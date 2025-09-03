// app/pro/createBusiness.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
          // Note: Vous devrez adapter cette partie selon votre implémentation d'upload
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
        onPress={() => pickImage(field)}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePickerContent}>
            <Ionicons name="camera-outline" size={32} color="#666" />
            <Text style={styles.imagePickerText}>
              {field === 'logo' ? 'Ajouter un logo' : 'Ajouter une couverture'}
            </Text>
            <Text style={styles.imagePickerSubtext}>
              Ratio {aspectRatio}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loadingCurrencies) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement...</Text>
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
      >
        <View style={styles.formContainer}>
          {/* Informations de base */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Informations de base</Text>
            
            <Text style={styles.label}>Nom de l'entreprise *</Text>
            <TextInput
              style={styles.input}
              value={business.name}
              onChangeText={(text) => setBusiness({ ...business, name: text })}
              placeholder="Entrez le nom de votre entreprise"
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={business.description}
              onChangeText={(text) => setBusiness({ ...business, description: text })}
              placeholder="Décrivez votre entreprise"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Type d'entreprise *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={business.type}
                onValueChange={(value) => setBusiness({ ...business, type: value })}
                style={styles.picker}
              >
                <Picker.Item label="Commerçant" value="COMMERCANT" />
                <Picker.Item label="Fournisseur" value="FOURNISSEUR" />
                <Picker.Item label="Restaurateur" value="RESTAURATEUR" />
              </Picker>
            </View>
          </View>

          {/* Contact et localisation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Contact et localisation</Text>
            
            <Text style={styles.label}>Adresse *</Text>
            <TextInput
              style={styles.input}
              value={business.address}
              onChangeText={(text) => setBusiness({ ...business, address: text })}
              placeholder="Adresse complète de votre entreprise"
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.label}>Numéro de téléphone *</Text>
            <TextInput
              style={styles.input}
              value={business.phoneNumber}
              onChangeText={(text) => setBusiness({ ...business, phoneNumber: text })}
              placeholder="+237 123 456 789"
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
            />

            <View style={styles.coordinatesContainer}>
              <View style={styles.coordinateInput}>
                <Text style={styles.label}>Latitude *</Text>
                <TextInput
                  style={styles.input}
                  value={business.latitude?.toString()}
                  onChangeText={(text) => setBusiness({ ...business, latitude: parseFloat(text) || 0 })}
                  placeholder="4.0511"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.coordinateInput}>
                <Text style={styles.label}>Longitude *</Text>
                <TextInput
                  style={styles.input}
                  value={business.longitude?.toString()}
                  onChangeText={(text) => setBusiness({ ...business, longitude: parseFloat(text) || 0 })}
                  placeholder="9.7679"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Devise */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Devise</Text>
            
            <Text style={styles.label}>Devise de l'entreprise *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={business.currencyId}
                onValueChange={(value) => setBusiness({ ...business, currencyId: value })}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner une devise" value="" />
                {currencies.map((currency) => (
                  <Picker.Item 
                    key={currency.id} 
                    label={`${currency.name} (${currency.code}) ${currency.symbol}`} 
                    value={currency.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖼️ Images</Text>
            {renderImagePicker('logo', logoUri, 'Logo de l\'entreprise', '1:1')}
            {renderImagePicker('cover', coverUri, 'Image de couverture', '16:9')}
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Créer l'entreprise</Text>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  coordinateInput: {
    flex: 1,
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  coverImagePicker: {
    height: 150,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CreateBusiness;