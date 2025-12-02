import { Feather, Ionicons } from "@expo/vector-icons";

import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router"; // ← LA clé magique
import { GetWalletTransactions } from "@/api/wallet";

export const RecentTransactions = () => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await GetWalletTransactions({ limit: 15 });

      // Normalisation robuste du format de réponse
      const rawTransactions = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const formatted = rawTransactions.map((t: any) => ({
        id: t.id || t.providerTransactionId || "#",
        date: new Date(
          t.createdAt || t.created_at || Date.now()
        ).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        amount: Math.abs(Number(t.amount) || 0),
        type:
          ["DEPOSIT", "REFUND", "ADJUSTMENT", "deposit", "refund"].includes(
            t.provider
          ) ||
          t.type === "DEPOSIT" ||
          t.provider === "DEPOSIT"
            ? "incoming"
            : "outgoing",
      }));

      setTransactions(formatted);
    } catch (error) {
      console.error("Erreur chargement transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Rechargement automatique quand l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  if (loading) {
    return (
      <View
        style={{
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#58617b" />
        <Text style={{ marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      {/* ---------- En-tête ---------- */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions Récentes</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {/* Bouton refresh manuel (optionnel mais sympa) */}
          <TouchableOpacity onPress={loadTransactions}>
            <Ionicons name="refresh" size={22} color="#58617b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/finance/Transactions")}
            style={styles.seeMore}
          >
            <Text style={styles.seeMoreText}>Voir plus</Text>
            <Ionicons name="chevron-forward" size={16} color="#58617b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- Liste scrollable ---------- */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {transactions.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              paddingVertical: 30,
              color: "#58617b",
            }}
          >
            Aucune transaction trouvée.
          </Text>
        ) : (
          transactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              {/* ---------- Icône ---------- */}
              <View style={styles.iconContainer}>
                <Feather
                  name={
                    transaction.type === "incoming"
                      ? "arrow-up-right"
                      : "arrow-down-left"
                  }
                  size={16}
                  color={
                    transaction.type === "incoming" ? "#00af66" : "#ef4444"
                  }
                  style={styles.arrow}
                />
              </View>

              {/* ---------- Détails ---------- */}
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionId}>{transaction.id}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>

              {/* ---------- Montant ---------- */}
              <View style={styles.amountContainer}>
                <Text
                  style={[
                    styles.amount,
                    {
                      color:
                        transaction.type === "incoming" ? "#00af66" : "#ef4444",
                    },
                  ]}
                >
                  {transaction.type === "incoming" ? "+" : "-"}
                  {Math.abs(transaction.amount).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <Text style={styles.currency}> KMF</Text>
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default RecentTransactions;

/* ------------------------------------------------------------------
   STYLES (j'ai juste ajouté un petit truc pour le bouton refresh)
------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eef0f4",
    marginTop: 16,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: "#58617b",
  },
  scrollView: {
    minHeight: 200,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f4",
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#f6f8f9",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  arrow: {
    transform: [{ rotate: "20deg" }],
  },
  transactionDetails: {
    flex: 1,
    justifyContent: "center",
  },
  transactionId: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
    color: "#58617b",
    fontWeight: "400",
    marginTop: 4,
  },
  amountContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  currency: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
});
