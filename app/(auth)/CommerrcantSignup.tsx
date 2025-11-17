// FortibOneOnboarding.tsx - SOLUTION COMPLÈTE
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  useOnboardingStore,
  FormData,
  CreateBusinessData,
  Country,
} from "@/store/onboardingStore";

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
interface CountrySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountry: Country | null;
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
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.dateModalContainer}>
            <Text style={modalStyles.modalTitle}>Sélectionner une date</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={modalStyles.datePicker}
            />
            <View style={modalStyles.dateModalButtons}>
              <TouchableOpacity
                style={[modalStyles.dateButton, modalStyles.cancelButton]}
                onPress={onClose}
              >
                <Text style={modalStyles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.dateButton, modalStyles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={modalStyles.confirmButtonText}>Confirmer</Text>
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
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <Text style={modalStyles.modalTitle}>Sélectionnez le sexe</Text>
          <View style={modalStyles.genderOptions}>
            {["Masculin", "Féminin"].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  modalStyles.genderOption,
                  tempSelectedGender === gender && modalStyles.selectedOption,
                ]}
                onPress={() => setTempSelectedGender(gender)}
              >
                <Text
                  style={[
                    modalStyles.genderText,
                    tempSelectedGender === gender && modalStyles.selectedText,
                  ]}
                >
                  {gender}
                </Text>
                <View
                  style={[
                    modalStyles.radioButton,
                    tempSelectedGender === gender &&
                      modalStyles.radioButtonSelected,
                  ]}
                >
                  {tempSelectedGender === gender && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={modalStyles.modalButtonContainer}>
            <TouchableOpacity
              style={[
                modalStyles.saveButton,
                !tempSelectedGender && modalStyles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!tempSelectedGender}
            >
              <Text
                style={[
                  modalStyles.saveButtonText,
                  !tempSelectedGender && modalStyles.saveButtonTextDisabled,
                ]}
              >
                Enregistrer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// === MODAL PAYS ===
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
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.countryModalContainer}>
          <View style={modalStyles.countryModalHeader}>
            <Text style={modalStyles.countryModalTitle}>
              Sélectionnez votre pays
            </Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={modalStyles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={modalStyles.searchIcon}
            />
            <TextInput
              placeholder="Rechercher un pays..."
              value={search}
              onChangeText={setSearch}
              style={modalStyles.searchInput}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={modalStyles.regionScrollView}
            contentContainerStyle={modalStyles.regionScrollContent}
          >
            {regions.map((region) => (
              <TouchableOpacity
                key={region}
                onPress={() => setSelectedRegion(region)}
                style={[
                  modalStyles.regionChip,
                  selectedRegion === region && modalStyles.regionChipSelected,
                ]}
              >
                <Text
                  style={[
                    modalStyles.regionChipText,
                    selectedRegion === region &&
                      modalStyles.regionChipTextSelected,
                  ]}
                >
                  {region === "Tous" ? "Tous" : region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {loading ? (
            <View style={modalStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={modalStyles.loadingText}>Chargement...</Text>
            </View>
          ) : (
            <ScrollView style={modalStyles.countriesScrollView}>
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={country.cca2}
                  style={[
                    modalStyles.countryItemModern,
                    selectedCountry?.cca2 === country.cca2 &&
                      modalStyles.selectedCountryItemModern,
                  ]}
                  onPress={() => handleSelect(country)}
                >
                  <Image
                    source={{ uri: country.flags.png }}
                    style={modalStyles.flagModern}
                  />
                  <View style={modalStyles.countryInfo}>
                    <Text style={modalStyles.countryNameModern}>
                      {country.name.common}
                    </Text>
                    <Text style={modalStyles.phoneCodeModern}>
                      {getPhoneCode(country)}
                    </Text>
                  </View>
                  {selectedCountry?.cca2 === country.cca2 && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#059669"
                    />
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

const FortibOneOnboarding: React.FC = () => {
  const router = useRouter();
  const scrollViewRef2 = useRef<ScrollView>(null);
  const scrollViewRef3 = useRef<ScrollView>(null);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(false);

  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [phoneError, setPhoneError] = useState<string>("");

  // ÉTAT LOCAL pour gérer les erreurs de validation
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const {
    step,
    accountType,
    personalData,
    businessData,
    logoImage,
    coverImage,
    selectedCountry,
    otp,
    showPassword,
    showConfirmPassword,
    setStep,
    setAccountType,
    updatePersonalData,
    updateBusinessData,
    setLogoImage,
    setCoverImage,
    setOtp,
    togglePassword,
    toggleConfirmPassword,
    setSelectedCountry,
  } = useOnboardingStore();

  // Charger le pays par défaut
  useEffect(() => {
    const loadDefaultCountry = async () => {
      if (selectedCountry) return;
      const saved = await AsyncStorage.getItem("onboarding_selectedCountry");
      if (saved) {
        const country = JSON.parse(saved);
        setSelectedCountry(country);
        updatePersonalData({ country: country.name.common });
      } else {
        const fetchCameroon = async () => {
          const res = await fetch("https://restcountries.com/v3.1/alpha/CM");
          const data = await res.json();
          if (data[0]) {
            const cm = data[0];
            setSelectedCountry(cm);
            updatePersonalData({ country: cm.name.common });
            AsyncStorage.setItem(
              "onboarding_selectedCountry",
              JSON.stringify(cm)
            );
          }
        };
        fetchCameroon();
      }
    };
    loadDefaultCountry();
  }, []);

  // VALIDATION SIMPLIFIÉE - Sans react-hook-form
  const validatePersonalData = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!personalData.prenom?.trim()) errors.prenom = "Prénom requis";
    if (!personalData.name?.trim()) errors.name = "Nom requis";
    if (!personalData.sexe) errors.sexe = "Sexe requis";
    if (!personalData.country) errors.country = "Pays requis";
    if (!personalData.dateNaissance) errors.dateNaissance = "Date requise";

    if (!personalData.email?.trim()) {
      errors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email)) {
      errors.email = "Email invalide";
    }

    if (!personalData.phone?.trim()) {
      errors.phone = "Téléphone requis";
    } else if (!validatePhoneNumber(personalData.phone, selectedCountry)) {
      errors.phone = "Numéro invalide pour ce pays";
    }

    if (!personalData.city?.trim()) errors.city = "Ville requise";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [personalData, selectedCountry]);

  const validateBusinessData = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!businessData.name?.trim()) errors.name = "Nom du commerce requis";
    if (!businessData.activitySector) errors.activitySector = "Secteur requis";
    if (!businessData.address?.trim()) errors.address = "Adresse requise";
    if (!businessData.currencyId) errors.currencyId = "Devise requise";

    if (!businessData.description?.trim()) {
      errors.description = "Description requise";
    } else if (businessData.description.length < 20) {
      errors.description = "20+ caractères requis";
    }

    if (!logoImage) errors.logoUrl = "Logo requis";
    if (!coverImage) errors.coverImageUrl = "Couverture requise";
    if (!businessData.latitude || businessData.latitude === 0) {
      errors.latitude = "Position GPS requise";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [businessData, logoImage, coverImage]);

  const validatePasswordData = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!personalData.password) {
      errors.password = "Mot de passe requis";
    } else {
      if (personalData.password.length < 8) errors.password = "8+ caractères";
      if (!/[A-Z]/.test(personalData.password)) errors.password = "1 majuscule";
      if (!/\d/.test(personalData.password)) errors.password = "1 chiffre";
      if (!/[!@#$%^&*]/.test(personalData.password))
        errors.password = "1 spécial";
    }

    if (!personalData.confirmPassword) {
      errors.confirmPassword = "Confirmation requise";
    } else if (personalData.password !== personalData.confirmPassword) {
      errors.confirmPassword = "Mots de passe différents";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [personalData.password, personalData.confirmPassword]);

  const validatePhoneNumber = useCallback(
    (phone: string, country: Country | null): boolean => {
      if (!country || !phone) return false;
      const code = country.idd.root + country.idd.suffixes[0];
      if (!phone.startsWith(code)) return false;
      const number = phone.replace(code, "").trim().replace(/\s+/g, "");
      if (!/^\d+$/.test(number)) return false;

      const rules: Record<string, number[]> = {
        "+237": [9],
        "+33": [9],
        "+1": [10],
        "+44": [10],
        "+49": [10, 11],
      };
      const expected = rules[code] || [9, 10];
      return expected.includes(number.length);
    },
    []
  );

  const handlePhoneChange = useCallback(
    (text: string) => {
      const code = selectedCountry
        ? selectedCountry.idd.root + selectedCountry.idd.suffixes[0]
        : "";

      if (code && !text.startsWith(code)) {
        const newValue = code + " ";
        updatePersonalData({ phone: newValue });
      } else {
        updatePersonalData({ phone: text });
      }
      setPhoneError("");
      // Effacer l'erreur de validation pour ce champ
      setValidationErrors((prev) => ({ ...prev, phone: "" }));
    },
    [selectedCountry, updatePersonalData]
  );

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      updatePersonalData({ [field]: value });
      // Effacer l'erreur de validation pour ce champ
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    },
    [updatePersonalData]
  );

  const handleBusinessInputChange = useCallback(
    (field: keyof CreateBusinessData, value: string) => {
      updateBusinessData({ [field]: value });
      // Effacer l'erreur de validation pour ce champ
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    },
    [updateBusinessData]
  );

  const handleCountrySelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      updatePersonalData({ country: country.name.common });
      const code = country.idd.root + country.idd.suffixes[0];
      if (!personalData.phone.startsWith(code)) {
        const newPhone = code + " ";
        updatePersonalData({ phone: newPhone });
      }
      AsyncStorage.setItem(
        "onboarding_selectedCountry",
        JSON.stringify(country)
      );
      setValidationErrors((prev) => ({ ...prev, country: "" }));
    },
    [setSelectedCountry, updatePersonalData, personalData.phone]
  );

  const handleGenderSelect = useCallback(
    (gender: string) => {
      updatePersonalData({ sexe: gender });
      setValidationErrors((prev) => ({ ...prev, sexe: "" }));
      setShowGenderModal(false);
    },
    [updatePersonalData]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      const formatted = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
      updatePersonalData({ dateNaissance: formatted });
      setValidationErrors((prev) => ({ ...prev, dateNaissance: "" }));
      setShowDateModal(false);
    },
    [updatePersonalData]
  );

  const pickImage = useCallback(
    async (type: "logo" | "cover") => {
      try {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission refusée", "Accès à la galerie nécessaire");
          return;
        }

        if (type === "logo") setIsLoadingLogo(true);
        else setIsLoadingCover(true);

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: type === "logo" ? [1, 1] : [16, 9],
          quality: 0.8,
        });

        if (!result.canceled) {
          const uri = result.assets[0].uri;
          if (type === "logo") {
            setLogoImage(uri);
            setValidationErrors((prev) => ({ ...prev, logoUrl: "" }));
          } else {
            setCoverImage(uri);
            setValidationErrors((prev) => ({ ...prev, coverImageUrl: "" }));
          }
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger l'image");
        console.error("Image picker error:", error);
      } finally {
        if (type === "logo") setIsLoadingLogo(false);
        else setIsLoadingCover(false);
      }
    },
    [setLogoImage, setCoverImage]
  );

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Accès à la localisation nécessaire");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateBusinessData({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setValidationErrors((prev) => ({ ...prev, latitude: "" }));

      Alert.alert("Succès", "Position GPS enregistrée");
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'obtenir la position");
      console.error("Location error:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [updateBusinessData]);

  const getPhoneCode = useCallback(
    (country: Country): string => country.idd.root + country.idd.suffixes[0],
    []
  );

  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      if (/^\d*$/.test(value) && value.length <= 1) {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
          setTimeout(() => {
            otpInputRefs.current[index + 1]?.focus();
          }, 50);
        }
      }
    },
    [otp, setOtp]
  );

  const handleOtpKeyPress = useCallback(
    (e: any, index: number) => {
      if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
        setTimeout(() => {
          otpInputRefs.current[index - 1]?.focus();
        }, 50);
      }
    },
    [otp]
  );

  const Header = useCallback(
    ({ onBack }: { onBack?: () => void }) => (
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={{ padding: 8 }}
            accessibilityLabel="Retour"
          >
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.titleContainer}>
          <Image
            source={require("@/assets/images/logo/green.png")}
            style={styles.logoImage}
          />
          <Text style={styles.mainTitle}>
            Créer un compte {"\n"}
            <Text style={styles.subTitle}>Professionnel</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButton}>Connectez-vous</Text>
        </TouchableOpacity>
      </View>
    ),
    [router]
  );

  const Footer = useCallback(
    ({
      onBack,
      onNext,
      nextLabel = "Suivant",
      showIcon = true,
    }: {
      onBack?: () => void;
      onNext: () => void;
      nextLabel?: string;
      showIcon?: boolean;
    }) => {
      const getIsValid = () => {
        switch (step) {
          case 1:
            return !!accountType;
          case 2:
            return validatePersonalData();
          case 3:
            return validateBusinessData();
          case 4:
            return validatePasswordData();
          case 5:
            return otp.every((digit) => digit !== "");
          default:
            return true;
        }
      };

      const isValid = getIsValid();

      return (
        <View style={styles.footer}>
          {onBack && (
            <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
              <Text style={styles.cancelText}>Retour</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
            onPress={onNext}
            disabled={!isValid}
          >
            <Text style={styles.nextButtonText}>{nextLabel}</Text>
            {showIcon && <Feather name="arrow-right" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      );
    },
    [
      step,
      accountType,
      validatePersonalData,
      validateBusinessData,
      validatePasswordData,
      otp,
    ]
  );

  const renderStep1 = () => (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.question}>
          Que souhaitez-vous faire sur FortibOne ?
        </Text>
        {[
          { id: "COMMERCANT", title: "Je suis COMMERÇANT" },
          { id: "FOURNISSEUR", title: "Je suis FOURNISSEUR" },
          { id: "RESTAURATEUR", title: "Je suis RESTAURATEUR" },
        ].map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.accountTypeCard,
              accountType === type.id && styles.accountTypeCardSelected,
            ]}
            onPress={() => setAccountType(type.id as any)}
          >
            <Text style={styles.accountTypeTitle}>{type.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Footer onNext={() => setStep(2)} />
    </View>
  );

  const Step2Content = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef2}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header onBack={() => setStep(1)} />
          <Text style={styles.stepIndicator}>Etape 2 sur 4</Text>
          <Text style={styles.stepTitle}>Informations du responsable</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.prenom && styles.inputError,
              ]}
              value={personalData.prenom}
              onChangeText={(text) => handleInputChange("prenom", text)}
              placeholder="Jean"
            />
            {validationErrors.prenom && (
              <Text style={styles.errorText}>{validationErrors.prenom}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={[styles.input, validationErrors.name && styles.inputError]}
              value={personalData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Dupont"
            />
            {validationErrors.name && (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sexe *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={{ color: personalData.sexe ? "#000" : "#999" }}>
                {personalData.sexe || "Sélectionnez"}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {validationErrors.sexe && (
              <Text style={styles.errorText}>{validationErrors.sexe}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pays *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowCountryModal(true)}
            >
              {selectedCountry ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{ uri: selectedCountry.flags.png }}
                    style={{ width: 24, height: 16, marginRight: 8 }}
                  />
                  <Text>{selectedCountry.name.common}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Sélectionnez un pays</Text>
              )}
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {validationErrors.country && (
              <Text style={styles.errorText}>{validationErrors.country}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de naissance *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowDateModal(true)}
            >
              <Text
                style={{ color: personalData.dateNaissance ? "#000" : "#999" }}
              >
                {personalData.dateNaissance || "jj/mm/aaaa"}
              </Text>
              <Feather name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            {validationErrors.dateNaissance && (
              <Text style={styles.errorText}>
                {validationErrors.dateNaissance}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.email && styles.inputError,
              ]}
              value={personalData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <View style={styles.phoneContainer}>
              <TextInput
                style={[
                  styles.input,
                  { paddingLeft: selectedCountry ? 60 : 12 },
                  (validationErrors.phone || phoneError) && styles.inputError,
                ]}
                value={personalData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                placeholder={
                  selectedCountry
                    ? `${getPhoneCode(selectedCountry)} 6 XX XX XX XX`
                    : "+237 6 XX XX XX XX"
                }
              />
              {selectedCountry && (
                <View style={styles.phoneCodeOverlay}>
                  <Text style={styles.phoneCodeText}>
                    {getPhoneCode(selectedCountry)}
                  </Text>
                </View>
              )}
            </View>
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : (
              validationErrors.phone && (
                <Text style={styles.errorText}>{validationErrors.phone}</Text>
              )
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ville *</Text>
            <TextInput
              style={[styles.input, validationErrors.city && styles.inputError]}
              value={personalData.city}
              onChangeText={(text) => handleInputChange("city", text)}
            />
            {validationErrors.city && (
              <Text style={styles.errorText}>{validationErrors.city}</Text>
            )}
          </View>

          <Footer
            onBack={() => setStep(1)}
            onNext={() => {
              if (validatePersonalData()) {
                setStep(3);
              }
            }}
          />
        </ScrollView>

        <GenderSelectionModal
          visible={showGenderModal}
          onClose={() => setShowGenderModal(false)}
          onSelect={handleGenderSelect}
          selectedGender={personalData.sexe}
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
      </KeyboardAvoidingView>
    );
  };

  const Step3Content = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef3}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header onBack={() => setStep(2)} />
          <Text style={styles.stepIndicator}>Etape 3 sur 4</Text>
          <Text style={styles.stepTitle}>Activité Commerciale</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom du commerce *</Text>
            <TextInput
              style={[styles.input, validationErrors.name && styles.inputError]}
              value={businessData.name}
              onChangeText={(text) => handleBusinessInputChange("name", text)}
            />
            {validationErrors.name && (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Secteur d&apos;activité *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                Alert.alert("Info", "Sélection du secteur d'activité");
              }}
            >
              <Text
                style={{ color: businessData.activitySector ? "#000" : "#999" }}
              >
                {businessData.activitySector || "Sélectionnez"}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {validationErrors.activitySector && (
              <Text style={styles.errorText}>
                {validationErrors.activitySector}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse *</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.address && styles.inputError,
              ]}
              value={businessData.address}
              onChangeText={(text) =>
                handleBusinessInputChange("address", text)
              }
            />
            {validationErrors.address && (
              <Text style={styles.errorText}>{validationErrors.address}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Position GPS *</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Feather name="map-pin" size={20} color="#fff" />
              )}
              <Text style={styles.locationButtonText}>
                {isLoadingLocation ? " Chargement..." : " Ma position"}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                marginTop: 4,
                color: businessData.latitude ? "#059669" : "#999",
              }}
            >
              {businessData.latitude
                ? `Lat: ${businessData.latitude.toFixed(
                    4
                  )}, Lon: ${businessData.longitude.toFixed(4)}`
                : "Non défini"}
            </Text>
            {validationErrors.latitude && (
              <Text style={styles.errorText}>{validationErrors.latitude}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Logo *</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage("logo")}
              disabled={isLoadingLogo}
            >
              {isLoadingLogo ? (
                <ActivityIndicator size="large" color="#059669" />
              ) : logoImage ? (
                <Image
                  source={{ uri: logoImage }}
                  style={styles.imagePreview}
                />
              ) : (
                <Feather name="camera" size={30} color="#666" />
              )}
              <Text style={styles.imageText}>
                {isLoadingLogo
                  ? "Chargement..."
                  : logoImage
                  ? "Changer"
                  : "Ajouter"}
              </Text>
            </TouchableOpacity>
            {validationErrors.logoUrl && (
              <Text style={styles.errorText}>{validationErrors.logoUrl}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Couverture *</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage("cover")}
              disabled={isLoadingCover}
            >
              {isLoadingCover ? (
                <ActivityIndicator size="large" color="#059669" />
              ) : coverImage ? (
                <Image
                  source={{ uri: coverImage }}
                  style={styles.imagePreview}
                />
              ) : (
                <Feather name="image" size={30} color="#666" />
              )}
              <Text style={styles.imageText}>
                {isLoadingCover
                  ? "Chargement..."
                  : coverImage
                  ? "Changer"
                  : "Ajouter"}
              </Text>
            </TouchableOpacity>
            {validationErrors.coverImageUrl && (
              <Text style={styles.errorText}>
                {validationErrors.coverImageUrl}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                validationErrors.description && styles.inputError,
              ]}
              value={businessData.description}
              onChangeText={(text) =>
                handleBusinessInputChange("description", text)
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {validationErrors.description && (
              <Text style={styles.errorText}>
                {validationErrors.description}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Devise *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                Alert.alert("Info", "Sélection de la devise");
              }}
            >
              <Text
                style={{ color: businessData.currencyId ? "#000" : "#999" }}
              >
                {businessData.currencyId || "Sélectionnez"}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {validationErrors.currencyId && (
              <Text style={styles.errorText}>
                {validationErrors.currencyId}
              </Text>
            )}
          </View>

          <Footer
            onBack={() => setStep(2)}
            onNext={() => {
              if (validateBusinessData()) {
                updateBusinessData({
                  phoneNumber: personalData.phone,
                });
                setStep(4);
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderStep4 = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header onBack={() => setStep(3)} />
          <View style={styles.content}>
            <Text style={styles.stepIndicator}>Etape 4 sur 4</Text>
            <Text style={styles.stepTitle}>Mot de passe</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={[
                    styles.inputPassword,
                    validationErrors.password && styles.inputError,
                  ]}
                  value={personalData.password}
                  onChangeText={(text) => handleInputChange("password", text)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={togglePassword}>
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={styles.errorText}>
                  {validationErrors.password}
                </Text>
              )}
              <Text style={styles.passwordHint}>
                8+ caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmer le mot de passe *</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={[
                    styles.inputPassword,
                    validationErrors.confirmPassword && styles.inputError,
                  ]}
                  value={personalData.confirmPassword}
                  onChangeText={(text) =>
                    handleInputChange("confirmPassword", text)
                  }
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={toggleConfirmPassword}>
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword && (
                <Text style={styles.errorText}>
                  {validationErrors.confirmPassword}
                </Text>
              )}
            </View>
          </View>

          <Footer
            onBack={() => setStep(3)}
            onNext={() => {
              if (validatePasswordData()) {
                setStep(5);
              }
            }}
            nextLabel="Créer mon compte"
            showIcon={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderStep5 = () => {
    const isOtpComplete = otp.every((digit) => digit !== "");

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Header onBack={() => setStep(4)} />
          <View style={styles.content}>
            <Text style={styles.otpTitle}>Vérification OTP</Text>
            <Text style={styles.otpSubtitle}>
              Un code de vérification a été envoyé à {"\n"}
              {personalData.email}
            </Text>

            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputRefs.current[index] = ref)}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                Alert.alert("Code renvoyé", "Un nouveau code a été envoyé");
              }}
            >
              <Text style={styles.resendButtonText}>Renvoyer le code</Text>
            </TouchableOpacity>

            <Footer
              onBack={() => setStep(4)}
              onNext={() => {
                if (isOtpComplete) {
                  setStep(6);
                }
              }}
              nextLabel="Vérifier"
              showIcon={false}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderStep6 = () => (
    <View style={styles.successContainer}>
      <View style={styles.successContent}>
        <View style={styles.successIconContainer}>
          <Feather name="check-circle" size={80} color="#059669" />
        </View>
        <Text style={styles.successTitle}>Compte créé avec succès !</Text>
        <Text style={styles.successSubtitle}>
          Bienvenue sur FortibOne {personalData.prenom} !{"\n"}
          Votre commerce {businessData.name} est maintenant actif.
        </Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => {
            router.push("/(tabs)/home");
          }}
        >
          <Text style={styles.successButtonText}>Accéder à mon commerce</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {step === 1 && renderStep1()}
      {step === 2 && <Step2Content />}
      {step === 3 && <Step3Content />}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
    </SafeAreaView>
  );
};

// Les styles restent exactement les mêmes...
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  logoImage: { width: 50, height: 50, marginRight: 15 },
  mainTitle: { fontSize: 24, fontWeight: "600" },
  subTitle: { color: "#059669" },
  loginButton: { color: "#059669", fontWeight: "600" },
  content: { paddingHorizontal: 20, flex: 1 },
  question: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  accountTypeCard: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#eee",
  },
  accountTypeCardSelected: {
    borderColor: "#059669",
    backgroundColor: "#e6f7f0",
  },
  accountTypeTitle: { fontSize: 16, fontWeight: "600" },
  stepIndicator: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 20,
    marginTop: 10,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  formGroup: { marginBottom: 16, marginHorizontal: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  placeholderText: { color: "#999" },
  phoneContainer: { position: "relative" },
  phoneCodeOverlay: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  phoneCodeText: { color: "#059669", fontWeight: "600", fontSize: 14 },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingRight: 12,
  },
  inputPassword: { flex: 1, padding: 12, fontSize: 16 },
  passwordHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#f9f9f9",
    minHeight: 140,
  },
  imagePreview: { width: 100, height: 100, borderRadius: 12, marginBottom: 8 },
  imageText: { color: "#059669", fontWeight: "600", marginTop: 8 },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  locationButtonText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
  },
  cancelText: { color: "#666", fontWeight: "600" },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  nextButtonText: { color: "#fff", fontWeight: "600", marginRight: 8 },
  otpTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
    color: "#000",
  },
  otpSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    marginBottom: 30,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginVertical: 30,
    alignSelf: "center",
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "#fff",
  },
  otpInputFilled: {
    borderColor: "#059669",
    backgroundColor: "#f0fdf4",
  },
  resendButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  resendButtonText: {
    color: "#059669",
    fontWeight: "600",
    fontSize: 14,
  },
  verifyButton: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: "center",
    minWidth: 200,
    alignItems: "center",
  },
  verifyButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  verifyButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successContent: {
    alignItems: "center",
    width: "100%",
  },
  successIconContainer: {
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#000",
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
    lineHeight: 24,
  },
  successButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 250,
    justifyContent: "center",
  },
  successButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 10,
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 350,
    alignSelf: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#111",
  },
  genderOptions: { marginBottom: 20 },
  genderOption: {
    flexDirection: "row",
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
  saveButton: {
    backgroundColor: "#00C851",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  saveButtonDisabled: { backgroundColor: "#E0E0E0" },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  saveButtonTextDisabled: { color: "#999" },
  dateModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 350,
    alignSelf: "center",
    elevation: 5,
  },
  datePicker: { width: "100%", marginBottom: 20 },
  dateModalButtons: { flexDirection: "row", justifyContent: "space-between" },
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
  cancelButtonText: { color: "#666", fontWeight: "500" },
  confirmButtonText: { color: "#fff", fontWeight: "500" },
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
  countryModalTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
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
    paddingHorizontal: 20,
    marginBottom: 16,
    position: "relative",
  },
  searchIcon: { position: "absolute", left: 32, zIndex: 1, bottom: 25 },
  searchInput: {
    flex: 1,
    paddingLeft: 36,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  regionScrollView: { maxHeight: 50, marginBottom: 16 },
  regionScrollContent: { paddingHorizontal: 20, paddingVertical: 4 },
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  regionChipSelected: { backgroundColor: "#059669", borderColor: "#059669" },
  regionChipText: { fontSize: 14, color: "#666", fontWeight: "500" },
  regionChipTextSelected: { color: "#fff", fontWeight: "600" },
  countriesScrollView: { flex: 1, paddingHorizontal: 20 },
  countryItemModern: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCountryItemModern: {
    backgroundColor: "#F0FDF4",
    borderColor: "#059669",
  },
  flagModern: { width: 32, height: 22, borderRadius: 4, marginRight: 14 },
  countryInfo: { flex: 1 },
  countryNameModern: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginBottom: 2,
  },
  phoneCodeModern: { fontSize: 13, color: "#059669", fontWeight: "500" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#666" },
});

export default FortibOneOnboarding;
