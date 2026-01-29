// components/cards/TotalExpensesCard.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { GetWalletTransactions } from "@/api/wallet";

type Props = {
  currency?: string | null;
  backgroundColor?: string;
  iconColor?: string;
};

const TotalExpensesCard: React.FC<Props> = ({
  currency = "KMF",
  backgroundColor = "#FFF9E6",
  iconColor = "#FFC107",
}) => {
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTotalExpenses();
  }, []);

  const loadTotalExpenses = async () => {
    try {
      setLoading(true);

      const response = await GetWalletTransactions({
        limit: 100, // assez pour couvrir les dépenses récentes
        status: "COMPLETED",
      });

      const txs = Array.isArray(response) ? response : response?.data || [];

      let expensesSum = 0;

      txs.forEach((t: any) => {
        const provider = (t.provider || "").toString().toUpperCase();
        const amountRaw = Number(t.amount || 0);

        // On considère comme dépense :
        // - soit le montant est négatif
        // - soit c'est un PAYMENT, TRANSFER, WITHDRAWAL (même si montant positif par erreur API)
        const isExpense =
          amountRaw < 0 ||
          ["PAYMENT", "TRANSFER", "WITHDRAWAL"].includes(provider);

        if (isExpense && amountRaw < 0) {
          expensesSum += amountRaw; // amountRaw est négatif → on additionne la valeur négative
        }
      });

      // On prend la valeur absolue pour afficher un montant positif dans la carte
      setTotalExpenses(Math.abs(expensesSum));
    } catch (err) {
      console.error("Erreur chargement dépenses totales :", err);
      setTotalExpenses(0);
    } finally {
      setLoading(false);
    }
  };

  const formattedAmount = totalExpenses.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
