import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Interface pour typer les props du composant
interface InputFieldProps {
  label: string; // Le texte affiché au-dessus de l'input
  placeholder: string; // Texte indicatif dans le champ
  secureTextEntry?: boolean; // Si true, masque le texte (mot de passe)
  value: string; // Valeur actuelle de l'input (state externe)
  onChangeText: (text: string) => void; // Fonction pour mettre à jour la valeur
}

/**
 * Composant réutilisable pour un champ de saisie (texte ou mot de passe)
 * - Affiche un label descriptif
 * - Supporte le placeholder
 * - Gestion du type mot de passe avec icône œil pour afficher/masquer
 * - Largeur fixe 343px, hauteur fixe 48px pour cohérence UI
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
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
        />

        {/* Affiche l'icône œil uniquement si c'est un mot de passe */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setShowPassword(!showPassword)} // toggle affichage
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"} // œil ouvert/fermé
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

// Styles pour le composant
const styles = StyleSheet.create({
  container: {
    marginVertical: 10, // espace entre les champs
    width: 343, // largeur fixe pour cohérence design
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#111", // texte sombre pour lisibilité
  },
  inputWrapper: {
    flexDirection: "row", // aligne input et icône sur la même ligne
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc", // bord gris clair pour champ input
    borderRadius: 8, // coins arrondis
    height: 48, // hauteur fixe pour cohérence UI
    paddingHorizontal: 10, // padding interne
  },
  input: {
    flex: 1, // prend tout l'espace disponible
    fontSize: 16,
    color: "#111",
  },
  icon: {
    marginLeft: 10, // espace entre texte et icône
  },
});
