// app/(achats)/suppliers-market.tsx (ou ton chemin exact)
import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import BackButtonAdmin from "@/components/Admin/BackButton";
// import List from "@/components/Admin/List";
import { useDebouncedCallback } from "use-debounce";
import CompanyProfile from "@/components/Achat/CompanyProfile";
import {
  getAllProductFournisseur,
  ProductSearchResponse,
} from "@/api/produit/productsApi";
import CartButton from "@/components/CartButton";
// Import de la nouvelle fonction
export default function SuppliersMarket() {
  const { bussinessId, userType } = useLocalSearchParams<{
    bussinessId?: string;
    userType?: string;
  }>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]); // any temporaire, tu peux typer plus précisément si besoin
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtres et tri
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<
    "price_asc" | "price_desc" | "relevance" | "newest"
  >("relevance");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value.trim());
    setPage(1);
    setProducts([]);
  }, 600);

  // Mapping du tri vers les valeurs de l'API
  const getSortByParam = ():
    | "PRICE_ASC"
    | "PRICE_DESC"
    | "RELEVANCE"
    | "DISTANCE"
    | undefined => {
    switch (sortBy) {
      case "price_asc":
        return "PRICE_ASC";
      case "price_desc":
        return "PRICE_DESC";
      case "relevance":
      case "newest":
      default:
        return "RELEVANCE";
    }
  };

  const fetchProducts = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (pageNum === 1 && !append) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      try {
        const response: ProductSearchResponse = await getAllProductFournisseur({
          search: searchQuery || undefined,
          minPrice,
          maxPrice,
          sortBy: getSortByParam(),
          page: pageNum,
          limit: 20,
        });

        setProducts((prev) =>
          append ? [...prev, ...response.data] : response.data
        );
        setTotalPages(response.totalPages);
        setPage(pageNum);
      } catch (err: any) {
        console.error(
          "Erreur lors du chargement des produits fournisseurs :",
          err
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [searchQuery, minPrice, maxPrice, sortBy]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts(1);
    }, [fetchProducts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(1);
  };

  const loadMore = () => {
    if (page < totalPages && !loadingMore && !loading) {
      fetchProducts(page + 1, true);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("fr-CM", { maximumFractionDigits: 0 });

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      // Pas de variants ici d'après la réponse API → prix direct
      return (
        <View style={styles.productWrapper}>
          <TouchableOpacity
            style={styles.productCard}
            onPress={() =>
              router.push({
                pathname: "/(achats)/product-details/[productId]",
                params: { productId: item.productId || item.id },
              })
            }
          >
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                    item.variantImageUrl ||
                    item.productImageUrl ||
                    "https://via.placeholder.com/400x500.png?text=Produit",
                }}
                style={styles.productImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.businessName}>{item.businessName}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <Text style={styles.currency}> {item.currencyCode}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [router]
  );

  const renderFooter = () =>
    loadingMore ? (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    ) : null;

  const renderEmpty = () => (
    <Text style={styles.emptyText}>
      {searchQuery
        ? `Aucun produit trouvé pour "${searchQuery}"`
        : "Aucun produit disponible chez les fournisseurs"}
    </Text>
  );

  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.productWrapper}>
          <View style={[styles.productCard, { backgroundColor: "#fff" }]}>
            <View
              style={[styles.imageContainer, { backgroundColor: "#f0f0f0" }]}
            />
            <View style={styles.productInfo}>
              <View
                style={{
                  height: 12,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 4,
                  marginBottom: 8,
                  width: "80%",
                }}
              />
              <View
                style={{
                  height: 16,
                  width: "60%",
                  backgroundColor: "#f0f0f0",
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        </View>
      ))}
    </>
  );

  const ListHeader = () => (
    <>
      <CompanyProfile
        onSearch={debouncedSearch}
        onFilterPress={() => setFilterModalVisible(true)}
        businessId={bussinessId as string}
      />

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {products.length} produit{products.length > 1 ? "s" : ""}
        </Text>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterText}>
            {sortBy === "price_asc"
              ? "Prix croissant"
              : sortBy === "price_desc"
              ? "Prix décroissant"
              : "Pertinence"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <BackButtonAdmin fallbackRoute={userType} />
        <Text style={styles.title} numberOfLines={1}>
          Marché des Fournisseurs
        </Text>
        <CartButton /> {/* ← Ici */}
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 8 }}
        contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.7}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={loading ? renderSkeleton : renderEmpty}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      {/* Modal Filtres & Tri */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtres et tri</Text>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Trier par</Text>
              {[
                { key: "relevance", label: "Pertinence" },
                { key: "price_asc", label: "Prix croissant" },
                { key: "price_desc", label: "Prix décroissant" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.filterOption}
                  onPress={() => {
                    setSortBy(option.key as any);
                    setPage(1);
                    setProducts([]);
                    setFilterModalVisible(false);
                    fetchProducts(1);
                  }}
                >
                  <Text
                    style={
                      sortBy === option.key
                        ? styles.activeText
                        : styles.inactiveText
                    }
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.key && (
                    <Feather name="check" size={20} color="#27AE60" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  resultsText: { fontSize: 14, color: "#666" },
  filterBtn: { flexDirection: "row", alignItems: "center" },
  filterText: { fontSize: 14, color: "#666", marginRight: 4 },

  productWrapper: { flex: 1, padding: 8, maxWidth: "50%" },
  productCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    backgroundColor: "#f8f8f8",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  productImage: { width: "85%", height: "85%" },
  productInfo: { padding: 12 },
  productName: { fontSize: 13, color: "#333", marginBottom: 6, lineHeight: 18 },
  businessName: { fontSize: 12, color: "#666", marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline" },
  price: { fontSize: 16, fontWeight: "700", color: "#000" },
  currency: { fontSize: 12, color: "#666", marginLeft: 4 },

  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 15,
    padding: 40,
    fontStyle: "italic",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  filterSection: { marginBottom: 20 },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activeText: { fontSize: 16, color: "#27AE60", fontWeight: "500" },
  inactiveText: { fontSize: 16, color: "#333" },
  closeBtn: {
    backgroundColor: "#27AE60",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
