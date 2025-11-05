// FortibOneOnboarding.tsx
import { JSX, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  findNodeHandle,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BackButton from "@/components/BackButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useOnboardingStore,
  FormData,
  CreateBusinessData,
  Country,
} from "@/store/onboardingStore";

// === SCHEMAS ===
const personalSchema = yup.object({
  prenom: yup.string().required("Prénom requis"),
  name: yup.string().required("Nom requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  phone: yup.string().required("Téléphone requis"),
  country: yup.string().required("Pays requis"),
  city: yup.string().required("Ville requise"),
  sexe: yup.string().required("Sexe requis"),
  dateNaissance: yup.string().required("Date requise"),
  password: yup
    .string()
    .min(8, "8+ caractères")
    .matches(/[A-Z]/, "1 majuscule")
    .matches(/\d/, "1 chiffre")
    .matches(/[!@#$%^&*]/, "1 spécial")
    .required("Mot de passe requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mots de passe différents")
    .required("Confirmation requise"),
});

const businessSchema = yup.object({
  name: yup.string().required("Nom du commerce requis"),
  activitySector: yup.string().required("Secteur requis"),
  address: yup.string().required("Adresse requise"),
  description: yup
    .string()
    .min(20, "20+ caractères")
    .required("Description requise"),
  currencyId: yup.string().required("Devise requise"),
});

const FortibOneOnboarding: React.FC = () => {
  const router = useRouter();
  const scrollViewRef2 = useRef<ScrollView>(null);
  const scrollViewRef3 = useRef<ScrollView>(null);

  const {
    step,
    accountType,
    personalData,
    businessData,
    logoImage,
    coverImage,
    selectedCountry,
    selectedDate,
    otp,
    showPassword,
    showConfirmPassword,
    showGenderPicker,
    showDatePicker,
    showCountryPicker,
    showSectorPicker,
    showCurrencyPicker,
    setStep,
    setAccountType,
    updatePersonalData,
    updateBusinessData,
    setLogoImage,
    setCoverImage,
    setSelectedCountry,
    setSelectedDate,
    setOtp,
    togglePassword,
    toggleConfirmPassword,
    toggleGenderPicker,
    toggleDatePicker,
    toggleCountryPicker,
    toggleSectorPicker,
    toggleCurrencyPicker,
  } = useOnboardingStore();

  const personalForm = useForm<FormData>({
    resolver: yupResolver(personalSchema),
    mode: "onChange",
  });
  const businessForm = useForm<CreateBusinessData>({
    resolver: yupResolver(businessSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const sub = personalForm.watch((value) => updatePersonalData(value));
    return () => sub.unsubscribe();
  }, [personalForm, updatePersonalData]);

  useEffect(() => {
    const sub = businessForm.watch((value) => updateBusinessData(value));
    return () => sub.unsubscribe();
  }, [businessForm, updateBusinessData]);

  const pickImage = async (type: "logo" | "cover") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission refusée");

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
        businessForm.setValue("logoUrl", uri);
      } else {
        setCoverImage(uri);
        businessForm.setValue("coverImageUrl", uri);
      }
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return Alert.alert("Localisation refusée");

    const location = await Location.getCurrentPositionAsync({});
    updateBusinessData({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const formatDate = (date: Date): string => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const getPhoneCode = (country: Country): string =>
    country.idd.root + country.idd.suffixes[0];

  const validatePhoneNumber = (
    phone: string,
    country: Country | null
  ): boolean => {
    if (!country || !phone) return false;
    const code = getPhoneCode(country);
    if (!phone.startsWith(code)) return false;
    const number = phone.replace(code, "").trim().replace(/\s+/g, "");
    const rules: Record<string, number> = { "+33": 9, "+1": 10, "+44": 10 };
    const expected = rules[code] || 9;
    return number.length === expected && /^\d+$/.test(number);
  };

  const scrollToInput = (
    ref: TextInput | null,
    scrollRef: React.RefObject<ScrollView>
  ) => {
    if (ref && scrollRef.current) {
      setTimeout(() => {
        ref.measureLayout(
          findNodeHandle(scrollRef.current!) as number,
          (_x, y) =>
            scrollRef.current!.scrollTo({ y: y - 120, animated: true }),
          () => {}
        );
      }, 300);
    }
  };

  const Header = () => (
    <View style={styles.header}>
      <BackButton />
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
  );

  const Footer = ({
    onBack,
    onNext,
    nextLabel = "Suivant",
    showIcon = true,
  }: any) => {
    const isValid =
      step === 2
        ? personalForm.formState.isValid
        : businessForm.formState.isValid &&
          logoImage &&
          coverImage &&
          businessData.latitude !== 0;

    return (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelText}>{onBack ? "Retour" : "Annuler"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && { opacity: 0.5 }]}
          onPress={onNext}
          disabled={!isValid}
        >
          <Text style={styles.nextButtonText}>{nextLabel}</Text>
          {showIcon && <Feather name="arrow-right" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    );
  };

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
      <Footer
        onNext={() =>
          accountType ? setStep(2) : Alert.alert("Choisissez un type")
        }
      />
    </View>
  );

  const Step2Content = () => {
    const {
      control,
      formState: { errors },
    } = personalForm;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef2}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Header />
          <Text style={styles.stepIndicator}>Etape 2 sur 4</Text>
          <Text style={styles.stepTitle}>Informations du responsable</Text>

          <Controller
            control={control}
            name="prenom"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={[styles.input, errors.prenom && styles.inputError]}
                  {...field}
                  placeholder="Jean"
                />
                {errors.prenom && (
                  <Text style={styles.errorText}>{errors.prenom.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  {...field}
                  placeholder="Dupont"
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Sexe *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={toggleGenderPicker}
            >
              <Text style={{ color: personalData.sexe ? "#000" : "#999" }}>
                {personalData.sexe || "Sélectionnez"}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {!personalData.sexe && <Text style={styles.errorText}>Requis</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pays *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={toggleCountryPicker}
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
            {!personalData.country && (
              <Text style={styles.errorText}>Requis</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de naissance *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={toggleDatePicker}
            >
              <Text
                style={{ color: personalData.dateNaissance ? "#000" : "#999" }}
              >
                {personalData.dateNaissance || "jj/mm/aaaa"}
              </Text>
              <Feather name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            {!personalData.dateNaissance && (
              <Text style={styles.errorText}>Requis</Text>
            )}
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  {...field}
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Téléphone *</Text>
                <View style={styles.phoneContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { paddingLeft: selectedCountry ? 60 : 12 },
                      errors.phone && styles.inputError,
                    ]}
                    {...field}
                    keyboardType="phone-pad"
                  />
                  {selectedCountry && (
                    <View style={styles.phoneCodeOverlay}>
                      <Text style={styles.phoneCodeText}>
                        {getPhoneCode(selectedCountry)}
                      </Text>
                    </View>
                  )}
                </View>
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ville *</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  {...field}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city.message}</Text>
                )}
              </View>
            )}
          />

          <Footer
            onBack={() => setStep(1)}
            onNext={() => personalForm.formState.isValid && setStep(3)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const Step3Content = () => {
    const {
      control,
      formState: { errors },
    } = businessForm;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef3}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Header />
          <Text style={styles.stepIndicator}>Etape 3 sur 4</Text>
          <Text style={styles.stepTitle}>Activité Commerciale</Text>

          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom du commerce *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  {...field}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Secteur d’activité *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={toggleSectorPicker}
            >
              <Text
                style={{ color: businessData.activitySector ? "#000" : "#999" }}
              >
                {businessData.activitySector || "Sélectionnez"}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {!businessData.activitySector && (
              <Text style={styles.errorText}>Requis</Text>
            )}
          </View>

          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Adresse *</Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  {...field}
                />
                {errors.address && (
                  <Text style={styles.errorText}>{errors.address.message}</Text>
                )}
              </View>
            )}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Position GPS *</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Feather name="map-pin" size={20} color="#fff" />
              <Text style={styles.locationButtonText}> Ma position</Text>
            </TouchableOpacity>
            <Text
              style={{
                marginTop: 4,
                color: businessData.latitude ? "#059669" : "#999",
              }}
            >
              {businessData.latitude
                ? `Lat: ${businessData.latitude.toFixed(4)}`
                : "Non défini"}
            </Text>
            {!businessData.latitude && (
              <Text style={styles.errorText}>Requis</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Logo *</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage("logo")}
            >
              {logoImage ? (
                <Image
                  source={{ uri: logoImage }}
                  style={styles.imagePreview}
                />
              ) : (
                <Feather name="camera" size={30} color="#666" />
              )}
              <Text style={styles.imageText}>
                {logoImage ? "Changer" : "Ajouter"}
              </Text>
            </TouchableOpacity>
            {!logoImage && <Text style={styles.errorText}>Requis</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Couverture *</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage("cover")}
            >
              {coverImage ? (
                <Image
                  source={{ uri: coverImage }}
                  style={styles.imagePreview}
                />
              ) : (
                <Feather name="image" size={30} color="#666" />
              )}
              <Text style={styles.imageText}>
                {coverImage ? "Changer" : "Ajouter"}
              </Text>
            </TouchableOpacity>
            {!coverImage && <Text style={styles.errorText}>Requis</Text>}
          </View>

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  {...field}
                  multiline
                />
                {errors.description && (
                  <Text style={styles.errorText}>
                    {errors.description.message}
                  </Text>
                )}
              </View>
            )}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Devise *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={toggleCurrencyPicker}
            >
              <Text
                style={{ color: businessData.currencyId ? "#000" : "#999" }}
              >
                {businessData.currencyId || "Sélectionnez"}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {!businessData.currencyId && (
              <Text style={styles.errorText}>Requis</Text>
            )}
          </View>

          <Footer
            onBack={() => setStep(2)}
            onNext={() => {
              updateBusinessData({ phoneNumber: personalData.phone });
              if (
                businessForm.formState.isValid &&
                logoImage &&
                coverImage &&
                businessData.latitude
              )
                setStep(4);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderStep4 = () => {
    const {
      control,
      formState: { errors },
    } = personalForm;

    return (
      <View style={styles.container}>
        <Header />
        <Text style={styles.stepTitle}>Mot de passe</Text>

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={[
                    styles.inputPassword,
                    errors.password && styles.inputError,
                  ]}
                  {...field}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={togglePassword}>
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmer *</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={[
                    styles.inputPassword,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  {...field}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={toggleConfirmPassword}>
                  <Feather
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>
          )}
        />

        <Footer
          onBack={() => setStep(3)}
          onNext={() => personalForm.formState.isValid && setStep(5)}
          nextLabel="Créer"
          showIcon={false}
        />
      </View>
    );
  };

  const renderStep5 = () => (
    <View style={styles.container}>
      <Text style={styles.otpTitle}>Vérification OTP</Text>
      <View style={styles.otpInputContainer}>
        {otp.map((d, i) => (
          <TextInput
            key={i}
            style={styles.otpInput}
            value={d}
            onChangeText={(v) => {
              if (/^\d*$/.test(v) && v.length <= 1) {
                const newOtp = [...otp];
                newOtp[i] = v;
                setOtp(newOtp);
              }
            }}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.verifyButton} onPress={() => setStep(6)}>
        <Text style={styles.verifyButtonText}>Vérifier</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.successContent}>
      <Text style={styles.successTitle}>Compte créé !</Text>
      <TouchableOpacity style={styles.successButton}>
        <Text style={styles.successButtonText}>Continuer</Text>
      </TouchableOpacity>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  header: { padding: 20 },
  titleContainer: { flexDirection: "row", alignItems: "center" },
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
    borderWidth: 1,
    borderColor: "#eee",
  },
  accountTypeCardSelected: {
    borderColor: "#00C896",
    backgroundColor: "#e6f7f0",
  },
  accountTypeTitle: { fontSize: 16, fontWeight: "600" },
  stepIndicator: { fontSize: 14, color: "#666", marginBottom: 8 },
  stepTitle: { fontSize: 20, fontWeight: "600", marginBottom: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: { borderColor: "#FF4444" },
  errorText: { color: "#FF4444", fontSize: 12, marginTop: 4 },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
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
  phoneCodeText: { color: "#059669", fontWeight: "600" },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  inputPassword: { flex: 1, padding: 12 },
  textArea: { height: 100, textAlignVertical: "top" },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  imagePreview: { width: 100, height: 100, borderRadius: 12, marginBottom: 8 },
  imageText: { color: "#059669", fontWeight: "600" },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  locationButtonText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  cancelText: { color: "#666", fontWeight: "600" },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00C896",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: { color: "#fff", fontWeight: "600", marginRight: 8 },
  otpTitle: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 40,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginVertical: 30,
    alignSelf: "center",
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
  },
  verifyButton: {
    backgroundColor: "#00C896",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: "center",
  },
  verifyButtonText: { color: "#fff", fontWeight: "600" },
  successContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  successTitle: { fontSize: 24, fontWeight: "600", marginBottom: 30 },
  successButton: {
    backgroundColor: "#00C896",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  successButtonText: { color: "#fff", fontWeight: "600" },
});

export default FortibOneOnboarding;
