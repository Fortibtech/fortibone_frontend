import { loginUser, resendOtp } from "@/api/authService"; // <-- ton service loginUser
import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { useUserStore } from "@/store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fonction pour gérer la soumission du formulaire
  const handleLogin = async () => {
    const setEmail = useUserStore.getState().setEmail;

    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser(email, password);
      await AsyncStorage.setItem("access_token", result.token);
      if (result.success && result.token) {
        console.log("apres connection ", result.token);
        await AsyncStorage.setItem("access_token", result.token);
        useUserStore.getState().setToken(result.token);

        Alert.alert("Succès", "Connexion réussie !");
        router.replace("/(professionnel)");
      }
    } catch (err: any) {
      // ⚡ Cas email non vérifié
      if (err.message === "EMAIL_NOT_VERIFIED") {
        try {
          await resendOtp(email, "EMAIL_VERIFICATION");

          // ✅ Stocke l'email dans le store
          setEmail(email);

          Alert.alert(
            "OTP envoyé",
            err.originalMessage ||
              "Un code de vérification a été envoyé à votre email."
          );

          // 🔄 Redirection vers l'écran OTP sans passer l'email
          router.push("/(auth)/OtpScreen");
        } catch (otpErr) {
          console.error("Erreur lors du renvoi de l'OTP :", otpErr);
          Alert.alert(
            "Erreur",
            "Impossible de renvoyer l'OTP. Réessayez plus tard."
          );
        }
      } else {
        Alert.alert("Erreur de connexion", err.message || "Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <Text style={styles.title}>Se connecter</Text>

      <View style={styles.form}>
        <InputField
          label="Email"
          placeholder="Entrez votre email"
          value={email}
          onChangeText={setEmail}
        />

        <InputField
          label="Mot de passe"
          placeholder="Entrez votre mot de passe"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/ResetPassword")}
          style={{ alignSelf: "flex-end", position: "relative", right: 27 }}
        >
          <Text style={{ color: "#059669", fontWeight: "600" }}>
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>

        <View style={styles.button}>
          <CustomButton
            title={loading ? "Connexion..." : "Se connecter"}
            backgroundColor="#059669"
            textColor="#fff"
            width={343}
            borderRadius={50}
            fontSize={16}
            onPress={handleLogin}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.resgister}>
        <Text>Vous n&apos;avez pas encore de compte ?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={{ color: "#059669", fontWeight: "600" }}>
            inscrivez-vous
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  resgister: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  button: {
    marginTop: 20,
  },
});

export default Login;
