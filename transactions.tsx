// app/order-details/[id].tsx
import { getOrderById, updateOrderStatus, payOrder } from "@/api/Orders";
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
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  CardField,
  useStripe,
  StripeProvider,
} from "@stripe/stripe-react-native";

export default function CommandeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  // Modal de paiement
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "STRIPE" | "KARTAPAY" | "WALLET"
  >("WALLET");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [paying, setPaying] = useState(false);

  const { confirmPayment } = useStripe();

  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await getOrderById(id as string);
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
    };
    return map[status] || { text: status, color: "#666", bg: "#F3F4F6" };
  };

  const handlePay = async () => {
    if (!order) return;

    if (
      paymentMethod === "KARTAPAY" &&
      !/^\+(261|237)\d{8,10}$/.test(phoneNumber)
    ) {
      Alert.alert("Numéro invalide", "Format : +261XXXXXXXXX ou +237XXXXXXXXX");
      return;
    }

    if (paymentMethod === "STRIPE" && !cardComplete) {
      Alert.alert(
        "Carte incomplète",
        "Veuillez remplir tous les champs de la carte"
      );
      return;
    }

    setPaying(true);
    try {
      const payload: any = {
        orderId: order.id,
        method: paymentMethod,
      };

      if (paymentMethod === "KARTAPAY") {
        payload.phoneNumber = phoneNumber;
      }

      const response = await payOrder(payload);

      if (paymentMethod === "STRIPE" && response.clientSecret) {
        const { error } = await confirmPayment(response.clientSecret, {
          paymentMethodType: "Card",
        });
        if (error) throw error;
      }

      Toast.show({
        type: "success",
        text1: "Paiement réussi !",
        text2:
          paymentMethod === "WALLET"
            ? "Déduit de votre portefeuille"
            : "Commande payée",
      });

      // Recharger la commande
      await fetchOrderDetails();
      setPaymentModal(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Paiement échoué",
        text2: err.message || "Une erreur est survenue",
      });
    } finally {
      setPaying(false);
    }
  };
  const handleStatusUpdate = async (newStatus: OrderResponse["status"]) => {
    if (!order || updating) return;

    setUpdating(true);
    try {
      const updatedOrder = await updateOrderStatus(order.id, {
        status: newStatus,
      });

      const mergedOrder = {
        ...updatedOrder,
        customer: order.customer,
        business: order.business,
        lines: updatedOrder.lines || order.lines,
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
    <StripeProvider publishableKey="pk_test_ton_cle_stripe_ici">
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
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bg },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {statusConfig.text}
                </Text>
              </View>
            </View>
          </View>

          {/* Infos rapides */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(order.createdAt)}
              </Text>
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

          {/* Produits */}
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

          {/* Footer avec bouton Payer */}
          <View style={styles.footer}>
            {order.status === "PENDING_PAYMENT" && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => {
                  setPaymentModal(true);
                  setPaymentMethod("WALLET"); // par défaut
                }}
              >
                <Text style={styles.payText}>
                  Payer la commande • {total} KMF
                </Text>
              </TouchableOpacity>
            )}

            {/* Autres boutons d'action (annuler, confirmer, etc.) */}
            {order.status === "PENDING" && (
              <>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleStatusUpdate("CANCELLED")}
                >
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleStatusUpdate("CONFIRMED")}
                >
                  <Text style={styles.actionText}>Confirmer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* MODAL DE PAIEMENT */}
        <Modal visible={paymentModal} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1, justifyContent: "flex-end" }}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Payer {total} KMF</Text>
                    <TouchableOpacity onPress={() => setPaymentModal(false)}>
                      <Ionicons name="close" size={28} color="#999" />
                    </TouchableOpacity>
                  </View>

                  {/* Méthodes */}
                  <View style={styles.paymentTabs}>
                    {(["WALLET", "STRIPE", "KARTAPAY"] as const).map(
                      (method) => (
                        <TouchableOpacity
                          key={method}
                          style={[
                            styles.tab,
                            paymentMethod === method && styles.tabActive,
                          ]}
                          onPress={() => setPaymentMethod(method)}
                        >
                          <Text
                            style={[
                              styles.tabText,
                              paymentMethod === method && styles.tabTextActive,
                            ]}
                          >
                            {method === "WALLET"
                              ? "Portefeuille"
                              : method === "STRIPE"
                              ? "Carte bancaire"
                              : "MVola / Orange Money"}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  {/* Contenu selon méthode */}
                  {paymentMethod === "KARTAPAY" && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="+261 34 12 345 67"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                      />
                    </View>
                  )}

                  {paymentMethod === "STRIPE" && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Carte bancaire</Text>
                      <View style={styles.cardFieldWrapper}>
                        <CardField
                          postalCodeEnabled={false}
                          placeholders={{ number: "4242 4242 4242 4242" }}
                          cardStyle={{
                            backgroundColor: "#fff",
                            textColor: "#000",
                          }}
                          style={{ height: 50 }}
                          onCardChange={(e) => setCardComplete(e.complete)}
                        />
                      </View>
                    </View>
                  )}

                  {paymentMethod === "WALLET" && (
                    <View style={styles.walletInfo}>
                      <Ionicons name="wallet" size={48} color="#00A36C" />
                      <Text style={styles.walletText}>
                        Payer avec votre solde
                      </Text>
                      <Text style={styles.walletAmount}>
                        {total} KMF seront débités
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.modalCancel}
                      onPress={() => setPaymentModal(false)}
                    >
                      <Text style={styles.modalCancelText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalPay, paying && { opacity: 0.7 }]}
                      onPress={handlePay}
                      disabled={
                        paying || (paymentMethod === "STRIPE" && !cardComplete)
                      }
                    >
                      {paying ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.modalPayText}>
                          Payer maintenant
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </StripeProvider>
  );
}

// ====================== STYLES ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backBtn: { padding: 8 },
  cmdCode: { fontSize: 18, fontWeight: "700", color: "#111" },

  clientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  clientInfo: { flexDirection: "row", alignItems: "center" },
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
  clientName: { fontSize: 16, fontWeight: "600", color: "#111" },
  statusBox: { alignItems: "flex-end", justifyContent: "center" },
  statusLabel: { fontSize: 13, color: "#666" },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontSize: 13, fontWeight: "600" },

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
    marginVertical: 4,
  },
  infoLabel: { color: "#666", fontSize: 14 },
  infoValue: { color: "#333", fontWeight: "500", fontSize: 14 },

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

  footer: { marginHorizontal: 16, marginBottom: 40, gap: 12 },
  payBtn: {
    backgroundColor: "#00A36C",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  payText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  actionBtn: {
    backgroundColor: "#00A36C",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  cancelBtn: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },

  footerPlaceholder: { padding: 20, alignItems: "center" },
  footerInfo: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111" },

  paymentTabs: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#00A36C" },
  tabText: { fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#fff" },

  inputContainer: { marginBottom: 20 },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  cardFieldWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  walletInfo: { alignItems: "center", paddingVertical: 30 },
  walletText: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  walletAmount: {
    fontSize: 16,
    color: "#00A36C",
    marginTop: 8,
    fontWeight: "600",
  },

  modalFooter: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalCancel: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: { fontWeight: "600", color: "#666" },
  modalPay: {
    flex: 2,
    padding: 16,
    backgroundColor: "#00A36C",
    borderRadius: 12,
    alignItems: "center",
  },
  modalPayText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
