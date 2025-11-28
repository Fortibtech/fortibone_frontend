import { DepositMethodEnum, DepositWallet } from "@/api/wallet";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
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

const CreatDepositWallet = () => {
  const [amount, setAmount] = useState("");
  const [method] = useState<DepositMethodEnum>(DepositMethodEnum.MANUAL);
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide supérieur à 0");
      return;
    }

    try {
      setLoading(true);
      const res = await DepositWallet({
        amount: parsedAmount,
        method: DepositMethodEnum.MANUAL,
      });

      if (res.status === "FAILED") {
        Alert.alert("Échec", res.message || "Erreur inconnue lors du dépôt");
        return;
      }

      Alert.alert(
        "Succès",
        `Dépôt ${
          res.status === "PENDING" ? "en attente de validation" : "effectué"
        }`
      );
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[cardStyle, styles.cardContainer]}>
        <Text style={styles.title}>💰 Recharger mon portefeuille</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Montant</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 5000"
            placeholderTextColor={colors.textDisabled}
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
            accessibilityLabel="Montant du dépôt"
            accessibilityHint="Entrez le montant à déposer en chiffres"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Méthode de paiement</Text>
          <View style={styles.pickerContainer}>
            <Picker
              enabled={false}
              selectedValue={method}
              style={styles.picker}
              accessibilityLabel="Méthode de paiement"
              accessibilityHint="Méthode de dépôt, actuellement fixé à Manuel"
            >
              <Picker.Item
                label="Manuel (Validation par un administrateur)"
                value={DepositMethodEnum.MANUAL}
              />
              <Picker.Item
                label="Stripe (Bientôt disponible)"
                value={DepositMethodEnum.STRIPE}
                enabled={false}
              />
              <Picker.Item
                label="Mvola (En conception)"
                value={DepositMethodEnum.MVOLA}
                enabled={false}
              />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleDeposit}
          disabled={loading}
          activeOpacity={0.7}
          accessibilityLabel="Soumettre le dépôt"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              Soumettre un dépôt manuel
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreatDepositWallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  cardContainer: {
    marginTop: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textDisabled,
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
