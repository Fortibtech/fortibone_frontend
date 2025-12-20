import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  DashboardData,
  getFilteredDashboard,
  updateDeliveryStatus,
} from "@/api/delivery/deliveryApi";

import Toast from "react-native-toast-message";

const DeliveryHome: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);
  const { version } = useBusinessStore();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false); // Pour le loading du switch
  const { uri } = useUserAvatar();

  const hasRedirectedRef = useRef(false);

  // === CHARGEMENT INITIAL DES ENTREPRISES ===
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

  // === REDIRECTION SELON LE TYPE D'ENTREPRISE ===
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
      setTimeout(() => router.replace(targetRoute), 0);
    }
  }, [business?.type]);

  // === CHARGEMENT DU DASHBOARD ===
  const loadDashboard = async (businessId: string) => {
    try {
      const data = await getFilteredDashboard(businessId);
      setDashboard(data);
    } catch (error) {
      console.error("Erreur dashboard :", error);
      Alert.alert("Erreur", "Impossible de charger les statistiques.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (business?.id) {
        loadDashboard(business.id);
      }
    }, [business?.id])
  );

  // === PULL TO REFRESH ===
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (business?.id) await loadDashboard(business.id);
    setRefreshing(false);
  };

  // === CHANGEMENT D'ENTREPRISE ===
  const handleBusinessSelect = async (selected: Business) => {
    try {
      await BusinessesService.selectBusiness(selected);
      setBusiness(selected);
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

  // === FORMATAGE DES NOMBRES ===
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("fr-FR").format(num);

  // === CALCUL DES ALERTES ===
  const totalAlerts =
    (dashboard?.pendingRequests || 0) + (dashboard?.activeDeliveries || 0);

  // === TOGGLE STATUT EN LIGNE (avec appel API réel) ===
  const toggleOnlineStatus = async () => {
    if (!business?.id || !dashboard || updatingStatus) return;

    const newStatus = !dashboard.isOnline;
    setUpdatingStatus(true);

    try {
      await updateDeliveryStatus(business.id, { isOnline: newStatus });

      // Mise à jour locale optimiste
      setDashboard((prev) => (prev ? { ...prev, isOnline: newStatus } : null));

      Toast.show({
        type: "success",
        text1: "Statut mis à jour",
        text2: newStatus
          ? "Vous êtes maintenant en ligne"
          : "Vous êtes hors ligne",
      });
    } catch (error) {
      console.error("❌ Erreur lors du changement de statut :", error);
      Alert.alert(
        "Erreur",
        "Impossible de changer votre statut. Réessayez plus tard."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };
  console.log("XXXXXXXXXXXXXX", businesses);

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

  // ============ STATUT EN LIGNE ============
  const renderOnlineStatus = () => {
    if (!dashboard) return null;

    return (
      <View style={styles.onlineSection}>
        <View style={styles.onlineCard}>
          <View style={styles.onlineLeft}>
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: dashboard.isOnline ? "#10B981" : "#EF4444" },
              ]}
            />
            <Text style={styles.onlineText}>
              {dashboard.isOnline ? "En ligne" : "Hors ligne"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.toggleSwitch, dashboard.isOnline && styles.toggleOn]}
            onPress={toggleOnlineStatus}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View
                style={[
                  styles.toggleKnob,
                  dashboard.isOnline && styles.toggleKnobOn,
                ]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============ VUE D'ENSEMBLE ============
  const renderOverview = () => {
    if (!dashboard) {
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
              <Ionicons name="bicycle" size={32} color="#854d0e" />
            </View>
            <View>
              <Text style={styles.cardLabel}>Livraisons actives</Text>
              <Text style={styles.cardValue}>{dashboard.activeDeliveries}</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={[styles.card, styles.cardPurple, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Ionicons name="time-outline" size={24} color="#4c1d95" />
              </View>
              <View>
                <Text style={styles.cardLabel}> Demandes en{"\n"} attente</Text>
                <Text style={styles.cardValue}>
                  {dashboard.pendingRequests}
                </Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardGreen, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Ionicons name="checkmark-done" size={24} color="#166534" />
              </View>
              <View>
                <Text style={styles.cardLabel}>Total livraisons</Text>
                <Text style={styles.cardValue}>
                  {formatNumber(dashboard.totalDeliveries)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ============ ACCÈS RAPIDE ============
  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(delivery)/tasks")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F3FF" }]}>
            <Ionicons name="list" size={32} color="#2563eb" />
          </View>
          <Text style={styles.quickTitle}>Mes courses</Text>
          <Text style={styles.quickSubtitle}>Voir toutes les livraisons</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(delivery)/earnings")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#ECFDF3" }]}>
            <Ionicons name="cash" size={32} color="#16a34a" />
          </View>
          <Text style={styles.quickTitle}>Revenus</Text>
          <Text style={styles.quickSubtitle}>Suivi des gains</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(delivery)/vehicles")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FFF7ED" }]}>
            <Ionicons name="settings" size={32} color="#f97316" />
          </View>
          <Text style={styles.quickTitle}>Paramètres</Text>
          <Text style={styles.quickSubtitle}>Zones, tarifs, véhicule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============ ÉCRAN DE CHARGEMENT INITIAL ============
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

  // ============ RENDER FINAL ============
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
            {renderOnlineStatus()}
            {renderOverview()}
            {renderQuickActions()}
          </>
        ) : (
          <View style={styles.noBusiness}>
            <Ionicons name="bicycle-outline" size={90} color="#E0E0E0" />
            <Text style={styles.noBusinessTitle}>Aucun profil livreur</Text>
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
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  fullLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  fullLoadingText: { marginTop: 16, fontSize: 16, color: "#666" },

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
    zIndex: 1,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  avatarContainer: {
    borderRadius: 20,
    overflow: "hidden",
    width: 40,
    height: 40,
  },
  avatar: { width: "100%", height: "100%" },
  placeholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // Statut en ligne
  onlineSection: { paddingHorizontal: 16, paddingVertical: 8 },
  onlineCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  onlineLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  onlineDot: { width: 12, height: 12, borderRadius: 6 },
  onlineText: { fontSize: 17, fontWeight: "600", color: "#111" },

  toggleSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#CCC",
    padding: 4,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: "#10B981" },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  toggleKnobOn: { alignSelf: "flex-end" },

  // Sections générales
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
  cardGreen: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: "700", color: "#000" },

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
});
