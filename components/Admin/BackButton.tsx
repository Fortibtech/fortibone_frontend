// components/BackButtonAdmin.tsx (ou où tu veux)
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React from "react";

interface BackButtonAdminProps extends TouchableOpacityProps {
  /**
   * Couleur de fond du bouton
   * - Par défaut : transparent (comme ta version actuelle)
   * - Exemples : "#ffffff", "rgba(255,255,255,0.9)", "#00C851", etc.
   */
  backgroundColor?: string;
  /**
   * Couleur de l'icône (par défaut noir)
   */
  iconColor?: string;
  /**
   * Taille de l'icône
   */
  iconSize?: number;
}

const BackButtonAdmin: React.FC<BackButtonAdminProps> = ({
  backgroundColor, // ← nouvelle prop dynamique
  iconColor = "#000",
  iconSize = 24,
  style,
  ...restProps
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        backgroundColor
          ? { backgroundColor }
          : { backgroundColor: "transparent" }, // fond dynamique
        style,
      ]}
      onPress={() => router.back()}
      activeOpacity={0.7}
      {...restProps}
    >
      <Ionicons name="arrow-back-outline" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#eef0f4",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BackButtonAdmin;
