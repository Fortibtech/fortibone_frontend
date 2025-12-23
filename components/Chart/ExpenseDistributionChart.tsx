import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { getSales } from "@/api/analytics";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

const { width } = Dimensions.get("window");

type UnitType = "DAY" | "WEEK" | "MONTH" | "YEAR";

const UNITS: { key: UnitType; label: string }[] = [
  { key: "DAY", label: "Jour" },
  { key: "WEEK", label: "Semaine" },
  { key: "MONTH", label: "Mois" },
  { key: "YEAR", label: "Année" },
];

interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalItemsSold: number;
}

interface CategoryData {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
  items: number;
}

const COLORS = [
  "#8B5CF6",
  "#A78BFA",
  "#C4B5FD",
  "#6366F1",
  "#818CF8",
  "#A5B4FC",
  "#EC4899",
  "#F472B6",
];

const ExpenseDistributionChart: React.FC<{
  businessId: string;
  currencyId: string;
}> = ({ businessId, currencyId }) => {
  const [unit, setUnit] = useState<UnitType>("MONTH");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId, { unit });
      const symbol = await getCurrencySymbolById(currencyId);

      const cats: SalesByCategory[] = data.salesByProductCategory || [];

      if (cats.length === 0) {
        setCategories([]);

        return;
      }

      const sorted = [...cats].sort((a, b) => b.totalRevenue - a.totalRevenue);
      const top = sorted.slice(0, 8);

      const total = top.reduce((sum, cat) => sum + cat.totalRevenue, 0);

      setSymbol(symbol);
      const processed: CategoryData[] = top.map((cat, i) => ({
        name: cat.categoryName,
        revenue: cat.totalRevenue,
        percentage: total > 0 ? (cat.totalRevenue / total) * 100 : 0,
        color: COLORS[i % COLORS.length],
        items: cat.totalItemsSold,
      }));

      setCategories(processed);
    } catch (err: any) {
      console.log("API error:", err?.response?.data);
      setError("Impossible de charger les données");
      // Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId, unit]);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1, index = 0) => {
      const colors = COLORS;
      return colors[index % colors.length];
    },
    strokeWidth: 2,
  };

  const chartData = {
    labels: categories.map((cat) =>
      cat.name.length > 8 ? cat.name.substring(0, 6) + "." : cat.name
    ),
    data: categories.map((cat) => cat.percentage / 100),
    colors: categories.map((cat) => cat.color),
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Répartition par catégorie</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune donnée disponible</Text>
        </View>
      ) : (
        <>
          {/* Progress Chart */}
          <View style={styles.chartContainer}>
            <ProgressChart
              data={chartData}
              width={width - 64}
              height={280} // ← Augmenté un peu la hauteur pour plus d'espace
              strokeWidth={20} // ← Épaisseur des arcs (plus épais = plus visible)
              radius={44} // ← Taille des cercles : beaucoup plus gros qu'avant (32 → 44)
              chartConfig={chartConfig}
              hideLegend={false}
              style={styles.chart}
            />
          </View>

          {/* Liste détaillée */}
          <ScrollView style={styles.categoryList} nestedScrollEnabled>
            {categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryIndicator,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {category.name}
                    </Text>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${category.percentage}%`,
                            backgroundColor: category.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryValue}>
                    {category.revenue.toLocaleString("fr-FR")} {symbol}
                  </Text>
                  <Text
                    style={[
                      styles.categoryPercentage,
                      { color: category.color },
                    ]}
                  >
                    {category.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
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
    borderColor: "#8B5CF6",
    elevation: 3,
    shadowColor: "#8B5CF6",
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
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  filterBtnActive: {
    backgroundColor: "#EDE9FE",
    borderColor: "#8B5CF6",
  },
  filterBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  filterBtnTextActive: {
    color: "#8B5CF6",
    fontWeight: "700",
  },
  totalCard: {
    backgroundColor: "#EDE9FE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  totalLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#8B5CF6",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chart: {
    borderRadius: 16,
  },
  categoryList: {
    marginTop: 20,
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryIndicator: {
    width: 8,
    height: 40,
    borderRadius: 4,
  },
  categoryInfo: {
    flex: 1,
    gap: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  categoryRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  categoryPercentage: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
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
    color: "#8B5CF6",
    fontSize: 15,
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

export default ExpenseDistributionChart;
