"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native"
import { useRouter } from "expo-router"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

const ChangePassword: React.FC = () => {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordRequirements = [
    { text: "Majuscule et minuscule", met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { text: "Chiffre", met: /\d/.test(newPassword) },
    { text: "Caractère spécial", met: /[!@#$%^&*]/.test(newPassword) },
  ]

  const handleSave = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs")
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas")
      return
    }
    if (newPassword.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      Alert.alert("Succès", "Mot de passe mis à jour avec succès")
      router.back()
    }, 1000)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changer Mot de Passe</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Old Password */}
        <View style={styles.section}>
          <Text style={styles.label}>Ancien Mot de Passe *</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={20} color="#1BB874" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholderTextColor="#CCCCCC"
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
              <MaterialIcons name={showOldPassword ? "visibility" : "visibility-off"} size={20} color="#999999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotLink}>
          <Text style={styles.forgotLinkText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* New Password */}
        <View style={styles.section}>
          <Text style={styles.label}>Nouveau Mot de Passe *</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={20} color="#1BB874" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Entrer le mot de passe"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#CCCCCC"
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <MaterialIcons name={showNewPassword ? "visibility" : "visibility-off"} size={20} color="#999999" />
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>8 caractères minimum</Text>
            {passwordRequirements.map((req, idx) => (
              <View key={idx} style={styles.requirementItem}>
                <MaterialIcons
                  name={req.met ? "check-circle" : "radio-button-unchecked"}
                  size={16}
                  color={req.met ? "#1BB874" : "#CCCCCC"}
                />
                <Text style={[styles.requirementText, { color: req.met ? "#1BB874" : "#999999" }]}>{req.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.section}>
          <Text style={styles.label}>Confirmer Mot de Passe *</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={20} color="#1BB874" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#CCCCCC"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color="#999999" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? "Chargement..." : "Sauvegarder"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
  },
  forgotLink: {
    marginVertical: 16,
  },
  forgotLinkText: {
    fontSize: 14,
    color: "#1BB874",
    fontWeight: "500",
  },
  requirementsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F0FFF9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0F0E8",
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1BB874",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1BB874",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1BB874",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#1BB874",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default ChangePassword
