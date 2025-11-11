// app/(achats)/product-details/[productId]/index.tsx
import { useState, useRef, useCallback, useEffect } from "react";
import { ProductService } from "@/api";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "@/stores/achatCartStore"; // ← IMPORT ZUSTAND
import Toast from "react-native-toast-message"; // ← Installe si pas fait : expo install react-native-toast-message
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import BackButtonAdmin from "@/components/Admin/BackButton";
const { width } = Dimensions.get("window");
// === Types ===
type Product = import("@/api").Product;
type ProductVariant = import("@/api").ProductVariant;

interface DisplayProduct {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  condition: string;
  availability: string;
  price: number;
  priceUnit: string;
  minimumOrder: number;
  tags: string[];
  images: { url: string }[];
  description: Record<string, string>;
  variant: ProductVariant;
}

// === Composant principal ===
export default function ProductDetailsScreen() {
  const { productId, bussinessId } = useLocalSearchParams<{
    productId: string;
    bussinessId: string;
  }>();

  console.log("Product ID:", productId);
  console.log("Business ID:", bussinessId);

  const [productData, setProductData] = useState<DisplayProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const addToCart = useCartStore((state) => state.addItem); // ← Hook Zustand

  const handleAddToCart = () => {
    if (!productData) return;

    // ──────────────────────────────────────────────────────────────
    // Ajout au panier avec supplierBusinessId
    // ──────────────────────────────────────────────────────────────
    addToCart(
      productData.id,
      productData.name,
      productData.variant,
      quantity,
      productData.images[0]?.url,
      bussinessId
    );

    Toast.show({
      type: "success",
      text1: "Ajouté au panier !",
      text2: `${quantity} × ${productData.name}`,
      position: "bottom",
      visibilityTime: 2000,
    });
  };
  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const product: Product = await ProductService.getProductById(productId);
      const variant = product.variants[0];

      if (!variant) throw new Error("Aucune variante trouvée");

      const priceNum = parseFloat(variant.price) || 0;
      const minOrder = variant.itemsPerLot || variant.alertThreshold || 1;
      const stock = variant.quantityInStock;

      const images = [
        ...(variant.imageUrl ? [{ url: variant.imageUrl }] : []),
        ...(product.imageUrl ? [{ url: product.imageUrl }] : []),
        { url: "https://via.placeholder.com/800x800.png?text=No+Image" },
      ].slice(0, 5);

      const tags = [
        product.category.name || "Sans catégorie",
        ...variant.attributeValues
          .map((av) =>
            av.attribute?.name && av.value
              ? `${av.attribute.name}: ${av.value}`
              : ""
          )
          .filter(Boolean),
        variant.sku,
        stock > 0 ? "En stock" : "Rupture",
      ];

      const description: Record<string, string> = {
        Marque: product.name.split(" ")[0] || "Inconnue",
        Modèle: product.name,
        État: stock > 10 ? "Neuf" : stock > 0 ? "Dernières pièces" : "Épuisé",
        Stock: `${stock} disponible`,
      };

      variant.attributeValues.forEach((av) => {
        if (av.attribute?.name && av.value) {
          description[av.attribute.name] = av.value;
        }
      });

      const displayProduct: DisplayProduct = {
        id: product.id,
        name: product.name,
        category: product.category.name || "Non classé",
        subcategory: product.category.parent?.name,
        condition: variant.lotPrice ? "Vendu par lot" : "À l'unité",
        availability: `Stock: ${stock} ${
          variant.itemsPerLot ? `(${variant.itemsPerLot}/lot)` : ""
        }`,
        price: priceNum,
        priceUnit: variant.lotPrice ? "/lot" : "/pièce",
        minimumOrder: minOrder,
        tags,
        images,
        description,
        variant,
      };

      setProductData(displayProduct);
      setQuantity(minOrder);
    } catch (err: any) {
      console.error("Erreur API:", err);
      Alert.alert("Erreur", err.message || "Impossible de charger le produit");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useFocusEffect(
    useCallback(() => {
      fetchProduct();
    }, [fetchProduct])
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentImageIndex(index);
  };

  const updateQuantity = (delta: number) => {
    if (!productData) return;
    setQuantity((prev) => Math.max(productData.minimumOrder, prev + delta));
  };

  if (loading || !productData) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#00B87C" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>
          Chargement du produit...
        </Text>
      </SafeAreaView>
    );
  }

  // ✅ CORRIGÉ : on utilise directement productData, pas "product"
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title}>Détails</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* CAROUSEL D'IMAGES */}
        <View style={styles.carousel}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {productData.images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: img.url }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.dots}>
            {productData.images.map((_, index) => (
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

        {/* INFORMATIONS */}
        <View style={styles.infoCard}>
          <View style={styles.categories}>
            <Text style={styles.category}>{productData.category}</Text>
            {productData.subcategory && (
              <Text style={styles.subcategory}>
                {" "}
                › {productData.subcategory}
              </Text>
            )}
          </View>

          <Text style={styles.name}>{productData.name}</Text>

          <View style={styles.statusRow}>
            <Text style={styles.condition}>{productData.condition}</Text>
            <Text style={styles.stock}>{productData.availability}</Text>
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {productData.price.toLocaleString("fr-FR")}
              </Text>
              <Text style={styles.unit}> FCFA {productData.priceUnit}</Text>
            </View>
            <Text style={styles.minimum}>
              Minimum : {productData.minimumOrder} pièces
            </Text>
          </View>

          <View style={styles.tags}>
            {productData.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descList}>
            {Object.entries(productData.description).map(([key, value]) => (
              <Text key={key} style={styles.descItem}>
                <Text style={styles.label}>
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                  :{" "}
                </Text>
                <Text style={styles.value}>{value}</Text>
              </Text>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BARRE D'ACTION */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(-1)}
            disabled={quantity <= productData.minimumOrder}
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

        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Ajouter au panier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// === STYLES (identiques) ===
const styles = StyleSheet.create({
  // ... (tout ton StyleSheet original, inchangé)
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
    height: 130,
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
