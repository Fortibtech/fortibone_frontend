// app/withdraw.tsx
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
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardField, StripeProvider } from "@stripe/stripe-react-native";

import { createWithdraw, GetWallet } from "@/api/wallet";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

// Types & constantes
type Method = "KARTAPAY" | "STRIPE";
const presets = [10000, 25000, 50000, 100000, 200000];
const MIN_AMOUNT = 1000;
const MAX_AMOUNT_STRIPE = 650000;

// COMPOSANT INTERNE (useStripe interdit ici → on ne l’utilise plus du tout en retrait)
function WithdrawContent() {
  const [method, setMethod] = useState<Method>("KARTAPAY");
  const [amount, setAmount] = useState<number>(25000);
  const [customInput, setCustomInput] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const business = useBusinessStore((state) => state.business);
  const [symbol, setSymbol] = useState<string | null>(null);
  // Récupération du solde
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
      console.error("Erreur récupération solde:", err);
      setWalletBalance(0);
      Alert.alert("Erreur", "Impossible de charger votre solde");
    } finally {
      setFetchingBalance(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [fetchBalance])
  );

  // Gestion presets
  const handlePreset = (val: number) => {
    if (val > (walletBalance || 0)) {
      Alert.alert(
        "Solde insuffisant",
        `Vous avez seulement ${(
          walletBalance || 0
        ).toLocaleString()} ${symbol} sur votre compte`
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
      const maxAllowed =
        method === "STRIPE"
          ? Math.min(MAX_AMOUNT_STRIPE, walletBalance || 0)
          : walletBalance || 0;

      if (num > maxAllowed) {
        Alert.alert(
          "Limite dépassée",
          method === "STRIPE"
            ? `Maximum Stripe : ${MAX_AMOUNT_STRIPE.toLocaleString()} ${symbol}`
            : "Vous n'avez pas assez sur votre solde"
        );
        return;
      }
      setAmount(num);
    } else {
      setAmount(0);
    }
  };

  // Lancement du retrait
  const initiateWithdraw = async () => {
    if (amount < MIN_AMOUNT || amount > (walletBalance || 0)) {
      Alert.alert(
        "Montant invalide",
        `Doit être entre ${MIN_AMOUNT} et ${(
          walletBalance || 0
        ).toLocaleString()} ${symbol}`
      );
      return;
    }

    if (method === "KARTAPAY" && !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      Alert.alert(
        "Numéro invalide",
        "Format international requis : +33612345678"
      );
      return;
    }

    if (method === "STRIPE" && !cardComplete) {
      Alert.alert(
        "Carte incomplète",
        "Veuillez remplir tous les champs de la carte"
      );
      return;
    }

    setLoading(true);

    try {
      if (method === "KARTAPAY") {
        const resp = await createWithdraw({
          amount,
          method: "KARTAPAY",
          metadata: {
            mobileMoneyNumber: phoneNumber.trim(),
            note: "Retrait via application mobile",
          },
        });

        if (resp.onboardingUrl) {
          Alert.alert(
            "Compte non lié",
            "Vous devez connecter votre numéro Mobile Money pour recevoir l'argent",
            [
              { text: "Plus tard", style: "cancel" },
              {
                text: "Lier maintenant",
                onPress: () => Linking.openURL(resp.onboardingUrl!),
              },
            ]
          );
          return;
        }

        if (!resp.success) {
          Alert.alert(
            "Échec",
            resp.message || "Impossible de traiter le retrait"
          );
          return;
        }

        Alert.alert(
          "Retrait envoyé !",
          `${amount.toLocaleString()} ${symbol} seront versés sur ${phoneNumber}\nDélai : 1 à 48h`,
          [{ text: "Super !", onPress: () => router.back() }]
        );
        return;
      }

      // RETRAIT STRIPE → PAS de createPaymentMethod ! (c'était la source du crash)
      const resp = await createWithdraw({
        amount,
        method: "STRIPE",
      });

      // Première fois → onboarding Stripe Connect
      if (resp.onboardingUrl) {
        Alert.alert(
          "Première fois ?",
          "Vous devez finaliser la configuration de votre carte pour les retraits",
          [
            { text: "Plus tard", style: "cancel" },
            {
              text: "Configurer maintenant",
              onPress: () => Linking.openURL(resp.onboardingUrl!),
            },
          ]
        );
        return;
      }

      if (!resp.success) {
        Alert.alert("Échec", resp.message || "Retrait refusé par la banque");
        return;
      }

      Alert.alert(
        "Retrait sur carte demandé !",
        `${amount.toLocaleString()} ${symbol} seront crédités sur votre carte sous 2 à 7 jours ouvrés`,
        [{ text: "Parfait", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error("Erreur retrait:", err);
      if (err.message === "TOKEN_EXPIRED") {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        router.replace("/login");
      } else {
        Alert.alert("Erreur", err.message || "Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  const canWithdraw =
    amount >= MIN_AMOUNT &&
    amount <= (walletBalance || 0) &&
    (method === "KARTAPAY" ? phoneNumber.length > 8 : cardComplete);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.headerTitle}>Retrait d&apos;Argent</Text>
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
          {/* SOLDE */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>
              {(walletBalance || 0).toLocaleString("fr-FR")} {symbol}
            </Text>
          </View>

          {/* MÉTHODE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Méthode de retrait</Text>
            <View style={styles.methodTabs}>
              <TouchableOpacity
                style={[styles.tab, method === "KARTAPAY" && styles.tabActive]}
                onPress={() => setMethod("KARTAPAY")}
              >
                <Text
                  style={[
                    styles.tabText,
                    method === "KARTAPAY" && styles.tabTextActive,
                  ]}
                >
                  Mobile Money
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, method === "STRIPE" && styles.tabActive]}
                onPress={() => setMethod("STRIPE")}
              >
                <Text
                  style={[
                    styles.tabText,
                    method === "STRIPE" && styles.tabTextActive,
                  ]}
                >
                  Carte bancaire
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* MONTANT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Montant à retirer</Text>
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
                      val > (walletBalance || 0) && { color: "#999999" },
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

          {/* CHAMPS SPÉCIFIQUES */}
          {method === "KARTAPAY" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Numéro Mobile Money</Text>
              <TextInput
                style={styles.input}
                placeholder="+261 34 12 34 56 ou +33 6 12 34 56 78"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <Text style={styles.helpText}>
                L&apos;argent sera envoyé sur ce numéro (MVola, Orange Money,
                MTN, etc.)
              </Text>
            </View>
          )}

          {/* {method === "STRIPE" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Carte de retrait</Text>
              <View style={styles.cardWrapper}>
                <CardField
                  postalCodeEnabled={false}
                  placeholders={{ number: "4242 4242 4242 4242" }}
                  cardStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    textColor: "#000000",
                    placeholderColor: "#999999",
                  }}
                  style={{ width: "100%", height: 50 }}
                  onCardChange={(card) => setCardComplete(card.complete)}
                />
              </View>
              <Text style={styles.helpText}>
                Délai : 2 à 7 jours ouvrés • Frais possibles selon votre banque
              </Text>
            </View>
          )} */}
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
          style={[styles.confirmBtn, !canWithdraw && { opacity: 0.5 }]}
          onPress={initiateWithdraw}
          disabled={!canWithdraw || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>
              {method === "STRIPE"
                ? "Retrait sur carte"
                : "Retrait Mobile Money"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// COMPOSANT PRINCIPAL
export default function WithdrawScreen() {
  return (
    <StripeProvider
      publishableKey="pk_test_51PBf5wRqgxgrSOxzkT3CoAj3wnYQKPSKxZLmtaH9lt8XXO8NoIknakl1nMxj14Mj25f3VC56dchbm7E4ATNXco2200dXM6svtP"
      merchantIdentifier="merchant.com.votreapp" // ← Change par ton vrai ID iOS
    >
      <WithdrawContent />
    </StripeProvider>
  );
}

// STYLES (100 % safe)
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

  methodTabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { backgroundColor: "#00BFA5" },
  tabText: { fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#FFFFFF" },

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
  cardWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 4,
    overflow: "hidden",
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
    justifyContent: "center",
  },
  confirmText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
