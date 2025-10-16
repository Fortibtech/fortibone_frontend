import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  type?: "text" | "password" | "description"; // 👈 ajout du type
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      placeholder,
      secureTextEntry = false,
      value,
      onChangeText,
      keyboardType = "default",
      onSubmitEditing,
      type = "text", // 👈 valeur par défaut
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(!secureTextEntry);
    const [isFocused, setIsFocused] = React.useState(false);

    const isDescription = type === "description";

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>

        <View
          style={[
            styles.inputWrapper,
            isDescription && styles.textareaWrapper, // 👈 styles spécifiques
            { borderColor: isFocused ? "#059669" : "#ccc" },
          ]}
        >
          <TextInput
            ref={ref}
            style={[styles.input, isDescription && styles.textareaInput]}
            placeholder={placeholder}
            secureTextEntry={!showPassword && secureTextEntry}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={(event) => {
              console.log(`${label} onSubmitEditing triggered`);
              onSubmitEditing?.(event);
            }}
            multiline={isDescription} // 👈 active textarea
            textAlignVertical={isDescription ? "top" : "center"} // 👈 aligne le texte en haut
            numberOfLines={isDescription ? 5 : 1}
            {...rest}
          />

          {secureTextEntry && (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setShowPassword(!showPassword)}
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
  }
);

InputField.displayName = "InputField";

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
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 10,
  },
  textareaWrapper: {
    alignItems: "flex-start",
    height: 120, // 👈 plus grand pour la description
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  textareaInput: {
    height: "100%",
    textAlignVertical: "top", // 👈 texte en haut
    paddingTop: 8,
  },
  icon: {
    marginLeft: 10,
  },
});
