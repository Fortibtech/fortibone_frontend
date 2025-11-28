// app/deposit.tsx
import { useState } from "react";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  CardField,
  useStripe,
  StripeProvider,
} from "@stripe/stripe-react-native";

import { createDeposit } from "@/api/wallet";

type Method = "STRIPE" | "KARTAPAY";

const presets = [10000, 20000, 50000, 15000]; // OK pour Stripe (max ~600M XAF safe)
const MAX_AMOUNT_XAF = 99999; // Limite safe (~1M USD equiv, sous 999k USD Stripe)

export default function DepositScreen() {
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [method, setMethod] = useState<Method>("STRIPE");
  const [amount, setAmount] = useState<string>("500000");
  const [customInput, setCustomInput] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

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
        `Montant max : ${MAX_AMOUNT_XAF.toLocaleString(
          "fr-FR"
        )} XAF (limite Stripe)`
      );
      return;
    }

    if (method === "KARTAPAY" && !/^\+(261|237)\d{8,9}$/.test(phoneNumber)) {
      // Regex affinée
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
      // ================== MVOLA ==================
      if (method === "KARTAPAY") {
        console.log("Envoi dépôt KARTAPAY →", {
          amount: numAmount,
          method: "KARTAPAY",
          phoneNumber,
        });

        const response = await createDeposit({
          amount: numAmount,
          method: "KARTAPAY",
          metadata: {
            phoneNumber,
            note: "Dépôt via application mobile",
          },
        });

        console.log("Réponse KARTAPAY :", response);

        Alert.alert(
          "Demande MVola envoyée !",
          `Vous allez recevoir une notification pour confirmer le paiement de ${formattedAmount} XAF`,
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      // ================== STRIPE ==================
      if (method === "STRIPE") {
        console.log("Création du PaymentMethod Stripe...");

        const { paymentMethod, error: pmError } = await createPaymentMethod({
          paymentMethodType: "Card",
        });

        if (pmError || !paymentMethod) {
          console.error("Erreur création PaymentMethod :", pmError);
          Alert.alert(
            "Carte invalide",
            pmError?.message || "Impossible de lire la carte"
          );
          return;
        }

        console.log("PaymentMethod créé →", paymentMethod.id);

        console.log("Envoi dépôt STRIPE →", {
          amount: numAmount,
          method: "STRIPE",
          paymentMethodId: paymentMethod.id,
        });

        const resp = await createDeposit({
          amount: numAmount,
          method: "STRIPE",
          metadata: {
            paymentMethodId: paymentMethod.id, // OBLIGATOIRE
            note: "Dépôt via carte bancaire",
          },
        });

        console.log("Réponse backend STRIPE :", resp);

        // Si ton backend renvoie un clientSecret → 3D Secure requis
        if (resp.data?.clientSecret) {
          console.log("3D Secure requis → clientSecret reçu");

          const { error, paymentIntent } = await confirmPayment(
            resp.data.clientSecret,
            {
              paymentMethodType: "Card",
            }
          );

          if (error) {
            console.error("Erreur 3D Secure :", error);
            Alert.alert(
              "Paiement refusé",
              error.message || "Échec du paiement"
            );
            return;
          }

          console.log("Paiement 3D Secure réussi →", paymentIntent?.status);
        } else {
          console.log("Paiement direct réussi (sans 3D Secure)");
        }

        Alert.alert(
          "Dépôt réussi !",
          `${formattedAmount} XAF ont été ajoutés à votre portefeuille`,
          [{ text: "Terminé", onPress: () => router.back() }]
        );
      }
    } catch (err: any) {
      console.error(
        "Erreur critique dépôt :",
        err.response?.data || err.message || err
      );

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

  return (
    <StripeProvider publishableKey="pk_test_51PBf5wRqgxgrSOxzkT3CoAj3wnYQKPSKxZLmtaH9lt8XXO8NoIknakl1nMxj14Mj25f3VC56dchbm7E4ATNXco2200dXM6svtP">
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Méthode */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Méthode</Text>
            <View style={styles.card}>
              <View style={styles.tabs}>
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
              </View>
            </View>
          </View>

          {/* Montant */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Montant</Text>
            <View style={styles.card}>
              <View style={styles.amountContainer}>
                <Text style={styles.amountValue}>{formattedAmount}</Text>
                <Text style={styles.currency}>XAF</Text>{" "}
                {/* Uniformisé en XAF */}
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

          {/* MVola */}
          {method === "KARTAPAY" && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Numéro MVola / Orange Money
              </Text>
              <View style={styles.card}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="+261 34 12 345 67"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Boutons du bas */}
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

// === TES STYLES ORIGINAUX 100% RESPECTÉS ===
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
