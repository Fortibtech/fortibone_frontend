// ProRegister.tsx
import { registerUser } from "@/api/authService";
import BackButton from "@/components/BackButton";
import CustomButton from "@/components/CustomButton";
import { useUserStore } from "@/store/userStore";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Genre } from "@/types/auth";

const ProRegister = () => {
  const router = useRouter();
  const setEmail = useUserStore((state) => state.setEmail);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    country: "",
    city: "",
    gender: "",
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const genderOptions = [
    { label: "Homme", value: "MALE" },
    { label: "Femme", value: "FEMALE" },
  ];

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "firstName":
        if (!value.trim()) newErrors.firstName = "Prénom requis";
        else delete newErrors.firstName;
        break;
      case "lastName":
        if (!value.trim()) newErrors.lastName = "Nom requis";
        else delete newErrors.lastName;
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) newErrors.email = "Email requis";
        else if (!emailRegex.test(value)) newErrors.email = "Email invalide";
        else delete newErrors.email;
        break;
      case "phoneNumber":
        if (!value.trim()) newErrors.phoneNumber = "Téléphone requis";
        else if (value.length < 10) newErrors.phoneNumber = "Numéro invalide";
        else delete newErrors.phoneNumber;
        break;
      case "password":
        if (!value) newErrors.password = "Mot de passe requis";
        else if (value.length < 8) newErrors.password = "8+ caractères";
        else if (!/[A-Z]/.test(value)) newErrors.password = "1 majuscule requise";
        else if (!/\d/.test(value)) newErrors.password = "1 chiffre requis";
        else if (!/[!@#$%^&*]/.test(value)) newErrors.password = "1 caractère spécial requis";
        else delete newErrors.password;
        break;
      case "confirmPassword":
        if (!value) newErrors.confirmPassword = "Confirmation requise";
        else if (value !== formData.password) newErrors.confirmPassword = "Mots de passe différents";
        else delete newErrors.confirmPassword;
        break;
      case "country":
        if (!value.trim()) newErrors.country = "Pays requis";
        else delete newErrors.country;
        break;
      case "city":
        if (!value.trim()) newErrors.city = "Ville requise";
        else delete newErrors.city;
        break;
      case "dateOfBirth":
        if (!value) newErrors.dateOfBirth = "Date requise";
        else delete newErrors.dateOfBirth;
        break;
      case "gender":
        if (!value) newErrors.gender = "Sexe requis";
        else delete newErrors.gender;
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    validateField(field, value);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const formattedDate = formatDate(date);
      setFormData({ ...formData, dateOfBirth: formattedDate });
      validateField("dateOfBirth", formattedDate);
    }
  };

  const handleGenderSelect = (value: string) => {
    setFormData({ ...formData, gender: value });
    validateField("gender", value);
    setShowGenderPicker(false);
  };

  const isFormValid = () => {
    return (
      Object.keys(errors).length === 0 &&
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phoneNumber &&
      formData.password &&
      formData.confirmPassword &&
      formData.dateOfBirth &&
      formData.country &&
      formData.city &&
      formData.gender
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs correctement");
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        city: formData.city,
        gender: formData.gender==='FEMALE' ? Genre.FEMALE : Genre.MALE,
        profileType: "PRO" as const,
      };

      console.log("📤 Envoi des données:", registerData);

      const response = await registerUser(registerData);
      console.log("✅ Inscription réussie:", response);

      // Sauvegarde l'email pour la vérification OTP
      setEmail(formData.email);

      Alert.alert(
        "Succès",
        "Inscription réussie ! Vérifiez votre email pour le code OTP.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(auth)/ProOtpVerify"),
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Erreur inscription:", error);
      Alert.alert(
        "Erreur",
        error.message || "Une erreur est survenue lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <Image
            source={require("@/assets/images/logo/green.png")}
            style={styles.logoImage}
          />
          <Text style={styles.title}>
            Créer un compte{"\n"}
            <Text style={styles.titleHighlight}>Professionnel</Text>
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Remplissez les informations ci-dessous pour créer votre compte
        </Text>

        {/* Prénom */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Prénom *</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="Jean"
            value={formData.firstName}
            onChangeText={(text) => handleInputChange("firstName", text)}
            onBlur={() => validateField("firstName", formData.firstName)}
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>

        {/* Nom */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Dupont"
            value={formData.lastName}
            onChangeText={(text) => handleInputChange("lastName", text)}
            onBlur={() => validateField("lastName", formData.lastName)}
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="exemple@email.com"
            value={formData.email}
            onChangeText={(text) => handleInputChange("email", text.toLowerCase())}
            onBlur={() => validateField("email", formData.email)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Téléphone */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            placeholder="+33612345678"
            value={formData.phoneNumber}
            onChangeText={(text) => handleInputChange("phoneNumber", text)}
            onBlur={() => validateField("phoneNumber", formData.phoneNumber)}
            keyboardType="phone-pad"
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
        </View>

        {/* Sexe */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Sexe *</Text>
          <TouchableOpacity
            style={[styles.selectInput, errors.gender && styles.inputError]}
            onPress={() => setShowGenderPicker(true)}
          >
            <Text style={formData.gender ? styles.selectedText : styles.placeholderText}>
              {formData.gender
                ? genderOptions.find((g) => g.value === formData.gender)?.label
                : "Sélectionnez votre sexe"}
            </Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>

        {/* Date de naissance */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date de naissance *</Text>
          <TouchableOpacity
            style={[styles.selectInput, errors.dateOfBirth && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={formData.dateOfBirth ? styles.selectedText : styles.placeholderText}>
              {formData.dateOfBirth ? formatDisplayDate(formData.dateOfBirth) : "jj/mm/aaaa"}
            </Text>
            <Feather name="calendar" size={20} color="#666" />
          </TouchableOpacity>
          {errors.dateOfBirth && (
            <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
          )}
        </View>

        {/* Pays */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pays *</Text>
          <TextInput
            style={[styles.input, errors.country && styles.inputError]}
            placeholder="France"
            value={formData.country}
            onChangeText={(text) => handleInputChange("country", text)}
            onBlur={() => validateField("country", formData.country)}
          />
          {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
        </View>

        {/* Ville */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ville *</Text>
          <TextInput
            style={[styles.input, errors.city && styles.inputError]}
            placeholder="Paris"
            value={formData.city}
            onChangeText={(text) => handleInputChange("city", text)}
            onBlur={() => validateField("city", formData.city)}
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        {/* Mot de passe */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mot de passe *</Text>
          <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
              onBlur={() => validateField("password", formData.password)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Confirmation mot de passe */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <View
            style={[
              styles.passwordContainer,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange("confirmPassword", text)}
              onBlur={() => validateField("confirmPassword", formData.confirmPassword)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Feather
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={loading ? "Inscription..." : "S'inscrire"}
            backgroundColor={isFormValid() ? "#16a34a" : "#e6e7e7"}
            textColor={isFormValid() ? "#fff" : "#252525FF"}
            width="100%"
            borderRadius={50}
            fontSize={16}
            onPress={handleSubmit}
            disabled={loading || !isFormValid()}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            Vous avez déjà un compte ?{" "}
            <Text style={styles.loginTextHighlight}>Connectez-vous</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <>
          {Platform.OS === "ios" ? (
            <View style={styles.modalOverlay}>
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Date de naissance</Text>
                  <TouchableOpacity
                    onPress={() => {
                      handleDateChange(null, selectedDate);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.datePickerConfirm}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setSelectedDate(date);
                  }}
                  maximumDate={new Date()}
                  locale="fr-FR"
                  textColor="#000"
                />
              </View>
            </View>
          ) : (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}

      {/* Gender Picker Modal */}
      {showGenderPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez votre sexe</Text>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => handleGenderSelect(option.value)}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowGenderPicker(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  logoImage: { width: 50, height: 50, marginRight: 15 },
  title: { fontSize: 24, fontWeight: "600", color: "#121111" },
  titleHighlight: { color: "#16a34a" },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 25,
  },
  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#121111",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#121111",
  },
  inputError: { borderColor: "#FF4444" },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 4,
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  selectedText: { color: "#121111", fontSize: 16 },
  placeholderText: { color: "#9ca3af", fontSize: 16 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#121111",
  },
  buttonContainer: { marginTop: 25, marginBottom: 15 },
  loginLink: { alignItems: "center", marginTop: 10 },
  loginText: { fontSize: 14, color: "#9ca3af" },
  loginTextHighlight: { color: "#16a34a", fontWeight: "600" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: { fontSize: 16, color: "#121111" },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 16, color: "#16a34a", fontWeight: "600" },
  datePickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#121111",
  },
  datePickerCancel: {
    fontSize: 16,
    color: "#6b7280",
  },
  datePickerConfirm: {
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "600",
  },
});

export default ProRegister;