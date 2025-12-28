import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { Business, BusinessesService } from "@/api";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { AnalyticsOverview, getAnalyticsOverview } from "@/api/analytics";
import { getOrdersByRestaurant, Order } from "@/api/menu/ordersApi";
import { useBusinessStore } from "@/store/businessStore";
import RevenueDistributionChart from "@/components/Chart/RevenueDistributionChart";
import PopularDishesChart from "@/components/Chart/PopularDishesChart";
import ReservationsByPeriodChart from "@/components/Chart/ReservationsByPeriodChart";
import SalesByPeriodChart from "@/components/Chart/SalesByPeriodChart";
import ExpenseDistributionChart from "@/components/Chart/ExpenseDistributionChart";
import InventoryLossesChart from "@/components/Chart/InventoryLossesChart";

type PeriodType = "day" | "week" | "month" | "year" | "all" | "custom";

interface RestaurantSpecificStats {
  pendingOrders?: number;
  inPreparationOrders?: number;
  readyOrders?: number;
}

const RestaurantHome: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const { version } = useBusinessStore();
  const setBusiness = useBusinessStore((state) => state.setBusiness);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { uri } = useUserAvatar();

  // Stats générales (CA, etc.)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  // Stats spécifiques restaurant
  const [restaurantStats, setRestaurantStats] =
    useState<RestaurantSpecificStats | null>(null);

  const [statsLoading, setStatsLoading] = useState(false);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showStatsChart, setShowStatsChart] = useState(false);

  // Filtre de période
  const [period, setPeriod] = useState<PeriodType>("all");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Modale filtre
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  // Date pickers
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // --------------------------- INIT ---------------------------
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const all = await BusinessesService.getBusinesses();
      setBusinesses(all);

      if (!business && all.length > 0) {
        const firstLivreur =
          all.find((b) => b.type === "RESTAURATEUR") || all[0];
        setBusiness(firstLivreur);
        await BusinessesService.selectBusiness(firstLivreur);
      }
    } catch (e) {
      console.log(e);
      // Alert.alert("Erreur", "Impossible de charger vos données livreur.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadInitialData();
  }, []);

  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (!business?.type) return;
    if (hasRedirectedRef.current) return;

    const routes: Record<string, string> = {
      COMMERCANT: "/(professionnel)",
      RESTAURATEUR: "/(restaurants)",
      FOURNISSEUR: "/(fournisseur)",
      LIVREUR: "/(delivery)",
    };

    const targetRoute = routes[business.type];
    if (!targetRoute) return;

    hasRedirectedRef.current = true;
    setTimeout(() => {
      router.replace(targetRoute);
    }, 0);
  }, [business?.type]);

  // --------------------------- FILTRE PÉRIODE ---------------------------
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

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
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

  // --------------------------- CHARGEMENT STATS ---------------------------
  const loadStats = async (businessId: string) => {
    if (statsLoading || !businessId) return;

    try {
      setStatsLoading(true);

      const { startDate, endDate } = getPeriodDates();

      // 1. Stats générales (CA, etc.)
      const overviewData = await getAnalyticsOverview(
        businessId,
        period === "all" ? undefined : startDate,
        period === "all" ? undefined : endDate
      );

      // 2. Stats spécifiques restaurant (en attente, préparation, prêtes)
      let restaurantSpecific: RestaurantSpecificStats = {
        pendingOrders: 0,
        inPreparationOrders: 0,
        readyOrders: 0,
      };

      try {
        const response = await fetch(
          `https://dash.fortibtech.com/businesses/${businessId}/analytics/restaurant`,
          {
            headers: {
              Authorization: "Bearer " + /* ton token si besoin */ "",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          restaurantSpecific = {
            pendingOrders: data.pendingOrders || 0,
            inPreparationOrders: data.inPreparationOrders || 0,
            readyOrders: data.readyOrders || 0,
          };
        }
      } catch (e) {
        console.warn("Endpoint /analytics/restaurant non disponible :", e);
      }

      setOverview(overviewData);
      setRestaurantStats(restaurantSpecific);
    } catch (e) {
      console.error("Erreur chargement stats :", e);
    } finally {
      setStatsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (business?.id) {
        loadStats(business.id);
      }
    }, [business?.id, period, customStartDate, customEndDate])
  );

  const handleBusinessSelect = async (selected: Business) => {
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
      Alert.alert("Erreur", "Impossible de changer d'entreprise");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (business?.id) await loadStats(business.id);
    setRefreshing(false);
  };

  const loadOrders = async () => {
    if (!business?.id) return;
    try {
      setOrdersLoading(true);
      const res = await getOrdersByRestaurant(business.id);
      setOrders(res.data || []);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les commandes");
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrdersModal = async () => {
    await loadOrders();
    setOrdersModalVisible(true);
  };

  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { text: "Paiement en attente", color: "#F97316", bg: "#FFEDD5" };
      case "PENDING":
        return { text: "Nouvelle", color: "#EA580C", bg: "#FFF7C2" };
      case "CONFIRMED":
        return { text: "Confirmée", color: "#7C3AED", bg: "#EDE9FE" };
      case "PROCESSING":
        return { text: "En préparation", color: "#D97706", bg: "#FFFBEB" };
      case "DELIVERED":
        return { text: "Livrée", color: "#16A34A", bg: "#DCFCE7" };
      case "COMPLETED":
        return { text: "Terminée", color: "#059669", bg: "#D1FAE5" };
      case "CANCELLED":
        return { text: "Annulée", color: "#EF4444", bg: "#FECACA" };
      default:
        return { text: status, color: "#6B7280", bg: "#F3F4F6" };
    }
  };

  const formatNumber = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  // --------------------------- UI ---------------------------
  const pendingOrders = restaurantStats?.pendingOrders || 0;
  const inPreparation = restaurantStats?.inPreparationOrders || 0;
  const readyOrders = restaurantStats?.readyOrders || 0;
  const totalAlerts = pendingOrders + inPreparation;

  const renderHeader = () => (
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
        {totalAlerts > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>
              {totalAlerts > 99 ? "99+" : totalAlerts}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => router.push("/fournisseurSetting")}
        >
          {uri ? (
            <Image key={uri} source={{ uri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Ionicons name="person" size={40} color="#aaa" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOverview = () => {
    if (!business) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vue d&apos;ensemble</Text>
          <TouchableOpacity onPress={openModal} style={styles.filterIcon}>
            <Ionicons name="calendar-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Ligne du haut : CA + colonne droite (En attente + En préparation) */}
        <View style={styles.cardsRow}>
          {/* Carte CA principale */}
          <View style={[styles.card, styles.cardYellow]}>
            <View style={styles.cardIcon}>
              <Image
                source={require("../../assets/images/wallet-money.png")}
                style={styles.emoji}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>CA {getPeriodLabel()}</Text>
              <Text
                style={styles.cardValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatNumber(overview?.totalSalesAmount || 0)}{" "}
                <Text style={styles.unit}>KMF</Text>
              </Text>
            </View>
          </View>

          {/* Colonne droite : deux petites cartes */}
          <View style={styles.rightColumn}>
            <View style={[styles.card, styles.cardPurple, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("../../assets/images/logo/bag-2.png")}
                  style={styles.emojiSmall}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>En attente</Text>
                <Text style={styles.cardValue} numberOfLines={1}>
                  {pendingOrders}
                </Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardOrange, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("../../assets/images/logo/cooking-pot.png")}
                  style={styles.emojiSmall}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>En préparation</Text>
                <Text style={styles.cardValue} numberOfLines={1}>
                  {inPreparation}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Carte pleine largeur : Prêtes à servir */}
        <View style={[styles.card, styles.cardGreen, { marginTop: 16 }]}>
          <View style={styles.cardIcon}>
            <Image
              source={require("../../assets/images/logo/food-tray.png.png")}
              style={styles.emoji}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Prêtes à servir</Text>
            <Text style={styles.cardValue} numberOfLines={1}>
              {readyOrders} commande{readyOrders > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Boutons */}
        <TouchableOpacity style={styles.ordersButton} onPress={openOrdersModal}>
          <Ionicons name="receipt" size={20} color="#7C3AED" />
          <Text style={styles.ordersButtonText}>
            Voir les {totalAlerts > 0 ? `${totalAlerts} ` : ""}commandes en
            cours
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#7C3AED" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => router.push("/(carriers)/")}
        >
          <Ionicons name="pricetag" size={20} color="#6366F1" />
          <Text style={styles.statsButtonText}>Tarifs des livreurs</Text>
          <Ionicons name="chevron-forward" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickCard} onPress={openOrdersModal}>
          <View style={[styles.quickIcon, { backgroundColor: "#FFF4E5" }]}>
            <Ionicons name="receipt-outline" size={32} color="#FF9500" />
          </View>
          <Text style={styles.quickTitle}>Commandes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/menus")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F9FF" }]}>
            <Ionicons name="restaurant-outline" size={32} color="#00A8E8" />
          </View>
          <Text style={styles.quickTitle}>Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/tables")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#F0E5FF" }]}>
            <Ionicons name="grid-outline" size={32} color="#7C3AED" />
          </View>
          <Text style={styles.quickTitle}>Tables</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.fullLoadingText}>
            Chargement du restaurant...
          </Text>
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
            {renderOverview()}
            <View style={styles.section}>
              <PopularDishesChart
                businessId={business.id}
                currencyId={business.currencyId}
              />
              <ReservationsByPeriodChart businessId={business.id} />
              <SalesByPeriodChart
                businessId={business.id}
                currencyId={business.currencyId}
              />
              <ExpenseDistributionChart
                businessId={business.id}
                currencyId={business.currencyId}
              />
              <RevenueDistributionChart
                businessId={business.id}
                currencyId={business.currencyId}
              />

              <InventoryLossesChart
                businessId={business.id}
                currencyId={business.currencyId}
              />
            </View>
            {/* {renderQuickActions()} */}
          </>
        ) : (
          <View style={styles.noBusiness}>
            <Ionicons name="restaurant-outline" size={90} color="#E0E0E0" />
            <Text style={styles.noBusinessTitle}>
              Aucun restaurant sélectionné
            </Text>
            <Text style={styles.noBusinessText}>
              Sélectionnez ou créez un restaurant pour commencer
            </Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL COMMANDES */}
      <Modal visible={ordersModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setOrdersModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Commandes en cours</Text>
              <View style={{ width: 28 }} />
            </View>

            {ordersLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color="#7C3AED" />
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Ionicons name="receipt-outline" size={80} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>Aucune commande active</Text>
              </View>
            ) : (
              <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                renderItem={({ item }) => {
                  const status = getStatusStyle(item.status);
                  return (
                    <Pressable
                      style={styles.orderCard}
                      onPress={() => {
                        setOrdersModalVisible(false);
                        router.push({
                          pathname: "/pro-order-details/[id]",
                          params: { id: item.id },
                        });
                      }}
                    >
                      <View style={styles.orderCardHeader}>
                        <Text style={styles.orderCardNumber}>
                          #{item.orderNumber}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: status.bg },
                          ]}
                        >
                          <Text
                            style={[styles.statusText, { color: status.color }]}
                          >
                            {status.text}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* MODAL STATS GRAPHIQUES */}
      <Modal visible={showStatsChart} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.closeChart}
            onPress={() => setShowStatsChart(false)}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          {business && (
            <RevenueDistributionChart
              businessId={business.id}
              currencyId={business.currencyId}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* MODALE FILTRE PÉRIODE - CORRIGÉE POUR ÊTRE COLLÉE AU BAS */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlayFull}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.modalContentBottom,
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
                  <Ionicons name="checkmark" size={22} color="#7C3AED" />
                )}
                {item.value === "custom" && (
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </Modal>

      {/* DATE PICKERS */}
      {showStartPicker && (
        <DateTimePicker
          value={customStartDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) {
              setCustomStartDate(date);
              setShowEndPicker(true);
            }
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={customEndDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={customStartDate || undefined}
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) {
              setCustomEndDate(date);
              setPeriod("custom");
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },

  rightColumn: {
    flex: 1,
    gap: 16,
    minWidth: 0, // crucial pour le shrink
  },

  card: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // remplace justifyContent: "space-between"
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  smallCard: {
    minHeight: 100,
  },

  cardIcon: {
    // plus de marginRight, on utilise gap dans card
  },

  cardContent: {
    flex: 1, // prend tout l'espace restant
    minWidth: 0, // autorise le rétrécissement
  },

  emoji: {
    width: 48,
    height: 48,
  },

  emojiSmall: {
    width: 36, // un peu réduit pour gagner de la place
    height: 36,
  },

  cardLabel: {
    fontSize: 14, // augmenté un peu pour lisibilité (était 9 → trop petit !)
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },

  cardValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    flexShrink: 1,
  },

  unit: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },

  cardYellow: {
    flex: 1.1, // la carte CA prend plus de place (équilibre visuel)
    borderWidth: 1,
    borderColor: "#FCD34D20",
    backgroundColor: "#FEF3C7",
  },

  cardPurple: {
    borderWidth: 1,
    borderColor: "#A78BFA20",
    backgroundColor: "#F9FAFB",
  },

  cardOrange: {
    borderWidth: 1,
    borderColor: "#FDBA7420",
    backgroundColor: "#FEF3C7",
  },

  cardGreen: {
    borderWidth: 1,
    borderColor: "#10B98120",
    backgroundColor: "#F0FDF4",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
    paddingBottom: 60,
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: { padding: 8, position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
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
  avatar: {
    width: "100%",
    height: "100%",
  },
  section: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  filterIcon: { padding: 8 },

  ordersButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  ordersButtonText: { fontSize: 16, fontWeight: "600", color: "#7C3AED" },
  statsButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
  },
  quickRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  quickCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
  },
  quickIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  noBusiness: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noBusinessTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#111827",
  },
  noBusinessText: { fontSize: 15, color: "#6B7280", textAlign: "center" },
  fullLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  fullLoadingText: { marginTop: 16, fontSize: 16, color: "#6B7280" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalOverlayFull: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyOrders: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: { marginTop: 16, fontSize: 18, color: "#6B7280" },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  orderCardHeader: { flex: 1 },
  orderCardNumber: { fontSize: 18, fontWeight: "800", color: "#111827" },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  statusText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  closeChart: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // MODALE FILTRE CORRIGÉE
  modalContentBottom: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 34, // Safe area bas d'écran
    width: "100%",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#DDD",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
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
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#7C3AED",
  },
  periodText: {
    fontSize: 16,
    color: "#333",
  },
  periodTextSelected: {
    fontWeight: "600",
    color: "#7C3AED",
  },
});

export default RestaurantHome;
