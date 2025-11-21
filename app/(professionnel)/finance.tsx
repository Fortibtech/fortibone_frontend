import { GetWallet, GetWalletTransactions, Wallet } from "@/api/wallet";
import WalletHeaderCard from "@/components/Wallet/GetWalletDeposits";
import { StatsCard } from "@/components/Wallet/StatsCard";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { RecentTransactions } from "@/components/Wallet/RecentTransactions";

const WalletScreen = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoadingHistory(true);
      const res = await GetWalletTransactions({ page: 1, limit: 10 });
      setTransactions(res?.data || []); // selon ta réponse API
    } catch (error) {
      console.log("Erreur historique :", error);
    } finally {
      setLoadingHistory(false);
    }
  };
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

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          {/* Bouton Retour */}
          <BackButtonAdmin />
          {/* Titre Centré */}
          <Text style={styles.title}>Finances</Text>

          {/* Bouton Options */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        {/* --- MENU OPTIONS --- */}
        {menuVisible && (
          <View style={styles.optionsMenu}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setMenuVisible(false);
                setHistoryVisible(true);
                fetchTransactions();
              }}
            >
              <Text style={styles.optionText}>Historique</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* --- CONTENU --- */}
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

      <Modal
        visible={historyVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Historique des transactions</Text>

            {loadingHistory ? (
              <Text>Chargement...</Text>
            ) : transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <View key={i} style={styles.transactionItem}>
                  <Text style={styles.txType}>{tx.type}</Text>
                  <Text style={styles.txAmount}>
                    {tx.amount} {tx.currency?.symbol}
                  </Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text>Aucune transaction trouvée</Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHistoryVisible(false)}
            >
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
    padding: 16,
  },

  optionsMenu: {
    position: "absolute",
    top: 60,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    paddingVertical: 8,
    width: 150,
    zIndex: 999,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionText: {
    color: "#333",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "90%",
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  transactionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  txType: { fontWeight: "600" },
  txAmount: { color: "#00af66", fontWeight: "600" },
  txDate: { color: "#999", fontSize: 12 },
  closeButton: {
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#00af66",
    borderRadius: 8,
  },
  closeText: { color: "#fff", fontWeight: "600" },
});

export default WalletScreen;
