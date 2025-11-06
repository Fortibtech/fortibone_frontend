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
import Business from "@/components/Achat/StoreCard";
const products = [
  {
    id: 1,
    name: "iPhone 17 Pro Max 2 To - 512Go 12M/512M - Noir - Neuf",
    price: "1 654 259",
    oldPrice: null,
    stock: "2 pièces",
  },
  {
    id: 2,
    name: "Carton/M iPhone 18 Pro - iPhone 15 - 82Gi - 25M/256M - G...",
    price: "354 259",
    oldPrice: null,
    stock: "neu",
  },
  {
    id: 3,
    name: "Carton/M iPhone 14 Pro - 18Go/o - 82Gi - 25M/128M - N...",
    price: "185 900",
    oldPrice: null,
    stock: "3 pièces",
  },
  {
    id: 4,
    name: "Carton/M iPhone 17 Pro - 128Go/o - 82Gi - 25M/256M - Bl...",
    price: "5 955 900",
    oldPrice: null,
    stock: "4 pièces",
  },
  {
    id: 5,
    name: "iPhone 16 Pro - 128Go/o - 82Gi - 12M/512M - Noir - Neuf/Occasion",
    price: "426 700",
    oldPrice: null,
    stock: "3 pièces",
  },
  {
    id: 6,
    name: "Carton/M iPhone 16 Pro - 128Go/o - 82Gi - 25M/256M - N...",
    price: "655 900",
    oldPrice: null,
    stock: "neu",
  },
  {
    id: 7,
    name: "iPhone 16 - 64Go/o - 4Gi - 8M/128M - Noir - Occasion",
    price: "125 900",
    oldPrice: null,
    stock: "4 pièces",
  },
  {
    id: 8,
    name: "iPhone 15 - 128Go/o - 4Gi - 8M/64M - Blanc - Neuf",
    price: "200 900",
    oldPrice: null,
    stock: "6 pièces",
  },
];

export default function Store() {
  const ProductCard = ({ product }: { product: any }) => (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
          }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.currency}>XAF</Text>
        </View>
        <Text style={styles.stock}>{product.stock}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Wuxi Rongpeng Technolo...
        </Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Store Info */}
      <Business />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <Text style={styles.searchPlaceholder}>Rechercher un produit</Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>Résultats (M produits)</Text>
        <TouchableOpacity style={styles.groupButton}>
          <Text style={styles.groupText}>Group ID</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 16,
  },
  moreButton: {
    padding: 4,
  },
  storeInfo: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#999",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },
  groupButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupText: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  productCard: {
    width: "50%",
    padding: 8,
  },
  imageContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    aspectRatio: 0.75,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  productImage: {
    width: "80%",
    height: "80%",
  },
  productInfo: {
    paddingHorizontal: 4,
  },
  productName: {
    fontSize: 12,
    color: "#333",
    marginBottom: 6,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginRight: 4,
  },
  currency: {
    fontSize: 12,
    color: "#666",
  },
  stock: {
    fontSize: 11,
    color: "#999",
  },
});
