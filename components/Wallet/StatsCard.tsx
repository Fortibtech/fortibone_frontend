import { useEffect, useState } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { GetWalletTransactions } from "@/api/wallet";
export const TransactionTypes = {
  DEPOSIT: "DEPOSIT" as const,
  WITHDRAWAL: "WITHDRAWAL" as const,
  PAYMENT: "PAYMENT" as const,
  TRANSFER: "TRANSFER" as const,
};

export enum TransactionStatusEnum {
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  FAILED = "FAILED",
}
export const StatsCard = () => {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  const [loading, setLoading] = useState(true);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  const fetchTotals = async () => {
    setLoading(true);

    try {
      const promises = [
        GetWalletTransactions({
          type: "DEPOSIT",
          status: TransactionStatusEnum.SUCCESS,
        }),
        GetWalletTransactions({
          type: "WITHDRAWAL",
          status: TransactionStatusEnum.SUCCESS,
        }),
      ];

      const results = await Promise.all(promises);

      const inflowResp = results[0];
      const outflowResp = results[1];

      const totalInflow = Array.isArray(inflowResp?.data)
        ? inflowResp.data.reduce((sum, t) => sum + t.amount, 0)
        : 0;

      const totalOutflow = Array.isArray(outflowResp?.data)
        ? outflowResp.data.reduce((sum, t) => sum + t.amount, 0)
        : 0;

      setTotalIn(totalInflow);
      setTotalOut(totalOutflow);
    } catch (err) {
      console.error("Erreur fetchTotals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotals();
  }, []);

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
        <TouchableOpacity
          onPress={() => router.push("/finance/Stats")}
          style={styles.seeMore}
        >
          <Text style={styles.seeMoreText}>Voir plus</Text>
          <Ionicons name="chevron-forward" size={16} color="#58617b" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00af66" />
      ) : (
        <View style={styles.statsRow}>
          {/* Entrées */}
          <View style={styles.statBox}>
            <View style={styles.ligne}>
              <Feather
                name="arrow-up-right"
                size={16}
                color="#00af66"
                style={styles.arrow}
              />
              <Text style={styles.statLabel}>Entrées</Text>
            </View>
            <View style={styles.statBottom}>
              <Text style={styles.statAmount}>
                {totalIn.toLocaleString()} KMF
              </Text>
            </View>
          </View>

          {/* Sorties */}
          <View style={styles.statBox}>
            <View style={styles.ligne}>
              <Feather
                name="arrow-down-left"
                size={16}
                color="#ef4444"
                style={styles.arrow}
              />
              <Text style={[styles.statLabel, { color: "#ef4444" }]}>
                Sorties
              </Text>
            </View>
            <View style={styles.statBottom}>
              <Text style={[styles.statAmount, { color: "#ef4444" }]}>
                {totalOut.toLocaleString()} KMF
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StatsCard;

// --- Styles inchangés ---
const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "space-between",
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
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  statBox: {
    flex: 1,
    height: 90,
    borderWidth: 1,
    borderColor: "#eef0f4",
    borderRadius: 16,
    padding: 12,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  arrow: { transform: [{ rotate: "20deg" }], marginBottom: 8 },
  statLabel: {
    fontSize: 12,
    color: "#58617b",
    fontWeight: "500",
    marginBottom: 8,
  },
  statBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statAmount: { fontSize: 14, fontWeight: "700", color: "#58617b" },
  statPercent: { fontSize: 12, fontWeight: "500", color: "#00af66" },
  ligne: { display: "flex", flexDirection: "row", gap: 5 },
});
