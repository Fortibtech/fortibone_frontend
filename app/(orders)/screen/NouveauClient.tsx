import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  
  StatusBar,

} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NouveauClient() {
  const router = useRouter();
  const [nom, setNom] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@gmail.com");
  const [telephone, setTelephone] = useState("+33 7 53 07 08 73");
  const [adresse, setAdresse] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Client</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Photo de Profil Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Photo de Profil</Text>
          <TouchableOpacity style={styles.photoUpload}>
            <Ionicons name="image-outline" size={40} color="#999" />
            <Text style={styles.uploadText}>
              Toucher pour ajouter une image
            </Text>
            <Text style={styles.uploadSubtext}>
              Format jpg, png, webp. Taille max: 5Mb
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nom Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Entrez le nom"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Entrez l'email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Téléphone Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={styles.input}
            value={telephone}
            onChangeText={setTelephone}
            placeholder="Entrez le téléphone"
            keyboardType="phone-pad"
          />
        </View>

        {/* Adresse Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={adresse}
            onChangeText={setAdresse}
            placeholder="Entrez l'adresse du client"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Ajouter le Client</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  placeholder: {
    width: 32,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#4a9eff",
    borderStyle: "dashed",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  photoUpload: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  uploadText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "#00a651",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
