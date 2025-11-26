// ProOtpVerify.tsx
import { resendOtp, verifyEmail } from "@/api/authService";
import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProOtpVerify = () => {
  const email = useUserStore((state) => state.email);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const router = useRouter();
  const inputsRef = useRef<TextInput[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (/^[0-9]$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      // Auto-focus next input
      if (index < 5) inputsRef.current[index + 1]?.focus();
    } else if (text === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Erreur", "Veuillez entrer le code complet à 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Code OTP saisi:", code, "pour email:", email);

      // Vérification du code + récupération du token et du profil
      const data = await verifyEmail(email!, code);

      // Sauvegarde du token
      const store = useUserStore.getState();
      await store.setToken(data.access_token);

      // Met à jour le profil dans le store
      if (data.userProfile) {
        store.setUserProfile(data.userProfile);
        console.log("✅ Profil mis à jour après OTP:", data.userProfile);
      } else {
        // Fallback : rafraîchit depuis l'API si le profil n'est pas renvoyé
        await store.refreshProfile();
      }

      Alert.alert(
        "✅ Succès",
        "Votre compte est vérifié ! Vous pouvez maintenant vous connectez et créer votre premier commerce.",
        [
          {
            text: "OK",
            onPress: () => {
              // Redirection vers la création du commerce
              router.replace("/(auth)/login");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Erreur vérification OTP:", error);
      Alert.alert("Erreur", error.message || "OTP invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) {
      Alert.alert(
        "Attention",
        `Vous pourrez renvoyer un code dans ${formatTime(timer)}`
      );
      return;
    }

    try {
      const result = await resendOtp(email!, "EMAIL_VERIFICATION");
      console.log("✅ OTP renvoyé:", result.message);
      Alert.alert("Succès", "Un nouveau code a été envoyé à votre email");
      setTimer(600); // Reset timer à 10 minutes
      setOtp(["", "", "", "", "", ""]); // Reset OTP inputs
      inputsRef.current[0]?.focus();
    } catch (error: any) {
      console.error("⚠️ Erreur:", error);
      Alert.alert("Erreur", error.message || "Impossible de renvoyer l'OTP");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={styles.content}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.title}>Vérification du code</Text>
          <Text style={styles.description}>
            Veuillez saisir le code de vérification à 6 chiffres envoyé à{" "}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={[styles.timer, timer <= 60 && styles.timerWarning]}>
            {formatTime(timer)}
          </Text>
          <Text style={styles.timerLabel}>
            {timer > 0 ? "Temps restant" : "Code expiré"}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el!;
              }}
              style={[
                styles.otpInput,
                digit !== "" && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={timer > 0}
          style={styles.resendContainer}
        >
          <Text style={styles.resendText}>
            Vous n&apos;avez pas reçu le code ?{" "}
            <Text
              style={[
                styles.resendLink,
                timer > 0 && styles.resendLinkDisabled,
              ]}
            >
              Renvoyer
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={loading ? "Vérification..." : "Valider"}
            backgroundColor={isOtpComplete && !loading ? "#16a34a" : "#e6e7e7"}
            textColor={isOtpComplete && !loading ? "#fff" : "#aeb3b3"}
            width="100%"
            borderRadius={50}
            fontSize={16}
            onPress={handleSubmit}
            disabled={loading || !isOtpComplete}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Conseil : Vérifiez votre dossier spam si vous ne trouvez pas le
            code.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  emailText: {
    color: "#16a34a",
    fontWeight: "600",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  timer: {
    fontSize: 32,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 5,
  },
  timerWarning: {
    color: "#ef4444",
  },
  timerLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 55,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#121111",
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  otpInputFilled: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: "#6b7280",
  },
  resendLink: {
    color: "#16a34a",
    fontWeight: "600",
  },
  resendLinkDisabled: {
    color: "#d1d5db",
  },
  buttonContainer: {
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  infoText: {
    fontSize: 13,
    color: "#065f46",
    lineHeight: 18,
  },
});

export default ProOtpVerify;