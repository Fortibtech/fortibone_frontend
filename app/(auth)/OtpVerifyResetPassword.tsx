import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import { resendOtp } from "@/api/authService";

const OtpVerify = () => {
  const { email } = useUserStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // ✅ 6 cases
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 600 secondes = 10 minutes
  const router = useRouter();
  const inputsRef = useRef<TextInput[]>([]);

  // Timer de 10 minutes
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (/^[0-9]$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Passer automatiquement au champ suivant
      if (index < 5 && text) {
        // ✅ Adapté pour 6 cases
        inputsRef.current[index + 1]?.focus();
      }
    } else if (text === "") {
      // Suppression
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");

    if (code.length < 6) {
      // ✅ Validation pour 6 chiffres
      Alert.alert("Erreur", "Veuillez entrer le code complet à 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      console.log("Code OTP saisi:", code, "pour email:", email);

      // ✅ Sauvegarde OTP dans le store
      useUserStore.getState().setOtp(code);

      // Appeler l'API pour valider le code
      router.replace("/(auth)/NewPassword");
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // Formattage du timer en mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleResendOtp = async () => {
    try {
      const result = await resendOtp(`${email}`, "PASSWORD_RESET");
      console.log("✅ OTP renvoyé:", result.message);
      Alert.alert("Succès", "✅ OTP renvoyé");
    } catch (error: any) {
      console.log("⚠️ Erreur:", error.message);
      Alert.alert("Erreur", `${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.title}>Vérification du code</Text>
        <Text style={styles.description}>
          Veuillez saisir le code de vérification à 6 chiffres envoyé à {email}.
        </Text>
      </View>

      <View style={styles.form}>
        {/* Timer */}
        <Text style={styles.timer}>{formatTime(timer)}</Text>

        {/* 6 champs OTP */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el!;
              }}
              style={[
                styles.otpInput,
                digit !== "" && { borderColor: "#16a34a" }, // Focus rempli en vert
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Renvoyer le code */}
        <TouchableOpacity onPress={handleResendOtp}>
          <Text style={styles.subtitle}>
            Vous n&apos;avez pas reçu le code ?{" "}
            <Text style={{ color: timer > 0 ? "#9ca3af" : "#16a34a" }}>
              Renvoyer
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.button}>
          <CustomButton
            title={loading ? "Vérification..." : "Valider"}
            backgroundColor={otp.every((d) => d !== "") ? "#16a34a" : "#e6e7e7"}
            textColor={otp.every((d) => d !== "") ? "#fff" : "#aeb3b3"}
            width={343}
            borderRadius={50}
            fontSize={16}
            onPress={handleSubmit}
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
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#16a34a",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 30,
  },
  otpInput: {
    width: 48, // ✅ Taille réduite
    height: 48, // ✅ Taille réduite
    borderWidth: 2,
    borderRadius: 14, // Ajusté pour ~30% d'arrondi
    textAlign: "center",
    fontSize: 20, // Réduit pour s'adapter
    color: "#121111",
    borderColor: "#d1d5db",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 5,
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: 20,
  },
});

export default OtpVerify;
