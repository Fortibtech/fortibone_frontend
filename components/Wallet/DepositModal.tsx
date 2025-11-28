import { DepositMethodEnum, DepositWallet } from "@/api/wallet";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Couleurs cohérentes avec le WalletHeaderCard
const colors = {
  background: "#fafafb",
  surface: "#ffffff",
  primary: "#00af66",
  textPrimary: "#333333",
  textDisabled: "#9ca3af",
  border: "#e5e7eb",
};

export const DepositModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
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
      onClose();
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>💰 Recharger mon portefeuille</Text>

          {/* Montant */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Montant</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5000"
              placeholderTextColor={colors.textDisabled}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
              editable={!loading}
            />
          </View>

          {/* Méthode */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Méthode de paiement</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={method}
                enabled={false}
                style={styles.picker}
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

          {/* Bouton */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleDeposit}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Soumettre un dépôt manuel
              </Text>
            )}
          </TouchableOpacity>

          {/* Fermer modal */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✖️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DepositModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  closeText: {
    fontSize: 18,
  },
});
