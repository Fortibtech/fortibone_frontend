// components/charts/ExpenseBreakdownChart.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { GetWalletTransactions } from "@/api/wallet";
import { format, subMonths, eachMonthOfInterval } from "date-fns";
import { fr } from "date-fns/locale/fr"; // Import correct v3

type ExpenseCategory =
  | "withdraw"
  | "payment"
  | "transfer"
  | "refund_adjust"
  | "other";

type MonthlyExpense = {
  month: string;
  withdraw: number;
  payment: number;
  transfer: number;
  refund_adjust: number;
  other: number;
};

const categoryColors: Record<ExpenseCategory, string> = {
  withdraw: "#F44336",
  payment: "#FF5722",
  transfer: "#FF9800",
  refund_adjust: "#FFC107",
  other: "#FFE082",
};

const categoryLabels = {
  withdraw: "Retraits",
  payment: "Paiements",
  transfer: "Transferts",
  refund_adjust: "Remb./Ajust.",
  other: "Autres",
};

const ExpenseBreakdownChart: React.FC = () => {
  const [data, setData] = useState<MonthlyExpense[]>([]);
  const [totals, setTotals] = useState<Record<ExpenseCategory, number>>({
    withdraw: 0,
    payment: 0,
    transfer: 0,
    refund_adjust: 0,
    other: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const all: any[] = [];
    let page = 1;
    const end = format(new Date(), "yyyy-MM-dd");
    const start = format(subMonths(new Date(), 11), "yyyy-MM-dd");

    while (true) {
      const res = await GetWalletTransactions({
        startDate: start,
        endDate: end,
        status: "COMPLETED",
        limit: 100,
        page,
      });
      const items = res?.data || [];
      all.push(...items);
      if (items.length < 100) break;
      page++;
    }
    return all;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const txs = await fetchAll();

        const outgoing = txs.filter(
          (t: any) =>
            !["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(
              t.provider?.toUpperCase()
            )
        );

        const months = eachMonthOfInterval({
          start: subMonths(new Date(), 11),
          end: new Date(),
        });

        const result: MonthlyExpense[] = [];
        const tempTotals = {
          withdraw: 0,
          payment: 0,
          transfer: 0,
          refund_adjust: 0,
          other: 0,
        };

        months.forEach((m) => {
          const key = format(m, "yyyy-MM");
          const name =
            format(m, "MMM", { locale: fr }).charAt(0).toUpperCase() +
            format(m, "MMM", { locale: fr }).slice(1);

          const monthTxs = outgoing.filter(
            (t: any) => format(new Date(t.createdAt), "yyyy-MM") === key
          );

          const cats = {
            withdraw: 0,
            payment: 0,
            transfer: 0,
            refund_adjust: 0,
            other: 0,
          };

          monthTxs.forEach((t: any) => {
            const amount = Math.abs(Number(t.amount || 0));
            const p = (t.provider || "").toUpperCase();
            if (p === "WITHDRAWAL") cats.withdraw += amount;
            else if (p === "PAYMENT") cats.payment += amount;
            else if (p === "TRANSFER") cats.transfer += amount;
            else if (["REFUND", "ADJUSTMENT"].includes(p) && t.amount < 0)
              cats.refund_adjust += amount;
            else cats.other += amount;
          });

          Object.keys(cats).forEach((k) => {
            tempTotals[k as ExpenseCategory] += cats[k as ExpenseCategory];
          });

          result.push({ month: name, ...cats });
        });

        setData(result);
        setTotals(tempTotals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const maxValue = Math.max(
    ...data.flatMap(Object.values).filter((v) => typeof v === "number"),
    1000
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Répartition des dépenses</Text>
        <ActivityIndicator style={{ marginTop: 50 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Répartition des dépenses • 12 mois</Text>

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
            {data.map((item, i) => (
              <View key={i} style={styles.barGroup}>
                <View style={styles.stackedBar}>
                  {(
                    [
                      "withdraw",
                      "payment",
                      "transfer",
                      "refund_adjust",
                      "other",
                    ] as ExpenseCategory[]
                  ).map((cat) => {
                    const v = item[cat];
                    if (!v) return null;
                    const h = (v / maxValue) * 200;
                    return (
                      <View
                        key={cat}
                        style={{
                          height: h < 6 ? 6 : h,
                          backgroundColor: categoryColors[cat],
                          width: "100%",
                        }}
                      />
                    );
                  })}
                </View>
                <Text style={styles.monthLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.legend}>
        {Object.entries(totals).map(([cat, total]) => {
          if (total === 0) return null;
          const c = cat as ExpenseCategory;
          return (
            <View key={cat} style={styles.legendItem}>
              <View
                style={[styles.dot, { backgroundColor: categoryColors[c] }]}
              />
              <Text style={styles.legendText}>{categoryLabels[c]}</Text>
              <Text style={styles.value}>{total.toLocaleString()} KMF</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ExpenseBreakdownChart;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 12,
    borderRadius: 16,
  },
  title: { fontSize: 17, fontWeight: "600", marginBottom: 16 },
  chart: { flexDirection: "row", height: 240 },
  yAxis: { width: 44, justifyContent: "space-between", paddingVertical: 12 },
  axisLabel: { fontSize: 10, color: "#888" },
  barsContainer: { flexDirection: "row", alignItems: "flex-end", gap: 24 },
  barGroup: { alignItems: "center", gap: 8 },
  stackedBar: {
    width: 36,
    height: 200,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  monthLabel: { fontSize: 11, color: "#666" },
  legend: { flexDirection: "column", gap: 10, marginTop: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 14, color: "#555", flex: 1 },
  value: { fontWeight: "600" },
});
