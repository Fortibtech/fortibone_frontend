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

const { width } = Dimensions.get("window");

// Liste des mois en français
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

type FilterType = "currentMonth" | "annual";

interface SalesByCategoryChartProps {
  data: SalesByProductCategory[];
}

export const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({
  data = [],
}) => {
  const [filter, setFilter] = useState<FilterType>("currentMonth");

  // Mois courant (dynamique)
  const currentMonthName = MONTHS[new Date().getMonth()]; // ex: "Décembre"
  const currentYear = new Date().getFullYear();

  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { labels: ["Aucune donnée"], values: [0] };
    }

    const isCurrentMonth = filter === "currentMonth";
    const filtered = isCurrentMonth ? data.slice(0, 5) : data; // Top 5 pour le mois, tout pour l'année

    const labels = filtered.map((item) => {
      const name = item.categoryName?.trim() || "Inconnu";
      return name.length > 12 ? name.substring(0, 10) + "..." : name;
    });

    const values = filtered.map((item) => {
      if (isCurrentMonth) {
        return Number(item.totalItemsSold) || 0;
      } else {
        return Math.round((Number(item.totalRevenue) || 0) / 1000);
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
    propsForBackgroundLines: { stroke: "#E5E5E5", strokeWidth: 1 },
    formatYLabel: (yValue) => {
      const value = parseFloat(yValue);
      if (isNaN(value)) return "0";
      return filter === "currentMonth" ? value.toString() : `${value}k`;
    },
  };

  const chartData = {
    labels: processedData.labels,
    datasets: [
      { data: processedData.values.length > 0 ? processedData.values : [0] },
    ],
  };

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
          {filter === "currentMonth"
            ? `Top catégories - ${currentMonthName} ${currentYear}`
            : `Revenus annuels par catégorie - ${currentYear}`}
        </Text>

        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "currentMonth" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("currentMonth")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === "currentMonth" && styles.filterBtnTextActive,
              ]}
            >
              {currentMonthName}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "annual" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("annual")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === "annual" && styles.filterBtnTextActive,
              ]}
            >
              Annuel
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
        withHorizontalLabels={true}
        withInnerLines={true}
        segments={filter === "currentMonth" ? 5 : 6}
        formatTopBarValue={(value: any) => {
          const num = Number(value);
          if (isNaN(num)) return "0";
          return filter === "currentMonth" ? `${num} articles` : `${num}k KMF`;
        }}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#00D09C" }]} />
          <Text style={styles.legendText}>
            {filter === "currentMonth"
              ? "Articles vendus"
              : "Revenus (milliers KMF)"}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Styles (inchangés, juste un petit ajustement visuel)
const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#00D09C",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chartHeader: {
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  filterBtnActive: {
    backgroundColor: "#E8FFF6",
    borderWidth: 1,
    borderColor: "#00D09C",
  },
  filterBtnText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  filterBtnTextActive: {
    color: "#00D09C",
    fontWeight: "700",
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
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});
