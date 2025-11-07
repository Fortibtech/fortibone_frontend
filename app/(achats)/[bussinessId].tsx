// app/(achats)/[businessId]/index.tsx
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
import List from "@/components/Admin/List";
import { ProductService, Product, ProductVariant } from "@/api";
import { useDebouncedCallback } from "use-debounce";
import CompanyProfile from "@/components/Achat/CompanyProfile";

export default function SupplierStore() {
  const { bussinessId } = useLocalSearchParams<{ bussinessId: string }>();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // États pour le filtre/tri
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<
    "price_asc" | "price_desc" | "name" | "newest"
  >("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value.trim());
    setPage(1);
    setProducts([]);
  }, 600);

  const fetchProducts = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!bussinessId) return;

      setLoading(pageNum === 1);
      if (pageNum > 1) setLoadingMore(true);

      try {
        const response = await ProductService.getBusinessProducts(bussinessId, {
          search: searchQuery || undefined,
          page: pageNum,
          limit: 20,
          categoryId: selectedCategory || undefined,
        });

        setProducts((prev) =>
          append ? [...prev, ...response.data] : response.data
        );
        setTotalPages(response.totalPages || 1);
        setPage(pageNum);
      } catch (err: any) {
        console.error("Erreur API:", err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [bussinessId, searchQuery, sortBy, selectedCategory]
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
    if (page < totalPages && !loadingMore) {
      fetchProducts(page + 1, true);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("fr-CM", { maximumFractionDigits: 0 });

  const bestVariant = (variants: ProductVariant[]) =>
    variants.find((v) => v.quantityInStock > 0) || variants[0];

  const renderItem = ({ item }: { item: Product }) => {
    const variant = bestVariant(item.variants);
    if (!variant) return null;

    return (
      <View style={styles.productWrapper}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() =>
            router.push({
              pathname: "/(achats)/product-details/[productId]",
              params: { productId: item.id, bussinessId: bussinessId },
            })
          }
        >
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri:
                  item.imageUrl ||
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
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {formatPrice(Number(variant.price))}
              </Text>
              <Text style={styles.currency}> XAF</Text>
            </View>
            {variant.lotPrice && variant.lotPrice > variant.price && (
              <Text style={styles.oldPrice}>
                {formatPrice(Number(variant.lotPrice))} XAF
              </Text>
            )}
            <Text style={styles.stock}>
              {variant.quantityInStock}
              {"  pièces "}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () =>
    loadingMore ? (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    ) : null;

  const renderEmpty = () => (
    <Text style={styles.emptyText}>
      {searchQuery
        ? `Aucun produit pour "${searchQuery}"`
        : "Aucun produit disponible"}
    </Text>
  );

  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
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
                }}
              />
              <View
                style={{
                  height: 16,
                  width: "70%",
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* HEADER */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title} numberOfLines={1}>
          Boutique
        </Text>
        <List />
      </View>

      {/* COMPANY PROFILE + SEARCH */}
      <CompanyProfile
        onSearch={debouncedSearch}
        onFilterPress={() => setFilterModalVisible(true)}
      />

      {/* RÉSULTATS */}
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
              ? "Prix ↑"
              : sortBy === "price_desc"
              ? "Prix ↓"
              : "Trier"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* LISTE PRODUITS */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 8 }}
        contentContainerStyle={{ paddingBottom: 30 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={loading ? renderSkeleton : renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL FILTRE */}
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
            <Text style={styles.modalTitle}>Trier & Filtrer</Text>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Trier par</Text>
              {["newest", "price_asc", "price_desc", "name"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.filterOption}
                  onPress={() => {
                    setSortBy(option as any);
                    setPage(1);
                    setProducts([]);
                    setFilterModalVisible(false);
                    fetchProducts(1);
                  }}
                >
                  <Text
                    style={
                      sortBy === option
                        ? styles.activeText
                        : styles.inactiveText
                    }
                  >
                    {option === "newest"
                      ? "Plus récent"
                      : option === "price_asc"
                      ? "Prix croissant"
                      : option === "price_desc"
                      ? "Prix décroissant"
                      : "Nom A-Z"}
                  </Text>
                  {sortBy === option && (
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

// === STYLES PARFAITS ===
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
    marginBottom: 20,
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
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  price: { fontSize: 16, fontWeight: "700", color: "#000" },
  currency: { fontSize: 12, color: "#666", marginLeft: 4 },
  oldPrice: { fontSize: 11, color: "#999", textDecorationLine: "line-through" },
  stock: { fontSize: 11, color: "#27AE60", fontWeight: "500" },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 15,
    padding: 40,
    fontStyle: "italic",
  },

  // Modal
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
  filterSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
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
