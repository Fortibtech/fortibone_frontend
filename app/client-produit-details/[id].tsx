// app/(tabs)/product/[id].tsx   (ou là où tu l’as placé)
import { addToFavorite, deleteFavoris, getProductById } from "@/api/Products";
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  // ──────────────────────────────────────────────────────────────
  // Récupération du produit
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        // Optionnel : pré-sélectionner la première variante
        if (data.variants?.length) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error("Erreur récupération produit :", err);
        Toast.show({
          type: "error",
          text1: "Impossible de charger le produit",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ──────────────────────────────────────────────────────────────
  // Gestion des favoris
  // ──────────────────────────────────────────────────────────────
  const handleToggleFavorite = async () => {
    if (favLoading || !id) return;

    try {
      setFavLoading(true);
      if (isFavorite) {
        await deleteFavoris(id);
        setIsFavorite(false);
        Toast.show({ type: "info", text1: "Retiré des favoris" });
      } else {
        await addToFavorite(id);
        setIsFavorite(true);
        Toast.show({ type: "success", text1: "Ajouté aux favoris" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Erreur favoris" });
    } finally {
      setFavLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Ajout / retrait du panier
  // ──────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;

    const variant = selectedVariant || product.variants?.[0];
    if (!variant) {
      Toast.show({
        type: "error",
        text1: "Veuillez choisir une variante",
      });
      return;
    }

    const payload = {
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: Number(variant.price), // ← number obligatoire
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
      text2: alreadyInCart ? undefined : `${product.name} ×1`,
    });
  };

  // ──────────────────────────────────────────────────────────────
  // État "dans le panier" pour l’affichage
  // ──────────────────────────────────────────────────────────────
  const currentVariantId = selectedVariant?.id || product?.variants?.[0]?.id;
  const inCart =
    product && currentVariantId
      ? isInCart(product.id, currentVariantId)
      : false;

  // ──────────────────────────────────────────────────────────────
  // Rendu des étoiles
  // ──────────────────────────────────────────────────────────────
  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Text
        key={i}
        style={{ fontSize: 18, color: i < rating ? "#FFD700" : "#ccc" }}
      >
        ★
      </Text>
    ));

  // ──────────────────────────────────────────────────────────────
  // Loading / Erreur
  // ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Produit introuvable</Text>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // Images du carousel
  // ──────────────────────────────────────────────────────────────
  const images =
    product.variants.length > 0
      ? product.variants.flatMap((v) =>
          v.imageUrl ? [{ uri: v.imageUrl }] : []
        )
      : product.imageUrl
      ? [{ uri: product.imageUrl }]
      : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* ────────────────────── CAROUSEL ────────────────────── */}
      <View style={styles.topSection}>
        <Carousel
          width={screenWidth}
          height={250}
          data={images.length > 0 ? images : [{ uri: product.imageUrl }]}
          scrollAnimationDuration={300}
          onSnapToItem={setActiveSlide}
          renderItem={({ item }) => (
            <View style={styles.carouselContainer}>
              <Image source={item} style={styles.carouselImage} />
              <LinearGradient
                colors={["rgba(0,0,0,0.2)", "transparent"]}
                style={styles.carouselOverlay}
              />
            </View>
          )}
        />

        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Back button */}
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        {/* Icône panier (coin haut droit) */}
        <TouchableOpacity
          style={[
            styles.cartIconContainer,
            inCart ? styles.cartIconContainerInCart : null,
          ]}
          onPress={handleAddToCart}
          activeOpacity={0.7}
        >
          <Image
            source={require("@/assets/images/logo/cart.png")}
            style={[styles.icon, inCart ? { tintColor: "#fff" } : null]}
          />
        </TouchableOpacity>

        {/* Icône cœur favoris */}
        <TouchableOpacity
          style={[
            styles.favoriteIconContainer,
            isFavorite ? { backgroundColor: "red" } : null,
          ]}
          onPress={handleToggleFavorite}
          disabled={favLoading}
          activeOpacity={0.7}
        >
          <Image
            source={require("@/assets/images/logo/heart.png")}
            style={[
              styles.icon,
              favLoading
                ? { tintColor: "#ccc" }
                : isFavorite
                ? { tintColor: "#fff" }
                : null,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* ────────────────────── CONTENU ────────────────────── */}
      <ScrollView
        style={styles.bottomSection}
        contentContainerStyle={styles.bottomSectionContent}
      >
        <Text style={styles.title}>{product.name}</Text>

        <ScrollView style={styles.descriptionContainer} nestedScrollEnabled>
          <Text style={styles.description}>{product.description}</Text>
        </ScrollView>

        <View style={styles.ratingRow}>
          <View style={{ flexDirection: "row" }}>
            {renderStars(Math.round(product.averageRating))}
          </View>
          <Text style={styles.ratingText}>
            {product.averageRating.toFixed(1)} ({product.reviewCount} avis)
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.price}>
            {selectedVariant?.price ?? product.variants[0]?.price ?? "0"} €
          </Text>

          <Text style={styles.stockText}>
            {(selectedVariant ?? product.variants[0])?.quantityInStock > 0
              ? `${
                  (selectedVariant ?? product.variants[0]).quantityInStock
                } en stock`
              : "Rupture de stock"}
          </Text>

          <ProductOptionsSelector
            product={product}
            onVariantSelect={setSelectedVariant}
          />

          <CategoryInfo category={product.category} />

          {/* Bouton principal Ajouter/Retirer */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                inCart ? styles.addToCartButtonInCart : null,
              ]}
              onPress={handleAddToCart}
              activeOpacity={0.7}
            >
              <Text style={styles.addToCartButtonText}>
                {inCart ? "Retirer du panier" : "Ajouter au panier"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <ReviewActions
            onShowReviews={() => setShowReviews(true)}
            onAddReview={() => setShowAddReview(true)}
          />
        </View>

        {/* Modals avis */}
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
      </ScrollView>
    </SafeAreaView>
  );
};

// ──────────────────────────────────────────────────────────────
// Styles (identiques à avant, juste un petit nettoyage)
// ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topSection: {
    height: 250,
    position: "relative",
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  carouselContainer: { position: "relative", width: "100%", height: "100%" },
  carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
  carouselOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 15,
    width: "100%",
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 4 },
  activeDot: { backgroundColor: "#000", transform: [{ scale: 1.2 }] },
  inactiveDot: { backgroundColor: "rgba(255,255,255,0.5)" },
  backButtonContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 5,
    zIndex: 10,
  },
  cartIconContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cartIconContainerInCart: { backgroundColor: "#4caf50" },
  favoriteIconContainer: {
    position: "absolute",
    top: 60,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  icon: { width: 22, height: 22, tintColor: "#000", resizeMode: "contain" },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  bottomSectionContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  descriptionContainer: { maxHeight: 150, marginBottom: 10 },
  description: { fontSize: 16, color: "#666", lineHeight: 24 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  ratingText: { marginLeft: 8, fontSize: 14, color: "#555" },
  infoContainer: { marginBottom: 16 },
  price: { fontSize: 20, fontWeight: "600", color: "#000", marginBottom: 8 },
  stockText: { fontSize: 14, color: "#666", marginBottom: 12 },
  actionButtonsContainer: { marginTop: 20 },
  addToCartButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartButtonInCart: { backgroundColor: "#f44336" },
  addToCartButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  actionsRow: { marginTop: 16 },
});

export default ProductDetails;
