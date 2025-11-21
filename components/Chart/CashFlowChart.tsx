// components/charts/CashFlowChart.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { GetWalletTransactions } from "@/api/wallet";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";

export type CashFlowData = {
  month: string; // ex: "Jan", "Fév", "Mar"...
  revenue: number; // en KMF (positif)
  expense: number; // en KMF (positif, on prend Math.abs pour les sorties)
};

type Props = {
  period?: "6m" | "12m" | "all"; // Tu pourras étendre plus tard
};

const CashFlowChart: React.FC<Props> = ({ period = "6m" }) => {
  const [data, setData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6 mois");

  useEffect(() => {
    loadCashFlowData();
  }, [period]);

  const loadCashFlowData = async () => {
    setLoading(true);
    try {
      // On récupère les 12 ou 6 derniers mois selon le filtre
      const monthsCount = period === "6m" ? 6 : period === "12m" ? 12 : 12;
      const endDate = new Date();
      const startDate = subMonths(endDate, monthsCount - 1);

      const start = format(startOfMonth(startDate), "yyyy-MM-dd");
      const end = format(endOfMonth(endDate), "yyyy-MM-dd");

      const response = await GetWalletTransactions({
        limit: 1000, // On prend assez pour couvrir les mois
        startDate: start,
        endDate: end,
      });

      const transactions = response.data || [];

      // Génère la liste des mois
      const months = eachMonthOfInterval({
        start: startDate,
        end: endDate,
      });

      const monthlyData: CashFlowData[] = months.map((monthDate) => {
        const monthKey = format(monthDate, "yyyy-MM");
        const monthName = format(monthDate, "MMM", {
          locale: require("date-fns/locale/fr"),
        });

        const monthTxs = transactions.filter((t) => {
          const txDate = format(new Date(t.createdAt), "yyyy-MM");
          return txDate === monthKey;
        });

        const revenue = monthTxs
          .filter((t) =>
            ["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(t.provider)
          )
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const expense = monthTxs
          .filter(
            (t) => !["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(t.provider)
          )
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          month: monthName,
          revenue: Math.round(revenue / 1000), // On affiche en milliers (K)
          expense: Math.round(expense / 1000),
        };
      });

      setData(monthlyData);
    } catch (error) {
      console.error("Erreur chargement flux trésorerie", error);
    } finally {
      setLoading(false);
    }
  };

  const maxValue =
    data.length > 0
      ? Math.max(...data.flatMap((d) => [d.revenue, d.expense]))
      : 800;
  const height = 200;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Flux de trésorerie</Text>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <ActivityIndicator size="small" color="#58617b" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flux de trésorerie</Text>

        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "6 mois" && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod("6 mois")}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === "6 mois" && styles.periodTextActive,
              ]}
            >
              6 mois
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.periodButton}>
            <Text style={styles.periodText}>Période</Text>
            <Feather name="chevron-down" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Graphique */}
      <View style={styles.chart}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{Math.round(maxValue * 0.8)}K</Text>
          <Text style={styles.axisLabel}>{Math.round(maxValue * 0.6)}K</Text>
          <Text style={styles.axisLabel}>{Math.round(maxValue * 0.4)}K</Text>
          <Text style={styles.axisLabel}>{Math.round(maxValue * 0.2)}K</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const revenueHeight = (item.revenue / maxValue) * height || 2;
              const expenseHeight = (item.expense / maxValue) * height || 2;

              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.bars}>
                    <View
                      style={[
                        styles.bar,
                        styles.revenueBar,
                        { height: revenueHeight },
                      ]}
                    >
                      {item.revenue ===
                        Math.max(...data.map((d) => d.revenue)) &&
                        item.revenue > 0 && (
                          <View style={styles.tooltip}>
                            <Text style={styles.tooltipText}>
                              {item.revenue}K
                            </Text>
                          </View>
                        )}
                    </View>
                    <View
                      style={[
                        styles.bar,
                        styles.expenseBar,
                        { height: expenseHeight },
                      ]}
                    />
                  </View>
                  <Text style={styles.monthLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Revenus</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F44336" }]} />
          <Text style={styles.legendText}>Dépenses</Text>
        </View>
      </View>
    </View>
  );
};

export default CashFlowChart;

// === STYLES (identiques à avant, juste un peu optimisés) ===
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 12,
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  periodSelector: { flexDirection: "row", gap: 8 },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    gap: 4,
  },
  periodButtonActive: { backgroundColor: "#E8F5E9" },
  periodText: { fontSize: 14, color: "#666" },
  periodTextActive: { color: "#4CAF50", fontWeight: "500" },
  chart: { flexDirection: "row", height: 240 },
  yAxis: { width: 40, justifyContent: "space-between", paddingVertical: 10 },
  axisLabel: { fontSize: 10, color: "#999", textAlign: "right" },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 220,
    gap: 20,
    paddingBottom: 20,
    paddingRight: 20,
  },
  barGroup: { alignItems: "center", gap: 8 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 200 },
  bar: { width: 14, borderRadius: 4, position: "relative", minHeight: 2 },
  revenueBar: { backgroundColor: "#4CAF50" },
  expenseBar: { backgroundColor: "#F44336" },
  tooltip: {
    position: "absolute",
    top: -28,
    left: -14,
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tooltipText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  monthLabel: { fontSize: 11, color: "#666", fontWeight: "500" },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: "#666" },
});
