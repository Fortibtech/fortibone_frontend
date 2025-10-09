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
interface Profile {
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33123456789',
    profilePicture: '',
  });

  const pickProfilePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l’accès à la bibliothèque de photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfile((prev) => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  };

  const handleSave = () => {
    if (!profile.name || !profile.email || !profile.phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    // Here you would typically send the data to an API
    console.log('Profile Updated:', profile);
    Alert.alert('Succès', 'Profil mis à jour avec succès !');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickProfilePicture}>
              {profile.profilePicture ? (
                <Image source={{ uri: profile.profilePicture }} style={styles.profilePicture} />
              ) : (
                <Ionicons name="person-circle-outline" size={80} color="#6b7280" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.editIcon} onPress={pickProfilePicture}>
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            placeholder="Entrez votre nom"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            placeholder="Entrez votre email"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            placeholder="Entrez votre numéro"
            placeholderTextColor="#6b7280"
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
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
    width: 28,
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059669',
    borderRadius: 20,
    padding: 8,
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
  saveButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;