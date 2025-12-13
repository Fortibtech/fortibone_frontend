// components/SalesByCategoryChart.tsx
import { SalesByProductCategory } from "@/api/analytics";
import React, { useState, useMemo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

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

const CATEGORY_COLORS = [
  "#00D09C",
  "#4ECDC4",
  "#45B7D1",
  "#FECA57",
  "#FF6B6B",
  "#DDA0DD",
  "#96CEB4",
  "#B0BEC5",
];

export const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({
  data = [],
}) => {
  const [filter, setFilter] = useState<FilterType>("currentMonth");

  const currentMonthName = MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { categories: [], total: 0 };
    }

    const isCurrentMonth = filter === "currentMonth";
    const filtered = data.slice(0, 6); // Top 6 catégories pour le graphique

    const total = filtered.reduce((sum, item) => {
      return (
        sum +
        (isCurrentMonth
          ? Number(item.totalItemsSold) || 0
          : Number(item.totalRevenue) || 0)
      );
    }, 0);

    const categories = filtered.map((item, index) => ({
      name: item.categoryName?.trim() || "Inconnu",
      value: isCurrentMonth
        ? Number(item.totalItemsSold) || 0
        : Number(item.totalRevenue) || 0,
      percentage:
        total > 0
          ? ((isCurrentMonth
              ? Number(item.totalItemsSold) || 0
              : Number(item.totalRevenue) || 0) /
              total) *
            100
          : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));

    return { categories, total };
  }, [data, filter]);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "8",
      strokeWidth: "3",
      stroke: "#fff",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#E5E5E5",
    },
  };

  const chartData = {
    labels: processedData.categories.map((cat) =>
      cat.name.length > 8 ? cat.name.substring(0, 6) + "." : cat.name
    ),
    datasets: [
      {
        data: processedData.categories.map((cat) =>
          filter === "currentMonth" ? cat.value : Math.round(cat.value / 1000)
        ),
        color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Ventes par catégorie</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune donnée disponible</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Ventes par catégorie</Text>
        <Text style={styles.subtitle}>
          {filter === "currentMonth"
            ? `${currentMonthName} ${currentYear}`
            : `Année ${currentYear}`}
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

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>
            {filter === "currentMonth"
              ? processedData.total.toLocaleString("fr-FR")
              : `${processedData.total.toLocaleString("fr-FR")} KMF`}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Catégories</Text>
          <Text style={styles.statValue}>
            {processedData.categories.length}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Moyenne</Text>
          <Text style={styles.statValue}>
            {processedData.categories.length > 0
              ? Math.round(
                  processedData.total / processedData.categories.length
                ).toLocaleString("fr-FR")
              : "0"}
          </Text>
        </View>
      </View>

      {/* Line Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width - 64}
          height={240}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={true}
          yAxisSuffix={filter === "currentMonth" ? "" : "k"}
          segments={5}
        />
      </View>

      {/* Category Details Grid */}
      <View style={styles.gridHeader}>
        <Text style={styles.gridTitle}>Top catégories</Text>
      </View>

      <ScrollView
        style={styles.categoryGrid}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.gridRow}>
          {processedData.categories.map((category, index) => (
            <View
              key={index}
              style={[
                styles.gridCard,
                { borderTopColor: category.color, borderTopWidth: 4 },
              ]}
            >
              <View style={styles.gridCardHeader}>
                <View
                  style={[
                    styles.gridBadge,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Text style={styles.gridBadgeText}>#{index + 1}</Text>
                </View>
              </View>

              <Text style={styles.gridCategoryName} numberOfLines={2}>
                {category.name}
              </Text>

              <View style={styles.gridStats}>
                <View style={styles.gridStatItem}>
                  <Text style={styles.gridStatLabel}>Valeur</Text>
                  <Text style={styles.gridStatValue}>
                    {filter === "currentMonth"
                      ? category.value.toLocaleString("fr-FR")
                      : `${category.value.toLocaleString("fr-FR")} KMF`}
                  </Text>
                </View>

                <View style={styles.gridDivider} />

                <View style={styles.gridStatItem}>
                  <Text style={styles.gridStatLabel}>Part</Text>
                  <Text
                    style={[styles.gridStatValue, { color: category.color }]}
                  >
                    {category.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    elevation: 3,
    shadowColor: "#00D09C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  chartHeader: {
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#F0FFFB",
    borderWidth: 1,
    borderColor: "#E8FFF6",
  },
  filterBtnActive: {
    backgroundColor: "#E8FFF6",
    borderColor: "#00D09C",
  },
  filterBtnText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  filterBtnTextActive: {
    color: "#00D09C",
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#00D09C",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  gridHeader: {
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  categoryGrid: {
    maxHeight: 500,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridCard: {
    width: (width - 76) / 2,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    borderTopWidth: 4,
    marginBottom: 12,
  },
  gridCardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  gridBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },
  gridCategoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    minHeight: 36,
  },
  gridStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  gridStatItem: {
    flex: 1,
    alignItems: "center",
  },
  gridStatLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  gridStatValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  gridDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#999",
    fontSize: 15,
    fontStyle: "italic",
  },
});
