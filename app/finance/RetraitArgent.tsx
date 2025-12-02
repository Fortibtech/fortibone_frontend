// app/deposit.tsx
import React, { useState, useCallback } from "react";
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
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import {
  CardField,
  useStripe,
  StripeProvider,
} from "@stripe/stripe-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createDeposit, GetWallet } from "@/api/wallet";
import BackButtonAdmin from "@/components/Admin/BackButton";

type Method = "STRIPE" | "KARTAPAY";

const presets = [10000, 20000, 50000, 150000];
const MAX_AMOUNT = 99999;

export default function DepositScreen() {
  const { confirmPayment, createPaymentMethod } = useStripe();

  const [method, setMethod] = useState<Method>("KARTAPAY");
  const [amount, setAmount] = useState<number>(10000);
  const [customInput, setCustomInput] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [fetchingBalance, setFetchingBalance] = useState(true);

  // Récupération du solde au focus (comme dans Retrait)
  const fetchBalance = useCallback(async () => {
    try {
      setFetchingBalance(true);
      const data = await GetWallet();
      const balance = parseFloat(data?.balance || "0") || 0;
      setWalletBalance(balance);
    } catch (err) {
      console.error("Erreur solde:", err);
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

  const handlePreset = (val: number) => {
    setAmount(val);
    setCustomInput("");
    Keyboard.dismiss();
  };

  const handleCustomAmount = (text: string) => {
    const nums = text.replace(/[^0-9]/g, "");
    setCustomInput(nums);
    if (nums) {
      const numVal = parseInt(nums);
      if (numVal > MAX_AMOUNT) {
        Alert.alert(
          "Limite dépassée",
          `Maximum : ${MAX_AMOUNT.toLocaleString("fr-FR")} XAF`
        );
        return;
      }
      setAmount(numVal);
    } else {
      setAmount(0);
    }
  };

  const initiateDeposit = async () => {
    if (amount < 1000) {
      Alert.alert("Montant trop bas", "Minimum : 1 000 XAF");
      return;
    }
    if (amount > MAX_AMOUNT) {
      Alert.alert(
        "Limite dépassée",
        `Maximum : ${MAX_AMOUNT.toLocaleString("fr-FR")} XAF (Stripe)`
      );
      return;
    }

    if (method === "KARTAPAY" && !/^\+(261|237)\d{8,10}$/.test(phoneNumber)) {
      Alert.alert("Numéro invalide", "Format : +261XXXXXXXXX ou +237XXXXXXXXX");
      return;
    }

    if (method === "STRIPE" && !cardComplete) {
      Alert.alert("Carte incomplète", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      if (method === "KARTAPAY") {
        await createDeposit({
          amount,
          method: "KARTAPAY",
          metadata: { phoneNumber, note: "Dépôt via application mobile" },
        });

        Alert.alert(
          "Demande envoyée !",
          `Vous recevrez une notification MVola/Orange Money pour ${amount.toLocaleString(
            "fr-FR"
          )} XAF`,
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      // STRIPE
      const { paymentMethod, error: pmError } = await createPaymentMethod({
        paymentMethodType: "Card",
      });

      if (pmError || !paymentMethod) {
        Alert.alert(
          "Carte invalide",
          pmError?.message || "Impossible de lire la carte"
        );
        return;
      }

      const resp = await createDeposit({
        amount,
        method: "STRIPE",
        metadata: {
          paymentMethodId: paymentMethod.id,
          note: "Dépôt par carte bancaire",
        },
      });

      if (resp.data?.clientSecret) {
        const { error } = await confirmPayment(resp.data.clientSecret, {
          paymentMethodType: "Card",
        });

        if (error) {
          Alert.alert("Paiement refusé", error.message || "Échec du paiement");
          return;
        }
      } else {
        // Sécurité : si pas de clientSecret → on considère échec
        Alert.alert("Erreur", "Paiement non confirmé par le serveur");
        return;
      }

      Alert.alert(
        "Dépôt réussi !",
        `${amount.toLocaleString("fr-FR")} XAF ajoutés à votre portefeuille`,
        [{ text: "Terminé", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error("Erreur dépôt:", err);
      const message =
        err.response?.data?.message || err.message || "Erreur inconnue";
      if (err.message === "TOKEN_EXPIRED") {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        router.replace("/login");
      } else {
        Alert.alert("Erreur", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StripeProvider publishableKey="pk_test_51PBf5wRqgxgrSOxzkT3CoAj3wnYQKPSKxZLmtaH9lt8XXO8NoIknakl1nMxj14Mj25f3VC56dchbm7E4ATNXco2200dXM6svtP">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <BackButtonAdmin />
          <Text style={styles.headerTitle}>Dépôt d&apos;Argent</Text>
          <TouchableOpacity style={styles.menuButton} onPress={fetchBalance}>
            {fetchingBalance ? (
              <ActivityIndicator size="small" color="#58617b" />
            ) : (
              <Ionicons name="refresh" size={22} color="#000" />
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* Solde actuel */}
            <View style={styles.soldeCard}>
              <View style={styles.soldeHeader}>
                <Ionicons name="wallet-outline" size={20} color="#6B7280" />
                <Text style={styles.soldeLabel}>Solde actuel</Text>
              </View>
              <Text style={styles.soldeAmount}>
                {(walletBalance || 0).toLocaleString("fr-FR")} XAF
              </Text>
            </View>

            {/* Méthode */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Méthode de dépôt</Text>
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    method === "KARTAPAY" && styles.tabActive,
                  ]}
                  onPress={() => setMethod("KARTAPAY")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      method === "KARTAPAY" && styles.tabTextActive,
                    ]}
                  >
                    MVola / Orange Money
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

            {/* Montant */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Montant à déposer</Text>
              <Text style={styles.amountDisplay}>
                {amount.toLocaleString("fr-FR")}
                <Text style={styles.amountCurrency}> XAF</Text>
              </Text>

              <View style={styles.presetsContainer}>
                {presets.map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.presetButton,
                      amount === val && styles.presetButtonActive,
                    ]}
                    onPress={() => handlePreset(val)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        amount === val && styles.presetTextActive,
                      ]}
                    >
                      {val.toLocaleString("fr-FR")}
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

            {/* Champs spécifiques */}
            {method === "KARTAPAY" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Numéro de téléphone</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="+261 34 12 345 67"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            )}

            {method === "STRIPE" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Carte bancaire</Text>
                <View style={styles.cardFieldContainer}>
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
                    onCardChange={(details) =>
                      setCardComplete(details.complete)
                    }
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Boutons sticky */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, loading && { opacity: 0.7 }]}
            onPress={initiateDeposit}
            disabled={
              loading || (method === "STRIPE" && !cardComplete) || amount < 1000
            }
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>
                {method === "STRIPE" ? "Payer par carte" : "Continuer"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
}

// Styles 100% cohérents avec RetraitArgent
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  menuButton: { padding: 4 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  soldeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#06B6D4",
  },
  soldeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  soldeLabel: { fontSize: 14, color: "#6B7280", marginLeft: 6 },
  soldeAmount: { fontSize: 32, fontWeight: "700", color: "#10B981" },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { backgroundColor: "#10B981" },
  tabText: { fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#FFFFFF" },

  amountDisplay: {
    fontSize: 40,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  amountCurrency: { fontSize: 20, color: "#6B7280" },

  presetsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  presetButtonActive: { backgroundColor: "#10B981", borderColor: "#10B981" },
  presetText: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
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

  phoneInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },

  cardFieldContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 4,
  },

  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#10B981" },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
