import {
  getMember,
  getMemberInventoryMovements,
  getMemberOrders,
  getMemberOverview,
  getMemberSales,
  InventoryMovements,
  Member,
  MemberOrders,
  Overview,
  Sales,
} from "@/api/members";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const MemberId = () => {
  const { businessId, memberId } = useLocalSearchParams<{
    businessId: string;
    memberId: string;
  }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [sales, setSales] = useState<Sales | null>(null);
  const [inventory, setInventory] = useState<InventoryMovements | null>(null);
  const [orders, setOrders] = useState<MemberOrders | null>(null);
  const [memberName, setMemberName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!businessId || !memberId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch member details
      const membersData = await getMember(businessId);
      const member = membersData.find((m: Member) => m.userId === memberId);
      if (member)
        setMemberName(`${member.user.firstName} ${member.user.lastName}`);
      else setError("Membre non trouvé.");

      // Fetch analytics data in parallel
      const [overviewData, salesData, inventoryData, ordersData] =
        await Promise.all([
          getMemberOverview(businessId, memberId),
          getMemberSales(businessId, memberId),
          getMemberInventoryMovements(businessId, memberId),
          getMemberOrders(businessId, memberId),
        ]);

      setOverview(overviewData);
      setSales(salesData);
      setInventory(inventoryData);
      setOrders(ordersData);
    } catch (err: any) {
      console.error("❌ Erreur chargement analytics :", err);
      setError("Échec du chargement des statistiques. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [businessId, memberId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Ionicons name="sad-outline" size={40} color="#6b7280" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAnalytics}
          accessibilityLabel="Réessayer de charger les statistiques"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );

  const sections = [
    {
      title: "Aperçu",
      icon: "stats-chart-outline",
      data: overview
        ? [
            {
              label: "Ventes traitées",
              value: overview.totalSalesProcessed,
              icon: "cash-outline",
            },
            {
              label: "Commandes de vente",
              value: overview.totalSalesOrdersProcessed,
              icon: "cart-outline",
            },
            {
              label: "Produits vendus",
              value: overview.totalProductsSold,
              icon: "cube-outline",
            },
            {
              label: "Montant des achats initiés",
              value: overview.totalPurchaseAmountInitiated,
              icon: "wallet-outline",
            },
            {
              label: "Commandes d'achat initiées",
              value: overview.totalPurchaseOrdersInitiated,
              icon: "basket-outline",
            },
            {
              label: "Réservations gérées",
              value: overview.totalReservationsManaged,
              icon: "calendar-outline",
            },
            {
              label: "Ajustements d'inventaire",
              value: overview.totalInventoryAdjustments,
              icon: "construct-outline",
            },
            {
              label: "Pertes gérées",
              value: overview.totalLossesManaged,
              icon: "alert-circle-outline",
            },
          ]
        : [],
    },
    {
      title: "Ventes",
      icon: "bar-chart-outline",
      data: sales
        ? [
            {
              label: "Ventes par période",
              value: JSON.stringify(sales.salesByPeriod),
              icon: "calendar-outline",
            },
            {
              label: "Produits les plus vendus",
              value: JSON.stringify(sales.topSellingProducts),
              icon: "star-outline",
            },
            {
              label: "Ventes par catégorie",
              value: JSON.stringify(sales.salesByProductCategory),
              icon: "pricetag-outline",
            },
          ]
        : [],
    },
    {
      title: "Mouvements d'inventaire",
      icon: "swap-horizontal-outline",
      data: inventory
        ? [
            {
              label: "Total des mouvements",
              value: inventory.total,
              icon: "list-outline",
            },
            {
              label: "Détails",
              value: JSON.stringify(inventory.data),
              icon: "document-outline",
            },
          ]
        : [],
    },
    {
      title: "Commandes",
      icon: "cart-outline",
      data: orders
        ? [
            {
              label: "Total de commandes",
              value: orders.total,
              icon: "list-outline",
            },
            {
              label: "Détails",
              value: JSON.stringify(orders.data),
              icon: "document-outline",
            },
          ]
        : [],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Retour à la liste des membres"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Ionicons
          name="person-outline"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
          {memberName || "Statistiques du membre"}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchAnalytics}
          accessibilityLabel="Rafraîchir les statistiques"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.sectionCard}
          >
            <LinearGradient
              colors={["#ffffff", "#f8fafc"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.sectionHeader}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color="#3b82f6"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>
            {item.data.map((dataItem, dataIndex) => (
              <View key={dataIndex} style={styles.dataRow}>
                <Ionicons
                  name={dataItem.icon as any}
                  size={16}
                  color="#3b82f6"
                  style={styles.dataIcon}
                />
                <Text style={styles.dataLabel}>{dataItem.label} :</Text>
                <Text style={styles.dataValue}>{dataItem.value}</Text>
              </View>
            ))}
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 12,
    marginRight: 12,
  },
  headerIcon: {
    marginRight: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  refreshButton: {
    padding: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  dataIcon: {
    marginRight: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    textAlign: "right",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MemberId;
