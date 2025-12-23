import { getRestaurantAnalytics } from "@/api/analytics";
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

const { width } = Dimensions.get("window");

type UnitType = "DAY" | "WEEK" | "MONTH" | "YEAR";

const UNITS: { key: UnitType; label: string }[] = [
  { key: "DAY", label: "Jour" },
  { key: "WEEK", label: "Semaine" },
  { key: "MONTH", label: "Mois" },
  { key: "YEAR", label: "Année" },
];

interface ReservationByPeriod {
  period: string;
  totalReservations: number;
}

const ReservationsByPeriodChart: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [unit, setUnit] = useState<UnitType>("MONTH");
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationByPeriod[]>([]);
  const [totalReservations, setTotalReservations] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurantAnalytics(businessId, { unit });
      const periods = data.reservationsByPeriod || [];

      const total = periods.reduce((sum, p) => sum + p.totalReservations, 0);
      setTotalReservations(total);
      setReservations(periods);
    } catch (err: any) {
      setError("Impossible de charger les réservations");
      Alert.alert("Erreur", err.message || "Une erreur est survenue");
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
    decimalPlaces: 0,
    color: (opacity = 1) =>
      `#8B5CF6${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`,
    labelColor: () => `#333`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: { strokeWidth: 1, stroke: "#efefef" },
  };

  const chartData = {
    labels: reservations.map((r) => r.period.slice(-5)), // ex: "01" ou "2025-12"
    datasets: [{ data: reservations.map((r) => r.totalReservations) || [0] }],
  };

  return (
    <View style={reservationStyles.chartCard}>
      <View style={reservationStyles.header}>
        <Text style={reservationStyles.title}>Réservations par période</Text>
        <Text style={reservationStyles.subtitle}>Évolution dans le temps</Text>

        <View style={reservationStyles.filterButtons}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u.key}
              style={[
                reservationStyles.filterBtn,
                unit === u.key && reservationStyles.filterBtnActive,
              ]}
              onPress={() => setUnit(u.key)}
            >
              <Text
                style={[
                  reservationStyles.filterBtnText,
                  unit === u.key && reservationStyles.filterBtnTextActive,
                ]}
              >
                {u.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={reservationStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : error ? (
        <View style={reservationStyles.errorContainer}>
          <Text style={reservationStyles.errorText}>{error}</Text>
        </View>
      ) : reservations.length === 0 ? (
        <View style={reservationStyles.noDataContainer}>
          <Text style={reservationStyles.noDataText}>Aucune réservation</Text>
        </View>
      ) : (
        <>
          <View style={reservationStyles.totalCard}>
            <Text style={reservationStyles.totalLabel}>
              Total des réservations
            </Text>
            <Text style={reservationStyles.totalValue}>
              {totalReservations}
            </Text>
          </View>

          <BarChart
            data={chartData}
            width={width - 64}
            height={260}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero
            showValuesOnTopOfBars
            style={{ borderRadius: 16 }}
          />
        </>
      )}
    </View>
  );
};

const reservationStyles = StyleSheet.create({
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
    fontSize: 28,
    fontWeight: "800",
    color: "#8B5CF6",
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
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

export default ReservationsByPeriodChart;
