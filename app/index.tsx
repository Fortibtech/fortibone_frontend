import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function IndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Image de fond en haut à gauche */}
      <Image
        source={require("../assets/images/logo/Top-logo.png")}
        style={[styles.bgImage, { top: 0, left: 0 }]}
      />

      {/* Image de fond en bas à droite */}
      <Image
        source={require("../assets/images/logo/Bottom-logo.png")}
        style={[styles.bgImage, { bottom: 0, right: 0 }]}
      />
      <View style={styles.imgLogo}>
        <Image
          source={require("../assets/images/logo/white.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FortibOne</Text>
      </View>
      <View style={styles.button}>
        <CustomButton
          title="Démarrer"
          backgroundColor="#fff"
          textColor="#059669"
          width="100%"
          borderRadius={15}
          fontSize={16}
          onPress={() => router.push("/onboarding")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#059669",
    padding: 20,
  },
  imgLogo: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 53,
    height: 53,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },

  button: {
    marginTop: 20,
    width: "100%",
  },
  bgImage: {
    position: "absolute",
    width: 150, // largeur de l'image
    height: 150, // hauteur de l'image
    resizeMode: "contain",
  },
});
