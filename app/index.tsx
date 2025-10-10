import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 5000); // Navigate after 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [router]);

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

      <View style={styles.loader}>
        <Progress.Circle
          size={50}
          indeterminate={true}
          color="#fff"
          borderWidth={4}
        />
      </View>
    </SafeAreaView>
  );
};

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
  loader: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  bgImage: {
    position: "absolute",
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
});

export default Index;
