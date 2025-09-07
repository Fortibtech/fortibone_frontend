// app/ProductDetails.tsx
import { addToFavorite, getProductById, deleteFavoris } from "@/api/Products";
import BackButton from "@/components/BackButton";
import AddProductReviewModal from "@/components/produit/AddProductReviewModal";
import CategoryInfo from "@/components/produit/CategoryInfo";
import ProductOptionsSelector from "@/components/produit/ProductOptionsSelector";
import ProductReviewsListModal from "@/components/produit/ProductReviewModal";
import ProductReviewModal from "@/components/produit/ProductReviewModal";
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
          scrollAnimationDuration={500}
          onSnapToItem={(index) => setActiveSlide(index)}
          renderItem={({ item }) => (
            <Image source={item} style={styles.carouselImage} />
          )}
        />

        {/* pagination */}
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

        {/* Bouton retour */}
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>

        {/* Toggle Panier */}
        {/* Icône Panier */}
        <TouchableOpacity
          style={[
            styles.cartIconContainer,
            inCart(selectedVariant?.id) && { backgroundColor: "#4caf50" },
          ]}
          onPress={handleAddToCart}
        >
          <Image
            source={require("@/assets/images/logo/cart.png")}
            style={[
              styles.icon,
              inCart(selectedVariant?.id) && { tintColor: "#fff" },
            ]}
          />
        </TouchableOpacity>
        {/* Favori */}
        <TouchableOpacity
          style={[
            styles.favoriteIconContainer,
            isFavorite && { backgroundColor: "red" },
          ]}
          onPress={handleToggleFavorite}
          disabled={favLoading}
        >
          <Image
            source={require("@/assets/images/logo/heart.png")}
            style={[
              styles.icon,
              favLoading && { tintColor: "#ccc" }, // grisé pendant chargement
              isFavorite && { tintColor: "#fff" }, // icône blanc sur fond rouge
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Partie basse : description + avis */}
      <View style={styles.bottomSection}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>

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
        <View>
          <Text>{product.variants[0].price}</Text>
          <Text>
            {product.variants[0].quantityInStock > 0
              ? `${product.variants[0].quantityInStock} pieces en stock`
              : "Rupture de stock"}
          </Text>

          <ProductOptionsSelector
            product={product}
            onVariantSelect={setSelectedVariant}
          />
          <CategoryInfo category={product.category} />
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <ReviewActions
          onShowReviews={() => setShowReviews(true)}
          onAddReview={() => setShowAddReview(true)}
        />

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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topSection: {
    height: "35%",
    position: "relative",
    backgroundColor: "#cccccc72",
  },
  carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
    height: "100%",
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 4 },
  activeDot: { backgroundColor: "#000" },
  inactiveDot: { backgroundColor: "#ccc" },
  backButtonContainer: { position: "absolute", top: 10, left: 10 },
  cartIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIconContainer: {
    position: "absolute",
    bottom: 40,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { width: 20, height: 20, tintColor: "#000", resizeMode: "contain" },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 16, color: "#666", lineHeight: 24 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  ratingText: { marginLeft: 8, fontSize: 14, color: "#555" },
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
  btnText: { color: "#000" },
});

export default ProductDetails;
