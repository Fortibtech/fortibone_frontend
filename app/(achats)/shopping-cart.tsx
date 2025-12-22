import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useProCartStore } from "@/stores/achatCartStore";
import { passMultipleOrders } from "@/api/orers/createOrder";
import BackButtonAdmin from "@/components/Admin/BackButton";

export default function ShoppingCartScreen() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, removeItem, clearCart } =
    useProCartStore();

  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert(
        "Panier vide",
        "Ajoutez au moins un produit pour passer commande."
      );
      return;
    }

    setLoading(true);

    try {
      // === PAYLOAD CORRIGÉ POUR TON API ===
      // L'API attend probablement un objet avec une clé "items" qui est un tableau
      const payload = {
        items: items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          // Ne pas envoyer "lines" ni d'autres champs inattendus
        })),
        // Si ton API attend d'autres champs (paymentMethod, notes, etc.), ajoute-les ici
        // paymentMethod: "WALLET",
        // notes: "Livraison rapide",
      };

      const orders = await passMultipleOrders(payload);

      console.log("✅ Commandes créées :", orders);

      clearCart(); // Vide le panier

      Toast.show({
        type: "success",
        text1: "Commande passée !",
        text2: `${orders.length} commande${orders.length > 1 ? "s" : ""} créée${
          orders.length > 1 ? "s" : ""
        }`,
        position: "bottom",
        visibilityTime: 4000,
      });
    } catch (error: any) {
      console.error("❌ Échec checkout :", error);

      const message =
        error.message ||
        "Une erreur est survenue lors de la validation de la commande.";

      Alert.alert("Échec de la commande", message);

      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: message,
        position: "bottom",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = getTotalPrice();
  const totalItemsCount = getTotalItems(); // Quantité totale (pour affichage)

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#ccc" />
          <Text style={styles.emptyText}>Votre panier est vide</Text>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.continueText}>Continuer mes achats</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <BackButtonAdmin />
          <Text style={styles.headerTitle}>Mon Panier</Text>
          <View style={{ width: 40 }} />
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image
                source={{
                  uri: item.imageUrl || "https://via.placeholder.com/100",
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={styles.itemPrice}>
                  {Number(item.variant.price).toLocaleString("fr-CM")} FCFA /
                  pièce
                </Text>
                <Text style={styles.itemQty}>Quantité : {item.quantity}</Text>
                <Text style={styles.itemTotal}>
                  Sous-total :{" "}
                  {(Number(item.variant.price) * item.quantity).toLocaleString(
                    "fr-CM"
                  )}{" "}
                  FCFA
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  removeItem(
                    item.productId,
                    item.variant.id,
                    item.supplierBusinessId
                  )
                }
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
        />

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nombre d&apos;articles :</Text>
            <Text style={styles.summaryValue}>{totalItemsCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total à payer :</Text>
            <Text style={styles.totalAmount}>
              {totalAmount.toLocaleString("fr-CM")} FCFA
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOUTON FIXE EN BAS */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.checkoutText}>Passer la commande</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  scrollContent: { padding: 16, paddingBottom: 100 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",

    color: "#000",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 18, color: "#666", marginTop: 20, marginBottom: 30 },
  continueBtn: {
    backgroundColor: "#00B87C",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemName: { fontSize: 15, fontWeight: "600", color: "#000" },
  itemPrice: { fontSize: 14, color: "#666", marginVertical: 4 },
  itemQty: { fontSize: 14, color: "#333" },
  itemTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: "#00B87C",
    marginTop: 4,
  },
  deleteBtn: { justifyContent: "center" },

  summary: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 16, color: "#666" },
  summaryValue: { fontSize: 16, fontWeight: "600" },
  totalAmount: { fontSize: 20, fontWeight: "bold", color: "#00B87C" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  checkoutBtn: {
    backgroundColor: "#00B87C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutBtnDisabled: { opacity: 0.7 },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
