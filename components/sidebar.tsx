// components/sidebar.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AlignJustify } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import des types et services API
import { Business } from "@/api";
import { useUserStore } from "@/store/userStore";

interface SidebarProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onBusinessSelect: (business: Business) => void;
  loading?: boolean;
}
// Responsive dimensions
const { width } = Dimensions.get("window");
const isTablet = width >= 600;
const Sidebar: React.FC<SidebarProps> = ({
  businesses,
  selectedBusiness,
  onBusinessSelect,
  loading = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { logout } = useUserStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Erreur", "Échec de la déconnexion");
    }
  };
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const navigateToCreateBusiness = () => {
    toggleSidebar();
    router.push("/pro/createBusiness");
  };

  const navigateToProfile = () => {
    toggleSidebar();
    router.push("/pro/profile");
  };

  const handleBusinessSelect = (business: Business) => {
    onBusinessSelect(business);
    toggleSidebar();
  };

  const renderBusinessItem = ({ item }: { item: Business }) => {
    const isSelected = selectedBusiness?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.businessItem, isSelected && styles.selectedBusinessItem]}
        onPress={() => handleBusinessSelect(item)}
        activeOpacity={0.8}
      >
        <View style={styles.businessContent}>
          {/* Logo d'entreprise ou placeholder */}
          <View
            style={[
              styles.businessLogoContainer,
              isSelected && styles.selectedBusinessLogoContainer,
            ]}
          >
            {item.logoUrl ? (
              <Image
                source={{ uri: item.logoUrl }}
                style={styles.businessLogo}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.logoPlaceholder,
                  isSelected && styles.selectedLogoPlaceholder,
                ]}
              >
                <Text
                  style={[
                    styles.logoPlaceholderText,
                    isSelected && styles.selectedLogoPlaceholderText,
                  ]}
                >
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.businessTextContainer}>
            <Text
              style={[
                styles.businessName,
                isSelected && styles.selectedBusinessName,
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.businessDescription,
                isSelected && styles.selectedBusinessDescription,
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <View style={styles.businessMetaContainer}>
              <Text
                style={[
                  styles.businessType,
                  isSelected && styles.selectedBusinessType,
                ]}
              >
                {item.type}
              </Text>
              {item.phoneNumber && (
                <Text
                  style={[
                    styles.businessPhone,
                    isSelected && styles.selectedBusinessPhone,
                  ]}
                >
                  📞 {item.phoneNumber}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Indicateur de sélection */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="business-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Aucune entreprise</Text>
      <Text style={styles.emptyStateSubtitle}>
        Créez votre première entreprise pour commencer
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={navigateToCreateBusiness}
      >
        <Text style={styles.emptyStateButtonText}>Créer une entreprise</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBusinessList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des entreprises...</Text>
        </View>
      );
    }

    if (businesses.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={businesses}
        renderItem={renderBusinessItem}
        keyExtractor={(item) => item.id}
        style={styles.businessList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

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
              <View>
                <Text style={styles.sidebarTitle}>Mes Entreprises</Text>
                {businesses.length > 0 && (
                  <Text style={styles.businessCount}>
                    {businesses.length} entreprise
                    {businesses.length > 1 ? "s" : ""}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={toggleSidebar}>
                <Ionicons name="close" size={30} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Entreprise actuellement sélectionnée */}
            {selectedBusiness && (
              <View style={styles.currentSelectionBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text style={styles.currentSelectionText}>
                  Actuellement: {selectedBusiness.name}
                </Text>
              </View>
            )}

            {renderBusinessList()}

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
                onPress={navigateToProfile}
              >
                <Ionicons name="person-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Profil</Text>
              </TouchableOpacity>
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
  logoutText: {
    fontSize: isTablet ? 18 : 16,
    color: "#FF5722",
    marginLeft: 8,
    fontWeight: "600",
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
  menuButton: {
    padding: -5,
  },
  sidebarContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: "80%",
    backgroundColor: "#fafafb",
    height: "100%",
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  businessCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  currentSelectionBanner: {
    backgroundColor: "#e8f5e8",
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#059669",
  },
  currentSelectionText: {
    fontSize: 14,
    color: "#1b5e20",
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  businessList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  businessItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  selectedBusinessItem: {
    backgroundColor: "#f0f9ff",
    borderWidth: 2,
    borderColor: "#059669",
    shadowColor: "#059669",
    shadowOpacity: 0.2,
  },
  businessContent: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },
  businessLogoContainer: {
    marginRight: 12,
  },
  selectedBusinessLogoContainer: {
    borderWidth: 2,
    borderColor: "#059669",
    borderRadius: 8,
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedLogoPlaceholder: {
    backgroundColor: "#059669",
  },
  logoPlaceholderText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#666",
  },
  selectedLogoPlaceholderText: {
    color: "white",
  },
  businessTextContainer: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectedBusinessName: {
    color: "#059669",
    fontWeight: "700",
  },
  businessDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  selectedBusinessDescription: {
    color: "#047857",
  },
  businessMetaContainer: {
    gap: 4,
  },
  businessType: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    opacity: 0.8,
  },
  selectedBusinessType: {
    color: "#059669",
    opacity: 1,
  },
  businessPhone: {
    fontSize: 12,
    color: "#666",
  },
  selectedBusinessPhone: {
    color: "#047857",
  },
  selectionIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  buttonContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  sidebarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default Sidebar;
