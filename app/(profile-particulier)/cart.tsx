import { createOrder } from "@/api/Orders";
import BackButton from "@/components/BackButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCartStore } from "@/stores/useCartStore";
import { CreateOrderPayload } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
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

// 🔹 Interface explicite pour CartItem
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

  const handleCheckout = async () => {
    if (isLoading) return;
    if (items.length === 0) {
      Toast.show({
        type: "info",
        text1: "Votre panier est vide",
      });
      return;
    }

    // Vérification du premier item pour businessId / supplierBusinessId
    const firstItem = items[0];
    if (!firstItem.businessId || !firstItem.supplierBusinessId) {
      Toast.show({
        type: "error",
        text1: "Impossible de passer la commande",
        text2: "Fournisseur ou business manquant pour le produit",
      });
      console.error("🛑 Premier item invalide:", firstItem);
      return;
    }

    // Vérification que tous les items ont le même businessId et supplierBusinessId
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
      console.error("🛑 Articles de fournisseurs différents:", invalidBusiness);
      return;
    }

    // Vérification que tous les items ont un variantId
    const invalidItem = items.find((i) => !i.variantId);
    if (invalidItem) {
      Toast.show({
        type: "error",
        text1: "Produit invalide dans le panier",
        text2: invalidItem.name,
      });
      console.error("🛑 Item sans variantId:", invalidItem);
      return;
    }

    // Construction du payload
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

    console.log("📦 Payload envoyé à l’API:", JSON.stringify(payload, null, 2));

    try {
      setIsLoading(true);
      const res = await createOrder(payload);
      console.log("✅ Commande réussie:", res);

      // Vider le panier après succès
      useCartStore.setState({ items: [] });

      Toast.show({
        type: "success",
        text1: "Commande passée avec succès 🎉",
      });
    } catch (err: any) {
      console.error(
        "❌ Erreur lors de la création de la commande:",
        err.response?.data || err.message
      );
      Toast.show({
        type: "error",
        text1: "Erreur lors de la commande",
        text2: err.response?.data?.message?.join?.(", ") || err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour incrémenter/décrémenter la quantité
  const updateQuantity = (variantId: string, delta: number) => {
    useCartStore.setState((state) => {
      const updatedItems = [...state.items];
      const index = updatedItems.findIndex(
        (item) => item.variantId === variantId
      );
      if (index !== -1) {
        const newQuantity = updatedItems[index].quantity + delta;
        if (newQuantity <= 0) {
          return { items: updatedItems.filter((_, i) => i !== index) }; // Supprime si quantité = 0
        }
        updatedItems[index].quantity = newQuantity;
      }
      return { items: updatedItems };
    });
  };

  // Calcul du total
  const totalPrice = items
    .reduce((sum, item) => {
      const price = parseFloat(item.price);
      return isNaN(price) ? sum : sum + price * item.quantity;
    }, 0)
    .toFixed(2);

  // Calcul du nombre total d'articles
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Rendu d'un item du panier
  const renderCartItem = (item: CartItem) => (
    <View key={item.variantId} style={styles.cartItem}>
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : fallbackImage}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {parseFloat(item.price).toFixed(2)} € x {item.quantity}
        </Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.variantId, -1)}
            style={styles.quantityButton}
            accessibilityLabel="Diminuer la quantité"
          >
            <Ionicons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.variantId, 1)}
            style={styles.quantityButton}
            accessibilityLabel="Augmenter la quantité"
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeItem(item.variantId)}
        style={styles.removeButton}
        accessibilityLabel="Supprimer l'article"
      >
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

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
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
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
                accessibilityLabel="Passer la commande"
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
});

export default Cart;
