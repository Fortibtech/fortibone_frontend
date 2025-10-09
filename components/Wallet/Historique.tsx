import {
  GetWalletTransactions,
  WalletTransaction,
  WalletTransactionResponse,
} from "@/api/wallet";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Historique: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔹 Récupère les transactions depuis l'API
   */
  const fetchTransactions = async (pageNumber = 1, refresh = false) => {
    if (loading && !refresh) return;

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res: WalletTransactionResponse | null = await GetWalletTransactions(
        {
          page: pageNumber,
          limit: 10,
        }
      );

      if (res) {
        setTotalPages(res.totalPages);
        if (refresh || pageNumber === 1) {
          setTransactions(res.data);
        } else {
          setTransactions((prev) => [...prev, ...res.data]);
        }
      } else {
        setError("Aucune donnée reçue du serveur");
      }
    } catch (err: any) {
      console.error("Erreur Historique :", err);
      setError("Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /**
   * 🔹 Gestion du scroll infini (pagination)
   */
  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  /**
   * 🔹 Rafraîchissement manuel (pull-to-refresh)
   */
  const handleRefresh = () => {
    setPage(1);
    fetchTransactions(1, true);
  };

  /**
   * 🔹 Affichage d’un élément de la liste
   */
  const renderItem: ListRenderItem<WalletTransaction> = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.amount}>
          {item.amount} {item.currencyCode}
        </Text>
        <Text
          style={[
            styles.status,
            item.status === "COMPLETED"
              ? styles.success
              : item.status === "PENDING"
              ? styles.pending
              : styles.failed,
          ]}
        >
          {item.status}
        </Text>
      </View>

      <Text style={styles.provider}>
        {item.provider} • {item.providerTransactionId || "N/A"}
      </Text>

      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.infoText}>Chargement des transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Aucune transaction trouvée.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Historique des transactions</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#059669"]}
          />
        }
        ListFooterComponent={
          loading && transactions.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Historique;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },
  transactionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  provider: {
    color: "#4b5563",
    marginTop: 4,
    fontSize: 14,
  },
  date: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  status: {
    fontWeight: "bold",
    textTransform: "capitalize",
    fontSize: 14,
  },
  success: { color: "#059669" },
  pending: { color: "#eab308" },
  failed: { color: "#dc2626" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    marginTop: 10,
    color: "#6b7280",
    fontSize: 15,
  },
  errorText: {
    color: "#dc2626",
    fontWeight: "600",
    textAlign: "center",
  },
  footerLoader: {
    alignItems: "center",
    marginVertical: 10,
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 5,
    fontSize: 13,
  },
});
