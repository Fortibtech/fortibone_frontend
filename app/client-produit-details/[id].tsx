// app/(tabs)/product/[id].tsx
import { addToFavorite, deleteFavoris, getProductById } from "@/api/Products";
import BackButtonAdmin from "@/components/Admin/BackButton";
import BackButton from "@/components/BackButton";
import AddProductReviewModal from "@/components/produit/AddProductReviewModal";
import CategoryInfo from "@/components/produit/CategoryInfo";
import ProductOptionsSelector from "@/components/produit/ProductOptionsSelector";
import ProductReviewsListModal from "@/components/produit/ProductReviewModal";
import ReviewActions from "@/components/produit/ReviewActions";
import { useCartStore } from "@/stores/useCartStore";
import { Products } from "@/types/Product";
import { Variant } from "@/types/v";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: screenWidth } = Dimensions.get("window");

const ProductDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { toggleItem, isInCart } = useCartStore();

  const [product, setProduct] = useState<Products | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [favLoading, setFavLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Animation du bouton flottant
  const scrollY = new Animated.Value(0);
  const floatingButtonOpacity = scrollY.interpolate({
    inputRange: [100, 300],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

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
        Toast.show({ type: "success", text1: "Ajouté aux favoris ❤️" });
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
      <Text key={i} style={{ fontSize: 20, marginRight: 2 }}>
        {i < rating ? "★" : "☆"}
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
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 18, color: "#999" }}>Produit introuvable</Text>
      </SafeAreaView>
    );
  }

  const images = product.variants
    .flatMap((v) => (v.imageUrl ? [{ uri: v.imageUrl }] : []))
    .concat(product.imageUrl ? [{ uri: product.imageUrl }] : [])
    .slice(0, 10); // max 10 images

  const hasImages = images.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* ==================== HERO CAROUSEL ==================== */}
      <View style={styles.topSection}>
        <Carousel
          width={screenWidth}
          height={280}
          data={hasImages ? images : [{ uri: "https://picsum.photos/600/800" }]}
          onSnapToItem={setActiveSlide}
          renderItem={({ item }) => (
            <View style={styles.carouselContainer}>
              <Image source={item} style={styles.carouselImage} />
              <LinearGradient
                colors={["rgba(0,0,0,0.3)", "transparent"]}
                style={styles.carouselOverlay}
              />
            </View>
          )}
        />

        {/* Dots */}
        {hasImages && images.length > 1 && (
          <View style={styles.paginationContainer}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeSlide ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        )}

        {/* Back */}
        <View style={styles.backButtonContainer}>
          <BackButtonAdmin />
        </View>

        {/* Panier rapide */}
        <TouchableOpacity
          style={[
            styles.quickCartButton,
            inCart && styles.quickCartButtonActive,
          ]}
          onPress={handleAddToCart}
        >
          <Image
            source={require("@/assets/images/logo/cart.png")}
            style={[styles.quickIcon, inCart && { tintColor: "#fff" }]}
          />
        </TouchableOpacity>

        {/* Favoris */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive,
          ]}
          onPress={handleToggleFavorite}
          disabled={favLoading}
        >
          <Image
            source={require("@/assets/images/logo/heart.png")}
            style={[
              styles.quickIcon,
              isFavorite ? { tintColor: "#fff" } : { tintColor: "#000" },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* ==================== CONTENU ==================== */}
      <Animated.ScrollView
        style={styles.bottomSection}
        contentContainerStyle={styles.bottomContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
          }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.title}>{product.name}</Text>

        {/* Description expandable */}
        <View style={styles.descriptionWrapper}>
          <Text
            style={styles.description}
            numberOfLines={descriptionExpanded ? undefined : 4}
          >
            {product.description || "Aucune description disponible."}
          </Text>
          {(product.description?.length ?? 0) > 120 && (
            <TouchableOpacity
              onPress={() => setDescriptionExpanded(!descriptionExpanded)}
              style={{ marginTop: 8 }}
            >
              <Text style={styles.readMoreText}>
                {descriptionExpanded ? "Afficher moins" : "Lire la suite"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <View style={{ flexDirection: "row" }}>
            {renderStars(Math.round(product.averageRating))}
          </View>
          <Text style={styles.ratingText}>
            {product.averageRating.toFixed(1)} • {product.reviewCount} avis
          </Text>
        </View>

        {/* Prix + Stock */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{currentVariant?.price ?? "0"} KMF</Text>
          {outOfStock && (
            <Text style={styles.outOfStock}>Rupture de stock</Text>
          )}
          {!outOfStock && (
            <Text style={styles.stockText}>
              {currentVariant?.quantityInStock} en stock
            </Text>
          )}
        </View>

        <ProductOptionsSelector
          product={product}
          onVariantSelect={setSelectedVariant}
        />
        <CategoryInfo category={product.category} />

        <ReviewActions
          onShowReviews={() => setShowReviews(true)}
          onAddReview={() => setShowAddReview(true)}
        />

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* ==================== BOUTONS FIXES BAS ==================== */}
      <View style={styles.fixedBottomBar}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            inCart && styles.addToCartButtonInCart,
            outOfStock && styles.buttonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={outOfStock}
        >
          <Text style={styles.addToCartText}>
            {inCart ? "Retirer" : "Ajouter au panier"}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.buyNowButton, outOfStock && styles.buttonDisabled]}
          disabled={outOfStock}
          onPress={() => {
            handleAddToCart();
            // router.push("/cart");
          }}
        >
          <Text style={styles.buyNowText}>Acheter maintenant</Text>
        </TouchableOpacity> */}
      </View>

      {/* Modals */}
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

// ========================================
// STYLES ULTIMES 2025 – UI/UX PARFAITE
// ========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // SECTION HAUT (CARROUSEL + ACTIONS)
  topSection: {
    height: 260,
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  carouselContainer: { width: "100%", height: "100%" },
  carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
  carouselOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "38%",
  },

  paginationContainer: {
    position: "absolute",
    bottom: 18,
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginHorizontal: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  activeDot: { backgroundColor: "#fff", transform: [{ scale: 1.25 }] },
  inactiveDot: { backgroundColor: "rgba(255,255,255,0.4)" },

  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    padding: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  quickCartButton: {
    position: "absolute",
    top: 10,
    right: 56,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  quickCartButtonActive: { backgroundColor: "#4caf50" },

  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  favoriteButtonActive: { backgroundColor: "#e74c3c" },

  quickIcon: { width: 22, height: 22, tintColor: "#000" },

  // SECTION BAS (CONTENU)
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
  },
  bottomContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 110,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },

  descriptionWrapper: { marginTop: 6, marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, color: "#4b5563" },
  readMoreText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },

  priceContainer: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  price: { fontSize: 24, fontWeight: "800", color: "#111827" },
  outOfStock: {
    fontSize: 14,
    color: "#e11d48",
    fontWeight: "600",
  },
  stockText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },

  // BARRE FIXE BAS
  fixedBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },

  addToCartButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartButtonInCart: { backgroundColor: "#f97316" },
  addToCartText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  buyNowButton: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  buttonDisabled: { backgroundColor: "#d1d5db", opacity: 0.7 },

  floatingCartButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    zIndex: 100,
  },
  floatingButtonInner: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    elevation: 10,
  },
  floatingButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default ProductDetails;
