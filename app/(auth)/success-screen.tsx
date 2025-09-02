import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SuccessScreen = () => {
  const router = useRouter();
  const handleLogin = async () => {
    // Logique de redirection vers la page de connexion
    router.replace("/(auth)/login");
  };
  return (
    <SafeAreaView style={styles.constainer}>
      <View style={styles.subContainer}>
        <View style={styles.boxImg}>
          <Image
            source={require("../../assets/images/logo/mark.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.text}>
          <Text style={styles.headerTitle}>Mot de passe modifié</Text>
          <Text style={styles.description}>
            Mot de passe modifié avec succès{"\n"}
            Vous pouvez vous reconnecter{"\n"}
            avec votre nouveau mot de passe
          </Text>
        </View>
        <View style={styles.button}>
          <CustomButton
            title={"Retours a la connexion"}
            backgroundColor="#059669"
            textColor="#fff"
            width={343}
            borderRadius={50}
            fontSize={16}
            onPress={handleLogin}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
  },
  subContainer: {
    height: "70%",

    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boxImg: {},
  headerTitle: {
    textAlign: "center",
    fontSize: 27,
    fontWeight: "700",
    gap: 5,
  },
  logo: {
    width: 150,
    height: 150,
  },
  description: {
    textAlign: "center",
    fontSize: 18,
    color: "#9ca3af",
    marginTop: 5,
  },
  text: {
    flexDirection: "column",

    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
  },
});

export default SuccessScreen;
