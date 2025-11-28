import { AnalyticsOverview, getAnalyticsOverview } from "@/api/analytics";
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

const OverviewId = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalyticsOverview(id);
      setData(result);
    } catch (error) {
      console.error("❌ Erreur lors du fetch overview:", error);
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

  if (error || !data) {
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

  const metrics = [
    {
      label: "Total des ventes",
      value: data.totalSalesAmount,
      icon: "cash-outline",
    },
    {
      label: "Commandes totales",
      value: data.totalSalesOrders,
      icon: "cart-outline",
    },
    {
      label: "Valeur moyenne commande",
      value: data.averageOrderValue,
      icon: "calculator-outline",
    },
    {
      label: "Produits vendus",
      value: data.totalProductsSold,
      icon: "cube-outline",
    },
    {
      label: "Total des achats",
      value: data.totalPurchaseAmount,
      icon: "wallet-outline",
    },
    {
      label: "Commandes d'achat",
      value: data.totalPurchaseOrders,
      icon: "bag-handle-outline",
    },
    {
      label: "Valeur de l'inventaire",
      value: data.currentInventoryValue,
      icon: "archive-outline",
    },
    {
      label: "Membres totaux",
      value: data.totalMembers,
      icon: "person-circle-outline",
    },
    {
      label: "Clients uniques",
      value: data.uniqueCustomers,
      icon: "people-outline",
    },
    {
      label: "Note moyenne",
      value: data.averageBusinessRating,
      icon: "star-outline",
    },
    {
      label: "Total des avis",
      value: data.totalBusinessReviews,
      icon: "chatbubble-outline",
    },
  ];

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
          name="stats-chart"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header}>Vue d&lsquo;ensemble</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {metrics.map((metric, index) => (
            <Animated.View
              key={metric.label}
              entering={FadeInUp.delay(index * 100).springify()}
              layout={Layout.springify()}
              style={styles.card}
            >
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardContent}>
                <Ionicons
                  name={metric.icon as any}
                  size={28}
                  color="#3b82f6"
                  style={styles.cardIcon}
                />
                <Text style={styles.cardLabel}>{metric.label}</Text>
                <Text style={styles.cardValue}>{metric.value}</Text>
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
  cardIcon: {
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "500",
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

export default OverviewId;
