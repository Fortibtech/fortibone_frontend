// app/business-details/[id].tsx
import { Business, BusinessesService, CreateBusinessData } from '@/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface BusinessFormData {
  name: string;
  description: string;
  type: string;
  address: string;
  phoneNumber: string;
}

const BusinessDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateBusinessData>>({
    name: '',
    description: '',
    type: 'COMMERCANT',
    address: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (id) {
      loadBusinessDetails();
    }
  }, [id]);

  const loadBusinessDetails = async () => {
    try {
      setLoading(true);
      const businessData = await BusinessesService.getBusinessById(id);
      setBusiness(businessData);
      setFormData({
        name: businessData.name,
        description: businessData.description || '',
        type: businessData.type,
        address: businessData.address || '',
        phoneNumber: businessData.phoneNumber || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'entreprise');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedBusiness = await BusinessesService.updateBusiness(id, formData);
      setBusiness(updatedBusiness);
      setEditing(false);
      Alert.alert('Succès', 'Entreprise mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (business) {
      setFormData({
        name: business.name,
        description: business.description || '',
        type: business.type,
        address: business.address || '',
        phoneNumber: business.phoneNumber || ''
      });
    }
    setEditing(false);
  };

  const pickImage = async (type: 'logo' | 'cover') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: 'image.jpg',
        } as any);

        try {
          if (type === 'logo') {
            await BusinessesService.uploadLogo(id, formData);
          } else {
            await BusinessesService.uploadCover(id, formData);
          }
          await loadBusinessDetails(); // Recharger pour voir la nouvelle image
          Alert.alert('Succès', `${type === 'logo' ? 'Logo' : 'Image de couverture'} mis à jour`);
        } catch (error) {
          Alert.alert('Erreur', 'Impossible de télécharger l\'image');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const navigateToMembers = () => {
    router.push(`./business-members?id=${id}`);
  };

  const navigateToOpeningHours = () => {
    router.push(`./opening-hours?id=${id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#059669" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Entreprise introuvable</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'entreprise</Text>
        <TouchableOpacity
          onPress={editing ? handleSave : () => setEditing(true)}
          style={styles.editButton}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <Text style={styles.editButtonText}>
              {editing ? 'Sauver' : 'Modifier'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.imagesSection}>
          {/* Cover Image */}
          <TouchableOpacity
            style={styles.coverContainer}
            onPress={() => editing && pickImage('cover')}
            disabled={!editing}
          >
            {business.coverImageUrl ? (
              <Image source={{ uri: business.coverImageUrl }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderCover}>
                <Ionicons name="image-outline" size={50} color="#ccc" />
                <Text style={styles.placeholderText}>Image de couverture</Text>
              </View>
            )}
            {editing && (
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={30} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => editing && pickImage('logo')}
            disabled={!editing}
          >
            {business.logoUrl ? (
              <Image source={{ uri: business.logoUrl }} style={styles.logo} />
            ) : (
              <View style={styles.placeholderLogo}>
                <Ionicons name="business-outline" size={30} color="#ccc" />
              </View>
            )}
            {editing && (
              <View style={styles.logoOverlay}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de l'entreprise</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={editing}
              placeholder="Nom de l'entreprise"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea, !editing && styles.inputDisabled]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              editable={editing}
              placeholder="Description de l'entreprise"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.type}
              onChangeText={(text) => setFormData({ ...formData, type: text })}
              editable={editing}
              placeholder="Type d'entreprise"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              editable={editing}
              placeholder="Adresse"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              editable={editing}
              placeholder="Numéro de téléphone"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToMembers}>
            <Ionicons name="people-outline" size={24} color="#059669" />
            <Text style={styles.actionButtonText}>Gérer les membres</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToOpeningHours}>
            <Ionicons name="time-outline" size={24} color="#059669" />
            <Text style={styles.actionButtonText}>Horaires d'ouverture</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Cancel Button when editing */}
        {editing && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imagesSection: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ccc',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: 'white',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
    resizeMode: 'cover',
  },
  placeholderLogo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 37,
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    backgroundColor: 'white',
    marginTop: 50,
    marginBottom: 10,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    height: 100,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    color: '#666',
  },
  actionsSection: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BusinessDetailsScreen;