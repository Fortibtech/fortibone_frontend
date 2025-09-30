import { getInventory, InventoryResponse } from "@/api/analytics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const Inventory = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getInventory(id);
      setInventory(result);
    } catch (error) {
      console.error("❌ Erreur lors du fetch inventory:", error);
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

  if (error || !inventory) {
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
          name="cube-outline"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header}>Suivi des stocks</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="archive-outline" size={20} color="#3b82f6" /> Résumé
          de l&lsquo;inventaire
        </Text>
        <View style={styles.grid}>
          <Animated.View
            entering={FadeInUp.delay(100).springify()}
            layout={Layout.springify()}
            style={styles.card}
          >
            <LinearGradient
              colors={["#ffffff", "#f8fafc"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Valeur totale du stock</Text>
              <Text style={styles.cardValue}>
                {inventory.currentInventoryValue} €
              </Text>
              <Text style={styles.cardLabel}>Unités en stock</Text>
              <Text style={styles.cardValue}>
                {inventory.totalUnitsInStock}
              </Text>
            </View>
          </Animated.View>
        </View>

        <Text style={styles.sectionTitle}>
          <Ionicons name="warning-outline" size={20} color="#3b82f6" /> Produits
          en faible stock
        </Text>
        {inventory.productsLowStock.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={40}
              color="#6b7280"
            />
            <Text style={styles.emptyText}>Aucun produit en faible stock.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {inventory.productsLowStock.map((prod, i) => (
              <Animated.View
                key={i}
                entering={FadeInUp.delay((i + 1) * 100).springify()}
                layout={Layout.springify()}
                style={styles.card}
              >
                <LinearGradient
                  colors={["#ffffff", "#f8fafc"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.productName}>
                    {prod.productName || "Produit inconnu"}
                  </Text>
                  <Text style={styles.cardLabel}>SKU: {prod.sku || "N/A"}</Text>
                  <Text style={styles.cardValue}>
                    Quantité: {prod.quantity || 0}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>
          <Ionicons name="timer-outline" size={20} color="#3b82f6" /> Produits
          expirants
        </Text>
        {inventory.expiringProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={40}
              color="#6b7280"
            />
            <Text style={styles.emptyText}>
              Aucun produit proche de l’expiration.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {inventory.expiringProducts.map((prod, i) => (
              <Animated.View
                key={i}
                entering={FadeInUp.delay(
                  (i + inventory.productsLowStock.length + 1) * 100
                ).springify()}
                layout={Layout.springify()}
                style={styles.card}
              >
                <LinearGradient
                  colors={["#ffffff", "#f8fafc"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.productName}>
                    {prod.productName || "Produit inconnu"}
                  </Text>
                  <Text style={styles.cardLabel}>SKU: {prod.sku || "N/A"}</Text>
                  <Text style={styles.cardLabel}>
                    Quantité: {prod.quantity || 0}
                  </Text>
                  <Text style={styles.cardValue}>
                    Expiration: {prod.expirationDate || "N/A"}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>
          <Ionicons name="trending-down-outline" size={20} color="#3b82f6" />{" "}
          Pertes par type de mouvement
        </Text>
        <View style={styles.grid}>
          {inventory.lossesByMovementType.map((loss, i) => (
            <Animated.View
              key={i}
              entering={FadeInUp.delay(
                (i +
                  inventory.productsLowStock.length +
                  inventory.expiringProducts.length +
                  1) *
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
                <Text style={styles.cardLabel}>Type</Text>
                <Text style={styles.cardValue}>{loss.movementType}</Text>
                <Text style={styles.cardLabel}>Quantité perdue</Text>
                <Text style={styles.cardValue}>{loss.totalQuantity}</Text>
                <Text style={styles.cardLabel}>Valeur totale</Text>
                <Text style={styles.cardValue}>{loss.totalValue} €</Text>
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
  emptyState: {
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
});

export default Inventory;
