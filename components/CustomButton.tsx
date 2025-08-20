// components/CustomButton.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type ButtonProps = {
  title: string; // texte du bouton
  onPress: () => void; // fonction quand on clique
  width?: number | string; // largeur (ex: 200 ou "80%")
  height?: number; // hauteur
  backgroundColor?: string; // couleur du fond
  textColor?: string; // couleur du texte
  borderRadius?: number; // arrondi des bords
  fontSize?: number; // taille du texte
};

export default function CustomButton({
  title,
  onPress,
  width = "80%",
  height = 50,
  backgroundColor = "#0A84FF",
  textColor = "#fff",
  borderRadius = 10,
  fontSize = 16,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          width,
          height,
          backgroundColor,
          borderRadius,
        } as ViewStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize,
          } as TextStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  text: {
    fontWeight: "600",
  },
});
