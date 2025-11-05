import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Plus, Search, Download } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
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

  const previousBusinessIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkForBusinessChange();
    }, [])
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedBusiness) {
        loadProducts(1, searchText);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, selectedBusiness?.id]);

  const loadCategories = async () => {
    try {
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.warn("Erreur lors du chargement des catégories:", error);
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

        setSearchText("");
        setPage(1);
        setPagination(null);
        await loadProducts(1, "", currentBusiness);
      } else if (!products.length && !loading) {
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
      } else {
        setProducts((prev) => [...prev, ...response.data]);
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
    await checkForBusinessChange();
    setRefreshing(false);
  }, [selectedBusiness]);

  const loadMoreProducts = useCallback(async () => {
    if (
      loadingMore ||
      !pagination ||
      !pagination.totalPages ||
      page >= pagination.totalPages
    )
      return;

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
    if (onCreateProduct) {
      onCreateProduct();
    } else {
      router.push("/product/create");
    }
  };

  const handleExport = () => {
    Alert.alert(
      "Exporter",
      "Fonctionnalité d'export en cours de développement"
    );
  };

  // ✅ Fonction pour obtenir le conditionnement (premier variant)
  const getPackaging = (product: Product): string => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      return variant.sku  || "Standard";
    }
    return "-";
  };

  // ✅ Fonction pour obtenir le nombre de lots (stock total)
  const getTotalStock = (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, variant) => {
        return sum + (variant.quantityInStock || 0);
      }, 0);
    }
    return 0;
  };

  // ✅ Fonction pour obtenir la valeur (prix du premier variant)
  const getValue = (product: Product): string => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      if (variant.price) {
        const price = parseFloat(variant.price);
        if (price >= 1000) {
          return `${Math.round(price / 1000)}k`;
        }
        return price.toFixed(0);
      }
    }
    return "-";
  };

  // ✅ Couleur de la ligne selon l'index
  const getRowColor = (index: number): string => {
    const colors = ["#FBBF24", "#EC4899", "#8B5CF6", "#10B981", "#F97316"];
    return colors[index % colors.length];
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Catalogue de Produits</Text>

      <TouchableOpacity onPress={handleCreateProduct} style={styles.iconButton}>
        <Ionicons name="cube-outline" size={24} color="#10B981" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <TouchableOpacity style={styles.filterButton}>
        <Ionicons name="options-outline" size={20} color="#6B7280" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Download size={18} color="#6B7280" />
        <Text style={styles.exportButtonText}>Exporter</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, styles.columnNumber]}>#</Text>
      <Text style={[styles.tableHeaderText, styles.columnProduct]}>
        Produit
      </Text>
      <Text style={[styles.tableHeaderText, styles.columnPackaging]}>
        Conditionnem...
      </Text>
      <Text style={[styles.tableHeaderText, styles.columnLots]}>Lots</Text>
      <Text style={[styles.tableHeaderText, styles.columnValue]}>Valeur</Text>
    </View>
  );

  const renderProductRow = ({
    item: product,
    index,
  }: {
    item: Product;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => handleProductPress(product)}
      activeOpacity={0.7}
    >
      {/* Barre colorée à gauche */}
      <View
        style={[styles.rowIndicator, { backgroundColor: getRowColor(index) }]}
      />

      {/* Numéro */}
      <Text style={[styles.tableCell, styles.columnNumber]}>{index + 1}</Text>

      {/* Nom du produit */}
      <Text
        style={[styles.tableCell, styles.columnProduct]}
        numberOfLines={1}
      >
        {product.name}
      </Text>

      {/* Conditionnement */}
      <Text
        style={[styles.tableCell, styles.columnPackaging]}
        numberOfLines={1}
      >
        {getPackaging(product)}
      </Text>

      {/* Lots */}
      <Text style={[styles.tableCell, styles.columnLots]}>
        {getTotalStock(product)}
      </Text>

      {/* Valeur */}
      <Text style={[styles.tableCell, styles.columnValue]}>
        {getValue(product)}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptySubtitle}>
        {searchText
          ? `Aucun résultat pour "${searchText}"`
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
        <ActivityIndicator size="small" color="#10B981" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}

      <ScrollView
        style={styles.tableContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
          />
        }
      >
        {renderTableHeader()}
        <FlatList
          data={products}
          renderItem={renderProductRow}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          scrollEnabled={false}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    gap: 8,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
    position: "relative",
  },
  rowIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  tableCell: {
    fontSize: 14,
    color: "#374151",
  },
  columnNumber: {
    width: 40,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  columnProduct: {
    flex: 2,
    fontWeight: "500",
    color: "#111827",
  },
  columnPackaging: {
    flex: 1.5,
    color: "#6B7280",
  },
  columnLots: {
    width: 50,
    textAlign: "center",
    color: "#374151",
  },
  columnValue: {
    width: 70,
    textAlign: "right",
    fontWeight: "600",
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
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
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 14,
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
    color: "#6B7280",
  },
});

export default ProductListScreen;