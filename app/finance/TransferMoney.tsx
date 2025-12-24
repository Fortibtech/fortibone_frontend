// screens/TransferMoney.tsx
import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { GetWallet, transferMoney } from "@/api/wallet";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

// Presets identiques à ceux du retrait
const presets = [5000, 10000, 25000, 50000, 100000, 200000];
const MIN_AMOUNT = 100;

export default function TransferMoney() {
  const [amount, setAmount] = useState<number>(10000);
  const [customInput, setCustomInput] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const business = useBusinessStore((state) => state.business);
  const [symbol, setSymbol] = useState<string | null>(null);
  // Récupération du solde au focus
  const fetchBalance = useCallback(async () => {
    try {
      setFetchingBalance(true);
      const data = await GetWallet();
      const balance = parseFloat(data?.balance || "0") || 0;
      setWalletBalance(balance);
      if (!business) return;
      const symbol = await getCurrencySymbolById(business.currencyId);
      setSymbol(symbol);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger votre solde");
      setWalletBalance(0);
    } finally {
      setFetchingBalance(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [fetchBalance])
  );

  // Gestion des presets
  const handlePreset = (val: number) => {
    if (val > (walletBalance || 0)) {
      Alert.alert(
        "Solde insuffisant",
        `Vous avez seulement ${(walletBalance || 0).toLocaleString()} ${symbol}`
      );
      return;
    }
    setAmount(val);
    setCustomInput("");
    Keyboard.dismiss();
  };

  // Montant personnalisé
  const handleCustomAmount = (text: string) => {
    const nums = text.replace(/[^0-9]/g, "");
    setCustomInput(nums);
    if (nums) {
      const num = parseInt(nums, 10);
      if (num > (walletBalance || 0)) {
        Alert.alert(
          "Solde insuffisant",
          "Montant supérieur à votre solde disponible"
        );
        return;
      }
      setAmount(num);
    } else {
      setAmount(0);
    }
  };

  // Lancer le transfert
  const initiateTransfer = async () => {
    if (amount < MIN_AMOUNT) {
      Alert.alert("Montant trop faible", `Minimum ${MIN_AMOUNT} ${symbol}`);
      return;
    }
    if (amount > (walletBalance || 0)) {
      Alert.alert("Solde insuffisant");
      return;
    }
    if (!recipient.trim()) {
      Alert.alert(
        "Destinataire requis",
        "Veuillez entrer un email ou téléphone"
      );
      return;
    }

    setLoading(true);
    try {
      const result = await transferMoney(amount, recipient.trim());

      Alert.alert(
        "Transfert réussi !",
        `${amount.toLocaleString()} ${symbol} envoyés à\n${result.description.replace(
          "Transfert vers ",
          ""
        )}`,
        [{ text: "Parfait !", onPress: () => router.back() }]
      );

      // Reset formulaire
      setAmount(10000);
      setCustomInput("");
      setRecipient("");
    } catch (err: any) {
      let msg = err.message || "Échec du transfert";

      if (msg.includes("non trouvé"))
        msg = "Aucun utilisateur trouvé avec cet identifiant";
      if (msg.includes("Solde insuffisant"))
        msg = "Vous n'avez pas assez sur votre portefeuille";

      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  const canTransfer =
    amount >= MIN_AMOUNT &&
    amount <= (walletBalance || 0) &&
    recipient.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.headerTitle}>Transfert d&apos;argent</Text>
        <TouchableOpacity onPress={fetchBalance} style={styles.refreshButton}>
          {fetchingBalance ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Ionicons name="refresh" size={24} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* SOLDE />
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>
              {(walletBalance || 0).toLocaleString("fr-FR")} XAF
            </Text>
          </View>

         

          {/* MONTANT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Montant à transférer</Text>
            <Text style={styles.amountDisplay}>
              {amount.toLocaleString("fr-FR")}{" "}
              <Text style={styles.currency}>{symbol}</Text>
            </Text>

            <View style={styles.presetsGrid}>
              {presets.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.presetBtn,
                    amount === val && styles.presetActive,
                    val > (walletBalance || 0) && styles.presetDisabled,
                  ]}
                  onPress={() => handlePreset(val)}
                  disabled={val > (walletBalance || 0)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      amount === val && styles.presetTextActive,
                    ]}
                  >
                    {val.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.customInput}
              placeholder="Montant personnalisé..."
              keyboardType="numeric"
              value={customInput}
              onChangeText={handleCustomAmount}
            />
          </View>

          {/* DESTINATAIRE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destinataire</Text>
            <TextInput
              style={styles.input}
              placeholder="Email "
              keyboardType="email-address"
              autoCapitalize="none"
              value={recipient}
              onChangeText={setRecipient}
            />
            <Text style={styles.helpText}>Exemple : jean@gmail.com</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (!canTransfer || loading) && { opacity: 0.5 },
          ]}
          onPress={initiateTransfer}
          disabled={!canTransfer || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>Envoyer l’argent</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// === MÊMES STYLES QUE LE WITHDRAW (harmonie totale) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111111" },
  refreshButton: { padding: 4 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 30 },

  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#00BFA5",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceLabel: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontWeight: "700", color: "#00BFA5" },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },

  amountDisplay: {
    fontSize: 40,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 16,
  },
  currency: { fontSize: 20, color: "#6B7280" },

  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  presetBtn: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  presetActive: { backgroundColor: "#00BFA5", borderColor: "#00BFA5" },
  presetDisabled: { opacity: 0.5 },
  presetText: { fontSize: 13, color: "#374151" },
  presetTextActive: { color: "#FFFFFF", fontWeight: "600" },

  customInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },

  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#00BFA5" },
  confirmBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#00BFA5",
    alignItems: "center",
  },
  confirmText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
