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
  type?: "text" | "password" | "description";
  leftIcon?: React.ReactNode; // AJOUTÉ ICI
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
      type = "text",
      leftIcon, // AJOUTÉ
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
            isDescription && styles.textareaWrapper,
            { borderColor: isFocused ? "#059669" : "#ccc" },
          ]}
        >
          {/* LEFT ICON */}
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              isDescription && styles.textareaInput,
              leftIcon ? styles.inputWithLeftIcon : undefined, // CORRIGÉ
            ]}
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
            multiline={isDescription}
            textAlignVertical={isDescription ? "top" : "center"}
            numberOfLines={isDescription ? 5 : 1}
            {...rest}
          />

          {/* RIGHT ICON (password toggle) */}
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

// === STYLES AMÉLIORÉS ===
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: "100%",
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
    height: 120,
  },
  leftIconContainer: {
    marginRight: 8,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  inputWithLeftIcon: {
    paddingLeft: 0, // évite double padding
  },
  textareaInput: {
    height: "100%",
    textAlignVertical: "top",
    paddingTop: 8,
  },
  icon: {
    marginLeft: 10,
  },
});
