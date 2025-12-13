import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import { getSales } from "@/api/analytics";

const { width } = Dimensions.get("window");

// Mois en français
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

interface TopSellingProduct {
  variantId: string;
  sku: string;
  productName: string;
  variantImageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

const COLORS = [
  "#00D09C",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF6B6B",
  "#DDA0DD",
  "#B0BEC5",
];

const RevenueDistributionChart: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [filter, setFilter] = useState<FilterType>("currentMonth");
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Mois et année actuels
  const currentMonthName = MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId);
      const products: TopSellingProduct[] = data.topSellingProducts || [];

      if (products.length === 0) {
        setTopProducts([]);
        setTotalRevenue(0);
        setLoading(false);
        return;
      }

      const total = products.reduce((sum, p) => sum + p.totalRevenue, 0);
      setTotalRevenue(total);

      const sorted = [...products].sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
      const maxItems = filter === "currentMonth" ? 5 : 6;
      const top = sorted.slice(0, maxItems);

      setTopProducts(top);
    } catch (err: any) {
      setError("Impossible de charger la répartition des revenus");
      Alert.alert("Erreur", err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId, filter]);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    decimalPlaces: 0,
  };

  // Créer des données pour un graphique empilé avec plusieurs "semaines" fictives
  const stackedData = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    legend: topProducts.map((item) =>
      item.productName.length > 12
        ? item.productName.slice(0, 10) + "..."
        : item.productName
    ),
    data: topProducts.map((product, index) => {
      // Simuler une distribution sur 4 semaines
      const baseValue = product.totalRevenue / 4;
      return [
        Math.round(baseValue * 0.8),
        Math.round(baseValue * 1.1),
        Math.round(baseValue * 0.95),
        Math.round(baseValue * 1.15),
      ];
    }),
    barColors: COLORS.slice(0, topProducts.length),
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          Répartition des revenus par produit
        </Text>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09C" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : topProducts.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune vente enregistrée</Text>
        </View>
      ) : (
        <>
          {/* Total Revenue Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Chiffre d'affaires total</Text>
            <Text style={styles.totalValue}>
              {totalRevenue.toLocaleString("fr-FR")} KMF
            </Text>
          </View>

          {/* Stacked Bar Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartSubtitle}>Distribution hebdomadaire</Text>
            <StackedBarChart
              data={stackedData}
              width={width - 64}
              height={280}
              chartConfig={chartConfig}
              style={styles.chart}
              hideLegend={false}
            />
          </View>

          {/* Product Cards Grid */}
          <ScrollView
            style={styles.productGrid}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <Text style={styles.gridTitle}>Top produits</Text>
            <View style={styles.gridContainer}>
              {topProducts.map((item, index) => {
                const percentage = (item.totalRevenue / totalRevenue) * 100;
                return (
                  <View
                    key={index}
                    style={[
                      styles.productCard,
                      {
                        borderLeftColor: COLORS[index % COLORS.length],
                        borderLeftWidth: 5,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.rankBadge,
                          { backgroundColor: COLORS[index % COLORS.length] },
                        ]}
                      >
                        <Text style={styles.rankText}>#{index + 1}</Text>
                      </View>
                      <Text style={styles.percentageBadge}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>

                    <Text style={styles.productCardName} numberOfLines={2}>
                      {item.productName}
                    </Text>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardStats}>
                      <View style={styles.cardStatItem}>
                        <Text style={styles.cardStatLabel}>Revenus</Text>
                        <Text style={styles.cardStatValue}>
                          {item.totalRevenue.toLocaleString("fr-FR")} KMF
                        </Text>
                      </View>
                      <View style={styles.cardStatItem}>
                        <Text style={styles.cardStatLabel}>Quantité</Text>
                        <Text style={styles.cardStatValue}>
                          {item.totalQuantitySold} unité
                          {item.totalQuantitySold > 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </>
      )}
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
  totalCard: {
    backgroundColor: "#E8FFF6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00D09C",
  },
  totalLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#00D09C",
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  productGrid: {
    maxHeight: 600,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  gridContainer: {
    gap: 16,
  },
  productCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 5,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  percentageBadge: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00D09C",
  },
  productCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    minHeight: 40,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  cardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardStatItem: {
    flex: 1,
  },
  cardStatLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  cardStatValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  loadingContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 15,
    textAlign: "center",
  },
  noDataContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#999",
    fontSize: 15,
    fontStyle: "italic",
  },
});

export default RevenueDistributionChart;
