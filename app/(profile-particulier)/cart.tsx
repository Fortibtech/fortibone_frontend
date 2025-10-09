import { createOrder } from "@/api/Orders";
import paymentService from "@/api/services/paiement";
import { PaymentMethod } from "@/api/types/payment";
import BackButton from "@/components/BackButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCartStore } from "@/stores/useCartStore";
import { CreateOrderPayload } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
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

// ✅ Charger Stripe uniquement sur mobile
let StripeModule: any = {};
if (Platform.OS !== "web") {
  StripeModule = require("@stripe/stripe-react-native");
}

const { CardField, useStripe } = StripeModule;

// 🔹 Image par défaut
const fallbackImage = require("@/assets/images/store-placeholder.png");

interface CartItem {
  variantId: string;
  businessId: string;
  supplierBusinessId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
}

const Cart = () => {
  const { items, removeItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const { confirmPayment, createPaymentMethod } =
    Platform.OS !== "web"
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useStripe()
      : { confirmPayment: null, createPaymentMethod: null };

  // --- LOGIQUE COMMANDE ---
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
        text2: "Fournisseur ou business manquant pour le produit",
      });
      return null;
    }

    const businessId = firstItem.businessId;
    const supplierBusinessId = firstItem.supplierBusinessId;
    const invalidBusiness = items.find(
      (item) =>
        item.businessId !== businessId ||
        item.supplierBusinessId !== supplierBusinessId
    );

    if (invalidBusiness) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Tous les articles doivent provenir du même fournisseur.",
      });
      return null;
    }

    const invalidItem = items.find((i) => !i.variantId);
    if (invalidItem) {
      Toast.show({
        type: "error",
        text1: "Produit invalide dans le panier",
        text2: invalidItem.name,
      });
      return null;
    }

    const payload: CreateOrderPayload = {
      type: "SALE",
      businessId,
      supplierBusinessId,
      notes: "Commande depuis l'app mobile",
      lines: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await createOrder(payload);
      return res.id;
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la commande",
        text2: err.response?.data?.message?.join?.(", ") || err.message,
      });
      return null;
    }
  };

  // --- CHECKOUT ---
  const handleCheckout = async () => {
    if (isLoading) return;
    setShowPaymentUI(true);
  };

  const handleFinalizePayment = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Paiement non disponible",
        "Le paiement par carte n’est pas encore disponible sur la version web."
      );
      return;
    }

    if (!cardDetails?.complete) {
      Alert.alert("Erreur", "Veuillez entrer des détails de carte valides.");
      return;
    }

    try {
      setIsLoading(true);
      const orderId = await handleCreateOrder();
      if (!orderId) return;

      const { paymentMethod, error: pmError } = await createPaymentMethod({
        paymentMethodType: "Card",
      });

      if (pmError || !paymentMethod?.id) {
        Alert.alert("Erreur Carte", pmError?.message || "Carte invalide.");
        setIsLoading(false);
        return;
      }

      const paymentIntentData = await paymentService.createPaymentIntent(
        orderId,
        {
          method: PaymentMethod.STRIPE,
          paymentMethodId: paymentMethod.id,
        }
      );

      if (paymentIntentData.clientSecret) {
        const { error: confirmError, paymentIntent } = await confirmPayment(
          paymentIntentData.clientSecret,
          { paymentMethodType: "Card" }
        );

        if (confirmError) {
          Alert.alert("Erreur de paiement", confirmError.message);
          return;
        }

        Toast.show({
          type: "success",
          text1: "Paiement réussi ! 🎉",
          text2: `Transaction: ${paymentIntentData.transactionId}`,
        });

        useCartStore.setState({ items: [] });
        setShowPaymentUI(false);
        setCardDetails(null);
        setCreatedOrderId(null);
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBackFromPayment = () => {
    setShowPaymentUI(false);
    setCardDetails(null);
    setCreatedOrderId(null);
  };

  const updateQuantity = (variantId: string, delta: number) => {
    useCartStore.setState((state) => {
      const updatedItems = [...state.items];
      const index = updatedItems.findIndex(
        (item) => item.variantId === variantId
      );
      if (index !== -1) {
        const newQuantity = updatedItems[index].quantity + delta;
        if (newQuantity <= 0) {
          return { items: updatedItems.filter((_, i) => i !== index) };
        }
        updatedItems[index].quantity = newQuantity;
      }
      return { items: updatedItems };
    });
  };

  const totalPrice = items
    .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
    .toFixed(2);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const renderCartItem = (item: CartItem) => (
    <View key={item.variantId} style={styles.cartItem}>
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : fallbackImage}
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
  );

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={showPaymentUI ? handleGoBackFromPayment : undefined}
          >
            <BackButton />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showPaymentUI ? "Paiement" : `Votre Panier (${totalItems})`}
          </Text>
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
                onPress={handleFinalizePayment}
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
              {items.map(renderCartItem)}
            </ScrollView>
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total :</Text>
                <Text style={styles.totalPrice}>{totalPrice} €</Text>
              </View>
              <TouchableOpacity
                onPress={handleCheckout}
                style={[styles.checkoutButton, isLoading && { opacity: 0.6 }]}
                disabled={isLoading}
              >
                <Text style={styles.checkoutButtonText}>
                  {isLoading ? "En cours..." : "Passer la commande"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
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
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    justifyContent: "center",
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
  },
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
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Styles pour l'écran de paiement
  paymentContainer: {
    flex: 1,
  },
  paymentContent: {
    paddingBottom: 30,
  },
  paymentHeader: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 24,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  totalSection: {
    backgroundColor: "#059669",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  totalSectionLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 8,
  },
  totalSectionAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
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
    width: "100%",
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  payButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: "#d1d5db",
    opacity: 0.6,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  securityText: {
    fontSize: 12,
    color: "#666",
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  webText: { textAlign: "center", color: "#777", fontSize: 16, marginTop: 10 },
});

export default Cart;
