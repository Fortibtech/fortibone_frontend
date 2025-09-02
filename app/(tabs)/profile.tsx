import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useUserStore } from "@/store/userStore";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import * as ImagePicker from "expo-image-picker";
import { uploadUserAvatar } from "@/api/Users"; // <-- import de la fonction exportée

type ProfileRoutes =
  | "/(profile-particulier)/personal-info"
  | "/(profile-particulier)/notifications"
  | "/(profile-particulier)/user-businesses"
  | "/(profile-particulier)/category"
  | "/(profile-particulier)/security"
  | "/(profile-particulier)/favorites"
  | "/(profile-particulier)/help"
  | "/(profile-particulier)/about";

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { logout, userProfile, setUserProfile } = useUserStore();

  const handleLogout = async () => {
    console.log("Logging out user...");
    await logout();
    router.replace("/(auth)/login");
  };

  // --- Nouvelle fonction pour changer l'avatar ---
  const handleChangeAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uploadedUrl = await uploadUserAvatar(result.assets[0].uri);

        if (uploadedUrl) {
          setUserProfile({
            ...userProfile!,
            profileImageUrl: uploadedUrl,
          });
          Alert.alert("Succès", "Avatar mis à jour !");
        }
      }
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible de changer l'avatar");
    }
  };

  const menuItems: { title: string; route: ProfileRoutes; icon: string }[] = [
    {
      title: "Informations personnelles",
      route: "/(profile-particulier)/personal-info",
      icon: "person-outline",
    },
    {
      title: "Vos favoris",
      route: "/(profile-particulier)/favorites",
      icon: "heart-outline",
    },
    {
      title: "Vos entreprises",
      route: "/(profile-particulier)/user-businesses",
      icon: "business-outline",
    },
    {
      title: "Notifications",
      route: "/(profile-particulier)/notifications",
      icon: "notifications-outline",
    },
    {
      title: "categories",
      route: "/(profile-particulier)/category",
      icon: "grid-outline",
    },
    {
      title: "Sécurité",
      route: "/(profile-particulier)/security",
      icon: "shield-outline",
    },
    {
      title: "Aide",
      route: "/(profile-particulier)/help",
      icon: "help-circle-outline",
    },
    {
      title: "À propos",
      route: "/(profile-particulier)/about",
      icon: "information-circle-outline",
    },
  ];

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userSection}>
            <TouchableOpacity
              onPress={handleChangeAvatar}
              style={styles.avatarWrapper}
            >
              {userProfile?.profileImageUrl ? (
                <Image
                  source={{ uri: userProfile.profileImageUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}

              {/* Icône overlay pour indiquer qu'on peut modifier */}
              <View style={styles.editIconWrapper}>
                <Ionicons name="camera-outline" size={18} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>
              {userProfile?.firstName || "Utilisateur"}
            </Text>
            <Text style={styles.userEmail}>
              {userProfile?.email || "user@example.com"}
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={styles.menuItem}
                onPress={() => router.push(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={24} color="#666" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF5722" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    position: "relative",
  },
  editIconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00C851",
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: "#fff",
  },
  userSection: {
    alignItems: "center", // centre horizontalement
    justifyContent: "center", // centre verticalement si parent donne assez d’espace
    marginVertical: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: "cover",
    marginBottom: 10,
  },

  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.3,
  },
  content: { flex: 1 },

  menuSection: { backgroundColor: "#fff", marginBottom: 20 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 120,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF5722",
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default ProfilePage;
