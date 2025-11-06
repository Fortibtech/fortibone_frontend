// app/(achats)/product-details/[productId]/index.tsx
import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import BackButtonAdmin from "@/components/Admin/BackButton";

const { width } = Dimensions.get("window");

// === Types ===
interface ProductImage {
  url: string;
}

interface ProductDescription {
  brand: string;
  model: string;
  state: string;
  storage: string;
  ram: string;
  system: string;
  processor: string;
  screenSize: string;
  simCard: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  condition: string;
  availability: string;
  price: number;
  priceUnit: string;
  minimumOrder: number;
  tags: string[];
  images: ProductImage[];
  description: ProductDescription;
}

// === Composant principal ===
export default function ProductDetailsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();

  // === États locaux ===
  const [quantity, setQuantity] = useState(10);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // === Données mock (à remplacer par API) ===
  const product: Product = {
    id: productId || "1",
    name: "iPhone 14 Pro - 128Go - 8Go - 12MP/12MP - Gris - Reconditionné",
    category: "Électroniques",
    subcategory: "Téléphones",
    condition: "Pièce unique",
    availability: "Stock dispo: 45 lots",
    price: 299000,
    priceUnit: "/pièce",
    minimumOrder: 10,
    tags: [
      "Apple",
      "iPhone 14",
      "iOS 17",
      "Neuf scellé",
      "128Go",
      "8Go RAM",
      "12MP/12MP",
      "Gris",
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      },
      {
        url: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800",
      },
      {
        url: "https://images.unsplash.com/photo-1696446702780-ae687b49f4c5?w=800",
      },
    ],
    description: {
      brand: "Apple",
      model: "iPhone 14",
      state: "Neuf",
      storage: "128Go/256Go/512Go",
      ram: "4Go/8Go",
      system: "iOS 16",
      processor: "A15 Bionic chip",
      screenSize: '6.1"',
      simCard: "1 nano SIM + eSIM",
    },
  };

  // === Gestion de la quantité ===
  const updateQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(product.minimumOrder, prev + delta));
  };

  // === Gestion du carousel ===
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentImageIndex(index);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* ==================== HEADER ==================== */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title}>Détails</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* ==================== CAROUSEL D'IMAGES ==================== */}
        <View style={styles.carousel}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: img.url }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Indicateur de page */}
          <View style={styles.dots}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index
                    ? styles.dotActive
                    : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ==================== INFORMATIONS ==================== */}
        <View style={styles.infoCard}>
          {/* Catégories */}
          <View style={styles.categories}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.subcategory}> › {product.subcategory}</Text>
          </View>

          {/* Nom */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Condition & Stock */}
          <View style={styles.statusRow}>
            <Text style={styles.condition}>{product.condition}</Text>
            <Text style={styles.stock}>{product.availability}</Text>
          </View>

          {/* Prix */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {product.price.toLocaleString("fr-FR")}
              </Text>
              <Text style={styles.unit}>{product.priceUnit}</Text>
            </View>
            <Text style={styles.minimum}>
              Minimum : {product.minimumOrder} pièces
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            {product.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ==================== DESCRIPTION ==================== */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>

          <View style={styles.descList}>
            {Object.entries(product.description).map(([key, value]) => (
              <Text key={key} style={styles.descItem}>
                <Text style={styles.label}>
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                  :{" "}
                </Text>
                <Text style={styles.value}>{value}</Text>
              </Text>
            ))}
            <TouchableOpacity>
              <Text style={styles.viewMore}>Voir plus</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Espace bas pour le bouton fixe */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ==================== BARRE D'ACTION FIXE ==================== */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(-1)}
            disabled={quantity <= product.minimumOrder}
          >
            <Ionicons name="remove" size={20} color="#00B87C" />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(1)}
          >
            <Ionicons name="add" size={20} color="#00B87C" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartBtn}>
          <Text style={styles.addToCartText}>Ajouter au panier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// === STYLES COHÉRENTS AVEC L'APP ===
const styles = StyleSheet.create({
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

  scrollView: { flex: 1 },

  // Carousel
  carousel: { backgroundColor: "#FFFFFF" },
  imageWrapper: {
    width,
    height: 340,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: "#00B87C", width: 24 },
  dotInactive: { backgroundColor: "#D1D5DB" },

  // Info Card
  infoCard: { backgroundColor: "#FFFFFF", padding: 16, marginTop: 1 },
  categories: { flexDirection: "row", marginBottom: 8 },
  category: { fontSize: 13, color: "#666" },
  subcategory: { fontSize: 13, color: "#666" },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  condition: { fontSize: 13, color: "#666" },
  stock: { fontSize: 13, color: "#666" },
  priceSection: { marginBottom: 16 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  price: { fontSize: 24, fontWeight: "700", color: "#00B87C" },
  unit: { fontSize: 14, color: "#666", marginLeft: 4 },
  minimum: { fontSize: 13, color: "#666" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: { fontSize: 12, color: "#4B5563", fontWeight: "500" },

  // Description
  descriptionCard: { backgroundColor: "#FFFFFF", padding: 16, marginTop: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  descList: { gap: 12 },
  descItem: { fontSize: 14, color: "#666", lineHeight: 20 },
  label: { color: "#666" },
  value: { color: "#000", fontWeight: "500" },
  viewMore: { fontSize: 14, color: "#00B87C", fontWeight: "600", marginTop: 4 },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  qtyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 20,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: "#00B87C",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addToCartText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
