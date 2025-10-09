import { GetWalletTransactions, WalletTransaction } from "@/api/wallet";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define colors to match the light UI/UX theme from StaticWalletScreen
const colors = {
  background: "#fafafb",
  surface: "#ffffff",
  primary: "#059669",
  primaryVariant: "#047857",
  secondary: "#FFD60A",
  error: "#ef4444",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textDisabled: "#9ca3af",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
};

// Common card style for consistency
const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

const WalletTransactionsList: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await GetWalletTransactions({ page: 1, limit: 10 });
      const parsedTransactions =
        result?.data.map((tx) => ({
          ...tx,
          amount: parseFloat(tx.amount as unknown as string),
        })) || [];
      setTransactions(parsedTransactions);
    } catch (err: any) {
      setError(
        err.message ||
          "Une erreur est survenue lors du chargement des transactions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const renderHeader = () => (
    <View style={[cardStyle, styles.header]}>
      <Text style={styles.headerTitle}>Historique des Transactions</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchTransactions} // Fixed: Now references the defined fetchTransactions
        accessibilityLabel="Réessayer le chargement des transactions"
        accessibilityRole="button"
      >
        <Text style={styles.retryButtonText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: WalletTransaction }) => {
    const statusColor =
      item.status === "PENDING"
        ? colors.warning
        : item.status === "COMPLETED"
        ? colors.success
        : colors.error;

    return (
      <View style={[cardStyle, styles.item]}>
        <View style={styles.row}>
          <Text style={styles.amount}>
            {item.amount.toFixed(2)} {item.currencyCode || "€"}
          </Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {item.status.toLowerCase() === "pending"
              ? "En attente"
              : item.status.toLowerCase() === "completed"
              ? "Complété"
              : "Échoué"}
          </Text>
        </View>
        <Text style={styles.provider}>Via {item.provider}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Chargement des transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>{renderError()}</SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={renderItem}
        contentContainerStyle={
          transactions.length === 0
            ? styles.flatListEmpty
            : styles.flatListContent
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  item: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  status: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  provider: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  flatListContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
  flatListEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
});

export default WalletTransactionsList;
