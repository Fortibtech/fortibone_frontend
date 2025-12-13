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
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { Business, BusinessesService } from "@/api";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { getStatRestaurant, RestaurantStats } from "@/api/menu/tableApi";
import { getOrdersByRestaurant, Order } from "@/api/menu/ordersApi";
import { useBusinessStore } from "@/store/businessStore";
import RevenueDistributionChart from "@/components/Chart/RevenueDistributionChart";

const RestaurantHome: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { uri } = useUserAvatar();
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showStatsChart, setShowStatsChart] = useState(false);

  // --------------------------- INIT ---------------------------

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const all = await BusinessesService.getBusinesses();
      setBusinesses(all);

      if (!business && all.length > 0) {
        setBusiness(all[0]);
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de charger vos commerces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (business?.id) loadStats(business.id);
    }, [business?.id])
  );

  const loadStats = async (businessId: string) => {
    if (statsLoading) return;
    try {
      setStatsLoading(true);
      const data = await getStatRestaurant(businessId);
      setStats(data);
    } catch (e) {
      console.error("Erreur stats:", e);
    } finally {
      setStatsLoading(false);
    }
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

  const pendingOrders = stats?.pendingOrders || 0;
  const inPreparation = stats?.inPreparationOrders || 0;
  const readyOrders = stats?.readyOrders || 0;
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
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>

        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardYellow]}>
            <View style={styles.cardIcon}>
              <Image
                source={require("../../assets/images/wallet-money.png")}
                style={styles.emoji}
              />
            </View>
            <View>
              <Text style={styles.cardLabel}>CA du mois</Text>
              <Text style={styles.cardValue}>
                {formatNumber(stats?.monthlyRevenue || 0)}{" "}
                <Text style={styles.unit}>KMF</Text>
              </Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={[styles.card, styles.cardPurple, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("../../assets/images/logo/bag-2.png")}
                  style={styles.emojiSmall}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>En attente</Text>
                <Text style={styles.cardValue}>{pendingOrders}</Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardOrange, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("../../assets/images/logo/cooking-pot.png")}
                  style={styles.emojiSmall}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>En préparation</Text>
                <Text style={styles.cardValue}>{inPreparation}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.cardGreen, { marginTop: 12 }]}>
          <View style={styles.cardIcon}>
            <Image
              source={require("../../assets/images/logo/food-tray.png.png")}
              style={styles.emoji}
            />
          </View>
          <View>
            <Text style={styles.cardLabel}>Prêtes à servir</Text>
            <Text style={styles.cardValue}>
              {readyOrders} commande{readyOrders > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.ordersButton} onPress={openOrdersModal}>
          <Ionicons name="receipt" size={20} color="#7C3AED" />
          <Text style={styles.ordersButtonText}>
            Voir les {totalAlerts > 0 ? `${totalAlerts} ` : ""}commandes en
            cours
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#7C3AED" />
        </TouchableOpacity>

        {/* Nouveau bouton Stats graphiques */}
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => setShowStatsChart(true)}
        >
          <Ionicons name="bar-chart" size={20} color="#6366F1" />
          <Text style={styles.statsButtonText}>Statistiques graphiques</Text>
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

  // --------------------------- LOADING ---------------------------

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

  // --------------------------- MAIN RETURN ---------------------------

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
            {renderQuickActions()}
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

      {/* ----------------------- MODAL COMMANDES ----------------------- */}

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
                        router.push(`/order-details/${item.id}`);
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

      {/* ----------------------- MODAL STATS GRAPHIQUES ----------------------- */}
      <Modal visible={showStatsChart} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.closeChart}
            onPress={() => setShowStatsChart(false)}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          {business && <RevenueDistributionChart businessId={business.id} />}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default RestaurantHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
    paddingBottom: 60,
  },

  // Header modernisé
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },

  cardsRow: { flexDirection: "row", gap: 16 },
  rightColumn: { flex: 1, gap: 16 },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  smallCard: { minHeight: 100 },
  cardYellow: {
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
  cardIcon: { marginRight: 16 },
  emoji: { width: 48, height: 48 },
  emojiSmall: { width: 32, height: 32 },
  cardLabel: { fontSize: 9, color: "#6B7280", fontWeight: "500" },
  cardValue: { fontSize: 24, fontWeight: "800", color: "#111827" },
  unit: { fontSize: 16, color: "#6B7280", fontWeight: "600" },

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

  // Nouveau bouton stats
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

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
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

  // Close button pour le chart modal
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
});
