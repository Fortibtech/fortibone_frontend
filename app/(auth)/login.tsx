import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton"; // ton bouton réutilisable
import InputField from "@/components/InputField"; // ton composant InputField
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  // State pour stocker les valeurs des champs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  // Fonction pour gérer la soumission du formulaire
  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    // Ici tu pourrais appeler ton API pour authentification
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>
      <Text style={styles.title}>Se connecter</Text>
      <View style={styles.form}>
        {/* Champ email */}
        <InputField
          label="Email"
          placeholder="Entrez votre email"
          value={email}
          onChangeText={setEmail}
        />

        {/* Champ mot de passe */}
        <InputField
          label="Mot de passe"
          placeholder="Entrez votre mot de passe"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={{ alignSelf: "flex-end", position: "relative", right: 27 }}
        >
          <Text style={{ color: "#059669", fontWeight: "600" }}>
            Mot de passe oublie?
          </Text>
        </TouchableOpacity>
        {/* Bouton connexion */}
        <CustomButton
          title="Se connecter"
          backgroundColor="#e6e7e7"
          textColor="#aeb3b3"
          width={343}
          borderRadius={15}
          fontSize={16}
          onPress={handleLogin}
        />
      </View>
      <View style={styles.resgister}>
        <Text>Vous n&apos;avez pas encore de compte?</Text>
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
});

export default Login;
