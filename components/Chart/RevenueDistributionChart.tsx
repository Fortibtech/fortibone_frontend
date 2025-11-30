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
  legendFontColor?: string;
  legendFontSize?: number;
}

const COLORS = [
  "#00D09C",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF6B6B",
  "#DDA0DD",
];

const RevenueDistributionChart: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [revenuFilter, setRevenuFilter] = useState<"Jan" | "Mensuel">(
    "Mensuel"
  );
  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState<PieDataItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId);
      const topProducts: TopSellingProduct[] = data.topSellingProducts || [];

      // Calcul du total
      const total = topProducts.reduce((sum, p) => sum + p.totalRevenue, 0);
      setTotalRevenue(total);

      // Préparer les données pour PieChart (max 6 produits pour lisibilité)
      const sorted = topProducts.sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
      const top6 = sorted.slice(0, 6);

      const chartData: PieDataItem[] = top6.map((item, index) => ({
        name:
          item.productName.length > 15
            ? item.productName.slice(0, 12) + "..."
            : item.productName,
        amount: item.totalRevenue,
        color: COLORS[index % COLORS.length],
        legendFontColor: "#333",
        legendFontSize: 14,
      }));

      // Ajouter "Autres" si plus de 6 produits
      if (sorted.length > 6) {
        const othersAmount = sorted
          .slice(6)
          .reduce((sum, p) => sum + p.totalRevenue, 0);
        chartData.push({
          name: "Autres",
          amount: othersAmount,
          color: "#CCCCCC",
          legendFontColor: "#666",
          legendFontSize: 14,
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
    fetchRevenueData();
  }, [businessId, revenuFilter]);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Répartition des Revenus</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              revenuFilter === "Jan" && styles.filterBtnActive,
            ]}
            onPress={() => setRevenuFilter("Jan")}
          >
            <Text
              style={[
                styles.filterBtnText,
                revenuFilter === "Jan" && styles.filterBtnTextActive,
              ]}
            >
              Jan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              revenuFilter === "Mensuel" && styles.filterBtnActive,
            ]}
            onPress={() => setRevenuFilter("Mensuel")}
          >
            <Text
              style={[
                styles.filterBtnText,
                revenuFilter === "Mensuel" && styles.filterBtnTextActive,
              ]}
            >
              Mensuel
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00D09C" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : pieData.length === 0 ? (
        <Text style={styles.noDataText}>Aucune vente enregistrée</Text>
      ) : (
        <>
          <View style={styles.donutContainer}>
            <PieChart
              data={pieData}
              width={width - 48}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={false}
              hasLegend={false}
            />
            <View style={styles.donutCenter}>
              <Text style={styles.donutCenterLabel}>CA Général</Text>
              <Text style={styles.donutCenterValue}>
                {totalRevenue.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.donutCenterCurrency}>XAF</Text>
            </View>
          </View>

          <View style={styles.revenusLegend}>
            {pieData.map((item, index) => (
              <View key={index} style={styles.revenuLegendItem}>
                <View style={styles.revenuLegendLeft}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.revenuLegendText}>{item.name}</Text>
                </View>
                <Text style={styles.revenuLegendAmount}>
                  {item.amount.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  kmf
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  donutContainer: {
    position: "relative",
    alignItems: "center",
    marginVertical: 16,
  },
  donutCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -40 }],
    alignItems: "center",
    width: 150,
  },
  donutCenterLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  donutCenterValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  donutCenterCurrency: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  revenusLegend: {
    marginTop: 16,
    gap: 12,
  },
  revenuLegendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenuLegendLeft: {
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
  revenuLegendText: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },
  revenuLegendAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    height: 200,
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

export default RevenueDistributionChart;
