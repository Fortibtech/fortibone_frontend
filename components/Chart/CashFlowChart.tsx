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
import { getSales } from "@/api/analytics"; // Ajuste le chemin selon ton projet

const { width } = Dimensions.get("window");

interface SalesResponse {
  salesByPeriod: Array<{
    period: string; // "2025-09"
    totalAmount: number;
    totalItems: number;
  }>;
  topSellingProducts: any[];
  salesByProductCategory: any[];
}

interface CashFlowData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
  }>;
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForBackgroundLines: {
    stroke: "#E5E5E5",
  },
  propsForLabels: {
    fontSize: 12,
    fontWeight: "500",
  },
};

const CashFlowChart: React.FC<{ businessId: string }> = ({ businessId }) => {
  const [tresorerieFilter, setTresorerieFilter] = useState<"Jan" | "Mensuel">(
    "Jan"
  );
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<CashFlowData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tresorerieLegend = [
    { name: "Revenus", color: "#00D09C" },
    { name: "Dépenses", color: "#FF6B6B" },
  ];

  // Simuler des dépenses (car pas dans l'API)
  const generateMockExpenses = (period: string) => {
    const base = parseFloat(period.split("-")[1]);
    return Math.round((Math.random() * 300 + 500) * 100) / 100; // 500–800€
  };

  const processData = (salesData: SalesResponse): CashFlowData => {
    const monthlyData: { [key: string]: { revenue: number; expense: number } } =
      {};

    // Traitement des revenus par mois
    salesData.salesByPeriod.forEach((sale) => {
      const monthKey = sale.period.slice(0, 7); // "2025-09"
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expense: 0 };
      }
      monthlyData[monthKey].revenue += sale.totalAmount;
      monthlyData[monthKey].expense = generateMockExpenses(monthKey);
    });

    // Si pas de données dans salesByPeriod, on peut ajouter des mois par défaut
    const allMonths =
      tresorerieFilter === "Jan"
        ? ["2025-01"]
        : Object.keys(monthlyData).length > 0
        ? Object.keys(monthlyData)
        : ["2025-09"]; // fallback

    const filteredMonths = allMonths.filter((m) =>
      tresorerieFilter === "Jan" ? m === "2025-01" : true
    );

    const labels = filteredMonths.map((m) => {
      const [year, month] = m.split("-");
      const monthName = new Date(`${year}-${month}-01`).toLocaleString("fr", {
        month: "short",
      });
      return tresorerieFilter === "Jan"
        ? "Jan"
        : `${monthName} ${year.slice(2)}`;
    });

    const revenues = filteredMonths.map((m) => monthlyData[m]?.revenue || 0);
    const expenses = filteredMonths.map(
      (m) => monthlyData[m]?.expense || generateMockExpenses(m)
    );

    return {
      labels,
      datasets: [
        {
          data: revenues,
          color: () => "#00D09C",
        },
        {
          data: expenses,
          color: () => "#FF6B6B",
        },
      ],
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales(businessId);
      const processed = processData(data);
      setChartData(processed);
    } catch (err: any) {
      setError("Impossible de charger les données de trésorerie");
      Alert.alert("Erreur", err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId, tresorerieFilter]);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Flux de Ventes</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              tresorerieFilter === "Jan" && styles.filterBtnActive,
            ]}
            onPress={() => setTresorerieFilter("Jan")}
          >
            <Text
              style={[
                styles.filterBtnText,
                tresorerieFilter === "Jan" && styles.filterBtnTextActive,
              ]}
            >
              Jan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              tresorerieFilter === "Mensuel" && styles.filterBtnActive,
            ]}
            onPress={() => setTresorerieFilter("Mensuel")}
          >
            <Text
              style={[
                styles.filterBtnText,
                tresorerieFilter === "Mensuel" && styles.filterBtnTextActive,
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
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : chartData ? (
        <>
          <BarChart
            data={chartData}
            width={width - 80}
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

          <View style={styles.legend}>
            {tresorerieLegend.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.noDataText}>Aucune donnée disponible</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
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
    marginTop: 20,
  },
});

export default CashFlowChart;
