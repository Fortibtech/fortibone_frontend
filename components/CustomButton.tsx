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
  disabled?: boolean; // <-- ajout
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
  disabled = false, // <-- ajout
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress} // empêche le clic si disabled
      style={[
        styles.button,
        {
          width,
          height,
          backgroundColor: disabled ? "#aeb3b3" : backgroundColor, // style visuel
          borderRadius,
        } as ViewStyle,
      ]}
      activeOpacity={disabled ? 1 : 0.7} // pas de feedback quand disabled
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
