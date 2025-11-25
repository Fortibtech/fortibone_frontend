// TransactionHistory.tsx
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
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  endOfMonth,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import BackButtonAdmin from "@/components/Admin/BackButton";
import Modal from "react-native-modal";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MotiView } from "moti";

type TransactionGroup = { title: string; data: FormattedTransaction[] };
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
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "week" | "month" | "custom"
  >("all");

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const limit = 20;

  const activeFiltersCount =
    (selectedType ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (datePreset !== "all" ? 1 : 0);

  const loadTransactions = useCallback(
    async (isRefresh = false) => {
      if (!hasMore && !isRefresh) return;
      const currentPage = isRefresh ? 1 : page;

      try {
        isRefresh ? setRefreshing(true) : setLoading(true);

        let startDate: string | undefined;
        let endDate: string | undefined;

        if (datePreset === "today") {
          const today = format(new Date(), "yyyy-MM-dd");
          startDate = today;
          endDate = today;
        } else if (datePreset === "week") {
          startDate = format(subMonths(new Date(), 0), "yyyy-MM-dd"); // simplifié
        } else if (datePreset === "month") {
          startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
          endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");
        }

        const response = await GetWalletTransactions({
          page: currentPage,
          limit,
          search: searchText || undefined,
          type: selectedType || undefined,
          status: selectedStatus || undefined,
          startDate,
          endDate, // CORRIGÉ : c'était "end" → erreur TS
        });

        const rawTxs = Array.isArray(response)
          ? response
          : response?.data || [];

        const formatted: FormattedTransaction[] = rawTxs.map((t: any) => {
          const isIncome = ["DEPOSIT", "REFUND", "ADJUSTMENT"].includes(
            t.provider || ""
          );
          return {
            id: t.id,
            title: getTransactionTitle(t),
            reference: t.providerTransactionId || t.orderId || t.id,
            date: format(new Date(t.createdAt), "dd MMM yyyy 'à' HH:mm", {
              locale: fr,
            }),
            rawDate: new Date(t.createdAt),
            amount: Math.abs(t.amount || 0),
            type: isIncome ? "income" : "expense",
            provider: t.provider || "",
            status: t.status,
          };
        });

        setTransactions(
          isRefresh ? formatted : (prev) => [...prev, ...formatted]
        );
        setHasMore(rawTxs.length === limit);
        if (!isRefresh) setPage((p) => p + 1);
      } catch (err: any) {
        console.error("Erreur transactions :", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [page, searchText, selectedType, selectedStatus, datePreset]
  );

  const resetFilters = () => {
    setSelectedType("");
    setSelectedStatus("");
    setDatePreset("all");
  };

  useEffect(() => {
    const groups = groupTransactionsByPeriod(transactions);
    setGroupedTransactions(groups);
  }, [transactions]);

  useEffect(() => {
    loadTransactions(true);
  }, [searchText, selectedType, selectedStatus, datePreset]);

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

  function groupTransactionsByPeriod(
    txs: FormattedTransaction[]
  ): TransactionGroup[] {
    const today = new Date();
    const groups: TransactionGroup[] = [];
    const todayTx = txs.filter((t) => isToday(t.rawDate));
    const yesterdayTx = txs.filter((t) => isYesterday(t.rawDate));
    const weekTx = txs.filter(
      (t) =>
        isThisWeek(t.rawDate) && !isToday(t.rawDate) && !isYesterday(t.rawDate)
    );
    const monthTx = txs.filter(
      (t) => isThisMonth(t.rawDate) && !isThisWeek(t.rawDate)
    );
    const olderTx = txs.filter((t) => t.rawDate < startOfMonth(today));

    if (todayTx.length) groups.push({ title: "AUJOURD'HUI", data: todayTx });
    if (yesterdayTx.length) groups.push({ title: "HIER", data: yesterdayTx });
    if (weekTx.length) groups.push({ title: "CETTE SEMAINE", data: weekTx });
    if (monthTx.length) groups.push({ title: "CE MOIS-CI", data: monthTx });
    if (olderTx.length) groups.push({ title: "PLUS ANCIEN", data: olderTx });
    return groups;
  }

  const renderTransaction = (t: FormattedTransaction) => (
    <View key={t.id} style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.iconContainer,
            t.type === "income" ? styles.incomeBg : styles.expenseBg,
          ]}
        >
          <Feather
            name={t.type === "income" ? "arrow-down-left" : "arrow-up-right"}
            size={18}
            color={t.type === "income" ? "#00BFA5" : "#F44336"}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{t.title}</Text>
          <Text style={styles.transactionReference}>{t.reference}</Text>
          <Text style={styles.transactionDate}>{t.date}</Text>
        </View>
      </View>

      {/* CORRIGÉ : tout le texte dans un seul <Text> */}
      <Text
        style={[
          styles.transactionAmount,
          { color: t.type === "income" ? "#00BFA5" : "#F44336" },
        ]}
      >
        {t.type === "income" ? "+ " : "- "}
        {t.amount.toLocaleString("fr-FR")} KMF
      </Text>
    </View>
  );
  // ==================== RENDER ====================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.headerTitle}>Historique</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Feather name="filter" size={24} color="#000" />
          {activeFiltersCount > 0 && (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={styles.filterBadge}
            >
              <Text style={styles.badgeText}>{activeFiltersCount}</Text>
            </MotiView>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTransactions(true)}
          />
        }
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          if (
            Math.round(event.nativeEvent.contentOffset.y + 1) >=
            Math.round(event.nativeEvent.contentSize.height)
          ) {
            if (!loadingMore && hasMore) {
              loadTransactions();
            }
          }
        }}
        scrollEventThrottle={200}
      >
        {groupedTransactions.map((group) => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {group.data.map(renderTransaction)} {/* CORRIGÉ */}
          </View>
        ))}

        {loadingMore && <ActivityIndicator style={{ margin: 20 }} />}

        {transactions.length === 0 && !loading && (
          <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>Aucune transaction</Text>
            <Text style={styles.emptyText}>
              {activeFiltersCount > 0
                ? "Modifiez les filtres"
                : "Elles apparaîtront ici"}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* MODAL FILTRES — CORRIGÉ */}
      <Modal
        isVisible={isFilterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        swipeDirection="down"
        onSwipeComplete={() => setFilterModalVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.modalContent}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filtres</Text>

          <Text style={styles.filterSectionTitle}>Type</Text>
          <View style={styles.chipsRow}>
            {(["DEPOSIT", "WITHDRAWAL", "PAYMENT", "TRANSFER"] as const).map(
              (t) => (
                <Pressable
                  key={t}
                  onPress={() =>
                    setSelectedType((prev) => (prev === t ? "" : t))
                  }
                  style={[styles.chip, selectedType === t && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedType === t && styles.chipTextActive,
                    ]}
                  >
                    {t === "DEPOSIT"
                      ? "Dépôt"
                      : t === "WITHDRAWAL"
                      ? "Retrait"
                      : t === "PAYMENT"
                      ? "Paiement"
                      : "Transfert"}
                  </Text>
                </Pressable>
              )
            )}
          </View>

          <Text style={styles.filterSectionTitle}>Statut</Text>
          <View style={styles.chipsRow}>
            {(["PENDING", "COMPLETED", "FAILED", "CANCELLED"] as const).map(
              (s) => (
                <Pressable
                  key={s}
                  onPress={() =>
                    setSelectedStatus((prev) => (prev === s ? "" : s))
                  }
                  style={[
                    styles.chip,
                    selectedStatus === s && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedStatus === s && styles.chipTextActive,
                    ]}
                  >
                    {s === "COMPLETED"
                      ? "Terminée"
                      : s === "PENDING"
                      ? "En attente"
                      : s === "FAILED"
                      ? "Échouée"
                      : "Annulée"}
                  </Text>
                </Pressable>
              )
            )}
          </View>

          <Text style={styles.filterSectionTitle}>Période</Text>
          <View style={styles.chipsRow}>
            {(["all", "today", "week", "month"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setDatePreset(p === datePreset ? "all" : p)}
                style={[styles.chip, datePreset === p && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    datePreset === p && styles.chipTextActive,
                  ]}
                >
                  {p === "all"
                    ? "Tout"
                    : p === "today"
                    ? "Aujourd’hui"
                    : p === "week"
                    ? "7 jours"
                    : "Ce mois"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.applyButton}
            >
              <Text style={styles.applyText}>
                Appliquer ({activeFiltersCount})
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionHistory;

// Styles (inchangés, juste propres)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 19, fontWeight: "700" },
  searchContainer: { padding: 16, backgroundColor: "#fff" },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    padding: 12,
    backgroundColor: "#e9ecef",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  incomeBg: { backgroundColor: "#E0F7EF" },
  expenseBg: { backgroundColor: "#FDEBEB" },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 15, fontWeight: "600" },
  transactionReference: { fontSize: 12, color: "#666" },
  transactionDate: { fontSize: 12, color: "#999" },
  transactionAmount: { fontSize: 15, fontWeight: "600",position: "relative" ,right: 100},
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  chipActive: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#4caf50",
  },
  chipText: { fontSize: 14, color: "#555" },
  chipTextActive: { color: "#2e7d32", fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  resetText: { color: "#999", fontSize: 16 },
  applyButton: {
    backgroundColor: "#00af66",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#aaa", marginTop: 16 },
  emptyText: { fontSize: 15, color: "#ccc", marginTop: 8 },
  filterBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#f44336",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});
