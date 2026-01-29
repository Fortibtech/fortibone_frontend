// components/cards/AvailableBalanceCard.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { GetWallet } from "@/api/wallet";

type Props = {
  currency: string | null; // Affiché après le montant (ex: KMF, MAD...)
  backgroundColor?: string;
  iconColor?: string;
};

const AvailableBalanceCard: React.FC<Props> = ({
  currency = "KMF", // Tu peux le changer en "MAD" si besoin
  backgroundColor = "#E8F5E9",
  iconColor = "#4CAF50",
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      setLoading(true);
      const wallet = await GetWallet();

      if (wallet && wallet.balance) {
        // L'API renvoie balance en string (ex: "1234567.89"), on convertit en number
        const balanceNumber = parseFloat(wallet.balance);
        setBalance(isNaN(balanceNumber) ? 0 : balanceNumber);
      } else {
        setBalance(0);
      }
    } catch (err) {
      console.error("Erreur chargement solde wallet", err);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const formattedBalance =
    balance !== null
      ? balance.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0,00";

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.cardHeader}>
        <Feather name="trending-up" size={20} color={iconColor} />
        <Text style={styles.cardLabel}>Solde disponible</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#999" />
      ) : (
        <Text style={styles.cardValue}>
          {formattedBalance} {currency}
        </Text>
      )}
    </View>
  );
};

export default AvailableBalanceCard;

// Styles identiques à ton design actuel
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
