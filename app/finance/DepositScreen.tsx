// app/deposit.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView, // ← Ajouté
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  CardField,
  useStripe,
  StripeProvider,
} from "@stripe/stripe-react-native";

import { createDeposit } from "@/api/wallet";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
import { STRIPE_PUBLISHABLE_KEY } from "@/config/stripe";

type Method = "STRIPE" | "KARTAPAY";

const presets = [10000, 20000, 50000, 15000];
const MAX_AMOUNT_XAF = 99999;

export default function DepositScreen() {
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [method, setMethod] = useState<Method>("STRIPE");
  const [amount, setAmount] = useState<string>("500000");
  const [customInput, setCustomInput] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const business = useBusinessStore((state) => state.business);
  const [symbol, setSymbol] = useState<string | null>(null);
  const formattedAmount = amount
    ? parseInt(amount).toLocaleString("fr-FR")
    : "0";

  const handlePreset = (val: number) => {
    setAmount(val.toString());
    setCustomInput("");
    Keyboard.dismiss();
  };

  const handleCustomAmount = (text: string) => {
    const nums = text.replace(/[^0-9]/g, "");
    setCustomInput(nums);
    if (nums) {
      const numVal = parseInt(nums);
      if (numVal > MAX_AMOUNT_XAF) {
        Alert.alert(
          "Limite dépassée",
          `Montant max : ${MAX_AMOUNT_XAF.toLocaleString(
            "fr-FR"
          )} XAF (limite Stripe)`
        );
        return;
      }
      setAmount(nums);
    } else {
      setAmount("");
    }
  };

  const initiateDeposit = async () => {
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 1000) {
      Alert.alert("Erreur", "Montant minimum : 1 000 XAF");
      return;
    }
    if (numAmount > MAX_AMOUNT_XAF) {
      Alert.alert(
        "Limite dépassée",
        `Montant max : ${MAX_AMOUNT_XAF.toLocaleString("fr-FR")} XAF`
      );
      return;
    }

    if (method === "KARTAPAY" && !/^\+(261|237)\d{8,10}$/.test(phoneNumber)) {
      Alert.alert("Numéro invalide", "Format : +261XXXXXXXXX ou +237XXXXXXXXX");
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
        await createDeposit({
          amount: numAmount,
          method: "KARTAPAY",
          metadata: {
            phoneNumber,
            note: "Dépôt via application mobile",
          },
        });

        Alert.alert(
          "Demande MVola envoyée !",
          `Vous allez recevoir une notification pour confirmer le paiement de ${formattedAmount} XAF`,
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
        amount: numAmount,
        method: "STRIPE",
        metadata: {
          paymentMethodId: paymentMethod.id,
          note: "Dépôt via carte bancaire",
        },
      });

      // if (resp.data?.clientSecret) {
      //   const { error } = await confirmPayment(resp.data.clientSecret, {
      //     paymentMethodType: "Card",
      //   });

      //   if (error) {
      //     Alert.alert("Paiement refusé", error.message || "Échec du paiement");
      //     return;
      //   }
      // }

      Alert.alert(
        "Dépôt réussi !",
        `${formattedAmount} ont été ajoutés à votre portefeuille`,
        [{ text: "Terminé", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error("Erreur dépôt :", err.response?.data || err.message || err);

      if (err.message === "TOKEN_EXPIRED") {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        router.replace("/login");
      } else {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue";
        Alert.alert("Erreur", message);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchSymbol = async () => {
      if (!business) return;
      const symbol = await getCurrencySymbolById(business.currencyId);
      setSymbol(symbol);
    };
    fetchSymbol();
  }, [business]);

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dépôt d&apos;Argent</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Feather name="more-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
          </View>
        </View>

        {/* SOLUTION CLAVIER : KeyboardAvoidingView + ScrollView */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true} // Crucial sur Android
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"} // Bonus iOS
          >
            {/* Méthode */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Méthode</Text>
              <View style={styles.card}>
                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      method === "STRIPE" && styles.tabActive,
                    ]}
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
                      KARTAPAY
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Montant */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Montant</Text>
              <View style={styles.card}>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountValue}>{formattedAmount}</Text>
                  <Text style={styles.currency}>{symbol}</Text>
                </View>

                <View style={styles.amountOptions}>
                  {presets.map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.amountOption,
                        parseInt(amount) === val && styles.amountOptionActive,
                      ]}
                      onPress={() => handlePreset(val)}
                    >
                      <Text
                        style={[
                          styles.amountOptionText,
                          parseInt(amount) === val &&
                          styles.amountOptionTextActive,
                        ]}
                      >
                        {val.toLocaleString("fr-FR")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.customAmountInput}
                  placeholder="Montant personnalisé..."
                  keyboardType="numeric"
                  value={
                    customInput
                      ? parseInt(customInput).toLocaleString("fr-FR")
                      : ""
                  }
                  onChangeText={handleCustomAmount}
                />
              </View>
            </View>

            {/* Carte bancaire */}
            {method === "STRIPE" && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Carte bancaire</Text>
                <View style={styles.card}>
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
                    onCardChange={(cardDetails) =>
                      setCardComplete(cardDetails.complete)
                    }
                  />
                </View>
              </View>
            )}

            {/* MVola / Orange Money */}
            {method === "KARTAPAY" && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Numéro de téléphone
                </Text>
                <View style={styles.card}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="+261 34 12 345 67"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    autoComplete="tel"
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Boutons du bas (sticky) */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, loading && { opacity: 0.7 }]}
            onPress={initiateDeposit}
            disabled={loading || (method === "STRIPE" && !cardComplete)}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {method === "STRIPE" ? "Payer par carte" : "Continuer"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
}

// === STYLES INCHANGÉS (100% identiques à ton design original) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  menuButton: { padding: 4 },

  progressContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  progressBar: { flexDirection: "row", gap: 4, height: 3 },
  progressSegment: { flex: 1, backgroundColor: "#E0E0E0", borderRadius: 2 },
  progressActive: { backgroundColor: "#00BFA5" },

  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    padding: 16,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { backgroundColor: "#00BFA5" },
  tabText: { fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#FFFFFF" },

  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
  },
  currency: { fontSize: 16, fontWeight: "600", color: "#666", marginLeft: 8 },

  amountOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  amountOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  amountOptionActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#00BFA5",
    borderWidth: 2,
  },
  amountOptionText: { fontSize: 13, fontWeight: "500", color: "#666" },
  amountOptionTextActive: { color: "#00BFA5", fontWeight: "600" },

  customAmountInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#FAFAFA",
    marginTop: 8,
  },

  phoneInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },

  bottomContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#00BFA5" },
  confirmButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#00BFA5",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
