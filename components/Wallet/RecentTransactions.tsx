// components/dashboard/RecentTransactions.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { GetWalletTransactions } from "@/api/wallet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const { width } = Dimensions.get("window");

type RecentTx = {
  id: string;
  title: string;
  reference: string;
  date: string;
  amount: number;
  type: "income" | "expense";
};

export const RecentTransactions = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<RecentTx[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecent = async () => {
    try {
      setLoading(true);
      const res = await GetWalletTransactions({ limit: 20 });

      const raw = Array.isArray(res) ? res : res?.data || [];

      const formatted: RecentTx[] = raw.slice(0, 20).map((t: any) => {
        const provider = (t.provider || "").toString().toUpperCase();
        const amountRaw = Number(t.amount) || 0;

        const isIncome =
          amountRaw > 0 ||
          provider === "DEPOSIT" ||
          provider === "REFUND" ||
          provider === "ADJUSTMENT";

        const title = (() => {
          switch (provider) {
            case "DEPOSIT":
              return "Dépôt d'argent";
            case "WITHDRAWAL":
              return "Retrait d'argent";
            case "PAYMENT":
              return t.metadata?.customer_name
                ? `Paiement de ${t.metadata.customer_name}`
                : "Paiement reçu";
            case "REFUND":
              return "Remboursement";
            case "ADJUSTMENT":
              return "Ajustement manuel";
            case "TRANSFER":
              return "Transfert";
            default:
              return "Transaction";
          }
        })();

        return {
          id: t.id || t.providerTransactionId || "#",
          title,
          reference: t.providerTransactionId || t.orderId || t.id || "N/A",
          date: format(
            new Date(t.createdAt || t.created_at || Date.now()),
            "dd MMM yyyy 'à' HH:mm",
            { locale: fr }
          ),
          amount: Math.abs(amountRaw),
          type: isIncome ? "income" : "expense",
        };
      });

      setTransactions(formatted);
    } catch (err) {
      console.error("Erreur recent transactions:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecent();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions récentes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadRecent} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={22} color="#58617b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/finance/Transactions")}
            style={styles.seeMore}
          >
            <Text style={styles.seeMoreText}>Voir tout</Text>
            <Ionicons name="chevron-forward" size={18} color="#58617b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#58617b" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="inbox" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Aucune transaction</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {transactions.map((t) => (
            <View key={t.id} style={styles.transactionItem}>
              {/* Icône */}
              <View
                style={[
                  styles.iconContainer,
                  t.type === "income" ? styles.incomeBg : styles.expenseBg,
                ]}
              >
                <Feather
                  name={
                    t.type === "income" ? "arrow-up-right" : "arrow-down-left"
                  }
                  size={18}
                  color={t.type === "income" ? "#00af66" : "#ef4444"}
                  style={{ transform: [{ rotate: "20deg" }] }}
                />
              </View>

              {/* Infos */}
              <View style={styles.info}>
                <Text style={styles.transactionTitle} numberOfLines={1}>
                  {t.title}
                </Text>
                <Text style={styles.transactionRef} numberOfLines={1}>
                  {t.reference}
                </Text>
                <Text style={styles.transactionDate}>{t.date}</Text>
              </View>

              {/* Montant */}
              <Text
                style={[
                  styles.amount,
                  { color: t.type === "income" ? "#00af66" : "#ef4444" },
                ]}
              >
                {t.type === "income" ? "+ " : "− "}
                {t.amount.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{" "}
                KMF
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  refreshBtn: {
    padding: 4,
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: "#58617b",
    fontWeight: "500",
  },

  loading: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 8,
  },
  loadingText: {
    color: "#58617b",
    fontSize: 14,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
  },

  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  incomeBg: { backgroundColor: "#ecfdf5" },
  expenseBg: { backgroundColor: "#fef2f2" },

  info: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  transactionRef: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 100,
    textAlign: "right",
  },
});

export default RecentTransactions;
