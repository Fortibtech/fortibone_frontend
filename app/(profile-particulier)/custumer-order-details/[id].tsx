// app/customer-order-details/[id].tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getCustomerDetailById } from "@/api/customers";
import { CustomerDetailResponse } from "@/types/customers";

export default function ClientProfile() {
  const router = useRouter();
  const { id: customerId, businessId } = useLocalSearchParams<{
    id: string;
    businessId: string;
  }>();

  const [data, setData] = useState<CustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId || !businessId) return;

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getCustomerDetailById(businessId, customerId);
        setData(result);
      } catch (err: any) {
        setError(err.message);
        Alert.alert("Erreur", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, businessId]);

  // Formatage sécurisé
  const formatPrice = (value: any): string => {
    const num = Number(value) || 0;
    return num.toFixed(2).replace(".", ",") + " €";
  };

  const formatDate = (iso: string | null): string => {
    return iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";
  };

  // Couleurs par statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { bg: "#D1FAE5", text: "#065F46", label: "Livrée" };
      case "PENDING":
      case "PENDING_PAYMENT":
        return { bg: "#DBEAFE", text: "#1E40AF", label: "En cours" };
      case "CANCELLED":
        return { bg: "#FECACA", text: "#991B1B", label: "Annulée" };
      default:
        return { bg: "#F3F4F6", text: "#374151", label: status };
    }
  };

  // Avatar avec initiale
  const AvatarWithInitial = ({ name }: { name: string }) => {
    const initial = name.charAt(0).toUpperCase();
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
    );
  };

  // Bouton Contacter
  const handleContact = () => {
    if (!data?.customerInfo) return;

    const { phoneNumber, email } = data.customerInfo;
    const options = [];

    if (phoneNumber) options.push({ label: "Appeler", value: "tel" });
    if (email) options.push({ label: "Envoyer un email", value: "mail" });

    if (options.length === 0) {
      Alert.alert("Contact", "Aucune information de contact disponible");
      return;
    }

    Alert.alert(
      "Contacter le client",
      "Choisissez une méthode :",
      options.map((opt) => ({
        text: opt.label,
        onPress: () => {
          if (opt.value === "tel") {
            Linking.openURL(`tel:${phoneNumber}`);
          } else if (opt.value === "mail") {
            Linking.openURL(`mailto:${email}`);
          }
        },
      })),
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Chargement du client...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>
            Impossible de charger les données
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace(router.asPath)}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { customerInfo, stats, recentOrders } = data;
  const fullName = `${customerInfo.firstName} ${customerInfo.lastName}`.trim();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiche Client</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <AvatarWithInitial name={customerInfo.firstName} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{fullName}</Text>

            {customerInfo.email && (
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={20} color="#666" />
                <Text style={styles.infoText}>{customerInfo.email}</Text>
              </View>
            )}

            {customerInfo.phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#666" />
                <Text style={styles.infoText}>{customerInfo.phoneNumber}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.infoText}>
                Client depuis: {formatDate(customerInfo.clientSince)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CA Total</Text>
            <Text style={styles.statValue}>
              {formatPrice(stats.totalSalesAmount)}
            </Text>
            <Text style={styles.statSubLabel}>Commandes Totales</Text>
            <Text style={styles.statSubValue}>{stats.totalOrders}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Panier Moyen</Text>
            <Text style={styles.statValue}>
              {formatPrice(stats.averageOrderValue)}
            </Text>
            <Text style={styles.statSubLabel}>Dernière Commande</Text>
            <Text style={styles.statSubValue}>
              {stats.lastOrderDate ? formatDate(stats.lastOrderDate) : "—"}
            </Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          {/* <View style={styles.ordersSectionHeader}>
            <Text style={styles.ordersTitle}>Dernières Commandes</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Voir tout</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View> */}

          <View style={styles.ordersCard}>
            {recentOrders.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: "#9CA3AF" }}>
                  Aucune commande récente
                </Text>
              </View>
            ) : (
              recentOrders.map((order, index) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <View key={order.orderId}>
                    {index > 0 && <View style={styles.divider} />}
                    <View style={styles.orderItem}>
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderTitle}>
                          #{order.orderNumber}
                        </Text>
                        <Text style={styles.orderDetails}>
                          {order.products.length} article
                          {order.products.length > 1 ? "s" : ""} - Date:{" "}
                          {formatDate(order.orderDate)}
                        </Text>
                      </View>
                      <View style={styles.orderRight}>
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: statusStyle.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: statusStyle.text },
                            ]}
                          >
                            {statusStyle.label}
                          </Text>
                        </View>
                        <Text style={styles.orderPrice}>
                          {formatPrice(order.totalAmount)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>Contacter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#6B7280", fontSize: 16 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: { color: "#EF4444", fontSize: 16, textAlign: "center" },
  retryButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: { flex: 1 },
  profileSection: {
    backgroundColor: "#fff",
    padding: 24,
    flexDirection: "row",
    gap: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  profileInfo: { flex: 1, paddingTop: 8 },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#4B5563",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  statSubLabel: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  statSubValue: { fontSize: 22, fontWeight: "600", color: "#111827" },
  ordersSection: { padding: 16 },
  ordersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
  seeAllButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAllText: { fontSize: 16, color: "#6B7280" },
  ordersCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  orderInfo: { flex: 1, paddingRight: 12 },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  orderDetails: { fontSize: 14, color: "#6B7280" },
  orderRight: { alignItems: "flex-end", gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: "500" },
  orderPrice: { fontSize: 18, fontWeight: "700", color: "#111827" },
  divider: { height: 1, backgroundColor: "#E5E7EB" },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  contactButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
