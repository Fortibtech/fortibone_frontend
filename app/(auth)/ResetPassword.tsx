import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import React, { useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore"; // ✅ Import store
import { forgotPassword } from "@/api/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { setEmail: saveEmail } = useUserStore(); // ✅ accès au store
  const router = useRouter();

  const isValidEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide.");
      return;
    }

    setLoading(true);
    try {
      // 👉 Sauvegarde l'email dans Zustand (sera dispo dans l'autre écran)
      saveEmail(email);
      // 👉 Appel API pour envoyer le code (à adapter avec ton backend)
      console.log("Email envoyé à:", email);
      saveEmail(email);
      const res = await forgotPassword(email);
      if (res.status === 201) {
        Alert.alert("Succès", "Un code a été envoyé à votre email.");
        router.push("/(auth)/OtpVerifyResetPassword");
      }
    } catch (error: any) {
      Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.title}>Réinitialiser le mot de passe</Text>
        <Text style={styles.description}>
          Entrez votre email, nous vous enverrons un code de vérification à
          votre adresse.
        </Text>
      </View>

      <View style={styles.form}>
        <InputField
          label="Email"
          placeholder="Entrez votre email"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.button}>
          <CustomButton
            title={
              loading
                ? "Envoi..."
                : isValidEmail(email)
                ? "Envoyer le code"
                : "Continuer"
            }
            backgroundColor={isValidEmail(email) ? "#16a34a" : "#e6e7e7"}
            textColor={isValidEmail(email) ? "#fff" : "#aeb3b3"}
            width={343}
            borderRadius={50}
            fontSize={16}
            onPress={handleSendCode}
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
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  descriptionContainer: {
    marginVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#121111",
  },
  description: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 5,
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: 20,
  },
});

export default ForgotPassword;
