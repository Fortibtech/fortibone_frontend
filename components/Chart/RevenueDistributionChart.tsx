import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { getSales } from "@/api/analytics";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
import { formatMoney } from "./InventoryLossesChart";

const { width } = Dimensions.get("window");

interface TopSellingProduct {
  variantId: string;
  sku: string;
  productName: string;
  variantImageUrl?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

const COLORS = [
  "#00D09C", // #1
  "#4ECDC4", // #2
  "#45B7D1", // #3
  "#96CEB4", // #4
  "#FECA57", // #5
  "#FF6B6B", // #6
  "#DDA0DD", // #7
  "#B0BEC5", // #8
];

const RevenueDistributionChart: React.FC<{
  businessId: string;
  currencyId: string;
  refreshKey?: number;
}> = ({ businessId, currencyId, refreshKey = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId);
      const symbol: any = await getCurrencySymbolById(currencyId);

      const products: TopSellingProduct[] = data.topSellingProducts || [];

      if (products.length === 0) {
        setTopProducts([]);
        setTotalRevenue(0);
        setSymbol(symbol);
        return;
      }

      const sorted = [...products].sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
      const top = sorted.slice(0, 8);
      const total = top.reduce((sum, p) => sum + p.totalRevenue, 0);

      setTotalRevenue(total);
      setTopProducts(top);
      setSymbol(symbol);
    } catch (err: any) {
      console.log("API error:", err?.response?.data);
      setError("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand businessId, currencyId OU refreshKey change
  useEffect(() => {
    fetchData();
  }, [businessId, currencyId, refreshKey]); // 👈 Ajouter refreshKey

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1, index = 0) =>
      COLORS[index % COLORS.length] +
      Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0"),
    strokeWidth: 1,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 11,
      fontWeight: "700",
    },
  };

  const progressChartData = {
    labels: topProducts.map((p) =>
      p.productName.length > 10
        ? p.productName.slice(0, 1) + "..."
        : p.productName
    ),
    data: topProducts.map((p) =>
      totalRevenue > 0 ? p.totalRevenue / totalRevenue : 0
    ),
    colors: topProducts.map((_, index) => COLORS[index % COLORS.length]),
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          Répartition des revenus par produit
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09C" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
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
          {/* Donut Chart SANS légende à droite */}
          <View style={styles.chartContainer}>
            <ProgressChart
              data={progressChartData}
              width={width - 64}
              height={270}
              strokeWidth={10}
              radius={40}
              chartConfig={chartConfig}
              hideLegend={true}
              style={styles.chart}
            />
          </View>

          {/* Total des revenus juste en dessous du cercle */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total des revenus :</Text>
            <Text style={styles.totalValue}>
              {formatMoney(totalRevenue, symbol)}
            </Text>
          </View>

          {/* Liste détaillée et lisible en bas */}
          <ScrollView style={styles.productList} nestedScrollEnabled>
            <Text style={styles.gridTitle}>Top produits vendus</Text>
            {topProducts.map((item, index) => {
              const percentage =
                totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0;
              const productColor = COLORS[index % COLORS.length];

              return (
                <View key={index} style={styles.productItem}>
                  <View style={styles.productLeft}>
                    <View
                      style={[
                        styles.rankBadge,
                        { backgroundColor: productColor },
                      ]}
                    >
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.productName}
                      </Text>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: productColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.productRight}>
                    <Text style={styles.productRevenue}>
                      {item.totalRevenue.toLocaleString("fr-FR")} {symbol}
                    </Text>
                    <Text
                      style={[
                        styles.productPercentage,
                        { color: productColor },
                      ]}
                    >
                      {percentage.toFixed(1)}%
                    </Text>
                    <Text style={styles.productQuantity}>
                      {item.totalQuantitySold} unité
                      {item.totalQuantitySold > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              );
            })}
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
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  chart: {
    borderRadius: 12,
  },
  totalContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 14,
    backgroundColor: "#f0fffa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#b0ffdd",
  },
  totalLabel: {
    fontSize: 15,
    color: "#006644",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#00a06a",
    marginTop: 4,
  },
  productList: {
    marginTop: 10,
    maxHeight: 500,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    marginLeft: 8,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  productLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  productInfo: {
    flex: 1,
    gap: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  productRight: {
    alignItems: "flex-end",
  },
  productRevenue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  productPercentage: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  loadingContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 15,
  },
  noDataContainer: {
    height: 260,
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
