// app/(achats)/[bussinessId]/index.tsx
import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

import BackButtonAdmin from "@/components/Admin/BackButton";
import List from "@/components/Admin/List";
import SearchHeader from "@/components/Admin/SearchHeader";

// === Types ===
interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock: string;
  imageUrl?: string;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
}

// === Props ===
export default function SupplierStore() {
  const { bussinessId } = useLocalSearchParams<{ bussinessId: string }>();
  const [searchQuery, setSearchQuery] = useState("");

  // === Données mock (à connecter à API) ===
  const supplier: Supplier = {
    id: bussinessId || "1",
    name: "Wuxi Rongpeng Technology Co.",
    category: "Électronique & Accessoires",
    logoUrl:
      "https://images.unsplash.com/photo-1592890288564-766e3c023f58?w=100",
  };

  const products: Product[] = [
    {
      id: "1",
      name: "iPhone 17 Pro Max 2 To - 512Go 12M/512M - Noir - Neuf",
      price: 1654259,
      stock: "2 pièces",
    },
    // ... autres produits
  ];

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ==================== HEADER ==================== */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title} numberOfLines={1}>
          {supplier.name}
        </Text>
        <List />
      </View>

      {/* ==================== STORE CARD ==================== */}
      <View style={styles.storeCard}>
        <View style={styles.storeHeader}>
          <View style={styles.logoContainer}>
            {supplier.logoUrl ? (
              <Image source={{ uri: supplier.logoUrl }} style={styles.logo} />
            ) : (
              <Text style={styles.logoPlaceholder}>Logo</Text>
            )}
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{supplier.name}</Text>
            <Text style={styles.storeCategory}>{supplier.category}</Text>
          </View>
        </View>
      </View>

      {/* ==================== RECHERCHE ==================== */}
      <View style={styles.searchWrapper}>
        <SearchHeader
          placeholder="Rechercher un article"
          showMenuButton={false}
          onSearch={setSearchQuery}
        />
      </View>

      {/* ==================== RÉSULTATS ==================== */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} produit
          {filteredProducts.length > 1 ? "s" : ""}
        </Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Group ID</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* ==================== GRILLE PRODUITS ==================== */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredProducts.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucun produit pour `{searchQuery}`
            </Text>
          ) : (
            filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() =>
                  router.push({
                    pathname: "/(achats)/product-details/[productId]",
                    params: { productId: product.id },
                  })
                }
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri:
                        product.imageUrl ||
                        "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
                    }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {product.price.toLocaleString()}
                    </Text>
                    <Text style={styles.currency}>XAF</Text>
                  </View>
                  <Text style={styles.stock}>{product.stock}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES COHÉRENTS ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
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
  storeCard: { backgroundColor: "#FFFFFF", padding: 16, marginTop: 8 },
  storeHeader: { flexDirection: "row", alignItems: "center" },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  logo: { width: 50, height: 50, borderRadius: 8 },
  logoPlaceholder: { fontSize: 24, color: "#9CA3AF" },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 16, fontWeight: "600", color: "#000" },
  storeCategory: { fontSize: 13, color: "#666" },
  searchWrapper: { padding: 16, backgroundColor: "#F5F5F5" },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsText: { fontSize: 14, color: "#666" },
  filterBtn: { flexDirection: "row", alignItems: "center" },
  filterText: { fontSize: 14, color: "#666", marginRight: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  productCard: { width: "50%", padding: 8 },
  imageContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    aspectRatio: 0.8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  productImage: { width: "80%", height: "80%" },
  productInfo: { paddingHorizontal: 4 },
  productName: { fontSize: 12, color: "#333", marginBottom: 6, lineHeight: 16 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 4 },
  price: { fontSize: 16, fontWeight: "700", color: "#000", marginRight: 4 },
  currency: { fontSize: 12, color: "#666" },
  stock: { fontSize: 11, color: "#999" },
  emptyText: {
    width: "100%",
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    padding: 32,
    fontStyle: "italic",
  },
});
