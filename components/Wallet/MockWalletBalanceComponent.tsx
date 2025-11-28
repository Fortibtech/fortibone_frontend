import { GetWallet, Wallet } from "@/api/wallet";
import { Ionicons } from "@expo/vector-icons"; // Assuming Expo for icons; adjust if needed
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const MockWalletBalanceComponent = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GetWallet();
      setWallet(data);
    } catch (err: any) {
      setError(err.message || "Impossible de récupérer le portefeuille");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[cardStyle, styles.cardContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement du solde...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !wallet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[cardStyle, styles.cardContainer]}>
          <Text style={styles.errorText}>
            {error || "Impossible de récupérer le portefeuille"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWallet}
            accessibilityLabel="Réessayer le chargement du solde"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[cardStyle, styles.cardContainer]}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Solde disponible</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleBalanceVisibility}
            accessibilityLabel={
              isBalanceVisible ? "Masquer le solde" : "Afficher le solde"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={isBalanceVisible ? "eye" : "eye-off"}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.balance}>
          {isBalanceVisible
            ? `${parseFloat(wallet.balance).toFixed(2)} ${
                wallet.currency?.symbol || wallet.currency?.code
              }`
            : "*****"}
        </Text>
        <Text style={styles.currencyName}>{wallet.currency?.name}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cardContainer: {
    marginHorizontal: 16,
    padding: 20,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balance: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
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
});

export default MockWalletBalanceComponent;
