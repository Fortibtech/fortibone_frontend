import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

// Définition des props du bouton
type BackButtonProps = {
  icon?: any; // Image à afficher dans le bouton (local ou require)
  size?: number; // Taille du bouton (largeur et hauteur, carré)
};

export default function BackButton({
  icon = require("../assets/images/logo/chevron-left.png"), // Valeur par défaut : flèche gauche
  size = 40, // Taille par défaut : 40x40
}: BackButtonProps) {
  const router = useRouter(); // Hook d'Expo Router pour naviguer

  return (
    <TouchableOpacity
      // Style du bouton : cercle, fond bleu, centré
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2, // Cercle complet
        },
      ]}
      onPress={() => router.back()} // Action : retourne à l'écran précédent
      activeOpacity={0.7} // Effet visuel lors du clic
    >
      <Image
        source={icon} // Icône à l'intérieur du bouton
        style={styles.icon} // Taille et couleur de l'icône
      />
    </TouchableOpacity>
  );
}

// Styles du composant
const styles = StyleSheet.create({
  button: {
    backgroundColor: "#cccfcfff", // Couleur de fond bleu
    justifyContent: "center", // Centre l'icône verticalement
    alignItems: "center", // Centre l'icône horizontalement
  },
  icon: {
    width: 20, // Largeur de l'icône
    height: 20, // Hauteur de l'icône
    resizeMode: "contain", // L'icône garde ses proportions
    tintColor: "#fff", // Couleur blanche de l'icône
  },
});
