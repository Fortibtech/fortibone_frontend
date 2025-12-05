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

interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalItemsSold: number;
}

interface LegendItem {
  name: string;
  amount: number;
  color: string;
}

const COLORS = ["#FF6B6B", "#FF8E8E", "#FF5252", "#FF3B3B", "#D32F2F"];

const ExpenseDistributionChart: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [filter, setFilter] = useState<FilterType>("currentMonth");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [legendData, setLegendData] = useState<LegendItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mois et année en cours
  const currentMonthName = MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId);
      const categories: SalesByCategory[] = data.salesByProductCategory || [];

      if (categories.length === 0) {
        setChartData(null);
        setLegendData([]);
        setLoading(false);
        return;
      }

      // Trier par revenu décroissant
      const sorted = [...categories].sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
      const isCurrentMonth = filter === "currentMonth";

      // Pour le mois en cours : top 5 + "Autres"
      // Pour l'année : tout afficher (ou top 8 + autres si trop)
      const limit = isCurrentMonth ? 5 : 8;
      const top = sorted.slice(0, limit);

      const labels = top.map((cat) =>
        cat.categoryName.length > 12
          ? cat.categoryName.slice(0, 10) + "..."
          : cat.categoryName
      );

      const amounts = top.map((cat) => Math.round(cat.totalRevenue / 1000)); // en milliers

      const legend: LegendItem[] = top.map((cat, i) => ({
        name: cat.categoryName,
        amount: Math.round(cat.totalRevenue),
        color: COLORS[i % COLORS.length],
      }));

      // Ajouter "Autres" si nécessaire
      if (sorted.length > limit) {
        const othersAmount = sorted
          .slice(limit)
          .reduce((sum, cat) => sum + cat.totalRevenue, 0);

        labels.push("Autres");
        amounts.push(Math.round(othersAmount / 1000));
        legend.push({
          name: "Autres catégories",
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
      setError("Impossible de charger les données");
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
    decimalPlaces: 0,
    color: () => "#FF6B6B",
    labelColor: () => "#444",
    style: { borderRadius: 16 },
    propsForBackgroundLines: { stroke: "#eee" },
    propsForLabels: { fontSize: 11, fontWeight: "600" },
    formatYLabel: (y: string) => `${parseInt(y)}k`,
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          Répartition des revenus par catégorie
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
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !chartData ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune donnée disponible</Text>
        </View>
      ) : (
        <>
          <BarChart
            data={chartData}
            width={width - 48}
            height={240}
            yAxisLabel=""
            yAxisSuffix="k"
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero={true}
            withInnerLines={true}
            showValuesOnTopOfBars={true}
            segments={5}
            formatTopBarValue={(value: any) => `${value}k KMF`}
          />

          <View style={styles.legend}>
            {legendData.map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={styles.legendLeft}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.legendAmount}>
                  {item.amount.toLocaleString("fr-FR")} KMF
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
    elevation: 3,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    gap: 10,
    marginTop: 8,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFEBEE",
  },
  filterBtnActive: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FF6B6B",
  },
  filterBtnText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },
  filterBtnTextActive: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
  chart: {
    marginVertical: 12,
    borderRadius: 16,
  },
  legend: {
    marginTop: 16,
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  legendDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },
  legendName: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
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

export default ExpenseDistributionChart;
