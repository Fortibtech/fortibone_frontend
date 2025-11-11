// app/(achats)/cartproduct/index.tsx
// Composant : Panier d'achat avec validation de commande via l'API createOrder
import  { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator, // ← Pour le loader pendant l'envoi
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // ← Pour rediriger après succès
import Toast from "react-native-toast-message";

// Stores & API
import { useCartStore, CartItem } from "@/stores/achatCartStore";
import { createOrder, CreateOrderPayload } from "@/api/Orders";

// Composants réutilisables
import BackButtonAdmin from "@/components/Admin/BackButton";
import { useUserStore } from "@/store/userStore";

const { width } = Dimensions.get("window");

const ShoppingCart = () => {
  // ──────────────────────────────────────────────────────────────
  // 1. Zustand : accès au panier global
  // ──────────────────────────────────────────────────────────────
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore();

  // ──────────────────────────────────────────────────────────────
  // 2. Navigation & états locaux
  // ──────────────────────────────────────────────────────────────
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // ← Empêche le double clic

  // ──────────────────────────────────────────────────────────────
  // Vérification multi-fournisseurs (optionnel, mais recommandé)
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const supplierIds = [
      ...new Set(items.map((item) => item.supplierBusinessId)),
    ];
    if (supplierIds.length > 1) {
      Toast.show({
        type: "error",
        text1: "Attention",
        text2:
          "Vous avez des produits de plusieurs fournisseurs. Veuillez commander auprès d'un seul fournisseur à la fois.",
        visibilityTime: 5000,
      });
    }
  }, [items]);

  // ──────────────────────────────────────────────────────────────
  // 3. Mise à jour quantité (+ / -)
  // ──────────────────────────────────────────────────────────────
  const handleUpdateQuantity = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      // Quantité à 0 → on retire complètement
      removeItem(item.productId, item.variant.id);
      Toast.show({ type: "info", text1: "Retiré du panier" });
    } else {
      updateQuantity(item.productId, item.variant.id, newQty);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 4. Suppression avec confirmation native
  // ──────────────────────────────────────────────────────────────
  const handleRemove = (item: CartItem) => {
    Alert.alert(
      "Retirer du panier",
      `Voulez-vous supprimer ${item.productName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            removeItem(item.productId, item.variant.id);
            Toast.show({ type: "info", text1: "Produit retiré" });
          },
        },
      ]
    );
  };

  // ──────────────────────────────────────────────────────────────
  // 6. PASSER COMMANDE → appel API createOrder()
  // ──────────────────────────────────────────────────────────────

  const handleCheckout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // ──────────────────────────────────────────────────────────────
      // 1. Récupère acheteur + fournisseur
      // ──────────────────────────────────────────────────────────────
      const buyerBusinessId = useUserStore.getState().userProfile?.id;
      if (!buyerBusinessId) throw new Error("Utilisateur non connecté");

      if (items.length === 0) throw new Error("Panier vide");

      // Tous les articles doivent avoir le même fournisseur
      const supplierIds = [...new Set(items.map((i) => i.supplierBusinessId))];
      if (supplierIds.length !== 1) {
        throw new Error(
          "Tous les produits doivent provenir du même fournisseur"
        );
      }
      const supplierBusinessId = supplierIds[0];

      // ──────────────────────────────────────────────────────────────
      // 2. Payload FINAL qui marche à 100%
      // ──────────────────────────────────────────────────────────────
      const payload: CreateOrderPayload = {
        type: "SALE",
        businessId: buyerBusinessId, // ← acheteur
        supplierBusinessId: supplierBusinessId, // ← fournisseur (OBLIGATOIRE MAINTENANT)
        notes: `Commande mobile - ${
          items.length
        } article(s) - ${new Date().toLocaleDateString("fr-FR")}`,
        lines: items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
      };

      console.log(
        "🚀 PAYLOAD FINAL CORRIGÉ :",
        JSON.stringify(payload, null, 2)
      );

      const orderResponse = await createOrder(payload);

      // ──────────────────────────────────────────────────────────────
      // Succès !
      // ──────────────────────────────────────────────────────────────
      clearCart();
      Toast.show({
        type: "success",
        text1: "Commande passée ! 🎉",
        text2: `N° ${orderResponse.orderNumber}`,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Impossible",
        text2: error.message || "Erreur serveur",
        visibilityTime: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 7. Calcul du total (Zustand le fait déjà)
  // ──────────────────────────────────────────────────────────────
  const totalPrice = getTotalPrice();

  // ──────────────────────────────────────────────────────────────
  // 8. Panier vide → état alternatif
  // ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header avec retour */}
        <View style={styles.header}>
          <BackButtonAdmin />
          <Text style={styles.title}>Mon Panier</Text>
          <View style={styles.spacer} />
        </View>

        {/* État vide */}
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyText}>
            Ajoutez des produits pour continuer vos achats
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // 9. Panier avec produits
  // ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title}>Mon Panier ({items.length})</Text>
        <TouchableOpacity
          onPress={() => {
            clearCart();
            Toast.show({ type: "info", text1: "Panier vidé" });
          }}
        >
          <Text style={styles.clearText}>Vider</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des articles */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {items.map((item) => (
          <View
            key={`${item.productId}-${item.variant.id}`}
            style={styles.itemCard}
          >
            {/* Image produit */}
            <Image
              source={{
                uri: item.imageUrl || "https://via.placeholder.com/80",
              }}
              style={styles.itemImage}
              resizeMode="cover"
            />

            {/* Infos produit */}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.productName}
              </Text>

              <View style={styles.itemTags}>
                <Text style={styles.itemSku}>SKU: {item.variant.sku}</Text>
                {item.variant.itemsPerLot && (
                  <Text style={styles.lotTag}>
                    Lot de {item.variant.itemsPerLot}
                  </Text>
                )}
              </View>

              <Text style={styles.itemPrice}>
                {parseFloat(item.variant.price).toLocaleString("fr-FR")} FCFA
                {item.variant.lotPrice ? "/lot" : "/pièce"}
              </Text>

              {/* Actions : quantité & suppression */}
              <View style={styles.itemActions}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQuantity(item, -1)}
                  >
                    <Ionicons name="remove" size={18} color="#00B87C" />
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQuantity(item, +1)}
                  >
                    <Ionicons name="add" size={18} color="#00B87C" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(item)}
                >
                  <Ionicons name="trash-outline" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Résumé de commande */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>
              {totalPrice.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>
              Calculée à l&apos;étape suivante
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>
              {totalPrice.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>
        </View>

        {/* Espace pour le bouton fixe */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ────────────────────────────────────────────────────────── */}
      {/* BOUTON FIXE EN BAS → PASSER COMMANDE */}
      {/* ────────────────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>
            {totalPrice.toLocaleString("fr-FR")} FCFA
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            isLoading && styles.checkoutBtnDisabled, // ← Grisé pendant loading
          ]}
          onPress={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.checkoutText}>Passer commande</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ──────────────────────────────────────────────────────────────
// Styles (inchangés + petit ajout pour le bouton disabled)
// ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  checkoutBtnDisabled: {
    backgroundColor: "#999",
    opacity: 0.7,
  },

  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#000" },
  spacer: { width: 32 },
  clearText: { fontSize: 14, color: "#00B87C", fontWeight: "600" },

  scrollView: { flex: 1 },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#333", marginTop: 20 },
  emptyText: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 8 },
  shopBtn: {
    marginTop: 24,
    backgroundColor: "#00B87C",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopBtnText: { color: "#FFF", fontWeight: "600", fontSize: 16 },

  // Item Card
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    lineHeight: 20,
  },
  itemTags: { flexDirection: "row", gap: 8, marginTop: 4 },
  itemSku: { fontSize: 12, color: "#666" },
  lotTag: {
    fontSize: 11,
    color: "#00B87C",
    backgroundColor: "#E6F7EF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00B87C",
    marginTop: 4,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 16,
  },
  removeBtn: { padding: 8 },

  // Summary
  summaryCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 14, color: "#666" },
  summaryValue: { fontSize: 14, color: "#000", fontWeight: "500" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginTop: 8,
  },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#000" },
  totalPrice: { fontSize: 20, fontWeight: "700", color: "#00B87C" },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  totalSection: { flex: 1 },
  totalText: { fontSize: 14, color: "#666" },
  totalAmount: { fontSize: 18, fontWeight: "700", color: "#00B87C" },
  checkoutBtn: {
    flexDirection: "row",
    backgroundColor: "#00B87C",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  checkoutText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});

export default ShoppingCart;
