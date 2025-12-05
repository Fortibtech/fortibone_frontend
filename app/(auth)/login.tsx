import { loginUser, resendOtp } from "@/api/authService";
import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileType, setProfileType] = useState<string | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true); // État de chargement
  const router = useRouter();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Vérification du profil au montage
  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem("userProfile");

        if (!savedProfile) {
          // Aucun profil choisi → rediriger vers le bon écran d'inscription
          setIsCheckingProfile(false);
          return;
        }

        setProfileType(savedProfile);

        // Vérifie si l'utilisateur est déjà connecté
        const token = await AsyncStorage.getItem("authToken"); // ou useUserStore.getState().token
        const user = useUserStore.getState().userProfile;

        if (token && user) {
          // Déjà connecté → rediriger selon le type
          if (user.profileType === "PRO") {
            router.replace("/(professionnel)");
          } else {
            router.replace("/(tabs)");
          }
          return;
        }

        // Profil choisi, mais pas connecté → on reste sur login
        setIsCheckingProfile(false);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        setIsCheckingProfile(false);
      }
    };

    checkProfileAndRedirect();
  }, [router]);

  // Redirection automatique si profil connu mais pas connecté
  useEffect(() => {
    if (!isCheckingProfile && !profileType) {
      if (profileType === null) {
        // On attend que le profil soit lu
      } else if (profileType === "particulier") {
        router.replace("/(auth)/register");
      } else if (profileType === "professionnel") {
        router.replace("/(auth)/FournisseurSignUp");
      }
    }
  }, [isCheckingProfile, profileType, router]);

  // Si on est en train de vérifier ou rediriger
  if (isCheckingProfile || (!profileType && profileType !== null)) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Préparation de votre espace...</Text>
      </SafeAreaView>
    );
  }

  // Si aucun profil → on ne devrait pas arriver ici (redirigé)
  if (!profileType) {
    return null;
  }

  const handleLogin = async () => {
    const setUserEmail = useUserStore.getState().setEmail;

    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser(email, password);
      if (result.success && result.token) {
        await useUserStore.getState().setToken(result.token);
        await useUserStore.getState().refreshProfile();
        const profile = useUserStore.getState().userProfile;
        if (!profile) {
          Alert.alert("Erreur", "Impossible de charger votre profil.");
          return;
        }

        Alert.alert("Succès", "Connexion réussie !");
        if (profile.profileType === "PRO") {
          router.replace("/(professionnel)");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        try {
          await resendOtp(email, "EMAIL_VERIFICATION");
          setUserEmail(email);
          Alert.alert(
            "OTP envoyé",
            err.originalMessage ||
              "Un code de vérification a été envoyé à votre email."
          );
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

  const capitalizedProfile = profileType
    ? profileType.charAt(0).toUpperCase() + profileType.slice(1)
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>
      <View style={styles.newTitle}>
        <Image
          source={require("@/assets/images/logo/green.png")}
          style={styles.logo}
        />
        <View style={styles.titleText}>
          <Text style={styles.mainTitle}>
            Accès <Text style={styles.subTitle}>{capitalizedProfile}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.resgister}>
        <Text>Nouveau sur KomoraLink ?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={{ color: "#059669", fontWeight: "600" }}>
            inscrivez-vous
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <InputField
          label="Email"
          placeholder="Entrez votre email"
          value={email}
          onChangeText={setEmail}
          ref={emailRef}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <InputField
          label="Mot de passe"
          placeholder="Entrez votre mot de passe"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          ref={passwordRef}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <View style={styles.forgotRow}>
          {/* <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Ionicons
              name={
                rememberMe ? "checkmark-circle" : "checkmark-circle-outline"
              }
              size={20}
              color={rememberMe ? "#059669" : "#ccc"}
            />
            <Text style={styles.rememberText}>Se rappeler de moi</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            onPress={() => router.push("/(auth)/ResetPassword")}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.button}>
          <CustomButton
            title={loading ? "Connexion..." : "Se connecter"}
            backgroundColor="#059669"
            textColor="#fff"
            borderRadius={50}
            fontSize={16}
            onPress={handleLogin}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#059669",
  },
  header: {
    marginBottom: 30,
  },
  newTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
    resizeMode: "contain",
  },
  titleText: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    color: "#121f3e",
    fontWeight: "600",
  },
  subTitle: {
    fontSize: 24,
    color: "#059669",
  },
  form: {
    flex: 1,
    paddingTop: 30,
    flexDirection: "column",
    alignItems: "center",
  },
  resgister: {
    flexDirection: "row",
    gap: 5,
    paddingLeft: 10,
  },
  forgotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rememberText: {
    fontSize: 14,
    color: "#1A202C",
  },
  forgotText: {
    color: "#059669",
    fontWeight: "600",
  },
  button: {
    marginTop: 20,
    width: "100%",
  },
});

export default Login;
