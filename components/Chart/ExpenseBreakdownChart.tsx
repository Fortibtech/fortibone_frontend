// components/charts/ExpenseBreakdownChart.tsx
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
import { fr } from "date-fns/locale";

type ExpenseCategory =
  | "withdraw"
  | "payment"
  | "transfer"
  | "refund_adjust"
  | "other";

type MonthlyExpense = {
  month: string; // "Jan", "Fév"...
  withdraw: number; // Retraits
  payment: number; // Paiements sortants
  transfer: number; // Transferts sortants
  refund_adjust: number; // Remboursements / Ajustements (souvent créditeurs, mais on les met ici si négatifs)
  other: number;
};
type ExpenseCategoryKey = keyof Omit<MonthlyExpense, "month">; // ← magique !

const categoryColors: Record<ExpenseCategory, string> = {
  withdraw: "#F44336",
  payment: "#FF5722",
  transfer: "#FF9800",
  refund_adjust: "#FFC107",
  other: "#FFE082",
};

const categoryLabels: Record<ExpenseCategory, string> = {
  withdraw: "Retraits",
  payment: "Paiements",
  transfer: "Transferts",
  refund_adjust: "Remboursements/Ajustements",
  other: "Autres",
};

const ExpenseBreakdownChart: React.FC = () => {
  const [data, setData] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalByCategory, setTotalByCategory] = useState<
    Record<ExpenseCategory, number>
  >({
    withdraw: 0,
    payment: 0,
    transfer: 0,
    refund_adjust: 0,
    other: 0,
  });

  useEffect(() => {
    loadExpenseData();
  }, []);

  const loadExpenseData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = subMonths(endDate, 11); // 12 mois

      const response = await GetWalletTransactions({
        limit: 2000,
        startDate: format(startOfMonth(startDate), "yyyy-MM-dd"),
        endDate: format(endOfMonth(endDate), "yyyy-MM-dd"),
      });

      const txs = response.data || [];

      // Seulement les sorties (dépenses)
      const outgoingTxs = txs.filter(
        (t) => !["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(t.provider)
      );

      const months = eachMonthOfInterval({ start: startDate, end: endDate });

      const monthlyData = months.map((monthDate) => {
        const monthKey = format(monthDate, "yyyy-MM");
        const monthName = format(monthDate, "MMM", { locale: fr });

        const monthTxs = outgoingTxs.filter(
          (t) => format(new Date(t.createdAt), "yyyy-MM") === monthKey
        );

        const categorized = {
          withdraw: 0,
          payment: 0,
          transfer: 0,
          refund_adjust: 0,
          other: 0,
        };

        let totals = { ...categorized };

        monthTxs.forEach((t) => {
          const amount = Math.abs(t.amount);
          const provider = t.provider.toUpperCase();

          if (provider === "WITHDRAWAL") {
            totals.withdraw += amount;
          } else if (provider === "PAYMENT") {
            totals.payment += amount;
          } else if (provider === "TRANSFER") {
            totals.transfer += amount;
          } else if (
            ["REFUND", "ADJUSTMENT"].includes(provider) &&
            t.amount < 0
          ) {
            totals.refund_adjust += amount;
          } else {
            totals.other += amount;
          }
        });

        // Cumul pour la légende
        Object.keys(totals).forEach((key) => {
          setTotalByCategory((prev) => ({
            ...prev,
            [key]:
              prev[key as ExpenseCategory] + totals[key as ExpenseCategory],
          }));
        });

        return {
          month: monthName,
          ...totals,
        };
      });

      setData(monthlyData);
    } catch (err) {
      console.error("Erreur chargement dépenses", err);
    } finally {
      setLoading(false);
    }
  };
  const maxValue =
    data.length > 0
      ? Math.max(
          ...data.flatMap((m) =>
            Object.values(m).filter((v): v is number => typeof v === "number")
          ),
          1000
        )
      : 1000;

  const height = 200;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Répartition des dépenses</Text>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
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
        <Text style={styles.title}>Répartition des dépenses</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, styles.periodButtonActive]}
          >
            <Text style={[styles.periodText, styles.periodTextActive]}>
              12 mois
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.periodButton}>
            <Text style={styles.periodText}>Période</Text>
            <Feather name="chevron-down" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chart}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>
            {((maxValue * 0.8) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.axisLabel}>
            {((maxValue * 0.6) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.axisLabel}>
            {((maxValue * 0.4) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.axisLabel}>
            {((maxValue * 0.2) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
            const totalMonth = (
              Object.keys(item) as ExpenseCategoryKey[]
            ).reduce((sum, key) => sum + (item[key] || 0), 0);

              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.stackedBar}>
                    {(Object.keys(categoryColors) as ExpenseCategory[]).map(
                      (cat) => {
                        const value = item[cat];
                        if (value === 0) return null;
                        const heightPercent = (value / maxValue) * height;

                        return (
                          <View
                            key={cat}
                            style={[
                              styles.stackedSegment,
                              {
                                backgroundColor: categoryColors[cat],
                                height: heightPercent,
                              },
                            ]}
                          >
                            {value ===
                              Math.max(...data.flatMap((d) => d[cat])) &&
                              value > 0 && (
                                <View style={styles.tooltip}>
                                  <Text style={styles.tooltipText}>
                                    {(value / 1000).toFixed(0)}K
                                  </Text>
                                </View>
                              )}
                          </View>
                        );
                      }
                    )}
                  </View>
                  <Text style={styles.monthLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Légende avec totaux réels */}
      <View style={styles.expenseLegend}>
        {Object.entries(totalByCategory).map(([cat, total]) => {
          if (total === 0) return null;
          const category = cat as ExpenseCategory;
          return (
            <View key={cat} style={styles.expenseItem}>
              <View style={styles.expenseItemHeader}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: categoryColors[category] },
                  ]}
                />
                <Text style={styles.expenseItemLabel}>
                  {categoryLabels[category]}
                </Text>
              </View>
              <Text style={styles.expenseItemValue}>
                {total.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}{" "}
                KMF
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ExpenseBreakdownChart;

// Styles (identiques à ton design)
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  periodButtonActive: { backgroundColor: "#FFEBEE" },
  periodText: { fontSize: 14, color: "#666" },
  periodTextActive: { color: "#F44336", fontWeight: "500" },
  chart: { flexDirection: "row", height: 240 },
  yAxis: { width: 40, justifyContent: "space-between", paddingVertical: 10 },
  axisLabel: { fontSize: 10, color: "#999", textAlign: "right" },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 20,
    paddingBottom: 20,
    paddingRight: 20,
  },
  barGroup: { alignItems: "center", gap: 8 },
  stackedBar: {
    width: 32,
    height: 200,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  stackedSegment: {
    width: "100%",
    minHeight: 2,
    position: "relative",
  },
  tooltip: {
    position: "absolute",
    top: -28,
    left: -10,
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tooltipText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  monthLabel: { fontSize: 11, color: "#666", fontWeight: "500" },
  expenseLegend: { gap: 16, marginTop: 20 },
  expenseItem: { gap: 4 },
  expenseItemHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  expenseItemLabel: { fontSize: 14, color: "#666" },
  expenseItemValue: { fontSize: 14, fontWeight: "600", color: "#000" },
});
