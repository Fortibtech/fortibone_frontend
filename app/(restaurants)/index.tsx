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
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { useUserAvatar } from "@/hooks/useUserAvatar";
import { Business, BusinessesService, SelectedBusinessManager } from "@/api";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { getStatRestaurant, RestaurantStats } from "@/api/menu/tableApi";
import { getOrdersByRestaurant, Order } from "@/api/menu/ordersApi";

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

  // États pour la modale des commandes
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

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
    } catch (e) {
      Alert.alert("Erreur", "Impossible de charger vos restaurants.");
    } finally {
      setLoading(false);
    }
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
          case "LIVREUR":
            router.push("/(delivery)");
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
  const loadStats = async (businessId: string) => {
    if (statsLoading) return;
    try {
      setStatsLoading(true);
      const data = await getStatRestaurant(businessId);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (selectedBusiness) await loadStats(selectedBusiness.id);
    setRefreshing(false);
  };

  // === CHARGEMENT DES COMMANDES EN COURS ===
  const loadOrders = async () => {
    if (!selectedBusiness) return;
    try {
      setOrdersLoading(true);
      const response = await getOrdersByRestaurant(selectedBusiness.id);
      setOrders(response.data);
    } catch (err: any) {
      Alert.alert("Erreur", "Impossible de charger les commandes");
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrdersModal = async () => {
    await loadOrders();
    setOrdersModalVisible(true);
  };

  // === STYLE SELON STATUT DE COMMANDE ===
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
      // case "READY":
      //   return { text: "Prête", color: "#059669", bg: "#D1FAE5" };
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

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("fr-FR").format(num);

  const pendingOrders = stats?.pendingOrders || 0;
  const inPreparation = stats?.inPreparationOrders || 0;
  const readyOrders = stats?.readyOrders || 0;
  const totalAlerts = pendingOrders + inPreparation;

  // === HEADER ===
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
              key={uri} // Force le rechargement même ici
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

  // === CARTE COMMANDE DANS LA MODALE ===
  const renderOrderCard = ({ item }: { item: Order }) => {
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
          <Text style={styles.orderCardNumber}>#{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>
        <View style={styles.orderCardBody}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValue}>
              {Number(item.totalAmount).toLocaleString("fr-FR")} KMF
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {item.notes && (
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color="#C9C9C9" />
      </Pressable>
    );
  };

  // === MODALE DES COMMANDES ===
  const OrdersModal = () => (
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
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );

  // === VUE D'ENSEMBLE ===
  const renderOverview = () => {
    if (!selectedBusiness) return null;

    if (statsLoading && !stats) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d&apos;ensemble</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>
              Chargement des statistiques...
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d&apos;ensemble</Text>

        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardYellow]}>
            <View style={styles.cardIcon}>
              <Image
                source={require("@/assets/images/wallet-money.png")}
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

        {/* Bouton pour ouvrir la liste des commandes */}
        <TouchableOpacity style={styles.ordersButton} onPress={openOrdersModal}>
          <Ionicons name="receipt" size={20} color="#7C3AED" />
          <Text style={styles.ordersButtonText}>
            Voir les {totalAlerts > 0 ? `${totalAlerts} ` : ""}commandes en
            cours
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#7C3AED" />
        </TouchableOpacity>
      </View>
    );
  };

  // === ACCÈS RAPIDE ===
  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickCard} onPress={openOrdersModal}>
          <View style={[styles.quickIcon, { backgroundColor: "#FFF4E5" }]}>
            <Ionicons name="receipt-outline" size={32} color="#FF9500" />
          </View>
          <Text style={styles.quickTitle}>Commandes</Text>
          <Text style={styles.quickSubtitle}>Voir toutes les commandes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/menus")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F9FF" }]}>
            <Ionicons name="restaurant-outline" size={32} color="#00A8E8" />
          </View>
          <Text style={styles.quickTitle}>Menu</Text>
          <Text style={styles.quickSubtitle}>Gérer les plats & catégories</Text>
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
          <Text style={styles.quickSubtitle}>Plan de salle & QR codes</Text>
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
        {selectedBusiness ? (
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

      <OrdersModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingBottom: 60 },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
  avatarPlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  section: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },

  cardsRow: { flexDirection: "row", gap: 12 },
  rightColumn: { flex: 1, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
  },
  smallCard: { minHeight: 90 },
  cardYellow: { borderColor: "#FACC15", backgroundColor: "#FFFBEB" },
  cardPurple: { borderColor: "#8B5CF6", backgroundColor: "#F3E8FF" },
  cardOrange: { borderColor: "#FB923C", backgroundColor: "#FFF7ED" },
  cardGreen: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  cardIcon: { marginRight: 12 },
  emoji: { width: 44, height: 44 },
  emojiSmall: { width: 28, height: 28 },
  cardLabel: { fontSize: 13, color: "#666" },
  cardValue: { fontSize: 20, fontWeight: "700", color: "#000" },
  unit: { fontSize: 14, color: "#666", fontWeight: "500" },

  ordersButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  ordersButtonText: { fontSize: 16, fontWeight: "600", color: "#7C3AED" },

  quickRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minHeight: 130,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  quickSubtitle: { fontSize: 12, color: "#888", textAlign: "center" },

  noBusiness: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noBusinessTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  noBusinessText: { fontSize: 14, color: "#888", textAlign: "center" },

  loadingContainer: { alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 12, color: "#888" },
  fullLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  fullLoadingText: { marginTop: 16, fontSize: 16, color: "#666" },

  // Styles de la modale et des cartes commandes
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyOrders: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: { marginTop: 16, fontSize: 18, color: "#888" },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  orderCardHeader: { flex: 1 },
  orderCardNumber: { fontSize: 17, fontWeight: "800", color: "#111" },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  orderCardBody: { flex: 1, marginTop: 10 },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: { fontSize: 14, color: "#666" },
  amountValue: { fontSize: 19, fontWeight: "900", color: "#7C3AED" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  dateText: { fontSize: 14, color: "#888" },
  notesText: { fontSize: 14, color: "#666", marginTop: 8, fontStyle: "italic" },
});

export default RestaurantHome;
