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

import { useUserAvatar } from "@/hooks/useUserAvatar";
import { Business, BusinessesService } from "@/api";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { useBusinessStore } from "@/store/businessStore";

export interface DeliveryStats {
  pendingRequests: number;
  activeDeliveries: number;
  completedToday: number;
  distanceTodayKm: number;
  earningsToday: number;
}

const DeliveryHome: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { uri } = useUserAvatar();

  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const all = await BusinessesService.getBusinesses();
      setBusinesses(all);

      if (!business && all.length > 0) {
        const firstLivreur = all.find((b) => b.type === "LIVREUR") || all[0];
        setBusiness(firstLivreur);
        await BusinessesService.selectBusiness(firstLivreur);
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de charger vos données livreur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load stats on focus
  useFocusEffect(
    useCallback(() => {
      if (business?.id) {
        loadStats(business.id);
      }
    }, [business?.id])
  );

  // Fake stats (replace with API)
  const loadStats = async (businessId: string) => {
    if (statsLoading) return;
    setStatsLoading(true);

    try {
      setTimeout(() => {
        setStats({
          pendingRequests: 3,
          activeDeliveries: 1,
          completedToday: 5,
          distanceTodayKm: 42.5,
          earningsToday: 12500,
        });
        setStatsLoading(false);
      }, 300);
    } catch (e) {
      console.error(e);
      setStatsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (business?.id) await loadStats(business.id);
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
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("fr-FR").format(num);

  const totalAlerts =
    (stats?.pendingRequests || 0) + (stats?.activeDeliveries || 0);

  const toggleOnline = () => {
    setIsOnline((prev) => !prev);
  };

  // ============ HEADER ============
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

  // ============ OVERVIEW ============
  const renderOverview = () => {
    if (!business) return null;

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

    const pending = stats?.pendingRequests || 0;
    const active = stats?.activeDeliveries || 0;
    const done = stats?.completedToday || 0;
    const distance = stats?.distanceTodayKm || 0;
    const earnings = stats?.earningsToday || 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d&apos;ensemble</Text>

        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardYellow]}>
            <View style={styles.cardIcon}>
              <Ionicons name="bicycle-outline" size={28} color="#854d0e" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Demandes en attente</Text>
              <Text style={styles.cardValue}>{pending}</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={[styles.card, styles.cardPurple, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Ionicons name="time-outline" size={24} color="#4c1d95" />
              </View>
              <View>
                <Text style={styles.cardLabel}>En cours</Text>
                <Text style={styles.cardValue}>{active}</Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardGreen, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color="#166534"
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>
                  Terminées (aujourd&apos;hui)
                </Text>
                <Text style={styles.cardValue}>{done}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.cardsRow, { marginTop: 12 }]}>
          <View style={[styles.card, styles.cardBlue]}>
            <View style={styles.cardIcon}>
              <Ionicons name="navigate-outline" size={24} color="#1d4ed8" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Distance parcourue</Text>
              <Text style={styles.cardValue}>
                {distance.toFixed(1)} <Text style={styles.unit}>km</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.card, styles.cardOrange]}>
            <View style={styles.cardIcon}>
              <Ionicons name="wallet-outline" size={24} color="#c2410c" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Revenus estimés</Text>
              <Text style={styles.cardValue}>
                {formatNumber(earnings)} <Text style={styles.unit}>KMF</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ============ QUICK ACTIONS ============
  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(delivery)/tasks")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F3FF" }]}>
            <Ionicons name="list-outline" size={32} color="#2563eb" />
          </View>
          <Text style={styles.quickTitle}>Courses</Text>
          <Text style={styles.quickSubtitle}>
            Voir et gérer toutes les livraisons
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(delivery)/earnings")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#ECFDF3" }]}>
            <Ionicons name="cash-outline" size={32} color="#16a34a" />
          </View>
          <Text style={styles.quickTitle}>Revenus</Text>
          <Text style={styles.quickSubtitle}>
            Suivre tes gains et paiements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(delivery)/settings")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FFF7ED" }]}>
            <Ionicons name="settings-outline" size={32} color="#f97316" />
          </View>
          <Text style={styles.quickTitle}>Paramètres</Text>
          <Text style={styles.quickSubtitle}>Tarifs, zones et préférences</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============ MAIN ============
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.fullLoadingText}>
            Chargement du profil livreur...
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
            {renderQuickActions()}
          </>
        ) : (
          <View style={styles.noBusiness}>
            <Ionicons name="bicycle-outline" size={90} color="#E0E0E0" />
            <Text style={styles.noBusinessTitle}>
              Aucun profil livreur sélectionné
            </Text>
            <Text style={styles.noBusinessText}>
              Sélectionnez ou créez un profil de livraison pour commencer
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryHome;

// ====== STYLES ======
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
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "#111827" },
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

  // Sections
  section: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },

  // Cards
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
  cardGreen: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  cardBlue: { borderColor: "#60A5FA", backgroundColor: "#EFF6FF" },
  cardOrange: { borderColor: "#FB923C", backgroundColor: "#FFF7ED" },

  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 10, color: "#666" },
  cardValue: { fontSize: 20, fontWeight: "700", color: "#000" },
  unit: { fontSize: 14, color: "#666", fontWeight: "500" },

  // Quick actions
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

  // No business
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
