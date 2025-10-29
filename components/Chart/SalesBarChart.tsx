// components/SalesByCategoryChart.tsx
import { SalesByProductCategory } from "@/api/analytics";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

const { width } = Dimensions.get("window");

type FilterType = "Jan" | "Mensuel";

interface SalesByCategoryChartProps {
  data: SalesByProductCategory[];
}

export const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({
  data,
}) => {
  const [filter, setFilter] = useState<FilterType>("Jan");

  // Filtrer les données (simulation : on garde tout pour "Mensuel", on prend les 3 premiers pour "Jan")
  const filteredData = filter === "Jan" ? data.slice(0, 3) : data;

  const labels = filteredData.map((item) => item.categoryName);
  const revenues = filteredData.map((item) => item.totalRevenue / 1000); // en milliers XAF
  const itemsSold = filteredData.map((item) => item.totalItemsSold);

  const chartConfig: AbstractChartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`, // Vert comme "Revenus"
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForBackgroundLines: {
      stroke: "#E5E5E5",
      strokeWidth: 1,
      strokeDasharray: "",
    },
    formatYLabel: (value) => {
      const num = parseFloat(value);
      return `${num}k`;
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: filter === "Jan" ? itemsSold : revenues,
        color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
      },
    ],
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          {filter === "Jan"
            ? "Top 3 catégories (Jan)"
            : "Revenus par catégorie"}
        </Text>
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

      <BarChart
        data={chartData}
        width={width - 48}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        withInnerLines={true}
        showBarTops={false}
        fromZero={true}
        showValuesOnTopOfBars={true}
        yAxisLabel={"" as any}
        yAxisSuffix={"" as any}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#00D09C" }]} />
          <Text style={styles.legendText}>
            {filter === "Jan" ? "Articles vendus" : "Revenus (k XAF)"}
          </Text>
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
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  filterBtnActive: {
    backgroundColor: "#E8FFF6",
  },
  filterBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  filterBtnTextActive: {
    color: "#00D09C",
    fontWeight: "600",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});
