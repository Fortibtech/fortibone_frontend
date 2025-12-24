import { GetWallet, Wallet } from "@/api/wallet";
import WalletHeaderCard from "@/components/Wallet/GetWalletDeposits";
import StatsCard from "@/components/Wallet/StatsCard";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router"; // ← La clé
import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { RecentTransactions } from "@/components/Wallet/RecentTransactions";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
import { useBusinessStore } from "@/store/businessStore";

const WalletScreen = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const business = useBusinessStore((state) => state.business);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GetWallet();
      setWallet(data);
      if (!business) return;
      const symbol = await getCurrencySymbolById(business.currencyId);
      setSymbol(symbol);
    } catch (err: any) {
      setError(err.message || "Impossible de charger le portefeuille");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recharge TOUT (solde + enfants via focus) quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, [fetchWallet])
  );

  // Optionnel : bouton refresh manuel dans le header
  const handleRefresh = () => {
    fetchWallet();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title}>Finances</Text>

        <TouchableOpacity onPress={handleRefresh} style={styles.iconButton}>
          {loading ? (
            <ActivityIndicator size="small" color="#58617b" />
          ) : (
            <Ionicons name="refresh" size={22} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#00af66" />
            <Text style={{ marginTop: 12, color: "#58617b" }}>
              Mise à jour du solde...
            </Text>
          </View>
        ) : error ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "red" }}>{error}</Text>
            <TouchableOpacity onPress={fetchWallet}>
              <Text style={{ color: "#00af66", marginTop: 10 }}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WalletHeaderCard
              symbol={symbol || "KMF"}
              balance={parseFloat(wallet?.balance || "0") || 0}
            />
            <StatsCard symbol={symbol || "KMF"} />
            <RecentTransactions currency={symbol || "KMF"} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  // Nouveau bouton stats
  statsButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f4",
    backgroundColor: "#fff",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f6f8f9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#000" },
  content: { flex: 1, padding: 16 },
});

export default WalletScreen;
