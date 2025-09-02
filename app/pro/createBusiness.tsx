import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

// Types
interface Business {
  name: string;
  description: string;
  type: string;
  address: string;
  phoneNumber: string;
  logoUrl: string;
  coverImageUrl: string;
  latitude: number;
  longitude: number;
  currencyId: string;
}

const CreateBusiness: React.FC = () => {
  const [business, setBusiness] = useState<Partial<Business>>({
    name: '',
    description: '',
    type: '',
    address: '',
    phoneNumber: '',
    logoUrl: '',
    coverImageUrl: '',
    latitude: 0,
    longitude: 0,
    currencyId: '',
  });

  const pickImage = async (field: 'logoUrl' | 'coverImageUrl') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l’accès à la bibliothèque de photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'logoUrl' ? [1, 1] : [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setBusiness((prev) => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  const handleSubmit = () => {
    // Basic validation
    if (!business.name || !business.description || !business.type || !business.address || !business.phoneNumber || !business.currencyId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (business.latitude === 0 || business.longitude === 0) {
      Alert.alert('Erreur', 'Veuillez fournir des coordonnées valides.');
      return;
    }
    // Here you would typically send the data to an API
    console.log('New Business:', business);
    Alert.alert('Succès', 'Entreprise créée avec succès !');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une Entreprise</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nom de l’entreprise</Text>
          <TextInput
            style={styles.input}
            value={business.name}
            onChangeText={(text) => setBusiness({ ...business, name: text })}
            placeholder="Entrez le nom"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={business.description}
            onChangeText={(text) => setBusiness({ ...business, description: text })}
            placeholder="Entrez la description"
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            value={business.type}
            onChangeText={(text) => setBusiness({ ...business, type: text })}
            placeholder="Ex: COMMERCANT"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={business.address}
            onChangeText={(text) => setBusiness({ ...business, address: text })}
            placeholder="Entrez l’adresse"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            value={business.phoneNumber}
            onChangeText={(text) => setBusiness({ ...business, phoneNumber: text })}
            placeholder="Entrez le numéro"
            placeholderTextColor="#6b7280"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={business.latitude?.toString()}
            onChangeText={(text) => setBusiness({ ...business, latitude: parseFloat(text) || 0 })}
            placeholder="Entrez la latitude"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={business.longitude?.toString()}
            onChangeText={(text) => setBusiness({ ...business, longitude: parseFloat(text) || 0 })}
            placeholder="Entrez la longitude"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
          />

          <Text style={styles.label}>ID de la devise</Text>
          <TextInput
            style={styles.input}
            value={business.currencyId}
            onChangeText={(text) => setBusiness({ ...business, currencyId: text })}
            placeholder="Entrez l’ID de la devise"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Logo</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage('logoUrl')}>
            {business.logoUrl ? (
              <Image source={{ uri: business.logoUrl }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>Sélectionner un logo</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Image de couverture</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage('coverImageUrl')}>
            {business.coverImageUrl ? (
              <Image source={{ uri: business.coverImageUrl }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>Sélectionner une image de couverture</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Créer l’entreprise</Text>
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
    width: 28, // Placeholder to balance the layout
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 20,
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
  imagePicker: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#6b7280',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateBusiness;