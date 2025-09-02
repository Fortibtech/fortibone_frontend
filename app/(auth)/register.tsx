import { registerUser } from "@/api/authService";
import { RegisterPayload } from "@/types/auth";
import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

// --- Types ---
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

interface ProfileTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: "PARTICULIER" | "PRO") => void;
  selectedType: string;
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
  profileType: string;
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
      if (event.type === "set" && date) {
        onSelect(date);
      }
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

// --- Modal Profile Type ---
const ProfileTypeModal: React.FC<ProfileTypeModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedType,
}) => {
  const [tempType, setTempType] = useState<string>(selectedType);
  const options: { value: "PARTICULIER" | "PRO"; label: string }[] = [
    { value: "PARTICULIER", label: "Particulier" },
    { value: "PRO", label: "Professionnel" },
  ];

  const handleSave = () => {
    if (tempType) {
      onSelect(tempType as "PARTICULIER" | "PRO");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Type de profil</Text>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.genderOption,
                tempType === opt.value && styles.selectedOption,
              ]}
              onPress={() => setTempType(opt.value)}
            >
              <Text
                style={[
                  styles.genderText,
                  tempType === opt.value && styles.selectedText,
                ]}
              >
                {opt.label}
              </Text>
              <View
                style={[
                  styles.radioButton,
                  tempType === opt.value && styles.radioButtonSelected,
                ]}
              >
                {tempType === opt.value && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.modalButtonContainer}>
            <CustomButton
              title="Enregistrer"
              onPress={handleSave}
              backgroundColor={tempType ? "#00C851" : "#E0E0E0"}
              textColor={tempType ? "#fff" : "#999"}
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

// --- Register Screen ---
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
    profileType: "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showProfileTypeModal, setShowProfileTypeModal] = useState(false);
  const router = useRouter();

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
      profileType: formData.profileType as "PARTICULIER" | "PRO",
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
        router.push(
          formData.profileType === "PRO"
            ? "/(professionnel)"
            : "/(auth)/OtpScreen"
        );
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

  const handleProfileTypeSelect = useCallback(
    (type: "PARTICULIER" | "PRO") => {
      updateField("profileType", type);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Créer un compte</Text>
        </View>

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

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Type de profil</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => setShowProfileTypeModal(true)}
              >
                <Text
                  style={[
                    styles.selectFieldText,
                    !formData.profileType && styles.placeholderText,
                  ]}
                >
                  {formData.profileType || "Sélectionnez le type de profil"}
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
        <ProfileTypeModal
          visible={showProfileTypeModal}
          onClose={() => setShowProfileTypeModal(false)}
          onSelect={handleProfileTypeSelect}
          selectedType={formData.profileType}
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
  header: { marginHorizontal: 30, marginTop: 30 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111",
    marginTop: 16,
  },
  scrollContent: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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
