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
import { useCallback, useEffect, useMemo, useState } from "react";
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
// === TYPES ===
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

interface Country {
  name: { common: string };
  flags: { png: string; svg: string };
  cca2: string;
  idd: { root: string; suffixes: string[] };
  region: string;
  subregion?: string;
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
}

// === MODAL DATE PICKER ===
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

  useEffect(() => {
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

// === MODAL SEXE ===
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

// === MODAL PAYS (avec région + code tel) ===
interface CountrySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountry: Country | null;
}

const CountrySelectionModal: React.FC<CountrySelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountry,
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("Tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && countries.length === 0) {
      fetch(
        "https://restcountries.com/v3.1/all?fields=name,flags,cca2,idd,region,subregion"
      )
        .then((res) => res.json())
        .then((data) => {
          const valid = data.filter(
            (c: Country) => c.idd?.root && c.idd?.suffixes?.length > 0
          );
          const sorted = valid.sort((a: Country, b: Country) =>
            a.name.common.localeCompare(b.name.common)
          );
          setCountries(sorted);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          Alert.alert("Erreur", "Impossible de charger les pays.");
        });
    }
  }, [visible, countries.length]);

  const regions = useMemo(() => {
    const regs = [
      "Tous",
      ...countries
        .map((c) => c.region)
        .filter((region, index, self) => self.indexOf(region) === index),
    ];
    return regs.filter(Boolean);
  }, [countries]);

  const filteredCountries = useMemo(() => {
    let list = countries;
    if (selectedRegion !== "Tous") {
      list = list.filter((c) => c.region === selectedRegion);
    }
    if (search) {
      list = list.filter((c) =>
        c.name.common.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [countries, search, selectedRegion]);

  const getPhoneCode = (country: Country): string => {
    return country.idd.root + country.idd.suffixes[0];
  };

  const handleSelect = (country: Country) => {
    onSelect(country);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.countryModalContainer}>
          {/* Header */}
          <View style={styles.countryModalHeader}>
            <Text style={styles.countryModalTitle}>
              Sélectionnez votre pays
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <InputField
              placeholder="Rechercher un pays..."
              value={search}
              onChangeText={setSearch}
              autoFocus={false}
              label=""
              style={styles.searchInput}
            />
          </View>

          {/* Region Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.regionScrollView}
            contentContainerStyle={styles.regionScrollContent}
          >
            {regions.map((region) => (
              <TouchableOpacity
                key={region}
                onPress={() => setSelectedRegion(region)}
                style={[
                  styles.regionChip,
                  selectedRegion === region && styles.regionChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.regionChipText,
                    selectedRegion === region && styles.regionChipTextSelected,
                  ]}
                >
                  {region === "Tous" ? "Tous" : region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Countries List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.countriesScrollView}
              showsVerticalScrollIndicator={false}
            >
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={country.cca2}
                  style={[
                    styles.countryItemModern,
                    selectedCountry?.cca2 === country.cca2 &&
                      styles.selectedCountryItemModern,
                  ]}
                  onPress={() => handleSelect(country)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: country.flags.png }}
                    style={styles.flagModern}
                  />
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryNameModern}>
                      {country.name.common}
                    </Text>
                    <Text style={styles.phoneCodeModern}>
                      {getPhoneCode(country)}
                    </Text>
                  </View>
                  {selectedCountry?.cca2 === country.cca2 && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#059669"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

// === VALIDATION TÉLÉPHONE PAR PAYS (exemple simple) ===
const validatePhoneNumber = (
  phone: string,
  country: Country | null
): boolean => {
  if (!country || !phone) return false;

  const code = country.idd.root + country.idd.suffixes[0];
  if (!phone.startsWith(code)) return false;

  const number = phone.replace(code, "").trim().replace(/\s+/g, "");
  const length = number.length;

  // Règles simples (ajustables)
  const rules: Record<string, number> = {
    "+33": 9, // France
    "+1": 10, // USA/Canada
    "+44": 10, // UK
    "+49": 10, // Allemagne
    "+34": 9, // Espagne
    "+39": 9, // Italie
    "+32": 9, // Belgique
    "+41": 9, // Suisse
  };

  const expected = rules[code] || 9;
  return length === expected && /^\d+$/.test(number);
};

// === COMPOSANT PRINCIPAL ===
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
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneError, setPhoneError] = useState<string>("");
  const [userProfile, setUserProfile] = useState<
    "particulier" | "professionnel" | null
  >(null);
  const router = useRouter();
  // Dans useEffect avec la vérif du profil, charge-le aussi dans l'état
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem("userProfile");
        if (saved === "particulier" || saved === "professionnel") {
          setUserProfile(saved as "particulier" | "professionnel");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Erreur vérification profil:", error);
        router.replace("/onboarding");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    checkProfile();
  }, [router]);
  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "phoneNumber") {
      setPhoneError("");
    }
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
    const baseValid =
      Object.values(formData).every((v) => v.trim() !== "") &&
      validateEmail(formData.email) &&
      validatePassword(formData.motDePasse);

    if (!baseValid) return false;

    const phoneValid = validatePhoneNumber(
      formData.phoneNumber,
      selectedCountry
    );
    if (!phoneValid) {
      setPhoneError("Numéro invalide pour ce pays");
    }
    return phoneValid;
  }, [formData, validateEmail, validatePassword, selectedCountry]);

  const isPasswordValid = useMemo(() => {
    return validatePassword(formData.motDePasse);
  }, [formData.motDePasse, validatePassword]);

  const formValid = useMemo(() => {
    const baseValid =
      Object.values(formData).every((v) => v.trim() !== "") &&
      validateEmail(formData.email) &&
      isPasswordValid; // Use memoized value

    if (!baseValid) return false;

    return validatePhoneNumber(formData.phoneNumber, selectedCountry);
  }, [formData, validateEmail, isPasswordValid, selectedCountry]);

  const getPhoneCode = (country: Country): string => {
    return country.idd.root + country.idd.suffixes[0];
  };

  const handleCountrySelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      updateField("pays", country.name.common);
      const code = getPhoneCode(country);
      if (!formData.phoneNumber.startsWith(code)) {
        updateField("phoneNumber", code + " ");
      }
      setPhoneError("");
    },
    [formData.phoneNumber, updateField]
  );

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

  const handleCreateAccount = async () => {
    if (!isFormValid()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs correctement.");
      return;
    }

    try {
      // Lecture directe du profil choisi dans l'onboarding
      const savedProfile = await AsyncStorage.getItem("userProfile");

      const profileType =
        savedProfile === "professionnel" ? "PRO" : "PARTICULIER";

      const payload: RegisterPayload = {
        firstName: formData.prenom.trim(),
        lastName: formData.nom.trim(),
        gender: formData.sexe === "Masculin" ? "MALE" : "FEMALE",
        profileType, // ← maintenant dynamique et sans warning !
        country: formData.pays.trim(),
        city: formData.ville.trim(),
        dateOfBirth: selectedDate
          ? selectedDate.toISOString().split("T")[0]
          : "1990-01-01", //
        email: formData.email.trim(),
        password: formData.motDePasse,
        phoneNumber: formData.phoneNumber.trim().replace(/\s+/g, ""),
      };

      const result = await registerUser(payload);
      useUserStore.getState().setEmail(payload.email);

      if (result.success) {
        Alert.alert("Succès", result.message || "Compte créé avec succès !");
        router.push("/(auth)/OtpScreen");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Préparation...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <SafeAreaView style={styles.container}>
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
                <Text style={styles.subTitle}>
                  {userProfile === "professionnel"
                    ? "Professionnel"
                    : "Particulier"}
                </Text>
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

              {/* PAYS */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Pays</Text>
                <TouchableOpacity
                  style={styles.selectField}
                  onPress={() => setShowCountryModal(true)}
                >
                  {selectedCountry ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Image
                        source={{ uri: selectedCountry.flags.png }}
                        style={{
                          width: 24,
                          height: 16,
                          marginRight: 8,
                          borderRadius: 2,
                        }}
                      />
                      <Text style={styles.selectFieldText}>
                        {selectedCountry.name.common}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.placeholderText}>
                      Sélectionnez votre pays
                    </Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* VILLE - CHAMP TEXTE LIBRE */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Ville</Text>
                <InputField
                  placeholder="Entrez votre ville (ex: Douala)"
                  value={formData.ville}
                  onChangeText={(text) => updateField("ville", text)}
                  autoCapitalize="words"
                  leftIcon={
                    selectedCountry ? (
                      <Image
                        source={{ uri: selectedCountry.flags.png }}
                        style={{
                          width: 20,
                          height: 14,
                          marginRight: 8,
                          borderRadius: 2,
                        }}
                      />
                    ) : null
                  }
                  label={""}
                />
              </View>

              {/* TÉLÉPHONE */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Téléphone</Text>
                <View style={{ position: "relative" }}>
                  <InputField
                    placeholder="6 12 34 56 78" // ← Plus d'indicatif ici !
                    value={
                      selectedCountry &&
                      formData.phoneNumber.startsWith(
                        getPhoneCode(selectedCountry)
                      )
                        ? formData.phoneNumber
                            .replace(getPhoneCode(selectedCountry), "")
                            .trim()
                        : formData.phoneNumber
                    }
                    onChangeText={(text) => {
                      const code = selectedCountry
                        ? getPhoneCode(selectedCountry)
                        : "";
                      const cleanNumber = text.replace(/\s+/g, " ").trim();
                      updateField(
                        "phoneNumber",
                        code + (cleanNumber ? " " + cleanNumber : "")
                      );
                    }}
                    keyboardType="phone-pad"
                    leftIcon={
                      selectedCountry ? (
                        <Text
                          style={{
                            marginRight: 8,
                            fontSize: 16,
                            color: "#059669",
                            fontWeight: "600",
                          }}
                        >
                          {getPhoneCode(selectedCountry)}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            marginRight: 8,
                            fontSize: 16,
                            color: "#999",
                          }}
                        >
                          +?
                        </Text>
                      )
                    }
                    label={""}
                  />
                  {phoneError ? (
                    <Text style={styles.phoneErrorText}>{phoneError}</Text>
                  ) : null}
                </View>
              </View>

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
                  formData.motDePasse && !isPasswordValid && styles.errorText,
                ]}
              >
                Le mot de passe doit comporter au moins 8 caractères et inclure
                des lettres majuscules, minuscules et chiffres
                {formData.motDePasse && !isPasswordValid && " - Insuffisant"}
              </Text>

              <View style={styles.createButtonContainer}>
                <CustomButton
                  title="Créer un compte"
                  onPress={handleCreateAccount}
                  backgroundColor={formValid ? "#00C851" : "#E0E0E0"}
                  textColor={formValid ? "#fff" : "#999"}
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
          <CountrySelectionModal
            visible={showCountryModal}
            onClose={() => setShowCountryModal(false)}
            onSelect={handleCountrySelect}
            selectedCountry={selectedCountry}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
};

