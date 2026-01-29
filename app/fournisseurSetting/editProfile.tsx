"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { updateUserProfile } from "@/api/Users";
import { UserProfile, useUserStore } from "@/store/userStore";
import { router } from "expo-router";

const EditProfileScreen = () => {
  // ❇️ VERSION PRO :
  // On ne déclenche AUCUN rerender via Zustand.
  // On lit la valeur une seule fois :
  const user = useUserStore.getState().userProfile;
  const setUserProfile = useUserStore.getState().setUserProfile;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    country: "",
    city: "",
    gender: "MALE" as "MALE" | "FEMALE",
    fonction: "Responsable commercial",
  });

  // ⭐️ Hydratation du formulaire une seule fois, jamais plus
  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      dateOfBirth: user.dateOfBirth || "",
      country: user.country || "",
      city: user.city || "",
      gender: (user.gender as any) || "MALE",
      fonction: prev.fonction, // ne vient pas du user
    }));
  }, []); // ← tableau vide = ne reroule jamais

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        gender: formData.gender,
      };

      const updatedUser = await updateUserProfile(payload);
      const data = updatedUser.data || updatedUser;

      setUserProfile({
        ...data,
        profileType: data.profileType.toUpperCase(),
      } as UserProfile);

      Alert.alert("Succès", "Profil mis à jour !", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/fournisseurSetting/userProfile");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Échec de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.formContainer}>
        {/* NOM */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Nom <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(v) => setFormData((p) => ({ ...p, firstName: v }))}
            placeholder="Votre nom"
          />
        </View>

        {/* PRÉNOM */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Prénom <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(v) => setFormData((p) => ({ ...p, lastName: v }))}
            placeholder="Votre prénom"
          />
        </View>

        {/* FONCTION */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fonction</Text>
          <TextInput
            style={styles.input}
            value={formData.fonction}
            onChangeText={(v) => setFormData((p) => ({ ...p, fonction: v }))}
            placeholder="Ex. Responsable commercial"
          />
        </View>

        {/* TÉLÉPHONE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(v) => setFormData((p) => ({ ...p, phoneNumber: v }))}
            keyboardType="phone-pad"
            placeholder="+33 6 12 34 56 78"
          />
        </View>

        {/* Ville / Pays … */}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <MaterialIcon name="close" size={20} color="#1BB874" />
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Sauvegarder</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  formContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "500", color: "#000000", marginBottom: 8 },
  required: { color: "#FF3B30" },
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
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 35,
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
  cancelButtonText: { fontSize: 15, fontWeight: "600", color: "#1BB874" },
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
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});

export default EditProfileScreen;
