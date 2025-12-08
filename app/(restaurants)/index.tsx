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

import { Business, BusinessesService, SelectedBusinessManager } from "@/api";
import { getStatRestaurant, RestaurantStats } from "@/api/restaurant";
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
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger vos restaurants.");
    } finally {
      setLoading(false);
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

  const handleBusinessSelect = async (business: Business) => {
    try {
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
      Alert.alert("Succès", `${business.name} sélectionné`);

      setTimeout(() => {
        switch (business.type) {
          case "COMMERCANT":
            router.replace("/(professionnel)");
            break;
          case "RESTAURATEUR":
            router.replace("/(restaurants)");
            break;
          case "FOURNISSEUR":
            router.replace("/(fournisseur)");
            break;
          case "LIVREUR":
            router.replace("/(livreur)");
            break;
        }
      }, 100);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de changer de restaurant");
    }
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("fr-FR").format(num);

  const pendingOrders = stats?.pendingOrders || 0;
  const inPreparation = stats?.inPreparationOrders || 0;
  const readyOrders = stats?.readyOrders || 0;

  const totalAlerts = pendingOrders + inPreparation;

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
          onPress={() => router.push("/restaurant/settings")}
        >
          {uri ? (
            <Image source={{ uri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#999" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
          {/* CA Mensuel */}
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
            {/* Commandes en attente */}
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

            {/* En préparation */}
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

        {/* Prêtes à servir */}
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
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/orders")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FFF4E5" }]}>
            <Ionicons name="receipt-outline" size={32} color="#FF9500" />
          </View>
          <Text style={styles.quickTitle}>Commandes</Text>
          <Text style={styles.quickSubtitle}>Voir toutes les commandes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/menu")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F9FF" }]}>
            <Ionicons name="restaurant-outline" size={32} color="#00A8E8" />
          </View>
          <Text style={styles.quickTitle}>Menu</Text>
          <Text style={styles.quickSubtitle}>Gérer les plats & catégories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/kitchen")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5FFE7" }]}>
            <Ionicons name="flame-outline" size={32} color="#00C851" />
          </View>
          <Text style={styles.quickTitle}>Cuisine</Text>
          <Text style={styles.quickSubtitle}>Écran de préparation</Text>
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

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/opening-hours")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FFF0F4" }]}>
            <Ionicons name="time-outline" size={32} color="#EC4899" />
          </View>
          <Text style={styles.quickTitle}>Horaires</Text>
          <Text style={styles.quickSubtitle}>Ouverture & fermeture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/stats")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F3FF" }]}>
            <Ionicons name="bar-chart-outline" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.quickTitle}>Statistiques</Text>
          <Text style={styles.quickSubtitle}>Plats populaires, CA, etc.</Text>
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
    borderRadius: 20,
    overflow: "hidden",
    width: 40,
    height: 40,
  },
  avatar: { width: "100%", height: "100%" },
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
});

export default RestaurantHome;
