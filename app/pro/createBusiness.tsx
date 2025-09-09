// app/pro/createBusiness.tsx - Version améliorée avec sélecteurs iOS
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Banknote, Building, ChevronDown } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Import des services API
import { BusinessesService, CreateBusinessData, Currency, CurrencyService } from '@/api';

// Composant de sélection iOS-friendly
interface IOSPickerProps {
  title: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}

const IOSPicker: React.FC<IOSPickerProps> = ({ 
  title, 
  options, 
  selectedValue, 
  onValueChange, 
  placeholder = "Sélectionner...",
  searchable = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const selectedOption = options.find(option => option.value === selectedValue);

  const filteredOptions = searchable && searchText 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchText.toLowerCase()) ||
        option.value.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  return (
    <>
      <TouchableOpacity 
        style={styles.iosPickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.iosPickerText,
          !selectedOption && styles.iosPickerPlaceholder
        ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelButton}>Annuler</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{title}</Text>
            
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalDoneButton}>OK</Text>
            </TouchableOpacity>
          </View>

          {searchable && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
            </View>
          )}

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedValue === item.value && styles.selectedOptionItem
                ]}
                onPress={() => {
                  onValueChange(item.value);
                  setModalVisible(false);
                  setSearchText('');
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === item.value && styles.selectedOptionText
                ]}>
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <Ionicons name="checkmark" size={24} color="#059669" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Aucun résultat pour "{searchText}"
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const CreateBusiness: React.FC = () => {
  const [business, setBusiness] = useState<Partial<CreateBusinessData>>({
    name: '',
    description: '',
    type: 'COMMERCANT',
    address: '',
    phoneNumber: '',
    latitude: 4.0511, // Douala par défaut
    longitude: 9.7679,
    currencyId: '',
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [logoUri, setLogoUri] = useState<string>('');
  const [coverUri, setCoverUri] = useState<string>('');

  // Options pour les types d'entreprise
  const businessTypeOptions = [
    { 
      label: '🏪 Commerçant', 
      value: 'COMMERCANT',
      description: 'Vente de produits au détail'
    },
    { 
      label: '🏭 Fournisseur', 
      value: 'FOURNISSEUR',
      description: 'Approvisionnement en gros'
    },
    { 
      label: '🍽️ Restaurateur', 
      value: 'RESTAURATEUR',
      description: 'Services de restauration'
    },
  ];

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoadingCurrencies(true);
      const currenciesData = await CurrencyService.getCurrencies();
      setCurrencies(currenciesData);
      
      // Sélectionner XAF par défaut si disponible
      const xafCurrency = currenciesData.find(c => c.code === 'XAF');
      if (xafCurrency) {
        setBusiness(prev => ({ ...prev, currencyId: xafCurrency.id }));
      } else if (currenciesData.length > 0) {
        setBusiness(prev => ({ ...prev, currencyId: currenciesData[0].id }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des devises:', error);
      Alert.alert('Erreur', 'Impossible de charger les devises');
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const pickImage = async (field: 'logo' | 'cover') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la bibliothèque de photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (field === 'logo') {
        setLogoUri(result.assets[0].uri);
      } else {
        setCoverUri(result.assets[0].uri);
      }
    }
  };

  const takePhoto = async (field: 'logo' | 'cover') => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: field === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (field === 'logo') {
        setLogoUri(result.assets[0].uri);
      } else {
        setCoverUri(result.assets[0].uri);
      }
    }
  };

  const showImageOptions = (field: 'logo' | 'cover') => {
    const title = field === 'logo' ? 'Logo de l\'entreprise' : 'Image de couverture';
    
    Alert.alert(
      title,
      'Choisissez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Galerie', onPress: () => pickImage(field) },
        { text: 'Caméra', onPress: () => takePhoto(field) },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!business.name?.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'entreprise est obligatoire.');
      return false;
    }
    if (!business.description?.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire.');
      return false;
    }
    if (!business.address?.trim()) {
      Alert.alert('Erreur', 'L\'adresse est obligatoire.');
      return false;
    }
    if (!business.phoneNumber?.trim()) {
      Alert.alert('Erreur', 'Le numéro de téléphone est obligatoire.');
      return false;
    }
    if (!business.currencyId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une devise.');
      return false;
    }
    if (!business.latitude || !business.longitude) {
      Alert.alert('Erreur', 'Les coordonnées géographiques sont obligatoires.');
      return false;
    }
    if (business.latitude < -90 || business.latitude > 90) {
      Alert.alert('Erreur', 'La latitude doit être entre -90 et 90.');
      return false;
    }
    if (business.longitude < -180 || business.longitude > 180) {
      Alert.alert('Erreur', 'La longitude doit être entre -180 et 180.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Créer l'entreprise
      const newBusiness = await BusinessesService.createBusiness({
        name: business.name!,
        description: business.description!,
        type: business.type as 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR',
        address: business.address!,
        phoneNumber: business.phoneNumber!,
        latitude: business.latitude!,
        longitude: business.longitude!,
        currencyId: business.currencyId!,
      });

      console.log('✅ Entreprise créée:', newBusiness);

      // Upload du logo si présent
      if (logoUri) {
        try {
          await BusinessesService.uploadLogo(newBusiness.id, {
            uri: logoUri,
            type: 'image/jpeg',
            name: 'logo.jpg',
          } as any);
        } catch (uploadError) {
          console.warn('⚠️ Erreur lors de l\'upload du logo:', uploadError);
        }
      }

      // Upload de la couverture si présente
      if (coverUri) {
        try {
          await BusinessesService.uploadCover(newBusiness.id, {
            uri: coverUri,
            type: 'image/jpeg',
            name: 'cover.jpg',
          } as any);
        } catch (uploadError) {
          console.warn('⚠️ Erreur lors de l\'upload de la couverture:', uploadError);
        }
      }

      // Sélectionner automatiquement la nouvelle entreprise
      await BusinessesService.selectBusiness(newBusiness);

      Alert.alert(
        'Succès', 
        `Entreprise "${newBusiness.name}" créée avec succès !`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(professionnel)');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'entreprise. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = (field: keyof CreateBusinessData, value: any) => {
    setBusiness(prev => ({ ...prev, [field]: value }));
  };

  const renderImagePicker = (
    field: 'logo' | 'cover',
    uri: string,
    label: string,
    aspectRatio: string
  ) => (
    <View style={styles.imageSection}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[
          styles.imagePicker,
          field === 'cover' && styles.coverImagePicker
        ]} 
        onPress={() => showImageOptions(field)}
        activeOpacity={0.7}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.imagePreview} />
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.changeImageText}>Changer</Text>
            </View>
          </>
        ) : (
          <View style={styles.imagePickerContent}>
            <Ionicons name="camera-outline" size={32} color="#666" />
            <Text style={styles.imagePickerText}>
              {field === 'logo' ? 'Ajouter un logo' : 'Ajouter une couverture'}
            </Text>
            <Text style={styles.imagePickerSubtext}>
              Ratio {aspectRatio} • Touchez pour sélectionner
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // Préparer les options de devises
  const currencyOptions = currencies.map(currency => ({
    label: `${currency.name} (${currency.code}) ${currency.symbol}`,
    value: currency.id
  }));

  if (loadingCurrencies) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des devises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une Entreprise</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Informations de base */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Informations de base</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom de l'entreprise *</Text>
              <TextInput
                style={styles.input}
                value={business.name}
                onChangeText={(text) => updateBusiness('name', text)}
                placeholder="Entrez le nom de votre entreprise"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={business.description}
                onChangeText={(text) => updateBusiness('description', text)}
                placeholder="Décrivez votre entreprise, ses activités et ses spécialités..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type d'entreprise *</Text>
              <View style={styles.inputWithIcon}>
                <Building size={16} color="#666" style={styles.inputIcon} />
                <View style={styles.pickerWrapper}>
                  <IOSPicker
                    title="Sélectionner le type d'entreprise"
                    options={businessTypeOptions.map(type => ({
                      label: type.label,
                      value: type.value
                    }))}
                    selectedValue={business.type || ''}
                    onValueChange={(value) => updateBusiness('type', value)}
                    placeholder="Choisir le type d'activité"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Contact et localisation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Contact et localisation</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adresse *</Text>
              <TextInput
                style={styles.input}
                value={business.address}
                onChangeText={(text) => updateBusiness('address', text)}
                placeholder="Adresse complète de votre entreprise"
                placeholderTextColor="#999"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Numéro de téléphone *</Text>
              <TextInput
                style={styles.input}
                value={business.phoneNumber}
                onChangeText={(text) => updateBusiness('phoneNumber', text)}
                placeholder="+237 123 456 789"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.coordinatesContainer}>
              <View style={styles.coordinateInput}>
                <Text style={styles.label}>Latitude *</Text>
                <TextInput
                  style={styles.input}
                  value={business.latitude?.toString()}
                  onChangeText={(text) => updateBusiness('latitude', parseFloat(text) || 0)}
                  placeholder="4.0511"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.coordinateInput}>
                <Text style={styles.label}>Longitude *</Text>
                <TextInput
                  style={styles.input}
                  value={business.longitude?.toString()}
                  onChangeText={(text) => updateBusiness('longitude', parseFloat(text) || 0)}
                  placeholder="9.7679"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.coordinatesHint}>
              <Ionicons name="information-circle" size={16} color="#8b5cf6" />
              <Text style={styles.hintText}>
                Utilisez Google Maps pour obtenir les coordonnées exactes de votre entreprise
              </Text>
            </View>
          </View>

          {/* Devise */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Configuration financière</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Devise de l'entreprise *</Text>
              <View style={styles.inputWithIcon}>
                <Banknote size={16} color="#666" style={styles.inputIcon} />
                <View style={styles.pickerWrapper}>
                  <IOSPicker
                    title="Sélectionner la devise"
                    options={[
                      { label: "Sélectionner une devise", value: "" },
                      ...currencyOptions
                    ]}
                    selectedValue={business.currencyId || ''}
                    onValueChange={(value) => updateBusiness('currencyId', value)}
                    placeholder="Choisir la devise principale"
                    searchable={true}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖼️ Images de l'entreprise</Text>
            {renderImagePicker('logo', logoUri, 'Logo de l\'entreprise', '1:1')}
            {renderImagePicker('cover', coverUri, 'Image de couverture', '16:9')}
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.submitButtonText}>Création en cours...</Text>
              </View>
            ) : (
              <View style={styles.submitButtonContent}>
                <Building size={20} color="white" />
                <Text style={styles.submitButtonText}>Créer l'entreprise</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formContainer: {
    marginTop: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  pickerWrapper: {
    marginLeft: 44,
  },
  // Styles pour les sélecteurs iOS
  iosPickerButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  iosPickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  iosPickerPlaceholder: {
    color: '#9ca3af',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinatesHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  hintText: {
    fontSize: 14,
    color: '#6366f1',
    flex: 1,
    lineHeight: 18,
  },
  // Styles des images
  imageSection: {
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  coverImagePicker: {
    height: 150,
  },
  imagePickerContent: {
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fafafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalDoneButton: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 12,
  },
  optionItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOptionItem: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  selectedOptionText: {
    color: '#059669',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CreateBusiness;