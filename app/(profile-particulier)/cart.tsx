// app/(tabs)/cart.tsx  (ou là où tu l’as)
import { createOrder } from "@/api/orers/createOrder";
import BackButton from "@/components/BackButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCartStore } from "@/stores/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const fallbackImage = require("@/assets/images/store-placeholder.png");

type PaymentOption = "CARD" | "CASH" | "WALLET";

const Cart = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>("CARD");

  const totalPrice = getTotalPrice().toFixed(2);
  const totalItemsCount = getTotalItems();

  // ──────────────────────────────────────────────────────────────
  // Création de la commande
  // ──────────────────────────────────────────────────────────────
  const handleCreateOrder = async () => {
    if (items.length === 0) {
      Toast.show({ type: "info", text1: "Votre panier est vide" });
      return;
    }

    const firstItem = items[0];

    // Vérification que tous les articles viennent du même établissement
    const invalidItem = items.find(
      (i) =>
        i.businessId !== firstItem.businessId ||
        i.supplierBusinessId !== firstItem.supplierBusinessId
    );

    if (invalidItem) {
      Toast.show({
        type: "error",
        text1: "Commande impossible",
        text2: "Tous les produits doivent provenir du même établissement.",
      });
      return;
    }

    const payload = {
      type: "SALE" as const,
      businessId: firstItem.businessId,
      supplierBusinessId: null,
      notes: `Commande mobile - Paiement: ${
        selectedPayment === "CARD"
          ? "Carte bancaire"
          : selectedPayment === "CASH"
          ? "Espèces"
          : "Portefeuille"
      }`,
      tableId: null,
      reservationDate: new Date().toISOString(),
      lines: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      useWallet: false,
      shippingFee: 0,
      discountAmount: 0,
    };

    console.log(
      "Payload envoyé à createOrder :",
      JSON.stringify(payload, null, 2)
    );

    try {
      setIsLoading(true);
      const response = await createOrder(payload);

      Toast.show({
        type: "success",
        text1: "Commande passée !",
        text2: `N°${response.orderNumber || response.id}`,
      });

      clearCart(); // Panier vidé après succès
      setTimeout(() => setShowPaymentUI(false), 1800);
    } catch (err: any) {
      console.error("Erreur création commande :", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de passer la commande";

      Toast.show({
        type: "error",
        text1: "Échec de la commande",
        text2: Array.isArray(message) ? message[0] : message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => items.length > 0 && setShowPaymentUI(true);
  const handleGoBack = () => {
    setShowPaymentUI(false);
    setSelectedPayment("CARD");
  };

  const renderCartItem = (item: (typeof items)[0]) => (
    <View key={`${item.productId}-${item.variantId}`} style={styles.cartItem}>
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : fallbackImage}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
          {item.variantName ? ` - ${item.variantName}` : ""}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price.toFixed(2)} € × {item.quantity}
        </Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() =>
              updateQuantity(item.productId, item.variantId, item.quantity - 1)
            }
            style={styles.quantityButton}
          >
            <Ionicons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() =>
              updateQuantity(item.productId, item.variantId, item.quantity + 1)
            }
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeItem(item.productId, item.variantId)}
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
          <TouchableOpacity onPress={showPaymentUI ? handleGoBack : undefined}>
            <BackButton />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showPaymentUI ? "Paiement" : `Panier (${totalItemsCount})`}
          </Text>
        </View>

        {showPaymentUI ? (
          /* ────────────────────── ÉCRAN PAIEMENT ────────────────────── */
          <ScrollView contentContainerStyle={styles.paymentContent}>
            <View style={styles.paymentHeader}>
              <Ionicons name="checkmark-circle" size={60} color="#059669" />
              <Text style={styles.paymentTitle}>Finaliser la commande</Text>
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <Text style={styles.totalAmount}>{totalPrice} €</Text>
            </View>

            <Text style={styles.paymentMethodLabel}>Mode de paiement</Text>
            <View style={styles.paymentOptions}>
              {(["CARD", "CASH", "WALLET"] as PaymentOption[]).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentOption,
                    selectedPayment === method && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setSelectedPayment(method)}
                >
                  <Ionicons
                    name={
                      method === "CARD"
                        ? "card-outline"
                        : method === "CASH"
                        ? "cash-outline"
                        : "wallet-outline"
                    }
                    size={28}
                    color={selectedPayment === method ? "#059669" : "#666"}
                  />
                  <Text
                    style={[
                      styles.paymentOptionText,
                      selectedPayment === method &&
                        styles.paymentOptionTextSelected,
                    ]}
                  >
                    {method === "CARD"
                      ? "Carte bancaire"
                      : method === "CASH"
                      ? "Espèces"
                      : "Portefeuille"}
                  </Text>
                  {selectedPayment === method && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#059669"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleCreateOrder}
              disabled={isLoading}
              style={[styles.payButton, isLoading && styles.payButtonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.payButtonText}>
                    Confirmer • {totalPrice} €
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          /* ────────────────────── PANIER CLASSIQUE ────────────────────── */
          <>
            {items.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Votre panier est vide</Text>
              </View>
            ) : (
              <>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {items.map(renderCartItem)}
                </ScrollView>

                <View style={styles.footer}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalPrice}>{totalPrice} €</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCheckout}
                    style={styles.checkoutButton}
                  >
                    <Text style={styles.checkoutButtonText}>
                      Passer la commande
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  paymentContent: { padding: 20, paddingBottom: 40 },
  paymentHeader: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
  },
  totalSection: {
    backgroundColor: "#059669",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  totalLabel: { fontSize: 16, color: "#fff", opacity: 0.9 },
  totalAmount: { fontSize: 36, fontWeight: "800", color: "#fff", marginTop: 8 },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  paymentOptions: { gap: 12, marginVertical: 20 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  paymentOptionSelected: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
  paymentOptionText: { flex: 1, marginLeft: 12, fontSize: 16, color: "#333" },
  paymentOptionTextSelected: { fontWeight: "600", color: "#059669" },
  payButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: { justifyContent: "center", padding: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: { fontSize: 18, color: "#666", fontWeight: "500" },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalPrice: { fontSize: 20, fontWeight: "700", color: "#059669" },
  checkoutButton: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default Cart;
