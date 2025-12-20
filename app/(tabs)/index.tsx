// app/(tabs)/index.tsx

import { getAllProductsLike } from "@/api/Products";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCartStore } from "@/stores/useCartStore";
import { useUserLocationStore } from "@/stores/useUserLocationStore"; // ← Ajout important
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polygon } from "react-native-svg";
import { Products } from "@/types/Product";

const HomePage: React.FC = () => {
  const itemsCount = useCartStore((state) => state.items.length);
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Products[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Récupération de la position de l'utilisateur
  const { latitude: userLat, longitude: userLng } = useUserLocationStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        fetchSuggestions(searchQuery);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = async (search: string = "") => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response: any = await getAllProductsLike(params);
      setProducts(response.data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des produits :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const response: any = await getAllProductsLike({
        search: query,
        limit: 5,
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des suggestions :", error);
      setSuggestions([]);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    fetchProducts(searchQuery);
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleSuggestionSelect = (product: Products) => {
    setSearchQuery(product.name);
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
    fetchProducts(product.name);
  };

  // Fonction de calcul de distance (Haversine)
  const calculateDistance = (
    userLat: number | null,
    userLng: number | null,
    prodLat: number | null,
    prodLng: number | null
  ): string => {
    if (!userLat || !userLng || !prodLat || !prodLng) {
      return "Distance inconnue";
    }

    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Rayon de la Terre en km

    const dLat = toRad(prodLat - userLat);
    const dLon = toRad(prodLng - userLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(prodLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m de vous`;
    }
    return `à ${distance.toFixed(1)} km de vous`;
  };

  // Fonction pour générer les étoiles
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push("🌟");
    }
    if (hasHalfStar) {
      stars.push("⭐");
    }
    while (stars.length < 5) {
      stars.push("☆");
    }

    return stars.join("");
  };

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <View style={styles.header2}>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="grid-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>KomoraLink</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/(profile-particulier)/cart")}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {itemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {renderSearchBar()}
    </View>
  );

  const renderSearchBar = (): JSX.Element => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="white"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Recherche"
          placeholderTextColor="white"
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.mapIconButton}
          onPress={() => router.push("/client-produit-details/map")}
        >
          <Ionicons name="map-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.searchSuggestions}>
          <ScrollView
            nestedScrollEnabled={true}
            style={styles.suggestionsScroll}
          >
            {suggestions.map((prod) => (
              <TouchableOpacity
                key={prod.id}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(prod)}
              >
                <Text style={styles.suggestionText}>{prod.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderPromoBanner = (): JSX.Element => (
    <View style={styles.bannerContainer}>
      <View style={styles.banner}>
        <View style={styles.bannerBackground} />
        <Svg
          height="100%"
          width="90%"
          style={styles.svgOverlay}
          viewBox="10 0 100 80"
          preserveAspectRatio="none"
        >
          <Polygon points="0,0 100,0 65,90 0,90" fill="#FFF9CD" />
        </Svg>
        <View style={styles.bannerContentWrapper}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Ne ratez pas ça !</Text>
            <Text style={styles.bannerSubtitle}>
              Jusqu&apos;à 50 % de réduction
            </Text>
          </View>
          <View style={styles.bannerImageContainer}>
            <Image
              source={require("@/assets/images/Image.png")}
              style={styles.bannerImage}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderEnterpriseCard = (product: Products): JSX.Element => {
    const rating = product.averageRating ?? 0;
    const reviewCount = product.reviewCount ?? 0;

    const distanceText = calculateDistance(
      userLat,
      userLng,
      product.latitude,
      product.longitude
    );

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.gridItem}
        onPress={() =>
          router.push({
            pathname: "/client-produit-details/[id]",
            params: { id: product.productId },
          })
        }
        activeOpacity={0.8}
      >
        <Image
          source={{
            uri: product.productImageUrl || "https://via.placeholder.com/300",
          }}
          style={styles.gridImage}
          resizeMode="cover"
        />

        <View style={styles.gridContent}>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {product.name}
          </Text>

          <Text style={styles.gridPrice}>
            {product.price.toLocaleString("fr-FR")} KMF
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.starsText}>{renderStars(rating)}</Text>
            {reviewCount > 0 && (
              <Text style={styles.reviewCountText}>({reviewCount})</Text>
            )}
          </View>

          {/* Distance réelle */}
          <Text style={styles.distanceText}>{distanceText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeleton = (): JSX.Element => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#059669" />
      <Text style={styles.loadingText}>Chargement des produits...</Text>
    </View>
  );

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#00C851" barStyle="light-content" />
        {renderHeader()}
        {renderPromoBanner()}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            renderSkeleton()
          ) : (
            <View style={styles.grid}>
              {products.map(renderEnterpriseCard)}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  mapIconButton: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
    marginVertical: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  starsText: {
    fontSize: 16,
    marginRight: 6,
  },
  reviewCountText: {
    fontSize: 13,
    color: "#666",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    fontStyle: "italic",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#059669",
    height: 300,
  },
  header2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
  },
  headerLeft: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  notificationButton: {
    padding: 4,
  },
  searchWrapper: {
    position: "relative",
    marginHorizontal: 20,
    marginTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#047D58",
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "white",
    fontWeight: "400",
  },
  searchSuggestions: {
    position: "absolute",
    top: 53,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 20,
  },
  suggestionsScroll: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
  bannerContainer: {
    position: "relative",
    padding: 20,
    marginTop: -140,
  },
  banner: {
    borderRadius: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 170,
    overflow: "hidden",
  },
  bannerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
  svgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  bannerContentWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  bannerContent: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontWeight: "400",
  },
  bannerImageContainer: {
    width: 200,
    height: 150,
    marginRight: -40,
    marginTop: 80,
  },
  bannerImage: {
    width: "80%",
    height: "80%",
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    zIndex: 1,
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gridImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  gridContent: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default HomePage;
