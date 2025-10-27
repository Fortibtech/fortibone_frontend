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
          paymentMethodId: ""
        }
      );

      console.log("✅ Paiement manuel créé:", paymentIntentData);

      Toast.show({
        type: "success",
        text1: "Commande validée ✅",
        text2: "Le paiement sera traité manuellement.",
      });

      // 🔹 Nettoyage
      useCartStore.setState({ items: [] });
    } catch (err: any) {
      console.error("❌ Erreur paiement manuel:", err);
      Alert.alert("Erreur", err.message || "Une erreur est survenue");
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

        {items.length === 0 ? (
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
