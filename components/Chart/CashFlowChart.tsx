// components/charts/CashFlowChart.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { GetWalletTransactions } from "@/api/wallet";
import {
  format,
  subMonths,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { fr } from "date-fns/locale/fr"; // Import correct (v3 compatible)

export type CashFlowData = {
  month: string;
  revenue: number;
  expense: number;
};

type Props = {
  period?: "6m" | "12m" | "all";
};

const CashFlowChart: React.FC<Props> = ({ period = "6m" }) => {
  const [data, setData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllTransactionsInPeriod = async (start: string, end: string) => {
    const allTxs: any[] = [];
    let page = 1;

    while (true) {
      const res = await GetWalletTransactions({
        startDate: start,
        endDate: end,
        status: "COMPLETED",
        limit: 100,
        page,
      });
      const items = res?.data || [];
      allTxs.push(...items);
      if (items.length < 100) break;
      page++;
    }
    return allTxs;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const monthsCount = period === "6m" ? 6 : 12;
        const endDate = new Date();
        const startDateObj = subMonths(endDate, monthsCount - 1);

        const start = format(startOfMonth(startDateObj), "yyyy-MM-dd");
        const end = format(endOfMonth(endDate), "yyyy-MM-dd");

        const transactions = await fetchAllTransactionsInPeriod(start, end);

        const months = eachMonthOfInterval({
          start: startDateObj,
          end: endDate,
        });

        const result: CashFlowData[] = months.map((monthDate) => {
          const monthKey = format(monthDate, "yyyy-MM");
          const monthName =
            format(monthDate, "MMM", { locale: fr }).charAt(0).toUpperCase() +
            format(monthDate, "MMM", { locale: fr }).slice(1);

          const monthTxs = transactions.filter(
            (t: any) => format(new Date(t.createdAt), "yyyy-MM") === monthKey
          );

          const revenue = monthTxs
            .filter((t: any) =>
              ["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(t.provider)
            )
            .reduce(
              (sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)),
              0
            );

          const expense = monthTxs
            .filter(
              (t: any) =>
                !["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(t.provider)
            )
            .reduce(
              (sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)),
              0
            );

          return {
            month: monthName,
            revenue: Math.round(revenue / 1000),
            expense: Math.round(expense / 1000),
          };
        });

        setData(result);
      } catch (err) {
        console.error("Erreur CashFlowChart :", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [period]);

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.revenue, d.expense]),
    100
  );
  const height = 200;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Flux de trésorerie</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#666" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Flux de trésorerie • {period === "6m" ? "6" : "12"} mois
      </Text>

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
            {data.map((item, i) => {
              const rh = (item.revenue / maxValue) * height || 4;
              const eh = (item.expense / maxValue) * height || 4;
              return (
                <View key={i} style={styles.barGroup}>
                  <View style={styles.bars}>
                    <View
                      style={[styles.bar, styles.revenueBar, { height: rh }]}
                    />
                    <View
                      style={[styles.bar, styles.expenseBar, { height: eh }]}
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
          <View style={[styles.dot, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Revenus</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#F44336" }]} />
          <Text style={styles.legendText}>Dépenses</Text>
        </View>
      </View>
    </View>
  );
};

export default CashFlowChart;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 12,
    borderRadius: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    height: 240,
  },
  yAxis: {
    width: 44,
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  axisLabel: {
    fontSize: 10,
    color: "#888",
    textAlign: "right",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 20,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  barGroup: {
    alignItems: "center",
    gap: 8,
  },
  bars: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-end",
    height: 200,
  },
  bar: {
    width: 16,
    borderRadius: 4,
    minHeight: 4,
  },
  revenueBar: {
    backgroundColor: "#4CAF50",
  },
  expenseBar: {
    backgroundColor: "#F44336",
  },
  monthLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#555",
  },
});
