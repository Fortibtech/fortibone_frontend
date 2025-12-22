// components/Cart/CartButton.tsx
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useProCartStore } from "@/stores/achatCartStore";

const CartButton = () => {
  // Changement ici : on prend le nombre d'articles uniques (pas la somme des quantités)
  const cartItemsCount = useProCartStore((state) => state.items.length);

  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/(achats)/shopping-cart")} // Adapte si besoin
      style={styles.container}
      activeOpacity={0.7}
    >
      <Feather name="shopping-cart" size={26} color="#000" />

      {/* Badge visible seulement s'il y a au moins 1 produit différent */}
      {cartItemsCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartItemsCount > 99 ? "99+" : cartItemsCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CartButton;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 4,
    backgroundColor: "#FF3B30", // Rouge classique
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#fff", // Bordure blanche pour meilleur contraste
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
