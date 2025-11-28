import { GetWallet, GetWalletTransactions, Wallet } from "@/api/wallet";
import WalletHeaderCard from "@/components/Wallet/GetWalletDeposits";
import StatsCard from "@/components/Wallet/StatsCard";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { RecentTransactions } from "@/components/Wallet/RecentTransactions";

const WalletScreen = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération du portefeuille
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

  // Correction importante : on ne passe PLUS de paramètre "status" invalide
  // GetWalletTransactions attend soit rien, soit status en MAJUSCULES exactes, ou un filtre valide
  const fetchTransactions = async () => {
    try {
      // Solution 1 (recommandée) : on ne passe aucun filtre status
      await GetWalletTransactions({ page: 1, limit: 10 });

      // Solution 2 (si tu veux vraiment filtrer) :
      // const res = await GetWalletTransactions({ page: 1, limit: 10, status: "COMPLETED" });

      // Mettre à jour ton composant RecentTransactions avec res.data
    } catch (err) {
      console.log("Erreur lors du chargement des transactions", err);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions(); // si RecentTransactions a besoin des données ici
  }, [fetchWallet]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title}>Finances</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {wallet ? (
          <WalletHeaderCard balance={parseFloat(wallet.balance) || 0} />
        ) : (
          <WalletHeaderCard balance={0} />
        )}
        <StatsCard />
        <RecentTransactions />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#eef0f4",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#000" },
  content: { flex: 1, padding: 16 },
});

export default WalletScreen;
