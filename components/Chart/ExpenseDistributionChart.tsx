import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getSales } from "@/api/analytics";

const { width } = Dimensions.get("window");

interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalItemsSold: number;
}

interface BarData {
  labels: string[];
  datasets: [{ data: number[] }];
}

const COLORS = ["#FF6B6B", "#FF8E8E", "#FF5252", "#FF3B3B", "#D32F2F"];

const ExpenseDistributionChart: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [depenseFilter, setDepenseFilter] = useState<"Janvier" | "Mensuel">(
    "Mensuel"
  );
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<BarData | null>(null);
  const [legendData, setLegendData] = useState<
    Array<{ name: string; amount: number; color: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId);
      const categories: SalesByCategory[] = data.salesByProductCategory || [];

      // Trier par revenu décroissant
      const sorted = categories.sort((a, b) => b.totalRevenue - a.totalRevenue);

      // Limiter à 5 catégories max pour lisibilité
      const top5 = sorted.slice(0, 5);

      const labels = top5.map((cat) =>
        cat.categoryName.length > 12
          ? cat.categoryName.slice(0, 9) + "..."
          : cat.categoryName
      );

      const amounts = top5.map((cat) => cat.totalRevenue);

      const legend = top5.map((cat, index) => ({
        name: cat.categoryName,
        amount: Math.round(cat.totalRevenue),
        color: COLORS[index % COLORS.length],
      }));

      // Si plus de 5, ajouter "Autres"
      if (sorted.length > 5) {
        const othersAmount = sorted
          .slice(5)
          .reduce((sum, cat) => sum + cat.totalRevenue, 0);
        labels.push("Autres");
        amounts.push(othersAmount);
        legend.push({
          name: "Autres",
          amount: Math.round(othersAmount),
          color: "#B0BEC5",
        });
      }

      setChartData({
        labels,
        datasets: [{ data: amounts }],
      });

      setLegendData(legend);
    } catch (err: any) {
      setError("Impossible de charger la répartition des dépenses");
      Alert.alert("Erreur", err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [businessId, depenseFilter]);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => "#FF6B6B",
    labelColor: () => "#666",
    style: { borderRadius: 16 },
    propsForBackgroundLines: { stroke: "#E5E5E5" },
    propsForLabels: { fontSize: 11, fontWeight: "500" },
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}> dépenses et revenus</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              depenseFilter === "Janvier" && styles.filterBtnActive,
            ]}
            onPress={() => setDepenseFilter("Janvier")}
          >
            <Text
              style={[
                styles.filterBtnText,
                depenseFilter === "Janvier" && styles.filterBtnTextActive,
              ]}
            >
              Janvier
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              depenseFilter === "Mensuel" && styles.filterBtnActive,
            ]}
            onPress={() => setDepenseFilter("Mensuel")}
          >
            <Text
              style={[
                styles.filterBtnText,
                depenseFilter === "Mensuel" && styles.filterBtnTextActive,
              ]}
            >
              Mensuel
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6B6B" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !chartData || chartData.datasets[0].data.length === 0 ? (
        <Text style={styles.noDataText}>
          Aucune donnée de vente par catégorie
        </Text>
      ) : (
        <>
          <BarChart
            data={chartData}
            width={width - 48}
            height={220}
            yAxisLabel="kmf"
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={true}
            showBarTops={false}
            fromZero={true}
            segments={4}
          />

          <View style={styles.depensesLegend}>
            {legendData.map((item, index) => (
              <View key={index} style={styles.depenseLegendItem}>
                <View style={styles.depenseLegendLeft}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.depenseLegendText}>{item.name}</Text>
                </View>
                <Text style={styles.depenseLegendAmount}>
                  {item.amount.toLocaleString("fr-FR")} XAF
                </Text>
              </View>
            ))}
          </View>
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
    borderColor: "#FF6B6B",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chartHeader: {
    flexDirection: "column",
    gap: 8,
    justifyContent: "center",
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
    backgroundColor: "#FFEBEE",
  },
  filterBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  filterBtnTextActive: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  depensesLegend: {
    marginTop: 16,
    gap: 12,
  },
  depenseLegendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  depenseLegendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  depenseLegendText: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },
  depenseLegendAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  loadingContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginVertical: 20,
  },
});

export default ExpenseDistributionChart;
