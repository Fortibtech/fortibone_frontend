import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GetWalletTransactions,
  TransactionType,
  TransactionStatus,
} from "@/api/wallet";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfMonth,
} from "date-fns";
import { fr } from "date-fns/locale";
import BackButtonAdmin from "@/components/Admin/BackButton";

// Types locaux
type TransactionGroup = {
  title: string;
  data: FormattedTransaction[];
};

type FormattedTransaction = {
  id: string;
  title: string;
  reference: string;
  date: string;
  rawDate: Date;
  amount: number;
  type: "income" | "expense";
  provider: string;
  status: TransactionStatus;
};

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<
    TransactionGroup[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filtres
  const [selectedType, setSelectedType] = useState<TransactionType | "">("");
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | "">(
    ""
  );

  const limit = 20;

  // Charger les transactions
  const loadTransactions = useCallback(
    async (isRefresh = false) => {
      if (!hasMore && !isRefresh) return;

      const currentPage = isRefresh ? 1 : page;

      try {
        isRefresh
          ? setRefreshing(true)
          : loadingMore
          ? setLoadingMore(true)
          : setLoading(true);

        const response = await GetWalletTransactions({
          page: currentPage,
          limit,
          search: searchText || undefined,
          type: selectedType || undefined,
          status: selectedStatus || undefined,
        });

        const rawTxs = response.data || [];

        const formatted: FormattedTransaction[] = rawTxs.map((t) => {
          const isIncome = ["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(
            t.provider
          );
          const absAmount = Math.abs(t.amount);

          return {
            id: t.id,
            title: getTransactionTitle(t),
            reference: t.providerTransactionId || t.orderId || t.id,
            date: format(new Date(t.createdAt), "dd MMM yyyy 'à' HH:mm", {
              locale: fr,
            }),
            rawDate: new Date(t.createdAt),
            amount: absAmount,
            type: isIncome ? "income" : "expense",
            provider: t.provider,
            status: t.status,
          };
        });

        setTransactions(
          isRefresh ? formatted : (prev) => [...prev, ...formatted]
        );
        setHasMore(response.page < response.totalPages);
        if (!isRefresh) setPage((p) => p + 1);
      } catch (err) {
        console.error("Erreur chargement transactions", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [page, searchText, selectedType, selectedStatus]
  );

  // Grouper par période
  useEffect(() => {
    const groups = groupTransactionsByPeriod(transactions);
    setGroupedTransactions(groups);
  }, [transactions]);

  useEffect(() => {
    loadTransactions(true);
  }, [searchText, selectedType, selectedStatus]);

  // Titre intelligent selon le type
  function getTransactionTitle(t: any): string {
    switch (t.provider) {
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
        return t.provider || "Transaction";
    }
  }

  // Groupement par période
  function groupTransactionsByPeriod(
    txs: FormattedTransaction[]
  ): TransactionGroup[] {
    const today = new Date();
    const groups: TransactionGroup[] = [];

    const todayTx = txs.filter((t) => isToday(t.rawDate));
    const yesterdayTx = txs.filter((t) => isYesterday(t.rawDate));
    const thisWeekTx = txs.filter(
      (t) =>
        isThisWeek(t.rawDate) && !isToday(t.rawDate) && !isYesterday(t.rawDate)
    );
    const thisMonthTx = txs.filter(
      (t) => isThisMonth(t.rawDate) && !isThisWeek(t.rawDate)
    );
    const olderTx = txs.filter((t) => t.rawDate < startOfMonth(today));

    if (todayTx.length) groups.push({ title: "AUJOURD'HUI", data: todayTx });
    if (yesterdayTx.length) groups.push({ title: "HIER", data: yesterdayTx });
    if (thisWeekTx.length)
      groups.push({ title: "CETTE SEMAINE", data: thisWeekTx });
    if (thisMonthTx.length)
      groups.push({ title: "CE MOIS-CI", data: thisMonthTx });
    if (olderTx.length) groups.push({ title: "PLUS ANCIEN", data: olderTx });

    return groups;
  }

  const onRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadTransactions(true);
  };

  const onEndReached = () => {
    if (!loadingMore && hasMore) {
      loadTransactions();
    }
  };

  const renderTransaction = (t: FormattedTransaction) => {
    const amountColor = t.type === "income" ? "#00BFA5" : "#F44336";
    const iconName = t.type === "income" ? "arrow-down-left" : "arrow-up-right";

    return (
      <View key={t.id} style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.iconContainer,
              t.type === "income" ? styles.incomeBg : styles.expenseBg,
            ]}
          >
            <Feather
              name={iconName}
              size={18}
              color={t.type === "income" ? "#00BFA5" : "#F44336"}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {t.title}
            </Text>
            <Text style={styles.transactionReference}>{t.reference}</Text>
            <Text style={styles.transactionDate}>{t.date}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {t.type === "income" ? "+" : "-"}
          {t.amount.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          KMF
        </Text>
      </View>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#58617b" />
          <Text style={{ marginTop: 12, color: "#666" }}>
            Chargement des transactions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.headerTitle}>Historique des Transactions</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Feather name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search & Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher (ID, client...)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 200;
          if (isCloseToBottom && !loadingMore && hasMore) onEndReached();
        }}
        scrollEventThrottle={400}
      >
        {groupedTransactions.map((group) => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {group.data.map(renderTransaction)}
          </View>
        ))}

        {loadingMore && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#58617b" />
          </View>
        )}

        {!hasMore && transactions.length > 0 && (
          <Text style={{ textAlign: "center", padding: 20, color: "#999" }}>
            Fin de l&apos;historique
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (tous tes styles originaux, je les garde intacts + quelques ajouts mineurs)
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginLeft: 16,
  },
  menuButton: { padding: 4 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#000" },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  incomeBg: { backgroundColor: "#E0F7EF" },
  expenseBg: { backgroundColor: "#FDEBEB" },
  transactionInfo: { flex: 1 },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  transactionReference: { fontSize: 12, color: "#666", marginBottom: 2 },
  transactionDate: { fontSize: 12, color: "#999" },
  transactionAmount: { fontSize: 15, fontWeight: "600" },
});

export default TransactionHistory;
;