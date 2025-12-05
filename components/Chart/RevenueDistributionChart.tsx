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
import { PieChart } from "react-native-chart-kit";
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

interface PieDataItem {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
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
  const [pieData, setPieData] = useState<PieDataItem[]>([]);
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
      const topProducts: TopSellingProduct[] = data.topSellingProducts || [];

      if (topProducts.length === 0) {
        setPieData([]);
        setTotalRevenue(0);
        setLoading(false);
        return;
      }

      const total = topProducts.reduce((sum, p) => sum + p.totalRevenue, 0);
      setTotalRevenue(total);

      const sorted = [...topProducts].sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
      const maxItems = filter === "currentMonth" ? 6 : 8;
      const top = sorted.slice(0, maxItems);

      const chartData: PieDataItem[] = top.map((item, i) => ({
        name:
          item.productName.length > 18
            ? item.productName.slice(0, 15) + "..."
            : item.productName,
        amount: item.totalRevenue,
        color: COLORS[i % COLORS.length],
        legendFontColor: "#333",
        legendFontSize: 13,
      }));

      // Ajouter "Autres" si besoin
      if (sorted.length > maxItems) {
        const others = sorted
          .slice(maxItems)
          .reduce((sum, p) => sum + p.totalRevenue, 0);
        chartData.push({
          name: "Autres produits",
          amount: others,
          color: "#E0E0E0",
          legendFontColor: "#666",
          legendFontSize: 13,
        });
      }

      setPieData(chartData);
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
      ) : pieData.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune vente enregistrée</Text>
        </View>
      ) : (
        <>
          <View style={styles.donutContainer}>
            <PieChart
              data={pieData}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute={false}
              hasLegend={false}
            />

            <View style={styles.donutCenter}>
              <Text style={styles.donutCenterLabel}>Chiffre d&apos;affaires</Text>
              <Text style={styles.donutCenterValue}>
                {totalRevenue.toLocaleString("fr-FR")} KMF
              </Text>
            </View>
          </View>

          <View style={styles.legend}>
            {pieData.map((item, i) => (
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
  donutContainer: {
    position: "relative",
    alignItems: "center",
    marginVertical: 10,
  },
  donutCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -80 }, { translateY: -50 }],
    alignItems: "center",
    width: 160,
  },
  donutCenterLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  donutCenterValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#000",
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

export default RevenueDistributionChart;
