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

export default function CommandeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const fetchOrderDetails = async () => {
    if (!id || isLoading) return;

    try {
      setIsLoading(true);
      const response = await getOrderById(id as string);
      setOrder(response);
      setRetryCount(0);
    } catch (err: any) {
      if (
        err.message.includes("Transaction already closed") &&
        retryCount < MAX_RETRIES
      ) {
        setRetryCount(retryCount + 1);
        Toast.show({
          type: "info",
          text1: "Délai dépassé",
          text2: `Nouvelle tentative (${retryCount + 1}/${MAX_RETRIES})...`,
        });
        setTimeout(() => fetchOrderDetails(), 1000);
        return;
      }

      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: err.response?.data?.message?.join?.(", ") || err.message,
      });
      console.error("Erreur lors de la récupération des détails:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Formatage date
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Style du statut
  const getStatusStyle = (status: OrderResponse["status"]) => {
    switch (status) {
      case "PENDING":
        return { bg: "#FFF7ED", color: "#F97316", text: "En cours" };
      case "COMPLETED":
        return { bg: "#ECFDF5", color: "#059669", text: "Terminée" };
      case "CANCELLED":
        return { bg: "#FEF2F2", color: "#EF4444", text: "Annulée" };
      case "REFUNDED":
        return { bg: "#F3F4F6", color: "#6B7280", text: "Remboursée" };
      default:
        return { bg: "#F3F4F6", color: "#6B7280", text: status };
    }
  };

  // Mise à jour du statut
  // Mise à jour du statut
 const handleStatusUpdate = async (newStatus: OrderResponse["status"]) => {
   if (!order || updating) return;

   setUpdating(true);
   try {
     const updatedOrder = await updateOrderStatus(order.id, {
       status: newStatus,
     });

     // --- CORRECTION ICI : on garde le customer original ---
     const mergedOrder = {
       ...updatedOrder,
       customer: order.customer, // ← On conserve le customer d'origine
       business: order.business, // ← Au cas où
       lines: updatedOrder.lines || order.lines, // ← Sécurité
     };

     setOrder(mergedOrder as OrderResponse);
     Toast.show({
       type: "success",
       text1: "Succès",
       text2: `Commande marquée comme ${getStatusStyle(
         newStatus
       ).text.toLowerCase()}`,
     });
   } catch (err: any) {
     const apiMessage = err.response?.data?.message;
     const fallback = err.message || "Impossible de mettre à jour le statut";

     const displayMessage = apiMessage
       ? Array.isArray(apiMessage)
         ? apiMessage.join(", ")
         : apiMessage
       : fallback;

     Toast.show({
       type: "error",
       text1: "Action impossible",
       text2: displayMessage,
     });
   } finally {
     setUpdating(false);
   }
 };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A36C" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Commande non trouvée</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(order.status);
  const total = parseFloat(order.totalAmount).toFixed(2).replace(".", ",");

  // Déterminer les boutons à afficher
  const showCancelButton =
    order.status !== "CANCELLED" && order.status !== "COMPLETED";
  const showCompleteButton = order.status === "PENDING";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#111" />
          </TouchableOpacity>
          <Text style={styles.cmdCode}>#{order.orderNumber}</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Client + Statut */}
        <View style={styles.clientCard}>
          <View style={styles.clientInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {order.customer.firstName.charAt(0)}
                {order.customer.lastName?.charAt(0) || ""}
              </Text>
            </View>
            <View>
              <Text style={styles.clientLabel}>Client</Text>
              <Text style={styles.clientName}>
                {order.customer.firstName} {order.customer.lastName || ""}
              </Text>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="call-outline" size={18} color="#111" />
          </TouchableOpacity> */}

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Statut</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {statusStyle.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Infos commande */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          {order.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Produits commandés */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Produits Commandés</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Produit</Text>
            <Text style={[styles.th, { flex: 1 }]}>Qté</Text>
            <Text style={[styles.th, { flex: 1 }]}>PU</Text>
            <Text style={[styles.th, { flex: 1 }]}>Total</Text>
          </View>

          {order.lines.map((line) => {
            const pu = parseFloat(line.price).toFixed(2).replace(".", ",");
            const totalLine = (parseFloat(line.price) * line.quantity)
              .toFixed(2)
              .replace(".", ",");
            return (
              <View key={line.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2 }]}>
                  {line.variant?.name || "Produit inconnu"}
                </Text>
                <Text style={[styles.td, { flex: 1 }]}>x{line.quantity}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{pu} €</Text>
                <Text style={[styles.td, { flex: 1 }]}>{totalLine} €</Text>
              </View>
            );
          })}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total} €</Text>
          </View>
        </View>

        {/* Boutons d'action conditionnels */}
        <View style={styles.footer}>
          {/* Bouton Annuler */}
          {showCancelButton && (
            <TouchableOpacity
              style={[styles.cancelBtn, updating && { opacity: 0.7 }]}
              onPress={() => handleStatusUpdate("CANCELLED")}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.cancelText}>Annuler</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Bouton Marquer expédié / Terminer */}
          {showCompleteButton && (
            <TouchableOpacity
              style={[styles.shipBtn, updating && { opacity: 0.7 }]}
              onPress={() => handleStatusUpdate("COMPLETED")}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.shipText}>Marquer expédié</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Si déjà terminée ou annulée → rien */}
          {!showCancelButton && !showCompleteButton && (
            <View style={styles.footerPlaceholder}>
              <Text style={styles.footerInfo}>
                {order.status === "COMPLETED"
                  ? "Commande terminée"
                  : "Commande annulée"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES (ajoutés) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 12, color: "#777", fontSize: 16 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  cmdCode: { fontWeight: "700", fontSize: 16, color: "#111" },

  // Client Card
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  clientInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00A36C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  clientLabel: { fontSize: 12, color: "#666" },
  clientName: { fontSize: 14, fontWeight: "600", color: "#111" },
  callBtn: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 8,
    marginRight: 8,
  },
  statusBox: { alignItems: "flex-end" },
  statusLabel: { fontSize: 12, color: "#666" },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  // Infos
  infoCard: { marginBottom: 16 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 13, color: "#666" },
  infoValue: { fontSize: 13, color: "#333", fontWeight: "500" },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: 12,
    marginBottom: 20,
  },
  cardTitle: { fontWeight: "700", fontSize: 15, marginBottom: 12 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#EEE",
    paddingBottom: 6,
  },
  th: { color: "#777", fontSize: 13, fontWeight: "600" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F4F4F4",
  },
  td: { fontSize: 13, color: "#333" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
  totalLabel: { fontWeight: "700", fontSize: 15 },
  totalValue: { fontWeight: "700", fontSize: 15, color: "#00A36C" },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#EF4444", fontWeight: "600" },
  shipBtn: {
    flex: 1,
    backgroundColor: "#00A36C",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  shipText: { color: "#fff", fontWeight: "600" },

  // Quand aucun bouton
  footerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerInfo: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
});
