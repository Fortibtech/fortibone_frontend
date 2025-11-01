import React, { JSX, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BackButton from "@/components/BackButton";
interface FormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  businessName: string;
  businessType: string;
  businessSector: string;
  address: string;
  website: string;
  description: string;
  password: string;
  confirmPassword: string;
}

interface AccountType {
  id: string;
  title: string;
  subtitle: string;
}

interface FooterProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  showIcon?: boolean;
}

interface LogoProps {}

interface HeaderProps {}

const FortibOneOnboarding: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [accountType, setAccountType] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    country: "Comores",
    city: "",
    businessName: "",
    businessType: "",
    businessSector: "",
    address: "",
    website: "",
    description: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);

  const accountTypes: AccountType[] = [
    {
      id: "merchant",
      title: "Je suis COMMERÇANT",
      subtitle: "Je vends des produits à des particuliers",
    },
    {
      id: "supplier",
      title: "Je suis FOURNISSEUR",
      subtitle: "Je vends en gros à des commerçants/restaurateurs",
    },
    {
      id: "restaurant",
      title: "Je suis RESTAURATEUR",
      subtitle: "Je propose des services de restauration",
    },
  ];

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOtpChange = (index: number, value: string): void => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
    }
  };

  const Logo: React.FC<LogoProps> = () => (
    <View style={styles.logoContainer}>
      <View style={styles.logo}>
        <View style={styles.logoWave} />
        <View style={styles.logoWave} />
      </View>
      <View>
        <Text style={styles.headerTitle}>Création de Compte</Text>
        <Text style={styles.headerSubtitle}>Professionnel</Text>
      </View>
    </View>
  );

  const Header: React.FC<HeaderProps> = () => (
    <View style={styles.header}>
         <BackButton />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          paddingLeft: 10,
        }}
      >
        <Image
          source={require("@/assets/images/logo/green.png")}
          style={{
            width: 50,
            height: 50,
            marginRight: 15,
            resizeMode: "contain",
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              color: "#121f3e",
              fontWeight: "600",
            }}
          >
            Créer un compte{" "}
            <Text
              style={{
                fontSize: 24,
                color: "#059669",
              }}
            >
              Professionnel
            </Text>
          </Text>
        </View>
      </View>
      );
      <View style={styles.loginLink}>
        <Text style={styles.loginText}>Deja un compte ? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButton}>Connectez-vous</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Footer: React.FC<FooterProps> = ({
    onBack,
    onNext,
    nextLabel = "Suivant",
    showIcon = true,
  }) => (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
        <Text style={styles.cancelText}>{onBack ? "Retour" : "Annuler"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>{nextLabel}</Text>
        {showIcon && <Feather name="arrow-right" size={20} color="#fff" />}
      </TouchableOpacity>
    </View>
  );

  const renderStep1 = (): JSX.Element => (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.question}>
          Que souhaitez-vous faire sur FortibOne ?
        </Text>

        {accountTypes.map((type: AccountType) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.accountTypeCard,
              accountType === type.id && styles.accountTypeCardSelected,
            ]}
            onPress={() => setAccountType(type.id)}
          >
            <View style={styles.iconContainer}>
              <Feather name="shopping-bag" size={24} color="#333" />
            </View>
            <View style={styles.accountTypeText}>
              <Text style={styles.accountTypeTitle}>{type.title}</Text>
              <Text style={styles.accountTypeSubtitle}>{type.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Footer onNext={() => setStep(2)} />
    </View>
  );

  const renderStep2 = (): JSX.Element => (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Etape 1 sur 3</Text>
        <Text style={styles.stepTitle}>Informations du responsable</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={formData.name}
            onChangeText={(value: string) => handleInputChange("name", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="john.doe@gmail.com"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value: string) => handleInputChange("email", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={styles.input}
            placeholder="+33 7 53 07 08 73"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(value: string) => handleInputChange("phone", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Pays *</Text>
          <View style={styles.selectInput}>
            <Text>{formData.country}</Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ville *</Text>
          <TextInput
            style={styles.input}
            placeholder="Adresse"
            value={formData.city}
            onChangeText={(value: string) => handleInputChange("city", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Photo de Profil *</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Feather name="image" size={32} color="#00C896" />
            <Text style={styles.uploadText}>
              Téléchargez une photo (png, jpg)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Footer onBack={() => setStep(1)} onNext={() => setStep(3)} />
    </ScrollView>
  );

  const renderStep3 = (): JSX.Element => (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Etape 2 sur 3</Text>
        <Text style={styles.stepTitle}>Activité Commercial</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom du Commerce *</Text>
          <TextInput
            style={styles.input}
            placeholder="Boutique de Bois"
            value={formData.businessName}
            onChangeText={(value: string) =>
              handleInputChange("businessName", value)
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Type de Commerce *</Text>
          <View style={styles.selectInput}>
            <Text style={styles.placeholderText}>Boutique physique</Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Secteur d&lsquo;Activité *</Text>
          <View style={styles.selectInput}>
            <Text style={styles.placeholderText}>Téléphones & accessoires</Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Adresse du commerce *</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrer une adresse"
            value={formData.address}
            onChangeText={(value: string) =>
              handleInputChange("address", value)
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>SIRET/NUI (Optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrer votre matricule"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Site Web (Optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un lien"
            value={formData.website}
            onChangeText={(value: string) =>
              handleInputChange("website", value)
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Entrer une description de votre activité"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(value: string) =>
              handleInputChange("description", value)
            }
          />
        </View>
      </View>
      <Footer onBack={() => setStep(2)} onNext={() => setStep(4)} />
    </ScrollView>
  );

  const renderStep4 = (): JSX.Element => (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Etape 3 sur 3</Text>
        <Text style={styles.stepTitle}>Création de Votre Compte</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mot de Passe *</Text>
          <View style={styles.passwordInput}>
            <TextInput
              style={styles.inputPassword}
              placeholder="••••••••••••"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(value: string) =>
                handleInputChange("password", value)
              }
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            L&lsquo;imposable 01 ch@Pas{"\n"}Caratère spécial
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirmer Mot de Passe *</Text>
          <View style={styles.passwordInput}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Confirmer le mot de passe"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(value: string) =>
                handleInputChange("confirmPassword", value)
              }
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
        </View>

        <View style={styles.termsContainer}>
          <Feather name="check-circle" size={20} color="#00C896" />
          <Text style={styles.termsText}>
            J&lsquo;accepte les Conditions d&lsquo;Utilisation et la Politique
            de confidentialité
          </Text>
        </View>
      </View>
      <Footer
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
        nextLabel="Créer mon Compte"
        showIcon={false}
      />
    </View>
  );

  const renderStep5 = (): JSX.Element => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(4)}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, styles.otpContent]}>
        <View style={styles.otpIconContainer}>
          <View style={styles.otpIcon}>
            <Feather name="shield" size={40} color="#00C896" />
          </View>
        </View>

        <Text style={styles.otpTitle}>Vérification OTP</Text>
        <Text style={styles.otpSubtitle}>Nous devons vérifier votre email</Text>
        <Text style={styles.otpDescription}>
          Pour vérifier votre compte, entrez le code à 4 chiffres{"\n"}
          envoyé à votre email.
        </Text>

        <View style={styles.otpInputContainer}>
          {otp.map((digit: string, index: number) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value: string) => handleOtpChange(index, value)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendText}>Renvoyer le Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => setStep(6)}
        >
          <Text style={styles.verifyButtonText}>Vérifier</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep6 = (): JSX.Element => (
    <View style={styles.container}>
      <View style={[styles.content, styles.successContent]}>
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Feather name="check" size={60} color="#fff" />
          </View>
        </View>

        <Text style={styles.successTitle}>Compte créé avec succès</Text>

        <TouchableOpacity style={styles.successButton}>
          <Text style={styles.successButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
    </SafeAreaView>
  );
};

interface Styles {
  safeArea: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  logoContainer: ViewStyle;
  logo: ViewStyle;
  logoWave: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  loginLink: ViewStyle;
  loginText: TextStyle;
  loginButton: TextStyle;
  content: ViewStyle;
  backButton: ViewStyle;
  question: TextStyle;
  accountTypeCard: ViewStyle;
  accountTypeCardSelected: ViewStyle;
  iconContainer: ViewStyle;
  accountTypeText: ViewStyle;
  accountTypeTitle: TextStyle;
  accountTypeSubtitle: TextStyle;
  footer: ViewStyle;
  cancelButton: ViewStyle;
  cancelText: TextStyle;
  nextButton: ViewStyle;
  nextButtonText: TextStyle;
  stepIndicator: TextStyle;
  stepTitle: TextStyle;
  formGroup: ViewStyle;
  label: TextStyle;
  input: ViewStyle & TextStyle;
  selectInput: ViewStyle;
  placeholderText: TextStyle;
  uploadBox: ViewStyle;
  uploadText: TextStyle;
  textArea: ViewStyle & TextStyle;
  passwordInput: ViewStyle;
  inputPassword: ViewStyle & TextStyle;
  helperText: TextStyle;
  termsContainer: ViewStyle;
  termsText: TextStyle;
  otpContent: ViewStyle;
  otpIconContainer: ViewStyle;
  otpIcon: ViewStyle;
  otpTitle: TextStyle;
  otpSubtitle: TextStyle;
  otpDescription: TextStyle;
  otpInputContainer: ViewStyle;
  otpInput: ViewStyle & TextStyle;
  resendButton: ViewStyle;
  resendText: TextStyle;
  verifyButton: ViewStyle;
  verifyButtonText: TextStyle;
  successContent: ViewStyle;
  successIconContainer: ViewStyle;
  successIcon: ViewStyle;
  successTitle: TextStyle;
  successButton: ViewStyle;
  successButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: "#00C896",
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logoWave: {
    width: 20,
    height: 30,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00C896",
  },
  loginLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginButton: {
    fontSize: 14,
    color: "#00C896",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  accountTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
  },
  accountTypeCardSelected: {
    borderColor: "#00C896",
    borderWidth: 2,
    backgroundColor: "#f0fdf9",
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountTypeText: {
    flex: 1,
  },
  accountTypeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  accountTypeSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#00C896",
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#00C896",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  stepIndicator: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#000",
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
  },
  placeholderText: {
    fontSize: 15,
    color: "#666",
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  inputPassword: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#000",
  },
  helperText: {
    fontSize: 12,
    color: "#00C896",
    marginTop: 6,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#00C896",
    lineHeight: 18,
  },
  otpContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  otpIconContainer: {
    marginBottom: 30,
  },
  otpIcon: {
    width: 100,
    height: 100,
    backgroundColor: "#e6f9f4",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  otpDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  otpInputContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
  resendButton: {
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: "#00C896",
    fontWeight: "600",
  },
  verifyButton: {
    width: "100%",
    padding: 16,
    backgroundColor: "#00C896",
    borderRadius: 12,
    alignItems: "center",
  },
  verifyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  successContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    backgroundColor: "#00C896",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 40,
    textAlign: "center",
  },
  successButton: {
    width: "100%",
    padding: 16,
    backgroundColor: "#00C896",
    borderRadius: 12,
    alignItems: "center",
  },
  successButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default FortibOneOnboarding;
