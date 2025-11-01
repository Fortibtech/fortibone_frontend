import { registerUser } from "@/api/authService";
import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { useUserStore } from "@/store/userStore";
import { RegisterPayload } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
}

interface GenderSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: string) => void;
  selectedGender: string;
}

interface FormData {
  prenom: string;
  nom: string;
  sexe: string;
  pays: string;
  ville: string;
  dateNaissance: string;
  email: string;
  motDePasse: string;
  phoneNumber: string;
  // profileType retiré
}

// --- Modal Date Picker ---
const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedDate,
}) => {
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowAndroidPicker(false);
      if (event.type === "set" && date) onSelect(date);
      onClose();
    } else if (date) {
      setTempDate(date);
    }
  };

  const handleConfirm = () => {
    onSelect(tempDate);
    onClose();
  };

  React.useEffect(() => {
    if (visible && Platform.OS === "android") setShowAndroidPicker(true);
  }, [visible]);

  if (Platform.OS === "android" && showAndroidPicker) {
    return (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
        maximumDate={new Date()}
      />
    );
  }

  if (Platform.OS === "ios") {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateModalContainer}>
            <Text style={styles.modalTitle}>Sélectionner une date</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={styles.datePicker}
            />
            <View style={styles.dateModalButtons}>
              <TouchableOpacity
                style={[styles.dateButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

// --- Modal Gender ---
const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedGender,
}) => {
  const [tempSelectedGender, setTempSelectedGender] =
    useState<string>(selectedGender);

  const handleSave = () => {
    if (tempSelectedGender) {
      onSelect(tempSelectedGender);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sélectionnez le sexe</Text>
          <View style={styles.genderOptions}>
            {["Masculin", "Féminin"].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  tempSelectedGender === gender && styles.selectedOption,
                ]}
                onPress={() => setTempSelectedGender(gender)}
              >
                <Text
                  style={[
                    styles.genderText,
                    tempSelectedGender === gender && styles.selectedText,
                  ]}
                >
                  {gender}
                </Text>
                <View
                  style={[
                    styles.radioButton,
                    tempSelectedGender === gender && styles.radioButtonSelected,
                  ]}
                >
                  {tempSelectedGender === gender && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalButtonContainer}>
            <CustomButton
              title="Enregistrer"
              onPress={handleSave}
              backgroundColor={tempSelectedGender ? "#00C851" : "#E0E0E0"}
              textColor={tempSelectedGender ? "#fff" : "#999"}
              width="100%"
              height={40}
              borderRadius={20}
              fontSize={14}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Register Screen (Particulier uniquement) ---
const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    prenom: "",
    nom: "",
    sexe: "",
    pays: "",
    ville: "",
    dateNaissance: "",
    email: "",
    motDePasse: "",
    phoneNumber: "",
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const router = useRouter();

  // Vérification que l'utilisateur vient bien du bon flux
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem("userProfile");
        if (saved !== "particulier") {
          router.replace("/onboarding"); // sécurité
        }
      } catch (error) {
        console.error("Erreur vérification profil:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    checkProfile();
  }, [router]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validatePassword = useCallback((password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  }, []);

  const validateEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const isFormValid = useCallback(() => {
    return (
      Object.values(formData).every((v) => v.trim() !== "") &&
      validateEmail(formData.email) &&
      validatePassword(formData.motDePasse)
    );
  }, [formData, validateEmail, validatePassword]);

  const handleCreateAccount = async () => {
    if (!isFormValid()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs correctement.");
      return;
    }

    const payload: RegisterPayload = {
      firstName: formData.prenom.trim(),
      lastName: formData.nom.trim(),
      gender: formData.sexe === "Masculin" ? "MALE" : "FEMALE",
      profileType: "PARTICULIER", // FORCÉ
      country: formData.pays.trim(),
      city: formData.ville.trim(),
      dateOfBirth: selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "1990-01-01",
      email: formData.email.trim(),
      password: formData.motDePasse,
      phoneNumber: formData.phoneNumber.trim(),
    };

    try {
      const result = await registerUser(payload);
      useUserStore.getState().setEmail(payload.email);

      if (result.success) {
        Alert.alert("Succès", result.message);
        router.push("/(auth)/OtpScreen"); // Particulier → OTP
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    }
  };

  const handleGenderSelect = useCallback(
    (gender: string) => {
      updateField("sexe", gender);
    },
    [updateField]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      updateField("dateNaissance", `${day}/${month}/${year}`);
    },
    [updateField]
  );

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Préparation...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={styles.container}>
        {/* === HEADER DYNAMIQUE === */}
        <View style={styles.header}>
          <BackButton />
        </View>

        <View style={styles.newTitle}>
          <Image
            source={require("@/assets/images/logo/green.png")}
            style={styles.logo}
          />
          <View style={styles.titleText}>
            <Text style={styles.mainTitle}>
              Création de compte{" "}
              <Text style={styles.subTitle}>Particulier</Text>
            </Text>
          </View>
        </View>

        <View style={styles.resgister}>
          <Text>Vous avez déjà un compte ?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={{ color: "#059669", fontWeight: "600" }}>
              connectez-vous
            </Text>
          </TouchableOpacity>
        </View>
        {/* === FIN HEADER === */}

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <InputField
              label="Prénom"
              placeholder="Prénom"
              value={formData.prenom}
              onChangeText={(text) => updateField("prenom", text)}
            />
            <InputField
              label="Nom"
              placeholder="Nom"
              value={formData.nom}
              onChangeText={(text) => updateField("nom", text)}
            />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Sexe</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => setShowGenderModal(true)}
              >
                <Text
                  style={[
                    styles.selectFieldText,
                    !formData.sexe && styles.placeholderText,
                  ]}
                >
                  {formData.sexe || "Sélectionnez le sexe"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <InputField
              label="Pays"
              placeholder="Pays"
              value={formData.pays}
              onChangeText={(text) => updateField("pays", text)}
            />
            <InputField
              label="Ville"
              placeholder="Ville"
              value={formData.ville}
              onChangeText={(text) => updateField("ville", text)}
            />
            <InputField
              label="Téléphone"
              placeholder="+33612345678"
              value={formData.phoneNumber}
              onChangeText={(text) => updateField("phoneNumber", text)}
              keyboardType="phone-pad"
            />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date de naissance</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => setShowDateModal(true)}
              >
                <Text
                  style={[
                    styles.selectFieldText,
                    !formData.dateNaissance && styles.placeholderText,
                  ]}
                >
                  {formData.dateNaissance || "jj/mm/aaaa"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <InputField
              label="Email"
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Mot de passe"
              placeholder="Mot de passe"
              secureTextEntry
              value={formData.motDePasse}
              onChangeText={(text) => updateField("motDePasse", text)}
              autoCapitalize="none"
            />
            <Text
              style={[
                styles.passwordInfo,
                formData.motDePasse &&
                  !validatePassword(formData.motDePasse) &&
                  styles.errorText,
              ]}
            >
              Le mot de passe doit comporter au moins 8 caractères et inclure
              des lettres majuscules, des lettres minuscules et des chiffres
              {formData.motDePasse &&
                !validatePassword(formData.motDePasse) &&
                " - Mot de passe insuffisant"}
            </Text>

            <View style={styles.createButtonContainer}>
              <CustomButton
                title="Créer un compte"
                onPress={handleCreateAccount}
                backgroundColor={isFormValid() ? "#00C851" : "#E0E0E0"}
                textColor={isFormValid() ? "#fff" : "#999"}
                width="100%"
                height={50}
                borderRadius={25}
              />
            </View>
          </View>
        </ScrollView>

        <GenderSelectionModal
          visible={showGenderModal}
          onClose={() => setShowGenderModal(false)}
          onSelect={handleGenderSelect}
          selectedGender={formData.sexe}
        />
        <DatePickerModal
          visible={showDateModal}
          onClose={() => setShowDateModal(false)}
          onSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#059669",
  },
  header: { marginBottom: 30, paddingHorizontal: 20 },
  newTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 30,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
    resizeMode: "contain",
  },
  titleText: { flex: 1 },
  mainTitle: {
    fontSize: 24,
    color: "#121f3e",
    fontWeight: "600",
  },
  subTitle: {
    fontSize: 24,
    color: "#059669",
  },
  resgister: {
    flexDirection: "row",
    gap: 5,
    paddingLeft: 30,
    marginBottom: 20,
  },
  scrollContent: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    alignItems: "center",
  },
  fieldContainer: { marginVertical: 10, width: 343 },
  label: { marginBottom: 5, fontSize: 14, fontWeight: "500", color: "#111" },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  selectFieldText: { fontSize: 16, color: "#111" },
  placeholderText: { color: "#999" },
  passwordInfo: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  createButtonContainer: { width: "100%", marginBottom: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 350,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    marginBottom: 20,
  },
  genderOptions: { marginBottom: 20 },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectedOption: { backgroundColor: "#E8F5E8", borderColor: "#00C851" },
  genderText: { fontSize: 16, fontWeight: "500", color: "#111" },
  selectedText: { color: "#00C851" },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioButtonSelected: { backgroundColor: "#00C851", borderColor: "#00C851" },
  modalButtonContainer: { width: "100%" },
  dateModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 350,
    elevation: 5,
  },
  datePicker: { width: "100%", marginBottom: 20 },
  dateModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  confirmButton: { backgroundColor: "#00C851" },
  cancelButtonText: { fontSize: 16, fontWeight: "500", color: "#666" },
  confirmButtonText: { fontSize: 16, fontWeight: "500", color: "#fff" },
  errorText: {
    fontSize: 12,
    color: "#FF4444",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
});

export default Register;
