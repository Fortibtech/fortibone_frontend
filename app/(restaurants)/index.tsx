// app/(restaurants)/index.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Business, BusinessesService, SelectedBusinessManager } from "@/api"; // même types que commerçant
import { getStatRestaurant, RestaurantStats } from "@/api/restaurant"; // stats spécifiques resto
import { useUserAvatar } from "@/hooks/useUserAvatar";
import BusinessSelector from "@/components/Business/BusinessSelector";

const RestaurantHome: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { uri } = useUserAvatar();

  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Chargement initial
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recharge stats quand on revient sur l’onglet
  useFocusEffect(
    useCallback(() => {
      if (selectedBusiness) {
        loadStats(selectedBusiness.id);
      }
    }, [selectedBusiness])
  );

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const all = await BusinessesService.getBusinesses();
      setBusinesses(all);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected ?? null);
      if (selected) {
        await loadStats(selected.id);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les données restaurant.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (businessId: string) => {
    try {
      setStatsLoading(true);
      const data = await getStatRestaurant(businessId);
      setStats(data);
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les statistiques.");
    } finally {
      setStatsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleBusinessSelect = async (business: Business) => {
    try {
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);

      Alert.alert("Succès", `Entreprise "${business.name}" sélectionnée`);

      setTimeout(() => {
        switch (business.type) {
          case "COMMERCANT":
            router.push("/(professionnel)");
            break;
          case "RESTAURATEUR":
            router.push("/(restaurants)");
            break;
          case "FOURNISSEUR":
            router.push("/(fournisseur)");
            break;
          default:
            console.warn("Type d'entreprise inconnu:", business.type);
        }
      }, 100); // 100ms suffit
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'entreprise");
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <BusinessSelector
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/(create-business)/")}
        onManageBusiness={() => router.push("/pro/ManageBusinessesScreen")}
      />

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push("/fournisseurSetting")}
        >
          <Image
            source={uri ? { uri } : require("@/assets/images/icon.png")}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderOverviewSection = () => {
    if (!selectedBusiness) return null;

    if (statsLoading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé rapide</Text>
          <View style={styles.analyticsLoadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.analyticsLoadingText}>
              Chargement des statistiques...
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé rapide</Text>
        <View style={styles.cardsRow}>
          <View style={[styles.overviewCard, styles.cardYellow]}>
            <Text style={styles.cardLabel}>CA du mois</Text>
            <Text style={styles.cardValue}>
              {stats?.monthlyRevenue ?? 0} FCFA
            </Text>
          </View>
          <View style={[styles.overviewCard, styles.cardPurple]}>
            <Text style={styles.cardLabel}>Commandes en attente</Text>
            <Text style={styles.cardValue}>
              {stats?.pendingReservations ?? 0}
            </Text>
          </View>
          <View style={[styles.overviewCard, styles.cardPink]}>
            <Text style={styles.cardLabel}>Tables occupées</Text>
            <Text style={styles.cardValue}>
              {stats?.averageTableOccupancy ?? 0} %
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickAccess = () => {
    if (!selectedBusiness) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.quickAccessRow}>
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push("/(restaurants)/tables-menus")}
          >
            <Text style={styles.quickAccessTitle}>Tables & Menus</Text>
            <Text style={styles.quickAccessSubtitle}>
              Configurer les tables, menus et disponibilités.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNoBusiness = () => (
    <View style={styles.noBusinessContainer}>
      <Ionicons name="business-outline" size={80} color="#E0E0E0" />
      <Text style={styles.noBusinessTitle}>Aucun restaurant sélectionné</Text>
      <Text style={styles.noBusinessText}>
        Crée ou sélectionne un restaurant pour voir le dashboard.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      {/* HEADER TOUJOURS VISIBLE */}
      <View style={styles.fixedHeader}>{renderHeader()}</View>

      {/* CONTENU */}
      <View style={styles.bodyContainer}>
        {loading ? (
          // Écran de chargement qui laisse le header visible
          <View style={styles.initialLoadingContainer}>
            <ActivityIndicator size="large" color="#00C851" />
            <Text style={styles.initialLoadingText}>
              Chargement du tableau de bord...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#00C851"]}
                tintColor="#00C851"
              />
            }
          >
            {selectedBusiness ? (
              <>
                {renderOverviewSection()}
                {renderQuickAccess()}
              </>
            ) : (
              renderNoBusiness()
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  fixedHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconButton: {
    padding: 8,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },

  bodyContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },

  initialLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },

  initialLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },

  section: { marginBottom: 24, alignItems: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  cardsRow: { flexDirection: "row", gap: 12 },
  overviewCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 90,
    justifyContent: "space-between",
  },
  cardYellow: {
    backgroundColor: "#FEF9C3",
    borderWidth: 2,
    borderColor: "#FACC15",
  },
  cardPurple: {
    backgroundColor: "#EDE9FE",
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  cardPink: {
    backgroundColor: "#FCE7F3",
    borderWidth: 2,
    borderColor: "#EC4899",
  },
  cardLabel: { fontSize: 13, color: "#555", marginBottom: 8 },
  cardValue: { fontSize: 18, fontWeight: "700", color: "#000" },

  quickAccessRow: { flexDirection: "row", gap: 12 },
  quickAccessCard: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  quickAccessSubtitle: { fontSize: 12, color: "#999", marginTop: 6 },

  noBusinessContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noBusinessTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  noBusinessText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  analyticsLoadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  analyticsLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
});

export default RestaurantHome;
