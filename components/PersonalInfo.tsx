import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "./CustomButton";
import InputField from "./InputField";
import { useUserStore } from "@/store/userStore";
import {
  updateUserProfile,
  deleteUserAccount,
  UpdateUserPayload,
} from "@/api/Users";
import DatePickerModal from "./DatePickerModal";
import GenderSelectionModal from "./GenderSelectionModal";
import { uploadImageToCloudinary } from "@/api/cloudinary";

const PersonalInfos = () => {
  const { userProfile, setUserProfile, logout } = useUserStore();
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    phoneNumber: userProfile?.phoneNumber || "",
    profileImageUrl: userProfile?.profileImageUrl || "",
    dateOfBirth: userProfile?.dateOfBirth || "",
    country: userProfile?.country || "",
    city: userProfile?.city || "",
    gender: userProfile?.gender || "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth) : undefined
  );
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false); // Nouvel état pour contrôler le DatePickerModal

  // --- Champs ---
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Photo ---
  const handlePickImage = async (
    updateField: (field: string, value: string) => void
  ) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uploadedUrl = await uploadImageToCloudinary(result.assets[0].uri);
        if (uploadedUrl) {
          updateField("profileImageUrl", uploadedUrl);
        } else {
          Alert.alert("Erreur", "Impossible de télécharger l'image.");
        }
      }
    } catch (error: any) {
      console.error("Erreur handlePickImage:", error.message);
      Alert.alert("Erreur", "Impossible de télécharger l'image.");
    }
  };

  // --- Date ---
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    updateField("dateOfBirth", date.toISOString().split("T")[0]);
    setShowDatePickerModal(false); // Fermer le modal après sélection
  };

  // --- Genre ---
  const handleGenderSelect = (gender: string) => {
    updateField("gender", gender);
    setShowGenderModal(false);
  };

  // --- Update profile ---
  const handleUpdateProfile = async () => {
    try {
      if (!userProfile) return;

      const payload: UpdateUserPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        profileImageUrl: formData.profileImageUrl,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        city: formData.city,
        gender:
          formData.gender === "Masculin"
            ? "MALE"
            : formData.gender === "Féminin"
            ? "FEMALE"
            : "MALE",
      };
      console.log("infos de mise a jour utilisateur", payload);
      const { status } = await updateUserProfile(payload);

      if (status === 200) {
        alert("✅ Profil mis à jour avec succès !");
        setUserProfile({ ...userProfile, ...payload });
      }

      Alert.alert("Succès", "Profil mis à jour !");
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de mettre à jour");
    }
  };

  // --- Delete account ---
  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer votre compte ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserAccount();
              Alert.alert("Compte supprimé", "Votre compte a été supprimé.");
              await logout();
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Impossible de supprimer");
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Ajustement pour iOS
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled" // Permet de cliquer sur les boutons même avec le clavier
        >
          <InputField
            label="Prénom"
            value={formData.firstName}
            onChangeText={(text) => updateField("firstName", text)}
            placeholder={""}
          />
          <InputField
            label="Nom"
            value={formData.lastName}
            onChangeText={(text) => updateField("lastName", text)}
            placeholder={""}
          />
          <InputField
            label="Téléphone"
            value={formData.phoneNumber}
            onChangeText={(text) => updateField("phoneNumber", text)}
            placeholder={""}
          />
          <InputField
            label="Pays"
            value={formData.country}
            onChangeText={(text) => updateField("country", text)}
            placeholder={""}
          />
          <InputField
            label="Ville"
            value={formData.city}
            onChangeText={(text) => updateField("city", text)}
            placeholder={""}
          />

          {/* Sexe */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Sexe</Text>
            <TouchableOpacity
              style={styles.selectField}
              onPress={() => setShowGenderModal(true)}
            >
              <Text
                style={[
                  styles.selectFieldText,
                  !formData.gender && styles.placeholderText,
                ]}
              >
                {formData.gender || "Sélectionnez le sexe"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Date de naissance */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date de naissance</Text>
            <TouchableOpacity
              style={styles.selectField}
              onPress={() => setShowDatePickerModal(true)} // Ouvre le modal explicitement
            >
              <Text
                style={[
                  styles.selectFieldText,
                  !formData.dateOfBirth && styles.placeholderText,
                ]}
              >
                {formData.dateOfBirth || "jj/mm/aaaa"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Mettre à jour le profil"
              onPress={handleUpdateProfile}
              backgroundColor="#00C851"
              textColor="#fff"
              width="100%"
              height={50}
              borderRadius={25}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Supprimer le compte"
              onPress={handleDeleteAccount}
              backgroundColor="#FF4444"
              textColor="#fff"
              width="100%"
              height={50}
              borderRadius={25}
            />
          </View>
        </ScrollView>

        <GenderSelectionModal
          visible={showGenderModal}
          onClose={() => setShowGenderModal(false)}
          onSelect={handleGenderSelect}
          selectedGender={formData.gender}
        />
        <DatePickerModal
          visible={showDatePickerModal} // Utiliser l'état dédié
          onClose={() => setShowDatePickerModal(false)} // Fermer le modal
          onSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Augmenter le padding pour les boutons
    paddingHorizontal: 20,
  },
  photoContainer: { alignItems: "center", marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#00C851",
    width: 35,
    height: 35,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContainer: { marginVertical: 10 },
  label: { fontSize: 14, fontWeight: "500", color: "#111", marginBottom: 5 },
  selectField: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectFieldText: { fontSize: 16, color: "#111" },
  placeholderText: { color: "#999" },
  buttonContainer: { marginVertical: 10 },
});

export default PersonalInfos;
