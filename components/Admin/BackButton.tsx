// components/BackButtonAdmin.tsx
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
   * Route personnalisée vers laquelle naviguer
   * - Si fournie → remplace router.back()
   * - Si non fournie → comportement par défaut : router.back()
   */
  fallbackRoute?: string;

  /**
   * Couleur de fond du bouton
   */
  backgroundColor?: string;

  /**
   * Couleur de l'icône
   */
  iconColor?: string;

  /**
   * Taille de l'icône
   */
  iconSize?: number;
}

const BackButtonAdmin: React.FC<BackButtonAdminProps> = ({
  fallbackRoute,
  backgroundColor,
  iconColor = "#000",
  iconSize = 24,
  style,
  ...restProps
}) => {
  const handlePress = () => {
    if (fallbackRoute) {
      router.push(fallbackRoute as any); // ou router.replace(fallbackRoute) si tu ne veux pas ajouter à l'historique
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        backgroundColor
          ? { backgroundColor }
          : { backgroundColor: "transparent" },
        style,
      ]}
      onPress={handlePress}
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
