import { uploadUserAvatar } from "@/api/Users";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";

// Responsive dimensions
const { width } = Dimensions.get("window");
const isTablet = width >= 600;

type ProfileRoutes =
  | "/(profile-particulier)/personal-info"
  | "/(profile-particulier)/notifications"
  | "/(profile-particulier)/user-businesses"
  | "/(profile-particulier)/category"
  | "/(profile-particulier)/security"
  | "/(profile-particulier)/favorites"
  | "/(profile-particulier)/help"
  | "/(profile-particulier)/about";

const ProfilePage = () => {
  const router = useRouter();
  const { logout, userProfile, setUserProfile } = useUserStore();
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation pour fade-in

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Erreur", "Échec de la déconnexion");
    }
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "L'accès à la galerie est requis.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1], // Carré pour l'avatar
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
      title: "Catégories",
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

  const renderMenuItem = ({
    item,
    index,
  }: {
    item: (typeof menuItems)[0];
    index: number;
  }) => {
    const cardAnim = new Animated.Value(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100, // Effet cascade
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={[styles.menuItem, { opacity: cardAnim }]}>
        <TouchableOpacity
          style={styles.menuItemContent}
          onPress={() => router.push(item.route)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={item.title}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons
              name={item.icon as any}
              size={isTablet ? 28 : 24}
              color="#666"
            />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={isTablet ? 24 : 20}
            color="#ccc"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profil</Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* User Info */}
            <View style={styles.userSection}>
              <TouchableOpacity
                onPress={handleChangeAvatar}
                style={styles.avatarWrapper}
                accessible={true}
                accessibilityLabel="Changer l'avatar"
              >
                {userProfile?.profileImageUrl ? (
                  <Image
                    source={{ uri: userProfile.profileImageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={isTablet ? 48 : 40}
                      color="#fff"
                    />
                  </View>
                )}
                <View style={styles.editIconWrapper}>
                  <Ionicons
                    name="camera-outline"
                    size={isTablet ? 20 : 18}
                    color="#fff"
                  />
                </View>
              </TouchableOpacity>
              <Text style={styles.userName} numberOfLines={1}>
                {userProfile?.firstName || "Utilisateur"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userProfile?.email || "user@example.com"}
              </Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.title}
                scrollEnabled={false}
              />
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessible={true}
              accessibilityLabel="Se déconnecter"
            >
              <Ionicons
                name="log-out-outline"
                size={isTablet ? 24 : 20}
                color="#FF5722"
              />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "700",
    color: "#333",
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 120,
  },
  userSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    resizeMode: "cover",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  editIconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#059669",
    borderRadius: 14,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    maxWidth: width * 0.8,
    textAlign: "center",
  },
  userEmail: {
    fontSize: isTablet ? 16 : 14,
    color: "#666",
    maxWidth: width * 0.8,
    textAlign: "center",
  },
  menuSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: isTablet ? 18 : 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: isTablet ? 18 : 16,
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
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    fontSize: isTablet ? 18 : 16,
    color: "#FF5722",
    marginLeft: 8,
    fontWeight: "600",
  },
});

export default ProfilePage;
