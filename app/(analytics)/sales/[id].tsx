import { getSales, SalesResponse } from "@/api/analytics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const Sale = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getSales(id);
      setSales(result);
    } catch (error) {
      console.error("❌ Erreur lors du fetch sales:", error);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !sales) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || "Aucune donnée trouvée."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Ionicons
          name="cart-outline"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header}>Statistiques de ventes</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar-outline" size={20} color="#3b82f6" /> Ventes
          par période
        </Text>
        <View style={styles.grid}>
          {sales.salesByPeriod.map((p, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(i * 100).springify()}
              layout={Layout.springify()}
              style={styles.card}
            >
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Période</Text>
                <Text style={styles.cardValue}>{p.period}</Text>
                <Text style={styles.cardLabel}>Total</Text>
                <Text style={styles.cardValue}>{p.totalAmount} €</Text>
                <Text style={styles.cardLabel}>Articles</Text>
                <Text style={styles.cardValue}>{p.totalItems}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          <Ionicons name="flame-outline" size={20} color="#3b82f6" /> Produits
          les plus vendus
        </Text>
        <View style={styles.grid}>
          {sales.topSellingProducts.map((prod, i) => (
            <Animated.View
              key={prod.variantId}
              entering={FadeInUp.delay(
                (i + sales.salesByPeriod.length) * 100
              ).springify()}
              layout={Layout.springify()}
              style={styles.card}
            >
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardContent}>
                {prod.variantImageUrl ? (
                  <Image
                    source={{ uri: prod.variantImageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={40} color="#6b7280" />
                  </View>
                )}
                <Text style={styles.productName}>{prod.productName}</Text>
                <Text style={styles.cardLabel}>SKU: {prod.sku}</Text>
                <Text style={styles.cardLabel}>
                  Quantité: {prod.totalQuantitySold}
                </Text>
                <Text style={styles.cardValue}>
                  Revenu: {prod.totalRevenue} €
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          <Ionicons name="folder-outline" size={20} color="#3b82f6" /> Ventes
          par catégorie
        </Text>
        <View style={styles.grid}>
          {sales.salesByProductCategory.map((cat, i) => (
            <Animated.View
              key={cat.categoryId}
              entering={FadeInUp.delay(
                (i +
                  sales.salesByPeriod.length +
                  sales.topSellingProducts.length) *
                  100
              ).springify()}
              layout={Layout.springify()}
              style={styles.card}
            >
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardContent}>
                <Text style={styles.productName}>{cat.categoryName}</Text>
                <Text style={styles.cardLabel}>
                  Revenu: {cat.totalRevenue} €
                </Text>
                <Text style={styles.cardLabel}>
                  Articles vendus: {cat.totalItemsSold}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerIcon: {
    marginRight: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    padding: 16,
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Sale;
