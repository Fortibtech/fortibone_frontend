import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Business, BusinessesService } from "@/api";
import {
  AnalyticsOverview,
  getAnalyticsOverview,
  getPendingOrdersCount,
  getProcessingPurchasesCount,
} from "@/api/analytics";
import { useUserStore } from "@/store/userStore";
import BusinessSelector from "@/components/Business/BusinessSelector";
import AnalyticsCard from "@/components/accueil/AnalyticsCard";
import { useBusinessStore } from "@/store/businessStore";

const HomePage: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const { userProfile } = useUserStore();
  const setBusiness = useBusinessStore((state) => state.setBusiness);
  const { version } = useBusinessStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics states
  const [overallOverview, setOverallOverview] =
    useState<AnalyticsOverview | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [processingPurchases, setProcessingPurchases] = useState<{
    count: number;
    totalItems: number;
  }>({ count: 0, totalItems: 0 });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Gestion de la période
  type PeriodType = "day" | "week" | "month" | "year" | "all" | "custom";
  const [period, setPeriod] = useState<PeriodType>("all");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Modale principale (filtre)
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Date picker
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Refs
  const analyticsLoadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const selectPeriod = (newPeriod: PeriodType) => {
    if (newPeriod === "custom") {
      setShowStartPicker(true);
      closeModal();
      return;
    }
    setPeriod(newPeriod);
    setCustomStartDate(null);
    setCustomEndDate(null);
    closeModal();
  };

  const formatDateFR = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long", // vendredi
      day: "numeric", // 24
      month: "long", // décembre
      year: "numeric", // 2025
    };

    let formatted = new Intl.DateTimeFormat("fr-FR", options).format(date);

    // Met la première lettre en majuscule → "Vendredi 24 décembre 2025"
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const getPeriodLabel = useCallback(() => {
    if (period === "custom" && customStartDate && customEndDate) {
      return `du ${formatDateFR(customStartDate)} au ${formatDateFR(
        customEndDate
      )}`;
    }
    switch (period) {
      case "day":
        return "du jour";
      case "week":
        return "de la semaine";
      case "month":
        return "du mois";
      case "year":
        return "de l'année";
      case "all":
        return "Global";
      default:
        return "Global";
    }
  }, [period, customStartDate, customEndDate]);

  // Calcul des dates selon la période
  const getPeriodDates = useCallback(() => {
    if (period === "custom" && customStartDate && customEndDate) {
      return {
        startDate: customStartDate.toISOString().split("T")[0],
        endDate: customEndDate.toISOString().split("T")[0],
      };
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    let startDate: string | undefined;
    let endDate: string | undefined = today;

    if (period === "day") {
      startDate = today;
    } else if (period === "week") {
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startDate = startOfWeek.toISOString().split("T")[0];
    } else if (period === "month") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    } else if (period === "year") {
      const year = now.getFullYear();
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    return { startDate, endDate };
  }, [period, customStartDate, customEndDate]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const all = await BusinessesService.getBusinesses();

      if (!mountedRef.current) return;

      setBusinesses(all);

      if (!business && all.length > 0) {
        const first = all[0];
        setBusiness(first);
        await BusinessesService.selectBusiness(first);
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error("Erreur chargement entreprises:", error);
        Alert.alert("Erreur", "Impossible de charger les entreprises");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [business, setBusiness]);

  const loadAnalytics = useCallback(async () => {
    if (!business?.id || analyticsLoadingRef.current) return;

    try {
      analyticsLoadingRef.current = true;
      setAnalyticsLoading(true);

      const { startDate, endDate } = getPeriodDates();

      const overviewPromise =
        period === "all"
          ? getAnalyticsOverview(business.id)
          : getAnalyticsOverview(business.id, startDate, endDate);

      const [overview, pendingCount, purchases] = await Promise.all([
        overviewPromise,
        getPendingOrdersCount(business.id, "SALE"),
        getProcessingPurchasesCount(business.id),
      ]);

      if (!mountedRef.current) return;

      setOverallOverview(overview);
      setPendingOrdersCount(pendingCount);
      setProcessingPurchases(purchases);
    } catch (error) {
      if (mountedRef.current) {
        console.error("Erreur analytics:", error);
        Alert.alert("Erreur", "Impossible de charger les statistiques");
      }
    } finally {
      if (mountedRef.current) {
        analyticsLoadingRef.current = false;
        setAnalyticsLoading(false);
      }
    }
  }, [business?.id, period, getPeriodDates]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (!business?.type || hasRedirectedRef.current) return;

    const routes: Record<string, string> = {
      COMMERCANT: "/(professionnel)",
      RESTAURATEUR: "/(restaurants)",
      FOURNISSEUR: "/(fournisseur)",
      LIVREUR: "/(delivery)",
    };

    const targetRoute = routes[business.type];
    if (targetRoute) {
      hasRedirectedRef.current = true;
      setTimeout(() => {
        router.replace(targetRoute);
      }, 0);
    }
  }, [business?.type]);

  useFocusEffect(
    useCallback(() => {
      if (business?.id) {
        loadAnalytics();
      }
    }, [business?.id, loadAnalytics])
  );

  useEffect(() => {
    if (business?.id) {
      loadAnalytics();
    }
  }, [period, customStartDate, customEndDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    if (business?.id) {
      await loadAnalytics();
    }
    setRefreshing(false);
  }, [loadInitialData, loadAnalytics, business?.id]);

  const handleBusinessSelect = useCallback(
    async (selected: Business) => {
      try {
        await BusinessesService.selectBusiness(selected);
        setBusiness(selected);
        setPeriod("all");
        setCustomStartDate(null);
        setCustomEndDate(null);
        Alert.alert("Succès", `"${selected.name}" sélectionné`);

        setTimeout(() => {
          const routes: Record<string, string> = {
            COMMERCANT: "/(professionnel)",
            RESTAURATEUR: "/(restaurants)",
            FOURNISSEUR: "/(fournisseur)",
            LIVREUR: "/(delivery)",
          };
          const target = routes[selected.type];
          if (target) router.replace(target);
        }, 100);
      } catch (error) {
        console.error("Erreur changement entreprise:", error);
        Alert.alert("Erreur", "Impossible de changer d'entreprise");
      }
    },
    [setBusiness]
  );

  const formatNumber = useCallback((num: number = 0): string => {
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
      num
    );
  }, []);

  const totalAlerts = useMemo(() => pendingOrdersCount, [pendingOrdersCount]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <BusinessSelector
          businesses={businesses}
          selectedBusiness={business}
          onBusinessSelect={handleBusinessSelect}
          loading={loading}
          onAddBusiness={() => router.push("/(create-business)/")}
          onManageBusiness={() => router.push("/pro/ManageBusinessesScreen")}
          refreshKey={version}
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
            {userProfile?.profileImageUrl ? (
              <Image
                source={{ uri: userProfile.profileImageUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color="#666" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      businesses,
      business,
      handleBusinessSelect,
      loading,
      totalAlerts,
      userProfile,
    ]
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
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vue d&apos;Ensemble</Text>
                <TouchableOpacity onPress={openModal} style={styles.filterIcon}>
                  <Ionicons name="calendar-outline" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {analyticsLoading ? (
                <View style={styles.analyticsLoadingContainer}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.analyticsLoadingText}>
                    Chargement des statistiques...
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsRow}>
                  <View style={[styles.overviewCard, styles.cardYellow]}>
                    <View style={styles.cardIcon}>
                      <Image
                        source={require("@/assets/images/wallet-money.png")}
                        style={styles.cardEmoji}
                      />
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>
                        CA {getPeriodLabel()}
                      </Text>
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
                          {(overallOverview?.totalSalesOrders || 0) > 1
                            ? "s"
                            : ""}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>

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

      {/* Modale principale */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Période des statistiques</Text>
            {[
              { label: "Aujourd'hui", value: "day" },
              { label: "Cette semaine", value: "week" },
              { label: "Ce mois", value: "month" },
              { label: "Cette année", value: "year" },
              { label: "Tout le temps", value: "all" },
              { label: "Période personnalisée", value: "custom" },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.periodItem,
                  period === item.value &&
                    item.value !== "custom" &&
                    styles.periodItemSelected,
                ]}
                onPress={() => selectPeriod(item.value as PeriodType)}
              >
                <Text
                  style={[
                    styles.periodText,
                    period === item.value &&
                      item.value !== "custom" &&
                      styles.periodTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {period === item.value && item.value !== "custom" && (
                  <Ionicons name="checkmark" size={22} color="#00C851" />
                )}
                {item.value === "custom" && (
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>

      {/* Date Picker pour date de début */}
      {showStartPicker && (
        <DateTimePicker
          value={customStartDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setCustomStartDate(selectedDate);
              setShowEndPicker(true); // Ouvre automatiquement le picker de fin
            }
          }}
        />
      )}

      {/* Date Picker pour date de fin */}
      {showEndPicker && (
        <DateTimePicker
          value={customEndDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={customStartDate || undefined}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setCustomEndDate(selectedDate);
              setPeriod("custom");
            }
          }}
        />
      )}
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
  avatarImage: {
    width: "100%",
    height: "100%",
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  filterIcon: {
    padding: 8,
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
    justifyContent: "space-between",
  },
  cardFull: {
    width: "50%",
  },
  cardYellow: {
    backgroundColor: "#F1E9C7FF",
    borderWidth: 2,
    borderColor: "#FACC15",
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
  cardIcon: {},
  cardEmoji: {
    width: 42,
    height: 42,
  },
  cardEmojiDouble: {
    width: 24,
    height: 24,
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
  // Styles modale native
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#DDD",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  periodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 10,
  },
  periodItemSelected: {
    backgroundColor: "#E3FCEF",
    borderWidth: 1,
    borderColor: "#00C851",
  },
  periodText: {
    fontSize: 16,
    color: "#333",
  },
  periodTextSelected: {
    fontWeight: "600",
    color: "#00C851",
  },
});

export default HomePage;
