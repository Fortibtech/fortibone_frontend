import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { deleteUserAccount, UserResponse } from '@/api/Users';
import { useUserStore } from '@/store/userStore';
import { router } from 'expo-router';


interface MenuItem {
  id: string;
  icon: string;
  title: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingsMenu: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const user = useUserStore.getState().userProfile;
  const handleViewProfile = () => {
    router.push('/userProfile');
  };

  const handleUpgradeToPremium = () => {
    // Navigation vers l'écran premium
     router.push('/subscription');
  };

  const handleMyBusiness = () => {
    router.push('/MyBusiness');
  };

  const handleAppSettings = () => {
    router.push('/setting');
  };

  const handleHelpCenter = () => {
    router.push('/HelpCenter');
  };

  const handlePrivacyPolicy = () => {
    router.push('/PrivacyPolicy');
  };

  const handleTermsConditions = () => {
    router.push('/TermsConditions');
  };

  const handleAbout = () => {
    router.push('/About');
  };

  const handleInviteUsers = () => {
    Alert.alert('Inviter', 'Fonctionnalité de partage à venir');
  };

  const handleRateApp = () => {
    Alert.alert('Noter', 'Merci de votre soutien !');
  };

  const handleLogout = () => {
    Alert.alert(
      'Se Déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
           router.dismissAll()
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'business',
      icon: '🏢',
      title: 'Mon Commerce',
      onPress: handleMyBusiness,
      showArrow: true,
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: "Paramètres de l'application",
      onPress: handleAppSettings,
      showArrow: true,
    },
    {
      id: 'help',
      icon: 'ℹ️',
      title: "Centre d'aide & assistance",
      onPress: handleHelpCenter,
      showArrow: true,
    },
    {
      id: 'privacy',
      icon: '🛡️',
      title: 'Politique de confidentialité',
      onPress: handlePrivacyPolicy,
      showArrow: true,
    },
    {
      id: 'terms',
      icon: '📄',
      title: "Termes & conditions d'utilisation",
      onPress: handleTermsConditions,
      showArrow: true,
    },
    {
      id: 'about',
      icon: 'ℹ️',
      title: 'Apropos de FertibTech',
      onPress: handleAbout,
      showArrow: true,
    },
    {
      id: 'invite',
      icon: '👥',
      title: 'Inviter des utilisateurs',
      onPress: handleInviteUsers,
      showArrow: false,
    },
    {
      id: 'rate',
      icon: '⭐',
      title: "Noter l'application",
      onPress: handleRateApp,
      showArrow: false,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={
              user?.profileImageUrl
                ? { uri: user.profileImageUrl }
                : require('@/assets/images/icon.png')
            }
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.firstName || 'Jean'} {user?.lastName || 'Dupont'}
            </Text>
            <TouchableOpacity onPress={handleViewProfile}>
              <Text style={styles.viewProfileLink}>Voir le profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Card */}
        <TouchableOpacity
          style={styles.premiumCard}
          onPress={handleUpgradeToPremium}>
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>Passer à Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Débloquez des fonctionnalités{'\n'}avancées et boostez vos
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
              onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              {item.showArrow && <Text style={styles.arrow}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Se Déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8E8E8',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  viewProfileLink: {
    fontSize: 14,
    color: '#00D68F',
    fontWeight: '500',
  },
  premiumCard: {
    backgroundColor: '#00D68F',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    opacity: 0.9,
  },
  subscribeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D68F',
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuItemText: {
    fontSize: 15,
    color: '#000000',
    flex: 1,
  },
  arrow: {
    fontSize: 24,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D68F',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsMenu;