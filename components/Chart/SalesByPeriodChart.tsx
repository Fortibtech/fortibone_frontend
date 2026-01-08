import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
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

const unitLabelMap: Record<UnitType, string> = {
  DAY: "par jour",
  WEEK: "par semaine",
  MONTH: "par mois",
  YEAR: "par année",
};

interface SalePeriod {
  period: string;
  totalAmount: number;
  totalItems: number;
}

const SalesByPeriodChart: React.FC<{
  businessId: string;
  currencyId: string;
  refreshKey?: number;
}> = ({ businessId, currencyId, refreshKey = 0 }) => {
  const [unit, setUnit] = useState<UnitType>("MONTH");
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [periods, setPeriods] = useState<SalePeriod[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chartKey, setChartKey] = useState(0);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId, { unit });
      const symbol = await getCurrencySymbolById(currencyId);
      setSymbol(symbol);
      setPeriods(data.salesByPeriod || []);
    } catch (err: any) {
      console.log("API error:", err?.response?.data);
      setError("Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId, unit, refreshKey]); // 👈 Ajouter refreshKey

  // Animation d'entrée + relance du tracé de la courbe quand les données sont prêtes
  useEffect(() => {
    if (!loading && periods.length > 0) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);

      // Relance l'animation de dessin de la courbe
      setChartKey((prev) => prev + 1);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [periods, loading, unit]);

  // Limite le nombre de labels affichés pour éviter le chevauchement
  const formatLabel = (p: string, index: number, total: number) => {
    // Affiche seulement certains labels selon le nombre total
    const maxLabels = 6; // Maximum de labels à afficher
    const step = Math.ceil(total / maxLabels);

    // N'affiche que les labels aux intervalles réguliers
    if (total > maxLabels && index % step !== 0 && index !== total - 1) {
      return ""; // Masque ce label
    }

    if (unit === "MONTH") return p.slice(5); // 2025-09 → 09
    if (unit === "YEAR") return p;
    if (unit === "DAY") {
      // Pour les jours, affiche format court (ex: 08/01)
      const parts = p.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
    }
    return p.slice(5);
  };

  const chartData = {
    labels: periods.map((p, index) => formatLabel(p.period, index, periods.length)),
    datasets: [
      {
        data: periods.length > 0 ? periods.map((p) => p.totalAmount) : [0],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: () => "#8B5CF6",
    strokeWidth: 4,
    decimalPlaces: 0,
    propsForDots: {
      r: "5",
      strokeWidth: "3",
      stroke: "#8B5CF6",
    },
    propsForLabels: {
      fontSize: 9,
      rotation: periods.length > 10 ? 45 : 0, // Rotation si beaucoup de labels
    },
    propsForVerticalLabels: {
      fontSize: 8,
      rotation: periods.length > 8 ? 45 : 0,
    },
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Évolution des ventes</Text>
        {symbol && (
          <Text style={styles.subTitle}>
            Montant {unitLabelMap[unit]} ({symbol})
          </Text>
        )}

        <View style={styles.filterButtons}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u.key}
              style={[
                styles.filterBtn,
                unit === u.key && styles.filterBtnActive,
              ]}
              onPress={() => setUnit(u.key)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  unit === u.key && styles.filterBtnTextActive,
                ]}
              >
                {u.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : periods.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Aucune donnée disponible</Text>
        </View>
      ) : (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LineChart
            key={`chart-${unit}-${chartKey}`} // ← Clé unique → force le redraw complet avec animation
            data={chartData}
            width={width - 64}
            height={240}
            chartConfig={chartConfig}
            bezier
            fromZero // ← Très important : la courbe part de zéro et se dessine progressivement
            style={styles.chart}
            formatYLabel={(value) =>
              symbol
                ? `${Number(value).toLocaleString("fr-FR")} ${symbol}`
                : value
            }
          />
        </Animated.View>
      )}
    </View>
  );
};

// ... (les styles restent identiques à ta version précédente)

const styles = StyleSheet.create({
  // (inchangés – tu peux copier-coller ceux de ta version précédente)
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
  subTitle: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 6,
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
  chart: {
    borderRadius: 16,
  },
  loadingContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
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

export default SalesByPeriodChart;
