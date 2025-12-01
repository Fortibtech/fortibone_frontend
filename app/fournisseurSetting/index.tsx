"use client";

import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useUserStore } from "@/store/userStore";
import { router } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LogoutModal from "./logoutModal";
import ShareAppModal from "./shareAppModal";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { Ionicons } from "@expo/vector-icons";

interface MenuItem {
  id: string;
  iconName: string;
  title: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingsMenu: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const user = useUserStore.getState().userProfile;
  const { uri } = useUserAvatar();
  const handleViewProfile = () => {
    router.push("/fournisseurSetting/userProfile");
  };

  const handleUpgradeToPremium = () => {
    router.push("/fournisseurSetting/subscription");
  };

  const handleMyBusiness = () => {
    router.push("/fournisseurSetting/companyProfile");
  };

  const handleAppSettings = () => {
    router.push("/fournisseurSetting/setting");
  };

  const handleHelpCenter = () => {
    router.push("/fournisseurSetting/helperCenter");
  };

  const handlePrivacyPolicy = () => {
    router.push("/fournisseurSetting/privacyPolicy");
  };

  const handleTermsConditions = () => {
    router.push("/fournisseurSetting/TermsAndConditions");
  };

  const handleAbout = () => {
    router.push("/fournisseurSetting/about");
  };

  const handleInviteUsers = () => {
    setShowShareModal(true);
  };

  const handleRateApp = () => {
    Alert.alert("Noter", "Merci de votre soutien !");
  };

  const handleLogout = () => {
    Alert.alert(
      "Se Déconnecter",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: () => {
            router.replace("/");
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: "business",
      iconName: "store",
      title: "Mon Commerce",
      onPress: handleMyBusiness,
      showArrow: true,
    },
    {
      id: "settings",
      iconName: "settings",
      title: "Paramètres de l'application",
      onPress: handleAppSettings,
      showArrow: true,
    },
    {
      id: "help",
      iconName: "info",
      title: "Centre d'aide & assistance",
      onPress: handleHelpCenter,
      showArrow: true,
    },
    {
      id: "privacy",
      iconName: "security",
      title: "Politique de confidentialité",
      onPress: handlePrivacyPolicy,
      showArrow: true,
    },
    {
      id: "terms",
      iconName: "description",
      title: "Termes & conditions d'utilisation",
      onPress: handleTermsConditions,
      showArrow: true,
    },
    {
      id: "about",
      iconName: "info-outline",
      title: "Apropos de FertibTech",
      onPress: handleAbout,
      showArrow: true,
    },
    {
      id: "invite",
      iconName: "group",
      title: "Inviter des utilisateurs",
      onPress: handleInviteUsers,
      showArrow: true,
    },
    {
      id: "rate",
      iconName: "star",
      title: "Noter l'application",
      onPress: handleRateApp,
      showArrow: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          {uri ? (
            <Image
              key={uri} // Indispensable ici aussi !
              source={{ uri }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Ionicons name="person" size={40} color="#ccc" />
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.firstName || "Jean"} {user?.lastName || "Dupont"}
            </Text>
            <TouchableOpacity onPress={handleViewProfile}>
              <Text style={styles.viewProfileLink}>Voir le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.premiumCard}
          onPress={handleUpgradeToPremium}
        >
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>Passer à Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Débloquez des fonctionnalités{"\n"}avancées et boostez vos
              activités
            </Text>
          </View>
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Souscrire</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={item.iconName}
                    size={20}
                    color="#1BB874"
                  />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              {item.showArrow && (
                <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
          disabled={loading}
        >
          <MaterialIcons name="logout" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Se Déconnecter</Text>
        </TouchableOpacity>
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
      <ShareAppModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F1F1FF",
    height: 90,
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: "#F8F1F1FF",
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: "#000000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    alignContent: "center",
    // justifyContent:'center'
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8E8E8",
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 6,
  },
  viewProfileLink: {
    fontSize: 13,
    color: "#1BB874",
    fontWeight: "500",
  },
  premiumCard: {
    backgroundColor: "#1BB874",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 18,
    opacity: 0.9,
  },
  subscribeButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  subscribeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1BB874",
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuItemText: {
    fontSize: 14,
    color: "#000000",
    flex: 1,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 20,
    color: "#CCCCCC",
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    height: 122,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1BB874",
    paddingVertical: 16,
    borderRadius: 24,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default SettingsMenu;
