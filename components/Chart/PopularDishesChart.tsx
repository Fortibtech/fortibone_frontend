// PopularDishesChart.tsx
import { getRestaurantAnalytics } from "@/api/analytics";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
const { width } = Dimensions.get("window");

interface PopularDish {
  variantId: string;
  dishName: string;
  dishImageUrl?: string;
  totalQuantityOrdered: number;
  totalRevenue: string | number;
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
];

const PopularDishesChart: React.FC<{
  businessId: string;
  currencyId: string;
}> = ({ businessId, currencyId }) => {
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [dishes, setDishes] = useState<PopularDish[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurantAnalytics(businessId);
      const symbol = await getCurrencySymbolById(currencyId);
      const popular = data.popularDishes || [];

      if (popular.length === 0) {
        setDishes([]);
        setTotalRevenue(0);
        return;
      }

      const processed = popular.map((d) => ({
        ...d,
        totalRevenue: Number(d.totalRevenue),
      }));

      const sorted = [...processed].sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
      const top8 = sorted.slice(0, 8);

      const total = top8.reduce((sum, d) => sum + d.totalRevenue, 0);
      setTotalRevenue(total);
      setDishes(top8);
      setSymbol(symbol);
    } catch (err: any) {
      setError("Impossible de charger les plats populaires");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1, index = 0) => {
      // Utilise la même couleur que les segments, mais en semi-transparent pour le texte/légende
      return (
        COLORS[index % COLORS.length] +
        Math.round(opacity * 255)
          .toString(16)
          .padStart(2, "0")
      );
    },
    strokeWidth: 1, // Optionnel : bordure plus fine et élégante
    useShadowColorFromDataset: false, // Important pour bien appliquer les couleurs
    propsForLabels: {
      fontSize: 11,
      fontWeight: "700",
      translateX: -2,
      translateY: 0,
    },
    propsForBackgroundLines: {
      strokeWidth: 0, // Enlève les lignes de grille inutiles
    },
  };

  const chartData = {
    labels: dishes.map((d) =>
      d.dishName.length > 10 ? d.dishName.substring(0, 8) + "..." : d.dishName
    ),
    data: dishes.map((d) =>
      totalRevenue > 0 ? d.totalRevenue / totalRevenue : 0
    ),
    colors: dishes.map((_, i) => COLORS[i % COLORS.length]),
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.header}>
        <Text style={styles.title}>Plats les plus vendus</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : dishes.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune commande enregistrée</Text>
        </View>
      ) : (
        <>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Revenu total des plats</Text>
            <Text style={styles.totalValue}>
              {totalRevenue.toLocaleString("fr-FR")} {symbol}
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <ProgressChart
              data={chartData}
              width={width - 64}
              height={270}
              strokeWidth={10}
              radius={36}
              chartConfig={chartConfig}
              hideLegend={false}
              style={styles.chart}
            />
          </View>

          {/* Liste avec ScrollView interne – même comportement que ton exemple */}
          <ScrollView
            style={styles.productList}
            nestedScrollEnabled={true} // ← Crucial pour Android quand imbriqué
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.gridTitle}>Top plats vendus</Text>

            {dishes.map((dish, index) => {
              const percentage =
                totalRevenue > 0 ? (dish.totalRevenue / totalRevenue) * 100 : 0;
              const dishColor = COLORS[index % COLORS.length];

              return (
                <View key={dish.variantId} style={styles.dishItem}>
                  <View style={styles.dishLeft}>
                    {/* Badge de rang comme dans l'exemple */}
                    <View
                      style={[styles.rankBadge, { backgroundColor: dishColor }]}
                    >
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>

                    <View style={styles.dishInfoContainer}>
                      {dish.dishImageUrl ? (
                        <Image
                          source={{ uri: dish.dishImageUrl }}
                          style={styles.dishImage}
                        />
                      ) : (
                        <View style={styles.dishImagePlaceholder} />
                      )}

                      <View style={styles.dishInfo}>
                        <Text style={styles.dishName} numberOfLines={2}>
                          {dish.dishName}
                        </Text>
                        <View style={styles.progressBg}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${percentage}%`,
                                backgroundColor: dishColor,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.dishRight}>
                    <Text style={styles.dishRevenue}>
                      {dish.totalRevenue.toLocaleString("fr-FR")} {symbol}
                    </Text>
                    <Text style={[styles.dishPercentage, { color: dishColor }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                    <Text style={styles.dishQty}>
                      {dish.totalQuantityOrdered} commande
                      {dish.totalQuantityOrdered > 1 ? "s" : ""}
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
  chart: {
    borderRadius: 12,
    marginVertical: 8,
    position: "relative",
    right: 10,
    bottom: 20,
  },
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
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  title: {
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
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  filterBtnActive: {
    backgroundColor: "#FFE0E0",
    borderColor: "#FF6B6B",
  },
  filterBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  filterBtnTextActive: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
  totalCard: {
    backgroundColor: "#FFE0E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
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
    color: "#FF6B6B",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  productList: {
    marginTop: 10,
    maxHeight: 500, // Même valeur que ton exemple
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    marginLeft: 8,
  },
  dishItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dishLeft: {
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
  dishInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  dishImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  dishImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  dishInfo: {
    flex: 1,
    gap: 8,
  },
  dishName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  progressBg: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  dishRight: {
    alignItems: "flex-end",
  },
  dishRevenue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  dishPercentage: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  dishQty: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 15,
    textAlign: "center",
  },
  noDataContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#999",
    fontSize: 15,
    fontStyle: "italic",
  },
});

export default PopularDishesChart;
