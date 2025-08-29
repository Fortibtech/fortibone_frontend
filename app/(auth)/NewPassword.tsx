import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "@/api/authService"; // 🔑 ton API resetPassword
import { useUserStore } from "@/store/userStore"; // ✅ ton store
import { ResetPasswordPayload } from "@/types/auth";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 👉 Récupération des données stockées
  const { email, otp } = useUserStore();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      // ✅ Vérification visuelle
      if (!email || !otp || !newPassword) {
        throw new Error("Email, OTP ou mot de passe manquant.");
      }
      const payload: ResetPasswordPayload = { email, otp, newPassword };

      // 👉 Appel de ton API backend avec email + otp + password
      const result = await resetPassword(payload);

      if (result.success && result.status === 201) {
        router.replace("/success-screen");
      }
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible de réinitialiser.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <Text style={styles.title}>Créer un nouveau mot de passe</Text>
      <Text style={styles.instruction}>
        Votre mot de passe doit être différent de l’ancien.
      </Text>

      <View style={styles.form}>
        <InputField
          label="Mot de passe"
          placeholder="Entrez votre nouveau mot de passe"
          secureTextEntry={true}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <InputField
          label="Confirmer le mot de passe"
          placeholder="Confirmez votre mot de passe"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={styles.button}>
          <CustomButton
            title={
              loading ? "Changement en cours..." : "Changer le mot de passe"
            }
            backgroundColor="#059669"
            textColor="#fff"
            width={343}
            borderRadius={50}
            fontSize={16}
            onPress={handleResetPassword}
            disabled={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 30,
  },
  form: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#1A202C",
    fontWeight: "600",
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
  instruction: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ResetPassword;
