import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { Business, BusinessesService } from "@/api";
import {
  AnalyticsOverview,
  getAnalyticsOverview,
  getPendingOrdersCount,
  getProcessingPurchasesCount,
} from "@/api/analytics";

import BusinessSelector from "@/components/Business/BusinessSelector";
import AnalyticsCard from "@/components/accueil/AnalyticsCard";
import { useUserAvatar } from "@/hooks/useUserAvatar";

// Zustand → seule source de vérité
import { useBusinessStore } from "@/store/businessStore";

const HomePage: React.FC = () => {
  // Zustand
  const business = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { uri } = useUserAvatar();

  // Analytics states
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

  // Dates du mois en cours
  const getCurrentMonthDates = (): { startDate: string; endDate: string } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    return { startDate, endDate };
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const all = await BusinessesService.getBusinesses();
      setBusinesses(all);

      // Si aucun business dans le store, on en prend un par défaut
      if (!business && all.length > 0) {
        const first = all[0];
        setBusiness(first);
        await BusinessesService.selectBusiness(first);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les entreprises");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!business?.id || analyticsLoading) return;

    try {
      setAnalyticsLoading(true);
      const { startDate, endDate } = getCurrentMonthDates();

      const [monthly, overall, pendingCount, purchases] = await Promise.all([
        getAnalyticsOverview(business.id, startDate, endDate),
        getAnalyticsOverview(business.id),
        getPendingOrdersCount(business.id, "SALE"),
        getProcessingPurchasesCount(business.id),
      ]);

      setMonthlyOverview(monthly);
      setOverallOverview(overall);
      setPendingOrdersCount(pendingCount);
      setProcessingPurchases(purchases);
    } catch (error) {
      console.error("Erreur analytics:", error);
      Alert.alert("Erreur", "Impossible de charger les statistiques");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recharge analytics quand business change ou quand on revient dans l'onglet
  useFocusEffect(
    useCallback(() => {
      if (business?.id) {
        loadAnalytics();
      }
    }, [business?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (business?.id) await loadAnalytics();
    setRefreshing(false);
  };

  const handleBusinessSelect = async (selected: Business) => {
    try {
      await BusinessesService.selectBusiness(selected);
      setBusiness(selected);
      Alert.alert("Succès", `"${selected.name}" sélectionné`);

      // Redirection immédiate selon le type
      setTimeout(() => {
        const routes: Record<string, string> = {
          COMMERCANT: "/(professionnel)",
          RESTAURATEUR: "/(restaurants)",
          FOURNISSEUR: "/(fournisseur)",
          LIVREUR: "/(delivery)",
        };
        const target = routes[selected.type];
        if (target) {
          router.replace(target);
        }
      }, 100);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de changer d'entreprise");
    }
  };

  const formatNumber = (num: number = 0): string =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(num);

  const totalAlerts = pendingOrdersCount;

  const renderHeader = () => (
    <View style={styles.header}>
      <BusinessSelector
        businesses={businesses}
        selectedBusiness={business} // ← toujours à jour grâce au store
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/(create-business)/")}
        onManageBusiness={() => router.push("/pro/ManageBusinessesScreen")}
      />

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          {totalAlerts > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {totalAlerts > 99 ? "99+" : totalAlerts}
              </Text>
            </View>
          )}
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => router.push("/fournisseurSetting")}
        >
          {uri ? (
            <Image
              key={uri}
              source={{ uri }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Ionicons name="person" size={40} color="#aaa" />
            </View>
          )}
        </TouchableOpacity>
      </View>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C851"]}
          />
        }
      >
        {business ? (
          <>
            {/* Vue d'ensemble */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vue d&apos;Ensemble</Text>

              {analyticsLoading ? (
                <View style={styles.analyticsLoadingContainer}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.analyticsLoadingText}>
                    Chargement des statistiques...
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsRow}>
                  {/* CA Global */}
                  <View style={[styles.overviewCard, styles.cardYellow]}>
                    <View style={styles.cardIcon}>
                      <Image
                        source={require("@/assets/images/wallet-money.png")}
                        style={styles.cardEmoji}
                      />
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>CA Global</Text>
                      <Text style={styles.cardValue}>
                        {formatNumber(overallOverview?.totalSalesAmount)}{" "}
                        <Text style={styles.cardUnit}>KMF</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFull}>
                    <View style={[styles.overviewCard, styles.cardPurple]}>
                      <View style={styles.cardIcon}>
                        <Image
                          source={require("@/assets/images/bag-2.png")}
                          style={styles.cardEmojiDouble}
                        />
                      </View>
                      <View>
                        <Text style={styles.cardLabel}>
                          Commandes en attente
                        </Text>
                        <Text style={styles.cardValue}>
                          {pendingOrdersCount} client
                          {pendingOrdersCount > 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.overviewCard, styles.cardGreen]}>
                      <View style={styles.cardIcon}>
                        <Image
                          source={require("@/assets/images/money-recive.png")}
                          style={styles.cardEmojiDouble}
                        />
                      </View>
                      <View>
                        <Text style={styles.cardLabel}>Articles vendus</Text>
                        <Text style={styles.cardValue}>
                          {overallOverview?.totalSalesOrders || 0} article
                          {overallOverview?.totalSalesOrders > 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Accès rapide */}
            <AnalyticsCard id={business.id} />
          </>
        ) : (
          <View style={styles.noBusinessContainer}>
            <Ionicons name="business-outline" size={80} color="#E0E0E0" />
            <Text style={styles.noBusinessTitle}>
              Aucune entreprise sélectionnée
            </Text>
            <Text style={styles.noBusinessText}>
              Sélectionnez une entreprise pour voir vos statistiques
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingBottom: 50,
  },
  avatarContainer: {
    borderRadius: 30,
    overflow: "hidden",
    width: 36,
    height: 36,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },

  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
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
    width: "100%",
    height: "100%",
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
