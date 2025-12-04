// components/SalesByCategoryChart.tsx
import { SalesByProductCategory } from "@/api/analytics";
import React, { useState, useMemo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { BarChartProps } from "react-native-chart-kit/dist/BarChart";

const { width } = Dimensions.get("window");
type FilterType = "Janvier" | "Mensuel";
interface SalesByCategoryChartProps {
  data: SalesByProductCategory[];
}
type CustomBarChartProps = BarChartProps & {
  formatTopBarValue?: (topBarValue: number) => string | number;
};
export const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({
  data = [], // protection si data est undefined
}) => {
  const [filter, setFilter] = useState<FilterType>("Janvier");

  // Utilisation de useMemo pour éviter les recalculs inutiles + nettoyage des données
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { labels: ["Aucune donnée"], values: [0] };
    }

    const filtered = filter === "Janvier" ? data.slice(0, 3) : data;
    const labels = filtered.map((item) => {
      const name = item.categoryName?.trim();
      return name && name.length > 12
        ? name.substring(0, 10) + "..."
        : name || "Inconnu";
    });

    const values = filtered.map((item) => {
      if (filter === "Janvier") {
        return Number(item.totalItemsSold) || 0;
      } else {
        return Math.round((Number(item.totalRevenue) || 0) / 1000); // en milliers, arrondi
      }
    });

    return { labels, values };
  }, [data, filter]);

  const chartConfig: AbstractChartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      stroke: "#E5E5E5",
      strokeWidth: 1,
    },
    // Formatage sécurisé des valeurs Y + tooltip
    formatYLabel: (yValue) => {
      const value = parseFloat(yValue);
      if (isNaN(value) || value === 0) return "0";
      return filter === "Janvier" ? value.toString() : `${value}k`;
    },
    // Formatage du tooltip (très important pour éviter NaN/undefined)
    formatTopBarValue: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) return "0";
      return filter === "Janvier" ? `${num} articles` : `${num}k KMF`;
    },
  };

  const chartData = {
    labels: processedData.labels,
    datasets: [
      {
        data: processedData.values.length > 0 ? processedData.values : [0],
      },
    ],
  };

  // Si pas de données du tout
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Revenus par catégorie</Text>
        <View
          style={{
            height: 220,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#999" }}>Aucune donnée disponible</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          {filter === "Janvier"
            ? "Top 3 catégories (Janvier)"
            : "Revenus par catégorie"}
        </Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "Janvier" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("Janvier")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === "Janvier" && styles.filterBtnTextActive,
              ]}
            >
              Janvier
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "Mensuel" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("Mensuel")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === "Mensuel" && styles.filterBtnTextActive,
              ]}
            >
              Mensuel
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <BarChart
        data={chartData}
        width={width - 48}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig}
        style={styles.chart}
        fromZero={true}
        showValuesOnTopOfBars={true}
        showBarTops={true}
        withHorizontalLabels={true}
        withInnerLines={true}
        // Le plus important pour de beaux tooltips lisibles :
        segments={filter === "Janvier" ? 4 : 5}
        formatTopBarValue={chartConfig.formatTopBarValue}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#00D09C" }]} />
          <Text style={styles.legendText}>
            {filter === "Janvier"
              ? "Articles vendus"
              : "Revenus (milliers KMF)"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#fff",

    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#00D09C",
  },
  chartHeader: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
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
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    marginLeft: 8, // ← Ajoute cette ligne
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
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});
