import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AlignJustify } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
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

interface SidebarProps {
  businesses: Business[];
  onBusinessSelect: (business: Business) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ businesses, onBusinessSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const navigateToCreateBusiness = () => {
    toggleSidebar();
    router.push('/pro/createBusiness');
  };

  const navigateToNotifications = () => {
    toggleSidebar();
    router.push('/pro/notifications');
  };

  const navigateToProfile = () => {
    toggleSidebar();
    router.push('/pro/profile');
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.businessItem}
      onPress={() => {
        onBusinessSelect(item);
        toggleSidebar();
      }}
      activeOpacity={0.8}
    >
      <View style={styles.businessContent}>
        <Image
          source={ item.logoUrl }
          style={styles.businessLogo}
          resizeMode="contain"
        />
        <View style={styles.businessTextContainer}>
          <Text style={styles.businessName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.businessDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.businessType}>{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
        <AlignJustify size={30} color="black" />
      </TouchableOpacity>
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleSidebar}
      >
        <View style={styles.sidebarContainer}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Mes Entreprises</Text>
              <TouchableOpacity onPress={toggleSidebar}>
                <Ionicons name="close" size={30} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={businesses}
              renderItem={renderBusinessItem}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              style={styles.businessList}
              contentContainerStyle={styles.listContent}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.sidebarButton}
                onPress={navigateToCreateBusiness}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Nouvelle Entreprise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarButton}
                onPress={navigateToNotifications}
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarButton}
                onPress={navigateToProfile}
              >
                <Ionicons name="person-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Profil</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.overlay}
            onPress={toggleSidebar}
            activeOpacity={1}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: -5,
  },
  sidebarContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '80%',
    backgroundColor: '#fafafb',
    height: '100%',
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  businessList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80, // Space for the create button
  },
  businessItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  businessContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  businessTextContainer: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 12,
    color: '#666',
    opacity: 0.7,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 15,
    borderRadius: 12,
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Sidebar;