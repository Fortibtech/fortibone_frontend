"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useUserStore } from "@/store/userStore";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { uploadUserAvatar } from "@/api/Users";
import { useUserAvatar } from "@/hooks/useUserAvatar";

const UserProfileScreen: React.FC = () => {
  // CORRIGÉ : on utilise le sélecteur réactif de Zustan
  const pathname = usePathname();
  const params = useLocalSearchParams();

  const user = useUserStore((state) => state.userProfile);
  const { uri } = useUserAvatar();
  const [loading, setLoading] = useState(false);
  // AJOUTE ÇA : log pour debug + protection
  console.log("USER DANS UserProfileScreen :", user);
  const handleEditProfile = () => {
    router.push("/fournisseurSetting/editProfile");
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Accès à la galerie requis.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setLoading(true);
      const uploadedUrl = await uploadUserAvatar(result.assets[0].uri);

      if (uploadedUrl) {
        // Mise à jour via setUserProfile → déclenche _avatarVersion automatiquement
        useUserStore.getState().setUserProfile({
          ...useUserStore.getState().userProfile!,
          profileImageUrl: uploadedUrl,
        });

        Alert.alert("Succès", "Photo mise à jour !");
      }
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Échec de la mise à jour");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    useUserStore.getState().refreshProfile();
  }, [pathname, params]);
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1BB874" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Chargement du profil...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Utilisateur</Text>
        <View style={styles.menuButton} />
      </View>

      {/* Avatar + Nom */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            key={user.profileImageUrl} // CLÉ MAGIQUE : force le refresh complet de l'image
            source={
              user?.profileImageUrl
                ? user.profileImageUrl
                : require("@/assets/images/icon.png")
            }
            style={styles.avatar}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handleChangeAvatar}
          >
            <MaterialIcon name="edit" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>
          {user.firstName?.trim() || "Prénom"} {user.lastName?.trim() || "Nom"}
        </Text>
        <Text style={styles.userRole}>{user.profileType || "Utilisateur"}</Text>
      </View>

      {/* Infos */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informations Contact</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcon name="email" size={20} color="#1BB874" />
          </View>
          <Text style={styles.infoText}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcon name="phone" size={20} color="#1BB874" />
          </View>
          <Text style={styles.infoText}>
            {user.phoneNumber || "Non renseigné"}
          </Text>
        </View>

        {/* CORRIGÉ : protection contre undefined */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MaterialIcon name="location-on" size={20} color="#1BB874" />
          </View>
          <Text style={styles.infoText}>
            {user.city && user.country
              ? `${user.city}, ${user.country}`
              : "Localisation non renseignée"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <MaterialIcon name="person" size={20} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Modifier les informations</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    height: 100,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  menuButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8E8E8",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1BB874",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 6,
  },
  userRole: {
    fontSize: 13,
    color: "#666666",
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoText: {
    fontSize: 13,
    color: "#333333",
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1BB874",
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 10,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default UserProfileScreen;
