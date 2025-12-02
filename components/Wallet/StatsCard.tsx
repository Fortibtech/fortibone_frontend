import { useCallback, useState } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router"; // ← La magie
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { GetWalletTransactions } from "@/api/wallet";

const StatsCard = () => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [loading, setLoading] = useState(true);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  const fetchTotals = async () => {
    setLoading(true);
    try {
      const [inflowResp, outflowResp] = await Promise.all([
        GetWalletTransactions({
          type: "DEPOSIT",
          status: "COMPLETED",
          limit: 100,
        }),
        GetWalletTransactions({
          type: "WITHDRAWAL",
          status: "COMPLETED",
          limit: 100,
        }),
      ]);

      const totalInflow = (
        Array.isArray(inflowResp?.data) ? inflowResp.data : []
      ).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      const totalOutflow = (
        Array.isArray(outflowResp?.data) ? outflowResp.data : []
      ).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      setTotalIn(totalInflow);
      setTotalOut(totalOutflow);
    } catch (err) {
      console.error("Erreur fetchTotals:", err);
      setTotalIn(0);
      setTotalOut(0);
    } finally {
      setLoading(false);
    }
  };

  // Rechargement automatique quand l'écran revient au focus
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
          {/* Bouton refresh manuel (optionnel mais propre) */}
          <TouchableOpacity onPress={fetchTotals}>
            <Ionicons name="refresh" size={22} color="#58617b" />
          </TouchableOpacity>

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
          <View style={styles.statBox}>
            <View style={styles.ligne}>
              <Feather
                name="arrow-up-right"
                size={18}
                color="#00af66"
                style={styles.arrow}
              />
              <Text style={styles.statLabel}>Entrées</Text>
            </View>
            <Text style={styles.statAmount}>
              {totalIn.toLocaleString("fr-FR")} KMF
            </Text>
          </View>

          {/* Sorties */}
          <View style={styles.statBox}>
            <View style={styles.ligne}>
              <Feather
                name="arrow-down-left"
                size={18}
                color="#ef4444"
                style={styles.arrow}
              />
              <Text style={[styles.statLabel, { color: "#ef4444" }]}>
                Sorties
              </Text>
            </View>
            <Text style={[styles.statAmount, { color: "#ef4444" }]}>
              {totalOut.toLocaleString("fr-FR")} KMF
            </Text>
          </View>
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