// === STYLES COMPLETS ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#059669" },
  header: { marginBottom: 30, paddingHorizontal: 20 },
  newTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 30,
  },
  logo: { width: 50, height: 50, marginRight: 15, resizeMode: "contain" },
  titleText: { flex: 1 },
  mainTitle: { fontSize: 24, color: "#121f3e", fontWeight: "600" },
  subTitle: { fontSize: 24, color: "#059669" },
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
  fieldContainer: { marginVertical: 10, width: "100%" },
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

    justifyContent: "flex-end",
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
  modalButtonContainer: { width: "100%", marginTop: 10 },
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
  phoneErrorText: {
    fontSize: 12,
    color: "#FF4444",
    marginTop: 4,
    paddingHorizontal: 10,
  },

  // === STYLES MODAL PAYS MODERNE ===
  countryModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    height: "90%",
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  countryModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  countryModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 32,
    zIndex: 1,
    bottom: 25,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 36,
  },
  regionScrollView: {
    maxHeight: 50,
    marginBottom: 16,
  },
  regionScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  regionChipSelected: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  regionChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  regionChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  countriesScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  countryItemModern: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  selectedCountryItemModern: {
    backgroundColor: "#F0FDF4",
    borderColor: "#059669",
  },
  flagModern: {
    width: 32,
    height: 22,
    borderRadius: 4,
    marginRight: 14,
  },
  countryInfo: {
    flex: 1,
  },
  countryNameModern: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginBottom: 2,
  },
  phoneCodeModern: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
});

export default Register;
