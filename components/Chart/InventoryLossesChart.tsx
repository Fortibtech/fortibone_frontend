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
import { getInventory } from "@/api/analytics";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

const { width } = Dimensions.get("window");

interface LossByMovementType {
  movementType: string;
  totalQuantity: number;
  totalValue: number;
}

interface InventoryLossesChartProps {
  businessId: string;
  currencyId: string;
}

export const formatMoney = (value: number, symbol: string = ""): string => {
  if (isNaN(value) || value === null || value === undefined)
    return `0,00 ${symbol}`;

  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${symbol}`;
};

const InventoryLossesChart: React.FC<InventoryLossesChartProps> = ({
  businessId,
  currencyId,
}) => {
  const [loading, setLoading] = useState(true);
  const [losses, setLosses] = useState<LossByMovementType[]>([]);
  const [totalLossValue, setTotalLossValue] = useState(0);
  const [symbol, setSymbol] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory(businessId);
      const currencySymbol = await getCurrencySymbolById(currencyId);

      const rawLosses: any[] = data.lossesByMovementType || [];

      if (rawLosses.length === 0) {
        setLosses([]);
        setTotalLossValue(0);
        setSymbol(currencySymbol as any);
        return;
      }

      const processedLosses: LossByMovementType[] = rawLosses.map((item) => ({
        movementType: item.movementType,
        totalQuantity: Number(item.totalQuantity) || 0,
        totalValue: parseFloat(String(item.totalValue).replace(",", "")) || 0,
      }));

      const total = processedLosses.reduce(
        (sum, item) => sum + item.totalValue,
        0
      );

      const sorted = processedLosses.sort(
        (a, b) => b.totalValue - a.totalValue
      );

      setLosses(sorted);
      setTotalLossValue(total);
      setSymbol(currencySymbol as any);
    } catch (err) {
      console.error("Erreur lors du chargement des pertes :", err);
      setError("Impossible de charger les pertes d'inventaire");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId, currencyId]);

  const formatMovementType = (type: string): string => {
    const map: Record<string, string> = {
      EXPIRATION: "Péremption",
      LOSS: "Perte inconnue",
      DAMAGE: "Dommage / Casse",
      THEFT: "Vol",
      SHRINKAGE: "Retrait",
      ADJUSTMENT: "Ajustement",
      RETURN: "Retour fournisseur",
    };
    return map[type] || type;
  };

  // === COULEURS VIVES TIRANT SUR LE ROUGE ===
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1, index = 0) => {
      const vividRedPalette = [
        "#FF1E1E", // Rouge ultra vif
        "#FF453A",
        "#FF6B6B",
        "#FF3333",
        "#FF1744",
        "#F50057",
        "#D50000",
        "#C62828",
      ];
      const baseColor = vividRedPalette[index % vividRedPalette.length];
      return opacity === 1
        ? baseColor
        : baseColor +
            Math.round(opacity * 255)
              .toString(16)
              .padStart(2, "0");
    },
    strokeWidth: 3,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
      fontWeight: "800",
      translateX: -22,
      translateY: 20,
    },
  };

  const chartData = {
    labels: losses.map((l) =>
      formatMovementType(l.movementType).length > 12
        ? formatMovementType(l.movementType).substring(0, 10) + "..."
        : formatMovementType(l.movementType)
    ),
    data: losses.map((l) =>
      totalLossValue > 0 ? l.totalValue / totalLossValue : 0
    ),
    colors: losses.map(
      (_, i) =>
        [
          "#FF1E1E",
          "#FF453A",
          "#FF6B6B",
          "#FF3333",
          "#FF1744",
          "#F50057",
          "#D50000",
          "#C62828",
        ][i % 8]
    ),
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.header}>
        <Text style={styles.title}>Pertes d&apos;inventaire par type</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF1E1E" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : losses.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune perte enregistrée</Text>
        </View>
      ) : (
        <>
          <View style={styles.chartContainer}>
            <ProgressChart
              data={chartData}
              width={width - 64}
              height={280}
              strokeWidth={20}
              radius={44}
              chartConfig={chartConfig}
              hideLegend={false}
              style={styles.chart}
            />

            <View style={styles.donutCenter}>
              <View style={styles.donuContainer}>
                <Text style={styles.donutCenterLabel}>
                  Valeur totale perdue :
                </Text>
                <Text style={styles.donutCenterValue}>
                  {formatMoney(totalLossValue, symbol)}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.listContainer}>
            {losses.map((loss, index) => {
              const percentage =
                totalLossValue > 0
                  ? (loss.totalValue / totalLossValue) * 100
                  : 0;
              const itemColor = [
                "#FF1E1E",
                "#FF453A",
                "#FF6B6B",
                "#FF3333",
                "#FF1744",
                "#F50057",
                "#D50000",
                "#C62828",
              ][index % 8];

              return (
                <View key={index} style={styles.lossItem}>
                  <View style={styles.lossLeft}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: itemColor },
                      ]}
                    />
                    <View style={styles.lossInfo}>
                      <Text style={styles.lossType}>
                        {formatMovementType(loss.movementType)}
                      </Text>
                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: itemColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.lossRight}>
                    <Text style={styles.lossValue}>
                      {formatMoney(loss.totalValue, symbol)}
                    </Text>
                    <Text style={[styles.lossPercentage, { color: itemColor }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                    <Text style={styles.lossQuantity}>
                      {loss.totalQuantity} unité
                      {loss.totalQuantity > 1 ? "s" : ""}
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
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FF1E1E",
    elevation: 3,
    shadowColor: "#FF1E1E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
    position: "relative",
  },
  chart: {
    borderRadius: 16,
  },
  donutCenter: {
    position: "absolute",
    width: width - 64,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  donuContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    top: "70%",
    right: "-15%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  donutCenterLabel: {
    fontSize: 18,
    color: "#666",
    fontWeight: "800",
  },
  donutCenterValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#b90707ff",
    marginLeft: 6,
  },
  listContainer: {
    maxHeight: 400,
    marginTop: 20,
  },
  lossItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lossLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  colorIndicator: {
    width: 10,
    height: 44,
    borderRadius: 5,
  },
  lossInfo: {
    flex: 1,
    gap: 8,
  },
  lossType: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  progressBackground: {
    height: 7,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  lossRight: {
    alignItems: "flex-end",
  },
  lossValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#312b2bff",
  },
  lossPercentage: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  lossQuantity: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  loadingContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 15,
    textAlign: "center",
  },
  noDataContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#999",
    fontSize: 15,
    fontStyle: "italic",
  },
});

export default InventoryLossesChart;
