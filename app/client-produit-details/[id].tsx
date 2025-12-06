// app/(tabs)/product/[id].tsx
import { addToFavorite, deleteFavoris, getProductById } from "@/api/Products";
import BackButtonAdmin from "@/components/Admin/BackButton";
import AddProductReviewModal from "@/components/produit/AddProductReviewModal";
import CategoryInfo from "@/components/produit/CategoryInfo";
import ProductOptionsSelector from "@/components/produit/ProductOptionsSelector";
import ProductReviewsListModal from "@/components/produit/ProductReviewModal";
import ReviewActions from "@/components/produit/ReviewActions";
import { useCartStore } from "@/stores/useCartStore";
import { Products } from "@/types/Product";
import { Variant } from "@/types/v";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar, // ← CORRECT IMPORT
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: screenWidth } = Dimensions.get("window");

const ProductDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleItem, isInCart } = useCartStore();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Products | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [favLoading, setFavLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Cacher la barre de statut (batterie, heure, wifi...) UNIQUEMENT sur cette page
  useEffect(() => {
    StatusBar.setHidden(true, "fade"); // "fade" ou "slide" pour une belle animation

    return () => {
      StatusBar.setHidden(false, "fade");
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data.variants?.length) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Impossible de charger le produit",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ... tout le reste de ton code (handleAddToCart, etc.) reste IDENTIQUE

  const handleToggleFavorite = async () => {
    if (favLoading || !id) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await deleteFavoris(id);
        setIsFavorite(false);
        Toast.show({ type: "info", text1: "Retiré des favoris" });
      } else {
        await addToFavorite(id);
        setIsFavorite(true);
        Toast.show({ type: "success", text1: "Ajouté aux favoris" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Erreur" });
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const variant = selectedVariant || product.variants?.[0];
    if (!variant) {
      Toast.show({ type: "error", text1: "Choisissez une variante" });
      return;
    }

    const payload = {
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: Number(variant.price),
      imageUrl: variant.imageUrl ?? product.imageUrl ?? undefined,
      businessId: product.businessId,
      supplierBusinessId: product.businessId,
      variantName: variant.id,
      stock: variant.quantityInStock,
      currency: "FCFA",
    };

    const alreadyInCart = isInCart(product.id, variant.id);
    toggleItem(payload);

    Toast.show({
      type: alreadyInCart ? "info" : "success",
      text1: alreadyInCart ? "Retiré du panier" : "Ajouté au panier !",
      text2: alreadyInCart ? undefined : `${product.name}`,
    });
  };

  const currentVariant = selectedVariant || product?.variants?.[0];
  const inCart =
    product && currentVariant ? isInCart(product.id, currentVariant.id) : false;
  const outOfStock = currentVariant?.quantityInStock === 0;

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Text key={i} style={{ fontSize: 18, marginRight: 3 }}>
        {i < Math.round(rating) ? "★" : "☆"}
      </Text>
    ));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 18, color: "#999" }}>
            Produit introuvable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = product.variants
    .flatMap((v) => (v.imageUrl ? [{ uri: v.imageUrl }] : []))
    .concat(product.imageUrl ? [{ uri: product.imageUrl }] : [])
    .slice(0, 10);

  const hasImages = images.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* TON UI RESTE 100% IDENTIQUE */}
      <View style={styles.hero}>
        <Carousel
          width={screenWidth}
          height={340}
          data={hasImages ? images : [{ uri: "https://picsum.photos/600/800" }]}
          onSnapToItem={setActiveSlide}
          renderItem={({ item }) => (
            <Image source={item} style={styles.heroImage} resizeMode="cover" />
          )}
        />
        {/* ... tout le reste de ton UI (dots, topActions, etc.) */}
        {hasImages && images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeSlide && styles.activeDot]}
              />
            ))}
          </View>
        )}
        <View style={styles.topActions}>
          <BackButtonAdmin backgroundColor="rgba(255, 255, 255, 0.9)" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[styles.iconBtn, inCart && styles.cartActive]}
              onPress={handleAddToCart}
            >
              <Image
                source={require("@/assets/images/logo/cart.png")}
                style={[styles.icon, inCart && { tintColor: "#fff" }]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, isFavorite && styles.heartActive]}
              onPress={handleToggleFavorite}
              disabled={favLoading}
            >
              <Image
                source={require("@/assets/images/logo/heart.png")}
                style={[
                  styles.icon,
                  isFavorite ? { tintColor: "#fff" } : { tintColor: "#000" },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Le reste de ton UI (fixedInfo, ScrollView, bottomBar, modals) → inchangé */}
      <View style={styles.fixedInfo}>
        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.ratingRow}>
          {renderStars(product.averageRating)}
          <Text style={styles.ratingText}>
            {product.averageRating.toFixed(1)} ({product.reviewCount} avis)
          </Text>
        </View>
        <Text style={styles.price}>{currentVariant?.price ?? "0"} KMF</Text>
        {outOfStock ? (
          <Text style={styles.outOfStock}>Rupture de stock</Text>
        ) : (
          <Text style={styles.inStock}>
            {currentVariant?.quantityInStock} en stock
          </Text>
        )}
        <ReviewActions
          onShowReviews={() => setShowReviews(true)}
          onAddReview={() => setShowAddReview(true)}
        />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text
            style={styles.description}
            numberOfLines={descriptionExpanded ? undefined : 4}
          >
            {product.description || "Aucune description disponible."}
          </Text>
          {(product.description?.length ?? 0) > 150 && (
            <TouchableOpacity
              onPress={() => setDescriptionExpanded(!descriptionExpanded)}
            >
              <Text style={styles.readMore}>
                {descriptionExpanded ? "Afficher moins" : "Lire la suite"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options du produit</Text>
          <ProductOptionsSelector
            product={product}
            onVariantSelect={setSelectedVariant}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégorie</Text>
          <CategoryInfo category={product.category} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.addButton,
            inCart && styles.addButtonActive,
            outOfStock && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={outOfStock}
        >
          <Text style={styles.addButtonText}>
            {inCart ? "Retirer du panier" : "Ajouter au panier"}
          </Text>
        </TouchableOpacity>
      </View>

      <ProductReviewsListModal
        productId={product.id}
        visible={showReviews}
        onClose={() => setShowReviews(false)}
      />
      <AddProductReviewModal
        productId={product.id}
        visible={showAddReview}
        onClose={() => setShowAddReview(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: { position: "relative", backgroundColor: "#371616ff", height: 250 },
  heroImage: { width: "100%", height: 250 },
  dots: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: { backgroundColor: "#fff", width: 24 },
  topActions: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
  },
  cartActive: { backgroundColor: "#22c55e" },
  heartActive: { backgroundColor: "#e74c3c" },
  icon: { width: 22, height: 22, tintColor: "#000" },
  fixedInfo: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#111", marginBottom: 6 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  ratingText: { fontSize: 15, color: "#666", fontWeight: "500" },
  price: { fontSize: 28, fontWeight: "800", color: "#111", marginBottom: 6 },
  outOfStock: { color: "#e11d48", fontWeight: "700", fontSize: 15 },
  inStock: { color: "#16a34a", fontWeight: "600", fontSize: 15 },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },
  description: { fontSize: 15, lineHeight: 23, color: "#444" },
  readMore: { marginTop: 10, color: "#111", fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    paddingTop: 12,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  addButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  addButtonActive: { backgroundColor: "#f97316" },
  disabledButton: { backgroundColor: "#94a3b8" },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ProductDetails;
