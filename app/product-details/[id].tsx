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
  // États pour les modals
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Erreur récupération produit :", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (favLoading) return;

    try {
      setFavLoading(true);
      if (isFavorite) {
        // → retirer
        await deleteFavoris(id);
        setIsFavorite(false);
        Toast.show({
          type: "info",
          text1: "Produit retiré des favoris",
        });
      } else {
        // → ajouter
        await addToFavorite(id);
        setIsFavorite(true);
        Toast.show({
          type: "success",
          text1: "Produit ajouté aux favoris",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la mise à jour du favori",
      });
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  };

  const inCart = (variantId?: string) => {
    if (variantId) return isInCart(variantId);
    // fallback: pas de variant
    return isInCart(product?.id || "");
  };

  const handleAddToCart = () => {
    if (!product) return;

    // état avant action
    const alreadyInCart = selectedVariant
      ? isInCart(selectedVariant.id)
      : isInCart(product.id);

    // on construit l'item qu'on veut toggle
    const variant = selectedVariant || {
      id: product.id,
      price: product.variants?.[0]?.price ?? 0, // fallback 0 si pas de variant
      imageUrl: product.imageUrl,
    };

    toggleItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price,
      imageUrl: variant.imageUrl,
      quantity: 1,
    });

    // toast cohérent
    if (alreadyInCart) {
      Toast.show({
        type: "info",
        text1: "Produit retiré du panier",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "✅ Le produit a été ajouté au panier avec succès !",
      });
    }
  };
  const renderStars = (val: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Text
        key={i}
        style={{ fontSize: 18, color: i < val ? "#FFD700" : "#ccc" }}
      >
        ★
      </Text>
    ));

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

  // Images du carrousel (pour l’instant juste l’image principale)
  const images = product.variants.length
    ? product.variants.map((v) => ({ uri: v.imageUrl }))
    : [{ uri: product.imageUrl }];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Carousel
          width={screenWidth}
          height={250}
          data={images}
          scrollAnimationDuration={300} // Smoother animation
          onSnapToItem={(index) => setActiveSlide(index)}
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

        {/* Pagination */}
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

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        {/* Cart Icon */}
        <TouchableOpacity
          style={[
            styles.cartIconContainer,
            inCart(selectedVariant?.id) && { backgroundColor: "#4caf50" },
          ]}
          onPress={handleAddToCart}
          activeOpacity={0.7} // Subtle press feedback
        >
          <Image
            source={require("@/assets/images/logo/cart.png")}
            style={[
              styles.icon,
              inCart(selectedVariant?.id) && { tintColor: "#fff" },
            ]}
          />
        </TouchableOpacity>

        {/* Favorite Icon */}
        <TouchableOpacity
          style={[
            styles.favoriteIconContainer,
            isFavorite && { backgroundColor: "red" },
          ]}
          onPress={handleToggleFavorite}
          disabled={favLoading}
          activeOpacity={0.7}
        >
          <Image
            source={require("@/assets/images/logo/heart.png")}
            style={[
              styles.icon,
              favLoading && { tintColor: "#ccc" },
              isFavorite && { tintColor: "#fff" },
            ]}
          />
        </TouchableOpacity>
      </View>
      {/* Partie basse : description + avis */}
      <ScrollView
        style={styles.bottomSection}
        contentContainerStyle={styles.bottomSectionContent}
      >
        <Text style={styles.title}>{product.name}</Text>
        <ScrollView style={styles.descriptionContainer} nestedScrollEnabled>
          <Text style={styles.description}>{product.description}</Text>
        </ScrollView>

        {/* Note + nombre d’avis */}
        <View style={styles.ratingRow}>
          <View style={{ flexDirection: "row" }}>
            {renderStars(Math.round(product.averageRating))}
          </View>
          <Text style={styles.ratingText}>
            {product.averageRating.toFixed(1)} ({product.reviewCount} avis)
          </Text>
        </View>
        {/* autre */}
        <View style={styles.infoContainer}>
          <Text style={styles.price}>{product.variants[0].price}</Text>
          <Text style={styles.stockText}>
            {product.variants[0].quantityInStock > 0
              ? `${product.variants[0].quantityInStock} pièces en stock`
              : "Rupture de stock"}
          </Text>

          <ProductOptionsSelector
            product={product}
            onVariantSelect={setSelectedVariant}
          />
          <CategoryInfo category={product.category} />
        </View>

        <View style={styles.reviewActionsContainer}>
          <ReviewActions
            onShowReviews={() => setShowReviews(true)}
            onAddReview={() => setShowAddReview(true)}
          />
        </View>

        {/* Modal pour lister les avis */}
        <ProductReviewsListModal
          productId={product.id}
          visible={showReviews}
          onClose={() => setShowReviews(false)}
        />

        {/* Modal pour ajouter un avis */}
        <AddProductReviewModal
          productId={product.id}
          visible={showAddReview}
          onClose={() => setShowAddReview(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topSection: {
    height: 250,
    position: "relative",
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  carouselContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    transform: [{ scale: 0.8 }],
  },
  activeDot: {
    backgroundColor: "#000",
    transform: [{ scale: 1.2 }],
  },
  inactiveDot: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  backButtonContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: "#000",
    resizeMode: "contain",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  bottomSectionContent: {
    padding: 20,
    paddingBottom: 40, // Extra padding to ensure content is not cut off
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  descriptionContainer: {
    maxHeight: 150,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    paddingRight: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  infoContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  stockText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  reviewActionsContainer: {
    marginTop: 16,
    marginBottom: 20, // Ensure buttons are not cut off
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
  },
  btnText: {
    color: "#000",
  },
});

export default ProductDetails;
