// components/SalesTrendChart.tsx
import { SalesByPeriod } from "@/api/analytics";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

const { width } = Dimensions.get("window");

type FilterType = "Jan" | "Mensuel";

interface SalesTrendChartProps {
  data: SalesByPeriod[];
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
  const [filter, setFilter] = useState<FilterType>("Jan");

  // Filtrer les données (ex: Jan = 1 mois, Mensuel = 6 mois)
  const filteredData = filter === "Jan" ? data.slice(0, 1) : data.slice(0, 6);

  const labels = filteredData.map((item) => item.period);
  const values = filteredData.map((item) => item.totalAmount / 1000); // en milliers XAF

  const chartConfig: AbstractChartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`, // Vert comme Revenus
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForBackgroundLines: {
      stroke: "#E5E5E5",
      strokeWidth: 1,
      strokeDasharray: "",
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#00D09C",
    },
    formatYLabel: (value) => `${parseFloat(value)}k`,
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Évolution des ventes</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "Jan" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("Jan")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === "Jan" && styles.filterBtnTextActive,
              ]}
            >
              Jan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilter("Mensuel")}
          >
            <Text style={styles.filterBtnText}>Mensuel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune donnée disponible</Text>
        </View>
      ) : (
        <LineChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={width - 48}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
          decorator={() => {
            return (
              <View>
                {values.map((value, index) => (
                  <Text
                    key={index}
                    style={{
                      position: "absolute",
                      left: `${(index / (values.length - 1)) * 100}%`,
                      bottom: `${(value / Math.max(...values)) * 80}%`,
                      transform: [{ translateX: -20 }, { translateY: -25 }],
                      fontSize: 11,
                      fontWeight: "600",
                      color: "#00D09C",
                    }}
                  >
                    {value}k
                  </Text>
                ))}
              </View>
            );
          }}
        />
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#00D09C" }]} />
          <Text style={styles.legendText}>Chiffre d&lsquo;affaires (k XAF)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#00D09C",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  filterButtons: { flexDirection: "row", gap: 8 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  filterBtnActive: { backgroundColor: "#E8FFF6" },
  filterBtnText: { fontSize: 12, color: "#666", fontWeight: "500" },
  filterBtnTextActive: { color: "#00D09C", fontWeight: "600" },
  chart: { marginVertical: 8, borderRadius: 16 },
  emptyState: { alignItems: "center", padding: 20 },
  emptyText: { color: "#666", fontSize: 14 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: "#666" },
});
