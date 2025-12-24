// components/dashboard/StatsCard.tsx
import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  GetWalletTransactions,
  TransactionType,
  TransactionStatus,
} from "@/api/wallet";
import TotalExpensesCard from "@/components/cards/TotalExpensesCard";
import AvailableBalanceCard from "@/components/cards/AvailableBalanceCard";

const StatsCard = ({ symbol }: { symbol: string }) => {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  const [loading, setLoading] = useState(true);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  const fetchTotals = async () => {
    setLoading(true);
    try {
      // Pour éviter l'erreur 400, on suit la structure valide du endpoint
      const [inResp, outResp] = await Promise.all([
        GetWalletTransactions({
          page: 1,
          limit: 100,
          type: "DEPOSIT" as TransactionType,
          status: "COMPLETED" as TransactionStatus,
        }),
        GetWalletTransactions({
          page: 1,
          limit: 100,
          type: "WITHDRAWAL" as TransactionType,
          status: "COMPLETED" as TransactionStatus,
        }),
      ]);

      const inflows = Array.isArray(inResp?.data) ? inResp.data : [];
      const outflows = Array.isArray(outResp?.data) ? outResp.data : [];

      const sumIn = inflows.reduce(
        (acc, t: any) => acc + Number(t.amount || 0),
        0
      );
      const sumOut = outflows.reduce(
        (acc, t: any) => acc + Number(t.amount || 0),
        0
      );

      setTotalIn(sumIn);
      setTotalOut(sumOut);
    } catch (err) {
      console.error("Erreur fetchTotals:", err);
      setTotalIn(0);
      setTotalOut(0);
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      fetchTotals();
    }, [])
  );

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/finance/Stats")}
            style={styles.seeMore}
          >
            <Text style={styles.seeMoreText}>Voir plus</Text>
            <Ionicons name="chevron-forward" size={16} color="#58617b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu */}
      {loading ? (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#00af66" />
        </View>
      ) : (
        <View style={styles.statsRow}>
          {/* Entrées */}
          <AvailableBalanceCard currency={symbol} />
          {/* Sorties */}
          <TotalExpensesCard currency={symbol} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eef0f4",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 18, color: "#000", fontWeight: "600" },
  seeMore: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeMoreText: { fontSize: 14, color: "#58617b" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  statBox: {
    flex: 1,
    height: 90,
    borderWidth: 1,
    borderColor: "#eef0f4",
    borderRadius: 16,
    padding: 12,
    justifyContent: "space-between",
  },
  ligne: { flexDirection: "row", gap: 6, alignItems: "center" },
  arrow: { transform: [{ rotate: "20deg" }] },
  statLabel: { fontSize: 13, color: "#58617b", fontWeight: "500" },
  statAmount: { fontSize: 18, fontWeight: "700", color: "#000" },
});

export default StatsCard;
