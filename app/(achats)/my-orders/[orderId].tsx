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
  createPaymentMethod,
} from "@stripe/stripe-react-native";

export default function CommandeDetails() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
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
    if (!orderId) return;
    try {
      setIsLoading(true);
      const response: any = await getOrderById(orderId);
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
  }, [orderId]);

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

  const handlePay = async () => {
    if (!order) return;

    // Validation
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
      let paymentMethodId: string | undefined;

      // === STRIPE : créer le PaymentMethod ===
      if (paymentMethod === "STRIPE") {
        const { paymentMethod: pm, error } = await createPaymentMethod({
          paymentMethodType: "Card",
        });

        if (error || !pm) {
          throw new Error(error?.message || "Impossible de lire la carte");
        }
        paymentMethodId = pm.id;
      }

      // === Appel API payOrder ===
      const result = await payOrder({
        orderId: order.id,
        method: paymentMethod,
        ...(paymentMethod === "STRIPE" && { paymentMethodId }),
        ...(paymentMethod === "KARTAPAY" && { phoneNumber }),
      });

      // === Confirmation Stripe si clientSecret renvoyé ===
      if (paymentMethod === "STRIPE" && result.clientSecret) {
        const { error } = await confirmPayment(result.clientSecret, {
          paymentMethodType: "Card",
        });
        if (error) throw new Error(error.message || "Paiement refusé");
      }

      Toast.show({
        type: "success",
        text1: "Paiement réussi !",
        text2:
          paymentMethod === "WALLET"
            ? "Montant débité de votre portefeuille"
            : paymentMethod === "KARTAPAY"
            ? "Demande envoyée à votre opérateur"
            : "Paiement par carte accepté",
      });

      await fetchOrderDetails();
      setPaymentModal(false);
      // Reset des champs
      setPhoneNumber("");
      setCardComplete(false);
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
    <StripeProvider publishableKey="pk_test_51PBf5wRqgxgrSOxzkT3CoAj3wnYQKPSKxZLmtaH9lt8XXO8NoIknakl1nMxj14Mj25f3VC56dchbm7E4ATNXco2200dXM6svtP">
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* === Tout ton UI existant (header, client, produits, etc.) === */}
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

          <View style={styles.footer}>
            {/* INFOS RAPIDES – AJOUT DE LA SECTION LIVRAISON */}
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

              {/* === NOUVELLE SECTION : CODE DE LIVRAISON === */}
              {order.deliveryRequest && (
                <>
                  <View style={styles.separator} />

                  <View style={styles.deliverySection}>
                    <Text style={styles.deliveryTitle}>Livraison en cours</Text>

                    <View style={styles.deliveryRow}>
                      <Text style={styles.deliveryLabel}>Transporteur</Text>
                      <Text style={styles.deliveryValue}>
                        {order.deliveryRequest.carrier.name}
                      </Text>
                    </View>

                    <View style={styles.deliveryRow}>
                      <Text style={styles.deliveryLabel}>Statut livraison</Text>
                      <Text
                        style={[
                          styles.deliveryValue,
                          { textTransform: "capitalize" },
                        ]}
                      >
                        {order.deliveryRequest.status === "PENDING"
                          ? "En attente du livreur"
                          : order.deliveryRequest.status === "IN_TRANSIT"
                          ? "En cours de livraison"
                          : order.deliveryRequest.status === "DELIVERED"
                          ? "Livrée"
                          : order.deliveryRequest.status}
                      </Text>
                    </View>

                    {/* Code de livraison mis en évidence */}
                    <View style={styles.codeContainer}>
                      <Text style={styles.codeLabel}>
                        Code à donner au livreur
                      </Text>
                      <View style={styles.codeBox}>
                        <Text style={styles.codeText}>
                          {order.deliveryRequest.deliveryCode}
                        </Text>
                      </View>
                      <Text style={styles.codeHint}>
                        Montrez ce code au livreur pour récupérer votre commande
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
            {order.status === "PENDING_PAYMENT" && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => {
                  setPaymentModal(true);
                  setPaymentMethod("WALLET");
                  setPhoneNumber("");
                  setCardComplete(false);
                }}
              >
                <Text style={styles.payText}>
                  Payer la commande : {total} KMF
                </Text>
              </TouchableOpacity>
            )}

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
                    <Text style={styles.modalTitle}>Payer : {total} KMF</Text>
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
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {method === "WALLET"
                              ? "Portefeuille"
                              : method === "STRIPE"
                              ? "Carte bancaire"
                              : "KARTAPAY"}
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
                            backgroundColor: "#ffffff",
                            textColor: "#000000",
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
// ====================== STYLES ======================
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
  payBtn: {
    backgroundColor: "#00A36C",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

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

  footerPlaceholder: { padding: 20, alignItems: "center" },
  footerInfo: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  deliverySection: {
    marginTop: 8,
  },
  deliveryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#00A36C",
    marginBottom: 12,
  },
  deliveryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  deliveryLabel: {
    fontSize: 14,
    color: "#666",
  },
  deliveryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  codeContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: "#00A36C",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  // MODAL
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
    paddingBottom: 32,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111", flexShrink: 1 },

  // TABS PAIEMENT
  paymentTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    columnGap: 4,
    rowGap: 4,
  },
  tab: {
    flexGrow: 1,
    flexBasis: "30%",
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#00A36C" },
  tabText: {
    fontWeight: "600",
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
  tabTextActive: { color: "#fff" },

  // INPUTS
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
    padding: 14,
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

  // WALLET
  walletInfo: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 8,
  },
  walletText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  walletAmount: {
    fontSize: 16,
    color: "#00A36C",
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },

  // MODAL FOOTER
  modalFooter: { flexDirection: "row", gap: 12, marginTop: 12 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: { fontWeight: "600", color: "#666" },
  modalPay: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: "#00A36C",
    borderRadius: 12,
    alignItems: "center",
  },
  modalPayText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
