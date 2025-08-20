import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

const Onboarding = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.TopContainer}>
        <Text style={styles.title}>Bienvenue sur FortibOne</Text>
        <Text style={styles.description}>
          FortibOne est une application de commerce en ligne qui vous permet de
          acheter facilement et rapidement vos produits.
        </Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  TopContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#7b7e86",
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
