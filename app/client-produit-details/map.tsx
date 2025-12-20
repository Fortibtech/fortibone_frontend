// app/client-produit-details/map.tsx

import { useUserLocationStore } from "@/stores/useUserLocationStore";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Callout } from "react-native-maps";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { router } from "expo-router";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { useEffect, useState } from "react";
import { getAllProductsLike } from "@/api/Products";
import { Products } from "@/types/Product";

const Map = () => {
  const [allProducts, setAllProducts] = useState<Products[]>([]);
  const [productsOnMap, setProductsOnMap] = useState<Products[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Products[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);

  const {
    latitude,
    longitude,
    loading: locationLoading,
  } = useUserLocationStore();

  // Chargement des produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response: any = await getAllProductsLike({});
        const products = response.data || [];

        setAllProducts(products);

        const withLocation = products.filter(
          (p: Products) => p.latitude !== null && p.longitude !== null
        );
        setProductsOnMap(withLocation);
      } catch (error) {
        console.error("Erreur chargement produits :", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Suggestions de recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        const filtered = allProducts
          .filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6);
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts]);

  const openProductModal = (product: Products) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    Keyboard.dismiss();
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) stars.push("🌟");
    if (hasHalf) stars.push("⭐");
    while (stars.length < 5) stars.push("☆");
    return stars.join("");
  };

  if (locationLoading || loadingProducts) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  if (!latitude || !longitude) {
    return (
      <View style={styles.loader}>
        <Ionicons name="location-off-outline" size={60} color="#9ca3af" />
        <Text style={styles.errorText}>Position non disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Marqueur utilisateur */}
        <Marker coordinate={{ latitude, longitude }}>
          <View style={styles.userMarker}>
            <Ionicons name="person" size={26} color="#ffffff" />
          </View>
          <Callout>
            <Text style={styles.calloutTitle}>Vous êtes ici</Text>
          </Callout>
        </Marker>

        {/* Marqueurs produits */}
        {productsOnMap.map((product) => (
          <Marker
            key={product.id}
            coordinate={{
              latitude: product.latitude!,
              longitude: product.longitude!,
            }}
            onPress={() => openProductModal(product)}
          >
            <View style={styles.productMarker}>
              <Ionicons name="storefront" size={24} color="#ffffff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Barre de recherche avec bouton retour */}
      <View style={styles.searchContainer}>
        <View style={styles.topBar}>
          <BackButtonAdmin backgroundColor="#fff" />
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un produit..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
            />
          </View>
        </View>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {suggestions.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setShowSuggestions(false);
                    setSearchQuery("");
                    Keyboard.dismiss();
                    router.push({
                      pathname: "/client-produit-details/[id]",
                      params: { id: prod.productId }, // ← ID correct (variant)
                    });
                  }}
                >
                  <Image
                    source={{
                      uri:
                        prod.productImageUrl ||
                        "https://via.placeholder.com/80",
                    }}
                    style={styles.suggestionImage}
                  />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {prod.name}
                    </Text>
                    <Text style={styles.suggestionPrice}>
                      {prod.price.toLocaleString("fr-FR")} KMF
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Modal détail produit */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {selectedProduct && (
                  <>
                    <Image
                      source={{
                        uri:
                          selectedProduct.productImageUrl ||
                          "https://via.placeholder.com/300",
                      }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    <ScrollView style={styles.modalBody}>
                      <Text style={styles.modalTitle}>
                        {selectedProduct.name}
                      </Text>

                      <Text style={styles.modalPrice}>
                        {selectedProduct.price.toLocaleString("fr-FR")} KMF
                      </Text>

                      <View style={styles.modalRating}>
                        <Text style={styles.starsText}>
                          {renderStars(selectedProduct.averageRating ?? 0)}
                        </Text>
                        <Text style={styles.reviewCount}>
                          ({selectedProduct.reviewCount ?? 0} avis)
                        </Text>
                      </View>

                      <Text style={styles.modalDescription}>
                        {selectedProduct.description ||
                          "Aucune description disponible."}
                      </Text>

                      <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => {
                          closeModal();
                          router.push({
                            pathname: "/client-produit-details/[id]",
                            params: { id: selectedProduct.productId }, // ← ID correct
                          });
                        }}
                      >
                        <Text style={styles.detailButtonText}>
                          Voir les détails
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.closeModalButton}
                      onPress={closeModal}
                    >
                      <Ionicons name="close" size={28} color="#666" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: "#9ca3af",
    fontWeight: "500",
  },

  // Barre de recherche
  searchContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  suggestionsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  suggestionTextContainer: { flex: 1 },
  suggestionName: { fontSize: 15, fontWeight: "600", color: "#333" },
  suggestionPrice: { fontSize: 14, color: "#059669", fontWeight: "500" },

  // Marqueurs
  userMarker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 8,
  },
  productMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e11d48",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
  },

  calloutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: 220,
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 10,
  },
  modalRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  starsText: { fontSize: 18, marginRight: 8 },
  reviewCount: { fontSize: 14, color: "#666" },
  modalDescription: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 24,
  },
  detailButton: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  closeModalButton: {
    position: "absolute",
    top: 12,
    right: 16,
    padding: 8,
  },
});

export default Map;
