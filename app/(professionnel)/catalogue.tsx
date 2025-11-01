import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Heart, Plus, Search } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Import des services API
import {
  Business,
  Category,
  CategoryService,
  Product,
  ProductService,
  SelectedBusinessManager,
} from "@/api";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProductListScreenProps {
  onProductPress?: (product: Product) => void;
  onCreateProduct?: () => void;
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({
  onProductPress,
  onCreateProduct,
}) => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  // Référence pour suivre l'entreprise précédente
  const previousBusinessIdRef = useRef<string | null>(null);

    const isLoadingRef = useRef(false);


  // Charger les catégories au démarrage
  useEffect(() => {
    loadCategories();
  }, []);

  // Détecter les changements d'entreprise à chaque fois que l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      checkForBusinessChange();
    }, [])
  );

  // Effet pour la recherche avec debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedBusiness) {
        loadProducts(1, searchText);
      }
    }, 500); // Délai de 500ms pour éviter trop d'appels API

    return () => clearTimeout(timeoutId);
  }, [searchText, selectedBusiness?.id]);

  const loadCategories = async () => {
    try {
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.warn("Erreur lors du chargement des catégories:", error);
      // Ne pas bloquer l'écran si les catégories ne se chargent pas
    }
  };

  const checkForBusinessChange = async () => {
     if (isLoadingRef.current) {
      console.log("⏳ Chargement déjà en cours, ignoré");
      return;
    }
    try {
      const currentBusiness =
        await SelectedBusinessManager.getSelectedBusiness();

      if (!currentBusiness) {
        Alert.alert(
          "Aucune entreprise sélectionnée",
          "Veuillez sélectionner une entreprise depuis le menu principal.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
        return;
      }

      // Vérifier si l'entreprise a changé
      const hasBusinessChanged =
        !selectedBusiness ||
        currentBusiness.id !== selectedBusiness.id ||
        currentBusiness.id !== previousBusinessIdRef.current;

      if (hasBusinessChanged) {
        console.log("🔄 Changement d'entreprise détecté:", {
          previous: selectedBusiness?.name || "aucune",
          current: currentBusiness.name,
        });

        setSelectedBusiness(currentBusiness);
        previousBusinessIdRef.current = currentBusiness.id;

        // Réinitialiser l'état et recharger les données
        setSearchText("");
        setPage(1);
        setPagination(null);
        await loadProducts(1, "", currentBusiness);
      } else if (!products.length && !loading) {
        // Premier chargement ou cas où les produits ne sont pas encore chargés
        await loadProducts(1, "", currentBusiness);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'entreprise:", error);
      Alert.alert("Erreur", "Impossible de vérifier l'entreprise sélectionnée");
    }
  };

  const loadProducts = async (
    pageNumber = 1,
    search = "",
    business?: Business
  ) => {
    const targetBusiness = business || selectedBusiness;
    if (!targetBusiness) return;

    if (isLoadingRef.current) {
      console.log("⏳ Chargement déjà en cours");
      return;
    }

    try {
      const isFirstPage = pageNumber === 1;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log("📦 Chargement des produits pour:", targetBusiness.name, {
        page: pageNumber,
        search: search || "aucun",
        businessId: targetBusiness.id,
      });

      const response = await ProductService.getBusinessProducts(
        targetBusiness.id,
        {
          page: pageNumber,
          limit: 20,
          search: search.trim() || undefined,
        }
      );

      if (isFirstPage) {
        setProducts(response.data);
        setPage(1);
        console.log("✅ Produits chargés:", response.data.length);
        console.log("✅ Produits :", response.data);
      } else {
        setProducts((prev) => [...prev, ...response.data]);
        console.log(
          "✅ Produits supplémentaires chargés:",
          response.data.length
        );
      }

      setPagination(response.page);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des produits:", error);
      Alert.alert("Erreur", "Impossible de charger les produits");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSearchText("");
    // Forcer la vérification de l'entreprise et le rechargement
    await checkForBusinessChange();
    setRefreshing(false);
  }, [selectedBusiness]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !pagination || !pagination.totalPages || page >= pagination.totalPages) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await loadProducts(nextPage, searchText);
  }, [loadingMore, pagination, page, searchText, selectedBusiness]);

  const handleProductPress = (product: Product) => {
    if (onProductPress) {
      onProductPress(product);
    } else {
       router.push(`/product/${product.id}`);
    }
  };

  const handleCreateProduct = () => {
    console.log("Bouton d'ajout cliqué !"); // Log pour débogage
    if (onCreateProduct) {
      onCreateProduct();
    } else {
      router.push("/product/create"); // Navigation activée par défaut
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId || "Catégorie";
  };

  const renderProductCard = ({ item: product }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Heart size={20} color="#666" fill="none" />
          </TouchableOpacity>
        </View>

        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.productFooter}>
          <View style={styles.productMeta}>
            <Text style={styles.productCategory}>
              {getCategoryName(product.categoryId)}
            </Text>
            <Text style={styles.productUnit}>Unité: {product.salesUnit}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Mes Produits</Text>
        {selectedBusiness && (
          <Text style={styles.headerSubtitle}>{selectedBusiness.name}</Text>
        )}
      </View>

      <TouchableOpacity onPress={handleCreateProduct} style={styles.addButton}>
        <Plus size={28} color="#059669" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* <TouchableOpacity style={styles.filterButton}>
        <Filter size={20} color="#666" />
      </TouchableOpacity> */}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {pagination?.total || products.length}
        </Text>
        <Text style={styles.statLabel}>Produits</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {products.filter((p) => p.variants.some((v)=>v.price && parseInt(v.price) > 0)).length}
        </Text>
        <Text style={styles.statLabel}>Avec prix</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {new Set(products.map((p) => p.categoryId).filter(Boolean)).size}
        </Text>
        <Text style={styles.statLabel}>Catégories</Text>
      </View>
    </View>
  );

  const renderBusinessChangeBanner = () => {
    // Afficher une bannière si l'entreprise vient de changer
    if (
      selectedBusiness &&
      previousBusinessIdRef.current === selectedBusiness.id
    ) {
      return null;
    }

    return (
      <View style={styles.businessChangeBanner}>
        <Text style={styles.businessChangeText}>
          📍 Produits de {selectedBusiness?.name}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptySubtitle}>
        {searchText
          ? `Aucun résultat pour "${searchText}"`
          : selectedBusiness
          ? `${selectedBusiness.name} n'a pas encore de produits`
          : "Commencez par ajouter votre premier produit"}
      </Text>

      {!searchText && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={handleCreateProduct}
        >
          <Plus size={20} color="white" />
          <Text style={styles.emptyButtonText}>Ajouter un produit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#059669" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>
            {selectedBusiness
              ? `Chargement des produits de ${selectedBusiness.name}...`
              : "Chargement des produits..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderBusinessChangeBanner()}
      {renderStats()}

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
          />
        }
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  businessChangeBanner: {
    backgroundColor: "#f0f9ff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
  },
  businessChangeText: {
    fontSize: 14,
    color: "#047857",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#059669",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 20,
  },
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImageContainer: {
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: {
    padding: 12,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 8,
  },
  favoriteButton: {
    padding: 2,
  },
  productDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  productFooter: {
    gap: 8,
  },
  productMeta: {
    gap: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  productUnit: {
    fontSize: 12,
    color: "#6b7280",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 14,
    color: "#6b7280",
  },
});

export default ProductListScreen;
