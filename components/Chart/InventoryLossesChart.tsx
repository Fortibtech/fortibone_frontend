import { getInventory } from "@/api/analytics";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

interface LossByMovementType {
  movementType: string;
  totalQuantity: number;
  totalValue: number;
}

interface InventoryLossesChartProps {
  businessId: string;
}

// Couleurs harmonieuses et professionnelles
const COLORS = [
  "#EF4444", // Rouge - Expiration / Perte critique
  "#F59E0B", // Orange - Dommage
  "#10B981", // Vert - Ajustement positif ? (rare)
  "#3B82F6", // Bleu
  "#8B5CF6", // Violet
  "#EC4899", // Rose
  "#6B7280", // Gris
  "#6366F1",
];

const InventoryLossesChart: React.FC<InventoryLossesChartProps> = ({
  businessId,
}) => {
  const [loading, setLoading] = useState(true);
  const [losses, setLosses] = useState<LossByMovementType[]>([]);
  const [totalLossValue, setTotalLossValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventory(businessId); // Ton appel API
      const lossesData: LossByMovementType[] = data.lossesByMovementType || [];

      if (lossesData.length === 0) {
        setLosses([]);
        setTotalLossValue(0);
        setLoading(false);
        return;
      }

      // Calcul du total des pertes en valeur
      const total = lossesData.reduce((sum, item) => sum + item.totalValue, 0);
      setTotalLossValue(total);

      // Trier par valeur descendante
      const sorted = [...lossesData].sort(
        (a, b) => b.totalValue - a.totalValue
      );
      setLosses(sorted);
    } catch (err: any) {
      console.log("API error:", err);
      setError("Impossible de charger les pertes d'inventaire");
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  // Traduction simple des types de mouvement (à enrichir selon tes valeurs réelles)
  const formatMovementType = (type: string): string => {
    const map: Record<string, string> = {
      EXPIRATION: "Péremption",
      DAMAGE: "Dommage",
      THEFT: "Vol",
      LOSS: "Perte inconnue",
      ADJUSTMENT: "Ajustement",
      RETURN: "Retour fournisseur",
    };
    return map[type] || type;
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1, index = 0) => {
      return (
        COLORS[index % COLORS.length] +
        Math.round(opacity * 255)
          .toString(16)
          .padStart(2, "0")
      );
    },
    strokeWidth: 2,
  };

  const chartData = {
    labels: losses.map((l) =>
      formatMovementType(l.movementType).length > 10
        ? formatMovementType(l.movementType).substring(0, 8) + "..."
        : formatMovementType(l.movementType)
    ),
    data: losses.map((l) =>
      totalLossValue > 0 ? l.totalValue / totalLossValue : 0
    ),
    colors: losses.map((_, i) => COLORS[i % COLORS.length]),
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.header}>
        <Text style={styles.title}>Pertes d&apos;inventaire par type</Text>
        <Text style={styles.subtitle}>Valeur totale perdue</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Chargement...</Text>
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
          {/* Total des pertes */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Valeur totale des pertes</Text>
            <Text style={styles.totalValue}>
              {totalLossValue.toLocaleString("fr-FR")} KMF
            </Text>
          </View>

          {/* Graphique en anneau */}
          <View style={styles.chartContainer}>
            <ProgressChart
              data={chartData}
              width={width - 64}
              height={240}
              strokeWidth={18}
              radius={36}
              chartConfig={chartConfig}
              hideLegend={false}
              style={styles.chart}
            />
          </View>

          {/* Liste détaillée */}
          <ScrollView style={styles.listContainer}>
            {losses.map((loss, index) => {
              const percentage =
                totalLossValue > 0
                  ? (loss.totalValue / totalLossValue) * 100
                  : 0;

              return (
                <View key={index} style={styles.lossItem}>
                  <View style={styles.lossLeft}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: COLORS[index % COLORS.length] },
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
                              backgroundColor: COLORS[index % COLORS.length],
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.lossRight}>
                    <Text style={styles.lossValue}>
                      {loss.totalValue.toLocaleString("fr-FR")} KMF
                    </Text>
                    <Text
                      style={[
                        styles.lossPercentage,
                        { color: COLORS[index % COLORS.length] },
                      ]}
                    >
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
  chartCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
    elevation: 3,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
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
    marginTop: 4,
  },
  totalCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  totalLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 6,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  chart: {
    borderRadius: 16,
  },
  listContainer: {
    maxHeight: 300,
    marginTop: 10,
  },
  lossItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lossLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  colorIndicator: {
    width: 10,
    height: 40,
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
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  lossRight: {
    alignItems: "flex-end",
  },
  lossValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
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
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  errorContainer: {
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 15,
    textAlign: "center",
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

export default InventoryLossesChart;
