import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Search, Download } from "lucide-react-native";
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

import {
  Business,
  BusinessesService,
  Product,
  ProductService,
  SelectedBusinessManager,
} from "@/api";
import { SafeAreaView } from "react-native-safe-area-context";
import InventoryApp from "@/components/produits/InventoryApp";

export const ProductListScreen = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  // ON REMET L'ONGLET ACTIFuel
  const [activeTab, setActiveTab] = useState<"catalogue" | "inventaire">(
    "catalogue"
  );

  const previousBusinessIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // === CHARGEMENT BUSINESS ===
  const checkForBusinessChange = useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      const currentBusiness =
        await SelectedBusinessManager.getSelectedBusiness();

      if (!currentBusiness) {
        Alert.alert("Aucune entreprise", "Veuillez en sélectionner une.", [
          { text: "OK", onPress: () => router.replace("/(professionnel)") },
        ]);
        return;
      }

      const hasChanged =
        !selectedBusiness || currentBusiness.id !== selectedBusiness.id;

      if (hasChanged) {
        await BusinessesService.selectBusiness(currentBusiness);
        setSelectedBusiness(currentBusiness);
        previousBusinessIdRef.current = currentBusiness.id;
        setSearchText("");
        setPage(1);
        setProducts([]);
        if (activeTab === "catalogue") {
          await loadProducts(1, "");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [selectedBusiness, activeTab]);

  useFocusEffect(
    useCallback(() => {
      checkForBusinessChange();
    }, [checkForBusinessChange])
  );

  // === RECHERCHE DÉBOUNCÉE ===
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeTab === "catalogue" && selectedBusiness) {
        loadProducts(1, searchText);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchText, selectedBusiness, activeTab]);

  // === CHARGEMENT PRODUITS ===
  const loadProducts = async (pageNumber = 1, search = "") => {
    if (!selectedBusiness) return;
    if (isLoadingRef.current) return;

    try {
      const isFirstPage = pageNumber === 1;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);

      const response = await ProductService.getBusinessProducts(
        selectedBusiness.id,
        {
          page: pageNumber,
          limit: 25,
          search: search.trim() || undefined,
        }
      );

      if (isFirstPage) {
        setProducts(response.data);
      } else {
        setProducts((prev) => [...prev, ...response.data]);
      }
      setPagination(response.page);
      setPage(pageNumber);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les produits");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSearchText("");
    await checkForBusinessChange();
    setRefreshing(false);
  };

  const loadMoreProducts = () => {
    if (loadingMore || !pagination || page >= pagination.totalPages) return;
    loadProducts(page + 1, searchText);
  };

  const handleCreateProduct = () => router.push("/product/create");

  // === FONCTIONS UTILITAIRES (inchangées) ===
  const getPackaging = (product: Product) =>
    product.variants?.[0]?.sku || "Standard";

  const getTotalStock = (product: Product) =>
    product.variants?.reduce((s, v) => s + (v.quantityInStock || 0), 0) || 0;

  const getValue = (product: Product) => {
    const price = product.variants?.[0]?.price;
    if (!price) return "-";
    const p = parseFloat(price);
    return p >= 1000 ? `${Math.round(p / 1000)}k` : p.toFixed(0);
  };

  const getRowColor = (i: number) => {
    const colors = ["#FBBF24", "#EC4899", "#8B5CF6", "#10B981", "#F97316"];
    return colors[i % 5];
  };

  // === RENDU ===
  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedBusiness) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER + ONGLET */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Produits</Text>
          <TouchableOpacity
            onPress={handleCreateProduct}
            style={styles.iconButton}
          >
            <Ionicons name="cube-outline" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* ONGLET RÉEL (maintenant fonctionnel !) */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "catalogue" && styles.tabActive]}
            onPress={() => setActiveTab("catalogue")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "catalogue" && styles.tabTextActive,
              ]}
            >
              Catalogue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "inventaire" && styles.tabActive]}
            onPress={() => setActiveTab("inventaire")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "inventaire" && styles.tabTextActive,
              ]}
            >
              Inventaire
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENU SELON L'ONGLET */}
      {activeTab === "catalogue" ? (
        <>
          {/* Barre de recherche + export */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#10B981" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un produit..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Liste des produits (inchangée) */}
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#10B981"]}
              />
            }
          >
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.columnNumber]}>
                #
              </Text>
              <Text style={[styles.tableHeaderText, styles.columnProduct]}>
                Produit
              </Text>
              <Text style={[styles.tableHeaderText, styles.columnPackaging]}>
                Cond.
              </Text>
              <Text style={[styles.tableHeaderText, styles.columnLots]}>
                Lots
              </Text>
              <Text style={[styles.tableHeaderText, styles.columnValue]}>
                Valeur
              </Text>
            </View>

            <FlatList
              data={products}
              scrollEnabled={false}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.tableRow}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <View
                    style={[
                      styles.rowIndicator,
                      { backgroundColor: getRowColor(index) },
                    ]}
                  />
                  <Text style={[styles.tableCell, styles.columnNumber]}>
                    {index + 1}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.columnProduct]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnPackaging]}>
                    {getPackaging(item)}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnLots]}>
                    {getTotalStock(item)}
                  </Text>
                  <Text style={[styles.tableCell, styles.columnValue]}>
                    {getValue(item)}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
                </View>
              }
              onEndReached={loadMoreProducts}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator style={{ marginVertical: 20 }} />
                ) : null
              }
            />
          </ScrollView>
        </>
      ) : (
        /* ONGLET INVENTAIRE → VRAI COMPOSANT */
        <InventoryApp id={selectedBusiness.id} />
      )}
    </SafeAreaView>
  );
};

// === STYLES (identiques à ton original, juste un petit ajustement visuel) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  iconButton: { padding: 8 },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#10B981" },
  tabText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#fff",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111" },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  exportButtonText: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  rowIndicator: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  tableCell: { fontSize: 14, color: "#374151" },
  columnNumber: { width: 50, fontWeight: "600", color: "#9ca3af" },
  columnProduct: { flex: 2, fontWeight: "500" },
  columnPackaging: { flex: 1.2, color: "#6b7280" },
  columnLots: { width: 60, textAlign: "center" },
  columnValue: { width: 80, textAlign: "right", fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#6b7280" },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, color: "#111" },
});

export default ProductListScreen;
