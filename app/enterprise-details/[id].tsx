// app/product-details.tsx
import { getProductsByBusiness, Product } from "@/api/client/business";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { JSX, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProductDetails = () => {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductsByBusiness(id);
        setProducts(response.data);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des produits:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProducts();
  }, [id]);

  const renderProductCard = (product: Product): JSX.Element => (
    <TouchableOpacity
      key={product.id}
      style={styles.gridItem}
      onPress={() =>
        router.push({
          pathname: "/client-produit-details/[id]",
          params: { id: product.id.toString() },
        })
      }
      activeOpacity={0.8}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.gridCategory}>
          {product.category?.name || "Divers"}
        </Text>
        <View style={styles.gridFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              ⭐ {product.averageRating?.toFixed(1) ?? "0"}
            </Text>
          </View>
          <View style={styles.discountBadge}>
            <Ionicons name="add" style={styles.discountText} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Articles de chez {name}</Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContainer}
          numColumns={2}
          renderItem={({ item }) => renderProductCard(item)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    backgroundColor: "#f8f8f8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#333",
  },
  gridContainer: {
    padding: 12,
    gap: 12,
  },
  gridItem: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  gridImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#eee",
  },
  gridContent: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
  gridCategory: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  gridFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    color: "#555",
  },
  discountBadge: {
    backgroundColor: "#cd7455",
    borderRadius: 16,
    padding: 4,
  },
  discountText: {
    fontSize: 16,
    color: "#fff",
  },
});

export default ProductDetails;
