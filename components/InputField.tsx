import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

// Interface pour typer les props du composant
interface InputFieldProps extends TextInputProps {
  label: string; // Le texte affiché au-dessus de l'input
  placeholder: string; // Texte indicatif dans le champ
  secureTextEntry?: boolean; // Si true, masque le texte (mot de passe)
  value: string; // Valeur actuelle de l'input (state externe)
  onChangeText: (text: string) => void; // Fonction pour mettre à jour la valeur
}

/**
 * Composant réutilisable pour un champ de saisie (texte, mot de passe, numérique)
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
  keyboardType = "default", // valeur par défaut
  ...rest
}) => {
  // State local pour basculer l'affichage du mot de passe
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      {/* Label du champ */}
      <Text style={styles.label}>{label}</Text>

      {/* Wrapper pour gérer input + icône si password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          secureTextEntry={!showPassword && secureTextEntry} // masque si password et non affiché
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType} // permet numeric, email, etc.
          {...rest} // passe toutes les autres props
        />

        {/* Affiche l'icône œil uniquement si c'est un mot de passe */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setShowPassword(!showPassword)} // toggle affichage
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="#555"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: 343,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  icon: {
    marginLeft: 10,
  },
});
