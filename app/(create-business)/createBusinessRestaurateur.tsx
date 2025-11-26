import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButtonAdmin from "@/components/Admin/BackButton";

const CreateBusinessRestaurateur = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ==================== HEADER IDENTIQUE AUX AUTRES ÉCRANS ==================== */}
      <View style={styles.header}>
        {/* Bouton Retour à gauche */}
        <BackButtonAdmin />

        {/* Titre centré */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Créer mon restaurant</Text>
        </View>

        {/* Espace vide à droite pour équilibrer */}
        <View style={{ width: 50 }} />
      </View>

      {/* ==================== MESSAGE CENTRAL TEMPORAIRE ==================== */}
      <View style={styles.centerContainer}>
        <Text style={styles.mainText}>Maquette en cours de conception</Text>
        <Text style={styles.subText}>par Blanche</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  mainText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#059669",
    textAlign: "center",
    marginBottom: 12,
  },
  subText: {
    fontSize: 18,
    color: "#666",
    fontStyle: "italic",
  },
});

export default CreateBusinessRestaurateur;
