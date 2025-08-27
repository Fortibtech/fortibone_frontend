import BackButton from '@/components/BackButton';
import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';

// Modal de sélection de date
const DatePickerModal = ({
  visible,
  onClose,
  onSelect,
  selectedDate
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
}) => {
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
      if (event.type === 'set' && date) {
        setTempDate(date);
        onSelect(date);
      }
      onClose();
    } else {
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleConfirm = () => {
    onSelect(tempDate);
    onClose();
  };

  // Effect pour déclencher le picker Android quand le modal devient visible
  React.useEffect(() => {
    if (visible && Platform.OS === 'android') {
      setShowAndroidPicker(true);
    }
  }, [visible]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Pour Android, on affiche directement le DateTimePicker natif
  if (Platform.OS === 'android' && showAndroidPicker) {
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

  // Pour iOS, on affiche le modal personnalisé
  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
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

const GenderSelectionModal = ({ 
  visible, 
  onClose, 
  onSelect,
  selectedGender 
}: { 
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: string) => void;
  selectedGender: string;
}) => {
  const [tempSelectedGender, setTempSelectedGender] = useState<string>(selectedGender);

  const handleGenderSelect = (gender: string) => {
    setTempSelectedGender(gender);
  };

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
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sélectionnez le sexe</Text>
          
          <View style={styles.genderOptions}>
            {/* Option Masculin */}
            <TouchableOpacity 
              style={[
                styles.genderOption,
                tempSelectedGender === 'Masculin' && styles.selectedOption
              ]}
              onPress={() => handleGenderSelect('Masculin')}
            >
              <Text style={[
                styles.genderText,
                tempSelectedGender === 'Masculin' && styles.selectedText
              ]}>
                Masculin
              </Text>
              <View style={[
                styles.radioButton,
                tempSelectedGender === 'Masculin' && styles.radioButtonSelected
              ]}>
                {tempSelectedGender === 'Masculin' && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>

            {/* Option Féminin */}
            <TouchableOpacity 
              style={[
                styles.genderOption,
                tempSelectedGender === 'Féminin' && styles.selectedOption
              ]}
              onPress={() => handleGenderSelect('Féminin')}
            >
              <Text style={[
                styles.genderText,
                tempSelectedGender === 'Féminin' && styles.selectedText
              ]}>
                Féminin
              </Text>
              <View style={[
                styles.radioButton,
                tempSelectedGender === 'Féminin' && styles.radioButtonSelected
              ]}>
                {tempSelectedGender === 'Féminin' && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtonContainer}>
            <CustomButton
              title="Save"
              onPress={handleSave}
              backgroundColor={tempSelectedGender ? '#00C851' : '#E0E0E0'}
              textColor={tempSelectedGender ? '#fff' : '#999'}
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

// Écran de création de compte
const Register = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    sexe: '',
    pays: '',
    ville: '',
    dateNaissance: '',
    email: '',
    motDePasse: ''
  });
  const router = useRouter();
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '') &&
    validateEmail(formData.email) &&
    validatePassword(formData.motDePasse);
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateAccount = () => {
    if (isFormValid() && validatePassword(formData.motDePasse)) {
      console.log('Données du compte:', formData);
      
    }router.push("/(professionnel)")
  };

  const handleGenderSelect = (gender: string) => {
    updateField('sexe', gender);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    updateField('dateNaissance', `${day}/${month}/${year}`);
  };

  const openDatePicker = () => {
    setShowDateModal(true);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
              onChangeText={(text) => updateField('prenom', text)}
            />

            <InputField
              label="Nom"
              placeholder="Nom"
              value={formData.nom}
              onChangeText={(text) => updateField('nom', text)}
            />

            {/* Champ Sexe - ouvre le modal */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Sexe</Text>
              <TouchableOpacity 
                style={styles.selectField}
                onPress={() => setShowGenderModal(true)}
              >
                <Text style={[
                  styles.selectFieldText,
                  !formData.sexe && styles.placeholderText
                ]}>
                  {formData.sexe || 'Sélectionnez le sexe'}
                </Text>
                <Ionicons 
                  name="chevron-down" 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <InputField
              label="Pays"
              placeholder="Pays"
              value={formData.pays}
              onChangeText={(text) => updateField('pays', text)}
            />

            <InputField
              label="Ville"
              placeholder="Ville"
              value={formData.ville}
              onChangeText={(text) => updateField('ville', text)}
            />

            {/* Champ Date de naissance - ouvre le calendrier */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date de naissance</Text>
              <TouchableOpacity 
                style={styles.selectField}
                onPress={openDatePicker}
              >
                <Text style={[
                  styles.selectFieldText,
                  !formData.dateNaissance && styles.placeholderText
                ]}>
                  {formData.dateNaissance || 'jj/mm/aaaa'}
                </Text>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <InputField
              label="Email"
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
            />
            {formData.email && !validateEmail(formData.email) && (
              <Text style={styles.errorText}>
                Format d'email invalide
              </Text>
            )}
            <InputField
              label="Mot de passe"
              placeholder="Mot de passe"
              secureTextEntry={true}
              value={formData.motDePasse}
              onChangeText={(text) => updateField('motDePasse', text)}
            />

            <Text style={[
              styles.passwordInfo,
              formData.motDePasse && !validatePassword(formData.motDePasse) && styles.errorText
            ]}>
              Le mot de passe doit comporter au moins 8 caractères et inclure des lettres majuscules, des lettres minuscules et des chiffres
              {formData.motDePasse && !validatePassword(formData.motDePasse) && " - Mot de passe insuffisant"}
            </Text>

            <View style={styles.createButtonContainer}>
              <CustomButton
                title="Créer un compte"
                onPress={handleCreateAccount}
                backgroundColor={isFormValid() ? '#00C851' : '#E0E0E0'}
                textColor={isFormValid() ? '#fff' : '#999'}
                width="100%"
                height={50}
                borderRadius={25}
              />
            </View>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
              <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Modal de sélection du sexe */}
        <GenderSelectionModal
          visible={showGenderModal}
          onClose={() => setShowGenderModal(false)}
          onSelect={handleGenderSelect}
          selectedGender={formData.sexe}
        />

        {/* Modal de sélection de date */}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginHorizontal: 30,
    marginTop: 30
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  fieldContainer: {
    marginVertical: 10,
    width: 343,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  selectFieldText: {
    fontSize: 16,
    color: '#111',
  },
  placeholderText: {
    color: '#999',
  },
  passwordInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  createButtonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },

  // Styles pour le modal général
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Styles pour le modal de genre
  genderOptions: {
    marginBottom: 20,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedOption: {
    backgroundColor: '#E8F5E8',
    borderColor: '#00C851',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  selectedText: {
    color: '#00C851',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#00C851',
    borderColor: '#00C851',
  },
  modalButtonContainer: {
    width: '100%',
  },

  // Styles pour le modal de date (manquants dans le code original)
  dateModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  datePicker: {
    width: '100%',
    marginBottom: 20,
  },
  dateModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#00C851',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
});

export default Register;