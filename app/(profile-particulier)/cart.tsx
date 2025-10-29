import { createOrder } from "@/api/Orders";
import paymentService from "@/api/services/paiement";
import { PaymentMethod } from "@/api/types/payment";
import BackButton from "@/components/BackButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCartStore } from "@/stores/useCartStore";
import { CreateOrderPayload } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import {
  CardField,
  createPaymentMethod,
  useStripe,
} from "@stripe/stripe-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// 🔹 Image par défaut si produit sans image
const fallbackImage = require("@/assets/images/store-placeholder.png");

const Cart = () => {
  const { items, removeItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  // const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const { confirmPayment, createPaymentMethod } =
    Platform.OS !== "web"
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useStripe()
      : { confirmPayment: null, createPaymentMethod: null };

  // 🔹 Créer la commande
  const handleCreateOrder = async () => {
    if (items.length === 0) {
      Toast.show({ type: "info", text1: "Votre panier est vide" });
      return null;
    }

    const firstItem = items[0];
    if (!firstItem.businessId || !firstItem.supplierBusinessId) {
      Toast.show({
        type: "error",
        text1: "Impossible de passer la commande",
        text2: "Business ou fournisseur manquant",
      });
      return null;
    }

    const invalid = items.find(
      (i) =>
        i.businessId !== firstItem.businessId ||
        i.supplierBusinessId !== firstItem.supplierBusinessId
    );
    if (invalid) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Tous les articles doivent provenir du même fournisseur.",
      });
      return null;
    }

    const payload: CreateOrderPayload = {
      type: "SALE",
      businessId: firstItem.businessId,
      supplierBusinessId: firstItem.supplierBusinessId,
      notes: "Commande depuis l'app mobile",
      lines: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await createOrder(payload);
      console.log("✅ Commande créée:", res);
      return res.id;
    } catch (err: any) {
      console.error("❌ Erreur création commande:", err);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: err.response?.data?.message || err.message,
      });
      return null;
    }
  };

  // 🔹 Paiement manuel (mode actuel)
  const handleManualPayment = async () => {
    try {
      setIsLoading(true);

      // Étape 1 : Créer la commande
      const orderId = await handleCreateOrder();
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      // Étape 2 : Créer la transaction manuelle
      console.log("💳 Création du paiement manuel...");
      const paymentIntentData = await paymentService.createPaymentIntent(
        orderId,
        {
          method: PaymentMethod.CASH,
          paymentMethodId: "",
        }
      );

      // if (paymentIntentData && paymentIntentData.clientSecret) {
      //   const { error: confirmError, paymentIntent } = await confirmPayment(
      //     paymentIntentData.clientSecret,
      //     { paymentMethodType: "Card" }
      //   );
      //   // Rest of your code...
      // }

      Toast.show({
        type: "success",
        text1: "Commande validée ✅",
        text2: "Le paiement sera traité manuellement.",
      });

      // Étape 4: Confirmer le paiement avec Stripe
      // if (paymentIntentData.clientSecret) {
      //   console.log("🔓 Confirmation du paiement...");
      //   const { error: confirmError, paymentIntent } = await confirmPayment(
      //     paymentIntentData.clientSecret,
      //     {
      //       paymentMethodType: "Card",
      //     }
      //   );

      //   if (confirmError) {
      //     console.error("❌ Erreur lors de la confirmation:", confirmError);
      //     Alert.alert(
      //       "Erreur de paiement",
      //       confirmError.message || "Le paiement a échoué"
      //     );
      //     setIsLoading(false);
      //     return;
      //   }

      //   console.log("✅ Paiement confirmé:", paymentIntent);

      //   // Succès !
      //   Toast.show({
      //     type: "success",
      //     text1: "Paiement réussi ! 🎉",
      //     text2: `Transaction: ${paymentIntentData.transactionId}`,
      //   });

      //   // Vider le panier
      //   useCartStore.setState({ items: [] });
      //   setShowPaymentUI(false);
      //   setCardDetails(null);
      //   setCreatedOrderId(null);
      // } else if (paymentIntentData.redirectUrl) {
      //   // Si une redirection est nécessaire (3D Secure, etc.)
      //   Alert.alert(
      //     "Action requise",
      //     "Vous allez être redirigé pour finaliser le paiement"
      //   );
      //   // Ici, vous pouvez ouvrir le redirectUrl dans un navigateur ou WebView
      // }
      console.log("✅ Paiement confirmé:", paymentIntentData);

      // Succès !
      Toast.show({
        type: "success",
        text1: "Paiement réussi ! 🎉",
        text2: `Transaction: ${paymentIntentData.transactionId}`,
      });
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Gestion quantité
  const updateQuantity = (variantId: string, delta: number) => {
    useCartStore.setState((state) => {
      const updated = [...state.items];
      const index = updated.findIndex((i) => i.variantId === variantId);
      if (index !== -1) {
        const newQty = updated[index].quantity + delta;
        if (newQty <= 0) {
          return { items: updated.filter((_, i) => i !== index) };
        }
        updated[index].quantity = newQty;
      }
      return { items: updated };
    });
  };

  const totalPrice = items
    .reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    .toFixed(2);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Votre Panier ({totalItems})</Text>
        </View>

        {showPaymentUI ? (
          Platform.OS === "web" ? (
            <View style={styles.webPlaceholder}>
              <Ionicons name="card-outline" size={64} color="#ccc" />
              <Text style={styles.webText}>
                Paiement par carte disponible uniquement sur l’app mobile.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.paymentContainer}
              contentContainerStyle={styles.paymentContent}
            >
              <View style={styles.paymentHeader}>
                <Ionicons name="card-outline" size={48} color="#059669" />
                <Text style={styles.paymentTitle}>Paiement sécurisé</Text>
              </View>

              <View style={styles.totalSection}>
                <Text style={styles.totalSectionLabel}>Montant total</Text>
                <Text style={styles.totalSectionAmount}>{totalPrice} €</Text>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.cardLabel}>Informations de carte</Text>
                <CardField
                  style={styles.cardField}
                  postalCodeEnabled={false}
                  placeholders={{ number: "4242 4242 4242 4242" }}
                  onCardChange={setCardDetails}
                />
                <Text style={styles.cardHint}>
                  Carte test : 4242 4242 4242 4242
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleManualPayment}
                style={[
                  styles.payButton,
                  (!cardDetails?.complete || isLoading) &&
                    styles.payButtonDisabled,
                ]}
                disabled={!cardDetails?.complete || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={20} color="#fff" />
                    <Text style={styles.payButtonText}>
                      Payer {totalPrice} €
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Votre panier est vide</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.content}>
              {items.map((item) => (
                <View key={item.variantId} style={styles.cartItem}>
                  <Image
                    source={
                      item.imageUrl ? { uri: item.imageUrl } : fallbackImage
                    }
                    style={styles.itemImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {parseFloat(item.price).toFixed(2)} € x {item.quantity}
                    </Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.variantId, -1)}
                        style={styles.quantityButton}
                      >
                        <Ionicons name="remove" size={20} color="#333" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.variantId, 1)}
                        style={styles.quantityButton}
                      >
                        <Ionicons name="add" size={20} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeItem(item.variantId)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total :</Text>
                <Text style={styles.totalPrice}>{totalPrice} €</Text>
              </View>
              <TouchableOpacity
                onPress={handleManualPayment}
                style={[styles.checkoutButton, isLoading && { opacity: 0.6 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.checkoutButtonText}>
                    Valider la commande
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  webText: {
    fontSize: 16,
    color: "#4b5563", // gris doux
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: "500",
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  webIcon: {
    marginBottom: 16,
  },
  webTextTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 8,
    textAlign: "center",
  },
  webTextSubtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },

  paymentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentContent: {
    paddingBottom: 32,
  },
  paymentHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#059669",
    marginTop: 8,
  },
  totalSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  totalSectionLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  totalSectionAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
  },
  cardSection: {
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  cardField: {
    height: 50,
    marginVertical: 10,
  },
  cardHint: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  payButton: {
    backgroundColor: "#059669",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: "#a7f3d0",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: { fontSize: 18, color: "#666", fontWeight: "500" },
  content: { flex: 1 },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    padding: 10,
  },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  itemDetails: { flex: 1, justifyContent: "center" },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  itemPrice: { fontSize: 14, color: "#666", marginBottom: 8 },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: { fontSize: 16, fontWeight: "600", color: "#333" },
  removeButton: { justifyContent: "center", padding: 8 },
  footer: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#333" },
  totalPrice: { fontSize: 18, fontWeight: "700", color: "#059669" },
  checkoutButton: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default Cart;
