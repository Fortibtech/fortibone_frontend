// app/(tabs)/index.tsx
import { Business, BusinessesService, SelectedBusinessManager } from "@/api";
import {
  AnalyticsOverview,
  getAnalyticsOverview,
  getPendingOrdersCount,
  getProcessingPurchasesCount,
} from "@/api/analytics";
import AnalyticsCard from "@/components/accueil/AnalyticsCard";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
const HomePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ États pour les analytics
  const [monthlyOverview, setMonthlyOverview] =
    useState<AnalyticsOverview | null>(null);
  const [overallOverview, setOverallOverview] =
    useState<AnalyticsOverview | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [processingPurchases, setProcessingPurchases] = useState<{
    count: number;
    totalItems: number;
  }>({ count: 0, totalItems: 0 });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // ✅ Charger les analytics quand une entreprise est sélectionnée
  useEffect(() => {
    if (selectedBusiness) {
      loadAnalytics();
    }
  }, [selectedBusiness]);

  // ✅ Fonction pour obtenir les dates du mois en cours
  const getCurrentMonthDates = (): { startDate: string; endDate: string } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Premier jour du mois
    const startDate = `${year}-${month}-01`;

    // Dernier jour du mois
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    return { startDate, endDate };
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const businessesResponse = await BusinessesService.getBusinesses();
      setBusinesses(businessesResponse);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected);

      if (selected?.type === "FOURNISSEUR") {
        router.push("/(fournisseur)");
      }

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

  // ✅ Fonction pour charger les analytics
  const loadAnalytics = async () => {
    if (!selectedBusiness) return;

    try {
      setAnalyticsLoading(true);

      // Obtenir les dates du mois en cours
      const { startDate, endDate } = getCurrentMonthDates();
      // Charger l'overview du mois en cours
      const monthlyData = await getAnalyticsOverview(
        selectedBusiness.id,
        startDate,
        endDate
      );
      setMonthlyOverview(monthlyData);

      // Charger l'overview global (sans dates)
      const overallData = await getAnalyticsOverview(selectedBusiness.id);
      setOverallOverview(overallData);

      // Charger le nombre de commandes en attente
      const pendingCount = await getPendingOrdersCount(
        selectedBusiness.id,
        "SALE"
      );
      setPendingOrdersCount(pendingCount);

      // Charger les achats en cours
      const purchasesData = await getProcessingPurchasesCount(
        selectedBusiness.id
      );
      setProcessingPurchases(purchasesData);
    } catch (error) {
      console.error("Erreur lors du chargement des analytics:", error);
      Alert.alert("Erreur", "Impossible de charger les statistiques");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (selectedBusiness) {
      await loadAnalytics();
    }
    setRefreshing(false);
  };

  const handleBusinessSelect = async (business: Business) => {
    try {
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
      Alert.alert("Succès", `Entreprise "${business.name}" sélectionnée`);
      if (business.type === "FOURNISSEUR") {
        router.push("/(fournisseur)");
      }
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'entreprise");
    }
  };

  // ✅ Fonction utilitaire pour formater les nombres
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <BusinessSelector
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/pro/createBusiness")}
        onManageBusiness={() => router.push("/pro/profile")}
      />

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatar}>
          <Ionicons name="person" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOverviewSection = () => {
    if (!selectedBusiness) return null;

    // ✅ Afficher un loader pendant le chargement des analytics
    if (analyticsLoading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d&apos;Ensemble</Text>
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
        <Text style={styles.sectionTitle}>Vue d&apos;Ensemble</Text>

        <View style={styles.cardsRow}>
          {/* CA Mensuel - Jaune */}
          <View style={[styles.overviewCard, styles.cardYellow]}>
            <View style={styles.cardIcon}>
              <Image
                source={require("@/assets/images/wallet-money.png")}
                style={styles.cardEmoji}
              />
            </View>
            <View>
              <Text style={styles.cardLabel}>CA Mensuel</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "baseline",
                }}
              >
                <Text style={styles.cardValue}>
                  {monthlyOverview
                    ? formatNumber(monthlyOverview.totalSalesAmount)
                    : "--"}
                </Text>
                <Text style={styles.cardUnit}> KMF</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFull}>
            {/* En attente - Violet */}
            <View style={[styles.overviewCard, styles.cardPurple]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("@/assets/images/bag-2.png")}
                  style={styles.cardEmojiDouble}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>En attente</Text>
                <Text style={styles.cardValue}>
                  {pendingOrdersCount} commande
                  {pendingOrdersCount > 1 ? "s" : ""} client
                  {pendingOrdersCount > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            {/* Achats en cours - Vert */}
            <View style={[styles.overviewCard, styles.cardGreen]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("@/assets/images/money-recive.png")}
                  style={styles.cardEmojiDouble}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>Achats en cours</Text>
                <Text style={styles.cardValue}>
                  {processingPurchases.totalItems} article
                  {processingPurchases.totalItems > 1 ? "s" : ""} commandé
                  {processingPurchases.totalItems > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickAccessSection = () => {
    if (!selectedBusiness) return null;
    const { id } = selectedBusiness;
    return <AnalyticsCard id={id} />;
  };

  const renderNoBusinessSelected = () => (
    <View style={styles.noBusinessContainer}>
      <Ionicons name="business-outline" size={80} color="#E0E0E0" />
      <Text style={styles.noBusinessTitle}>Aucune entreprise sélectionnée</Text>
      <Text style={styles.noBusinessText}>
        Sélectionnez une entreprise pour voir vos statistiques
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C851"]}
          />
        }
      >
        {selectedBusiness ? (
          <>
            {renderOverviewSection()}
            {renderQuickAccessSection()}
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
    backgroundColor: "#F8F9FA",
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
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    alignContent: "space-between",
    justifyContent: "space-between",
  },
  cardFull: {
    width: "50%",
  },
  cardYellow: {
    backgroundColor: "#F1E9C7FF",
    borderWidth: 2,
    borderColor: "#FACC15",
    alignContent: "space-between",
  },
  cardPurple: {
    backgroundColor: "#E5E9FFFF",
    borderWidth: 2,
    marginBottom: 10,
    borderColor: "#506EFF",
    padding: 10,
  },
  cardGreen: {
    backgroundColor: "#F2FCF1FF",
    borderWidth: 2,
    borderColor: "#68F755",
    padding: 10,
  },
  cardBlue: {
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  cardOrange: {
    backgroundColor: "#FFF7ED",
    borderWidth: 2,
    borderColor: "#F97316",
  },
  cardPink: {
    backgroundColor: "#FCE7F3",
    borderWidth: 2,
    borderColor: "#EC4899",
  },
  cardTeal: {
    backgroundColor: "#F0FDFA",
    borderWidth: 2,
    borderColor: "#14B8A6",
  },
  cardIcon: {},
  cardEmoji: {
    width: 42,
    height: 42,
    position: "relative",
  },
  cardEmojiDouble: {
    width: 24,
    height: 24,
    position: "relative",
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
    marginVertical: 12,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  cardUnit: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  quickAccessRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    minHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
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
});

export default HomePage;
