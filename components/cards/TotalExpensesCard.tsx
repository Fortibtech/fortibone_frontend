// components/cards/TotalExpensesCard.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { GetWalletTransactions } from "@/api/wallet";

type Props = {
  currency?: string; // ex: "KMF", "MAD", "EUR" → par défaut KMF
  backgroundColor?: string;
  iconColor?: string;
};

const TotalExpensesCard: React.FC<Props> = ({
  currency = "KMF",
  backgroundColor = "#FFF9E6",
  iconColor = "#FFC107",
}) => {
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTotalExpenses();
  }, []);

  const loadTotalExpenses = async () => {
    try {
      setLoading(true);

      const response = await GetWalletTransactions({
        limit: 100,
        status: "COMPLETED", // indispensable pour éviter le 400 sur status
        // type: "WITHDRAWAL" ou "PAYMENT" si tu veux être plus précis (optionnel)
      });

      const txs = response?.data || [];

      const total = txs
        .filter(
          (t: any) => !["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(t.provider)
        )
        .reduce(
          (sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)),
          0
        );

      setTotalExpenses(total);
    } catch (err) {
      console.error("Erreur chargement dépenses", err);
      setTotalExpenses(0);
    } finally {
      setLoading(false);
    }
  };

  const formattedAmount =
    totalExpenses !== null
      ? totalExpenses.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0,00";

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <Feather name="pie-chart" size={20} color={iconColor} />
        <Text style={styles.cardLabel}>En dépenses</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#999" />
      ) : (
        <Text style={styles.cardValue}>
          {formattedAmount} {currency}
        </Text>
      )}
    </View>
  );
};

export default TotalExpensesCard;

// Styles identiques à ton design
const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: "#666",
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
