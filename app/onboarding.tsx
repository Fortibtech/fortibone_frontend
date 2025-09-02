import CustomButton from "@/components/CustomButton";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Onboarding = () => {
  const router = useRouter();
  return (
    <>
      {/* Image en background */}
      <ImageBackground
        source={require("../assets/images/bg.png")}
        style={styles.bgImage}
        imageStyle={{ resizeMode: "cover" }}
      >
        {/* Dégradé blanc du haut vers le bas (30% de hauteur) */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,1)", // haut (opaque)
            "rgba(255,255,255,0.6)", // intermédiaire
            "rgba(255,255,255,0)", // bas (transparent)
          ]}
          end={{ x: 0, y: 0 }} // haut
          start={{ x: 0, y: 1 }} // bas
          style={styles.gradientOverlay}
        />
      </ImageBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.TopContainer}>
          <Image
            source={require("../assets/images/logo/white.png")}
            style={styles.logo}
          />
          <Text style={styles.title2}>FortibOne</Text>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Achetez facilement et rapidement avec FortibOne
            </Text>
            <Text style={styles.description}>
              Avec une interface intuitive, vous pouvez trouver et acheter vos
              produits.
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Se connecter"
              backgroundColor="#f6f4f0"
              textColor="#059669"
              width="50%"
              borderRadius={15}
              fontSize={16}
              onPress={() => router.push("/(auth)/login")}
            />
            <CustomButton
              title="Creer un compte"
              backgroundColor="#059669"
              textColor="#fff"
              width="50%"
              borderRadius={15}
              fontSize={16}
              onPress={() => router.push("/(auth)/register")}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    position: "absolute",
    top: "20%", // ✅ commence en haut
    width: "100%",
    height: "50%", // ✅ ne couvre que 30% de la hauteur
  },
  logo: {
    width: 24,
    height: 24,
    position: "relative",
    bottom: 5,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  TopContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    flexDirection: "row",
    position: "relative",
    bottom: 150,
    gap: 10,
  },
  bgImage: {
    position: "absolute",
    width: "100%", // largeur de l'image
    height: "70%", // hauteur de l'image
    resizeMode: "contain",
    zIndex: 1,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#7b7e86",
  },
  title2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#121f3e",
    marginBottom: 10,
    textAlign: "center",
  },
  textContainer: {
    position: "relative",
    top: 120,
  },
  bottomContainer: {
    height: "30%",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
});

export default Onboarding;
