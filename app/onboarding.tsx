import CustomButton from "@/components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Interface pour les props de CustomButton


// Type pour le profil
type ProfileType = "particulier" | "professionnel" | null;

const Onboarding: React.FC = () => {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);

  // Fonction pour sauvegarder le choix dans AsyncStorage
  const saveProfileChoice = async (profile: ProfileType) => {
    try {
      if (profile) {
        await AsyncStorage.setItem("userProfile", profile);
        setSelectedProfile(profile);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
    }
  };

  // Fonction pour gérer le clic sur "Continuer"
  const handleContinue = async () => {
    if (selectedProfile) {
      await AsyncStorage.setItem("userProfile", selectedProfile);
      router.push("/(auth)/login");
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Veuillez sélectionner un profil avant de continuer.",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.TopContainer}>
        <Image
          source={require("../assets/images/logo/green.png")}
          style={styles.logo}
        />
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Quel est votre profil ?</Text>
          <Text style={styles.headerSubtitle}>
            Sélectionnez le type de profil qui vous correspond
          </Text>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionBox,
              selectedProfile === "particulier" && styles.optionSelected,
            ]}
            onPress={() => saveProfileChoice("particulier")}
          >
            <Ionicons name="person-outline" size={32} color="#059669" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Particulier</Text>
              <Text style={styles.optionDescription}>
                Acheteur, client ou restaurant
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionBox,
              selectedProfile === "professionnel" && styles.optionSelected,
            ]}
            onPress={() => saveProfileChoice("professionnel")}
          >
            <Ionicons name="storefront-outline" size={32} color="#059669" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Professionnel</Text>
              <Text style={styles.optionDescription}>
                Commerçant, fournisseur ou restaurant
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Continuer"
          backgroundColor="#059669"
          textColor="#fff"
          width="100%"
          borderRadius={15}
          fontSize={16}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column" as const,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  TopContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
    resizeMode: "contain" as const,
  },
  bottomContainer: {
    flex: 0.5,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 200,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
    width: "100%",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#121f3e",
    marginBottom: 6,
    width: "100%",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#059669",
    width: "100%",
  },
  optionsContainer: {
    width: "100%",
    gap: 10,
    marginBottom: 250,
  },
  optionBox: {
    flexDirection: "row" as const,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#059669",
    borderRadius: 10,
    padding: 10,
  },
  optionSelected: {
    backgroundColor: "#05966920",
    borderColor: "#059669",
  },
  optionTextContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121f3e",
  },
  optionDescription: {
    fontSize: 12,
    color: "#7b7e86",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 10,
  },
});

export default Onboarding;
