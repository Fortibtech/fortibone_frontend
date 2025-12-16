// app/order-details/[id].tsx
import { getOrderById, updateOrderStatus } from "@/api/Orders";
import { OrderResponse } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response: any = await getOrderById(id);
      setOrder(response);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger la commande",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: OrderResponse["status"]) => {
    const map: Record<
      OrderResponse["status"],
      { text: string; color: string; bg: string }
    > = {
      PENDING_PAYMENT: {
        text: "En attente de paiement",
        color: "#F97316",
        bg: "#FFF7ED",
      },
      PENDING: { text: "Nouvelle commande", color: "#EA580C", bg: "#FFEDD5" },
      CONFIRMED: { text: "Confirmée", color: "#8B5CF6", bg: "#F5F3FF" },
      PROCESSING: { text: "En préparation", color: "#D97706", bg: "#FFFBEB" },
      SHIPPED: { text: "Expédiée", color: "#2563EB", bg: "#EFF6FF" },
      DELIVERED: { text: "Livrée", color: "#16A34A", bg: "#F0FDF4" },
      COMPLETED: { text: "Terminée", color: "#059669", bg: "#ECFDF5" },
      CANCELLED: { text: "Annulée", color: "#EF4444", bg: "#FEF2F2" },
      REFUNDED: { text: "Remboursée", color: "#6B7280", bg: "#F3F4F6" },
      PAID: { text: "Payée", color: "#059669", bg: "#D1FAE5" },
    };
    return map[status] || { text: status, color: "#666", bg: "#F3F4F6" };
  };

  const handleStatusUpdate = async (newStatus: OrderResponse["status"]) => {
    if (!order || updating) return;
    setUpdating(true);
    try {
      const updatedOrder = await updateOrderStatus(order.id, {
        status: newStatus as any,
      });
      const mergedOrder = {
        ...updatedOrder,
        customer: order.customer,
        business: order.business,
        lines: updatedOrder.lines || order.lines,
      };
      setOrder(mergedOrder as any);
      Toast.show({
        type: "success",
        text1: "Succès",
        text2: `Commande marquée comme ${getStatusConfig(
          newStatus
        ).text.toLowerCase()}`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Action impossible",
        text2: err.response?.data?.message || err.message || "Erreur inconnue",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A36C" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const total = parseFloat(order.totalAmount).toFixed(2).replace(".", ",");
  const statusConfig = getStatusConfig(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.cmdCode}>Commande #{order.orderNumber}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Client + Statut */}
        <View style={styles.clientCard}>
          <View style={styles.clientInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {order.customer.firstName[0]}
                {order.customer.lastName?.[0] || ""}
              </Text>
            </View>
            <View>
              <Text style={styles.clientLabel}>Client</Text>
              <Text style={styles.clientName}>
                {order.customer.firstName} {order.customer.lastName || ""}
              </Text>
            </View>
          </View>

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Statut</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Infos rapides */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          {order.tableNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Table</Text>
              <Text style={styles.infoValue}>N°{order.tableNumber}</Text>
            </View>
          )}
          {order.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Articles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Articles commandés</Text>
          {order.lines.map((line) => {
            const pu = parseFloat(line.price).toFixed(2).replace(".", ",");
            const totalLine = (parseFloat(line.price) * line.quantity)
              .toFixed(2)
              .replace(".", ",");
            return (
              <View key={line.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2 }]}>
                  {line.variant?.name || "Article"}
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "center" }]}>
                  x{line.quantity}
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {pu} KMF
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {totalLine} KMF
                </Text>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total} KMF</Text>
          </View>
        </View>

        {/* Actions pour le pro uniquement */}
        <View style={styles.footer}>
          {order.status === "PENDING" && (
            <>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleStatusUpdate("CANCELLED")}
                disabled={updating}
              >
                <Text style={styles.cancelText}>
                  {updating ? "Annulation..." : "Annuler"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleStatusUpdate("CONFIRMED")}
                disabled={updating}
              >
                <Text style={styles.actionText}>
                  {updating ? "Confirmation..." : "Confirmer"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backBtn: { padding: 6 },
  cmdCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
    textAlign: "center",
  },

  // CLIENT + STATUT
  clientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  clientInfo: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00A36C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  clientLabel: { fontSize: 13, color: "#666" },
  clientName: { fontSize: 16, fontWeight: "600", color: "#111", flexShrink: 1 },

  statusBox: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  statusLabel: { fontSize: 13, color: "#666", marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-end",
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  // INFOS RAPIDES
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 4,
    gap: 8,
  },
  infoLabel: { color: "#666", fontSize: 14 },
  infoValue: {
    color: "#333",
    fontWeight: "500",
    fontSize: 14,
    flexShrink: 1,
    textAlign: "right",
  },

  // ARTICLES
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  td: { fontSize: 14, color: "#333" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalLabel: { fontSize: 18, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#00A36C" },

  // FOOTER ACTIONS
  footer: { marginHorizontal: 16, marginBottom: 40, gap: 12 },
  actionBtn: {
    backgroundColor: "#00A36C",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  cancelBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },
});
