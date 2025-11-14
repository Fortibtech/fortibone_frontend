"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import MaterialIcon from "react-native-vector-icons/MaterialIcons"
import { updateUserProfile, type UpdateUserPayload } from "@/api/Users"
import { useUserStore } from "@/store/userStore"
import { router } from "expo-router"

const EditProfileScreen: React.FC = () => {
  const user = useUserStore.getState().userProfile

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    contactName: user?.firstName || "",
    contactFirstName: user?.lastName || "",
    fonction: "Responsable commercial",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: user?.dateOfBirth || "",
    country: user?.country || "",
    city: user?.city || "",
    gender: user?.gender || ("MALE" as "MALE" | "FEMALE"),
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!formData.contactName || !formData.email) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires")
      return
    }

    setLoading(true)
    try {
      const payload: UpdateUserPayload = {
        firstName: formData.contactName,
        lastName: formData.contactFirstName,
        phoneNumber: formData.phoneNumber,
        profileImageUrl: user?.profileImageUrl || "",
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        city: formData.city,
        gender: formData.gender === "MALE" ? "MALE" : "FEMALE",
      }

      const result = await updateUserProfile(payload)

      Alert.alert("Succès", "Profil mis à jour avec succès", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier Infos Contact</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.formContainer}>
        {/* Nom du Contact */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Nom du Contact <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.contactName}
            onChangeText={(text) => handleInputChange("contactName", text)}
            placeholder="John Doe"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Prénom du Contact */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Prénom du Contact <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.contactFirstName}
            onChangeText={(text) => handleInputChange("contactFirstName", text)}
            placeholder="Adresse complète avec rue, BP..."
            placeholderTextColor="#999999"
          />
        </View>

        {/* Fonction */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Fonction <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.fonction}
            onChangeText={(text) => handleInputChange("fonction", text)}
            placeholder="Ex. Responsable commercial"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Email Professionnel */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email Professionnel <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleInputChange("email", text)}
            placeholder="example@email.com"
            placeholderTextColor="#999999"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
          <Text style={styles.helperText}>Cette email sera utilisé comme identifiant</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={loading}>
          <MaterialIcon name="close" size={20} color="#1BB874" />
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcon name="check" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </>
          )}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 34,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  helperText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 6,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#1BB874",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1BB874",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#1BB874",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default EditProfileScreen
