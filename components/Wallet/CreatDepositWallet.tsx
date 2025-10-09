import { DepositMethodEnum, DepositWallet } from "@/api/wallet"; // adapte le chemin selon ton projet
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
const CreatDepositWallet = () => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<DepositMethodEnum>(
    DepositMethodEnum.STRIPE
  );
  const [loading, setLoading] = useState(false);
  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }
    setLoading(true);
    const res = await DepositWallet({
      amount: Number(amount),
      method,
    });
    setLoading(false);
    if (res.status === "FAILED") {
      Alert.alert("Échec", res.message || "Erreur inconnue");
      return;
    }
    Alert.alert(
      "Succès",
      `Dépôt ${
        res.status === "PENDING" ? "en attente" : "terminé"
      } via ${method}`
    );

    // Ici, tu peux rediriger selon la méthode
    if (method === "STRIPE" && res.clientSecret) {
      console.log(
        "🔹 Rediriger vers paiement Stripe avec clientSecret :",
        res.clientSecret
      );
    } else if (method === "MVOLA") {
      console.log("🔹 Afficher instructions MVOLA ou interface mobile money");
    } else if (method === "MANUAL") {
      console.log("🔹 Le dépôt manuel sera validé par un administrateur");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Recharger mon portefeuille</Text>

      <Text style={styles.label}>Montant</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 5000"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Méthode de paiement</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={method} onValueChange={(val) => setMethod(val)}>
          <Picker.Item
            label="Stripe (Carte bancaire)"
            value={DepositMethodEnum.STRIPE}
          />
          <Picker.Item
            label="Mvola (Mobile Money)"
            value={DepositMethodEnum.MVOLA}
          />
          <Picker.Item
            label="Manuel (Validation admin)"
            value={DepositMethodEnum.MANUAL}
          />
        </Picker>
      </View>

      <Button
        title={loading ? "Traitement..." : "Initier le dépôt"}
        onPress={handleDeposit}
        disabled={loading}
      />
    </View>
  );
};

export default CreatDepositWallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 20,
  },
});
