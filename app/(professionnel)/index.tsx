// app/(tabs)/index.tsx
import Sidebar from "@/components/sidebar";
import { Ionicons } from "@expo/vector-icons";
import { Route, router } from "expo-router";
import { Bell } from "lucide-react-native";
import React, { JSX, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
// Import des services API
import { Business, BusinessesService, SelectedBusinessManager } from "@/api";
import {
  getSales,
  SalesByPeriod,
  SalesByProductCategory,
  TopSellingProduct,
} from "@/api/analytics";

import SalesPieChart from "@/components/SalesPieChart";
import { SafeAreaView } from "react-native-safe-area-context";
import { SalesTrendChart } from "@/components/Chart/SalesByPeriodChart";
// Types
interface Enterprise {
  id: number;
  name: string;
  rating: number;
  compare: string;
  discount?: Float;
}

interface BusinessAction {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  color: string;
}

const HomePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Charger les entreprises depuis l'API
      const businessesResponse = await BusinessesService.getBusinesses();
      setBusinesses(businessesResponse);

      // Vérifier si une entreprise est déjà sélectionnée
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected);

      // Si une entreprise est sélectionnée mais n'est plus dans la liste, la désélectionner
      if (selected && !businessesResponse.find((b) => b.id === selected.id)) {
        await BusinessesService.clearSelectedBusiness();
        setSelectedBusiness(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };
  // Charger les ventes pour l'entreprise sélectionnée

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const navigateToEnterpriseDetails = (enterpriseId: number): void => {
    router.push(`/enterprise-details?id=${enterpriseId}` as Route);
  };
  const handleBusinessSelect = async (business: Business) => {
    try {
      console.log("Sélection de l'entreprise:", business.name);
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
      Alert.alert("Succès", `Entreprise "${business.name}" sélectionnée`);
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'entreprise");
    }
  };

  const getBusinessActions = (): BusinessAction[] => {
    if (!selectedBusiness) return [];

    const actions: BusinessAction[] = [
      {
        id: "analytics",
        title: "Statistiques",
        icon: "analytics-outline",
        description: "Voir les performances",
        route: `(analytics)?id=${selectedBusiness.id}`,
        color: "#7c3aed",
      },
      {
        id: "details",
        title: "Détails & Modifier",
        icon: "business-outline",
        description: "Voir et modifier les informations",
        route: `(business-details)?id=${selectedBusiness.id}`,
        color: "#059669",
      },
      {
        id: "members",
        title: "Gérer les membres",
        icon: "people-outline",
        description: "Ajouter, modifier, supprimer des membres",
        route: `(business-members)?id=${selectedBusiness.id}`,
        color: "#2563eb",
      },
      {
        id: "hours",
        title: "Horaires d'ouverture",
        icon: "time-outline",
        description: "Définir les horaires d'ouverture",
        route: `(opening-hours)?id=${selectedBusiness.id}`,
        color: "#dc2626",
      },
    ];

    // On ajoute l'onglet Restaurants seulement pour les restaurateurs
    if (selectedBusiness.type === "RESTAURATEUR") {
      actions.unshift({
        id: "restaurants",
        title: "Restaurants",
        icon: "restaurant-outline",
        description: "Gérer les tables et le menu",
        route: `(restaurants)?id=${selectedBusiness.id}`,
        color: "#06235cff",
      });
    }

    return actions;
  };

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <Sidebar
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
      />
      {renderSearchBar()}
      <TouchableOpacity style={styles.notificationButton}>
        <Bell size={30} color="black" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = (): JSX.Element => (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={25}
        color="gray"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher"
        placeholderTextColor="gray"
      />
    </View>
  );

  const renderSelectedBusinessBanner = (): JSX.Element | null => {
    if (!selectedBusiness) return null;

    return (
      <View style={styles.selectedBusinessBanner}>
        <View style={styles.bannerContent}>
          <Text style={styles.selectedBusinessTitle}>
            🏢 {selectedBusiness.name}
          </Text>
          <Text style={styles.selectedBusinessType}>
            {selectedBusiness.type}
          </Text>
          <Text style={styles.selectedBusinessAddress} numberOfLines={1}>
            📍 {selectedBusiness.address}
          </Text>
          {selectedBusiness.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.verifiedText}>Vérifié</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.changeBusiness}
          onPress={() => {
            Alert.alert(
              "Changer d'entreprise",
              "Ouvrez le menu (☰) pour sélectionner une autre entreprise",
              [{ text: "OK" }]
            );
          }}
        >
          <Text style={styles.changeBusinessText}>Changer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBusinessActions = (): JSX.Element | null => {
    if (!selectedBusiness) return null;

    const actions = getBusinessActions();

    return (
      <View style={styles.businessActionsContainer}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => router.push(action.route as Route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${action.color}15` },
                ]}
              >
                <Ionicons
                  name={action.icon as any}
                  size={24}
                  color={action.color}
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>
                  {action.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderQuickStats = (): JSX.Element | null => {
    if (!selectedBusiness) return null;

    return (
      <View style={styles.quickStatsContainer}>
        <Text style={styles.sectionTitle}>Aperçu rapide</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {selectedBusiness.averageRating.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedBusiness.reviewCount}</Text>
            <Text style={styles.statLabel}>Avis</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>
                {selectedBusiness.isVerified ? "Vérifié" : "En attente"}
              </Text>
            </View>
            <Text style={styles.statLabel}>Statut</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderNoBusinessSelected = (): JSX.Element => (
    <View style={styles.noBusinessContainer}>
      <Ionicons name="business-outline" size={60} color="#ccc" />
      <Text style={styles.noBusinessTitle}>Aucune entreprise sélectionnée</Text>
      <Text style={styles.noBusinessText}>
        Sélectionnez une entreprise dans le menu pour accéder aux outils de
        gestion
      </Text>
      <TouchableOpacity
        style={styles.selectBusinessButton}
        onPress={() => {
          Alert.alert(
            "Sélectionner une entreprise",
            "Ouvrez le menu (☰) pour sélectionner une entreprise",
            [{ text: "OK" }]
          );
        }}
      >
        <Text style={styles.selectBusinessButtonText}>
          Sélectionner une entreprise
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEnterpriseCard = (enterprise: Enterprise): JSX.Element => (
    <TouchableOpacity
      key={enterprise.id}
      style={styles.gridItem}
      onPress={() => navigateToEnterpriseDetails(enterprise.id)}
      activeOpacity={0.8}
    >
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>
          {enterprise.name}
        </Text>
        <Text style={styles.rating}>${enterprise.rating}</Text>
        <View style={styles.gridFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.gridCategory}>{enterprise.compare}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#00C851" barStyle="light-content" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00C851" barStyle="light-content" />
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
          />
        }
      >
        {renderSelectedBusinessBanner()}

        {selectedBusiness ? (
          <>
            {renderQuickStats()}
            {renderBusinessActions()}
          </>
        ) : (
          renderNoBusinessSelected()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    paddingRight: 20,
    alignItems: "center",
    paddingTop: 10,
  },
  selectedBusinessBanner: {
    backgroundColor: "#e8f5e8",
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerContent: {
    flex: 1,
  },
  selectedBusinessTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: 4,
  },
  selectedBusinessType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 2,
  },
  selectedBusinessAddress: {
    fontSize: 12,
    color: "#388e3c",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 12,
    color: "#059669",
    marginLeft: 4,
    fontWeight: "600",
  },
  changeBusiness: {
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeBusinessText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  businessCount: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  businessActionsContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "#666",
  },
  quickStatsContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  statBadge: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statBadgeText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  noBusinessContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
  },
  noBusinessTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  noBusinessText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  selectBusinessButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectBusinessButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    marginLeft: 12,
    justifyContent: "flex-start",
    alignItems: "center",
    alignContent: "center",
    flexDirection: "row",
  },
  bgImage: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 5,
    resizeMode: "contain",
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  notificationButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 48,
    width: "75%",
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
    color: "gray",
  },
  searchInput: {
    flex: 1,
    fontSize: 20,
    color: "gray",
    fontWeight: "400",
  },
  headerSection2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  bannerContainer: {
    padding: 0,
    marginTop: 1,
  },
  banner: {
    borderRadius: 16,
    elevation: 1,
  },
  bannerBackground: {
    backgroundColor: "white",
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontWeight: "400",
  },
  bannerButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "49%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gridContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  gridCategory: {
    fontSize: 20,
    color: "#666",
    opacity: 0.5,
    marginBottom: 10,
    fontWeight: "400",
  },
  gridFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 28,
    color: "#333",
    marginLeft: 4,
    fontWeight: "800",
    marginBottom: 10,
  },
  discountBadge: {
    backgroundColor: "#FFD700",
    borderRadius: 80,
    width: 40,
    height: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  discountText: {
    fontSize: 30,
    fontWeight: "700",
    color: "white",
  },
});

export default HomePage;
