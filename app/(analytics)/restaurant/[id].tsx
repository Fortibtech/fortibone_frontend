import { getStatRestaurant, RestaurantStats } from "@/api/restaurant";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const Restaurant = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStatRestaurant(id);
      setStats(data);
    } catch (err: any) {
      console.error("❌ Restaurant stats error:", err);
      setError("Échec du chargement des statistiques. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.center}>
        <Ionicons name="sad-outline" size={40} color="#6b7280" />
        <Text style={styles.errorText}>
          {error || "Aucune donnée disponible pour ce restaurant."}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchStats}
          accessibilityLabel="Réessayer de charger les statistiques"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = [
    {
      title: "Aperçu",
      icon: "stats-chart-outline",
      data: [
        {
          label: "Total des réservations",
          value: stats.totalReservations,
          icon: "calendar-outline",
        },
        {
          label: "Total des commandes de plats",
          value: stats.totalDishOrders,
          icon: "restaurant-outline",
        },
        {
          label: "Occupation moyenne des tables",
          value: stats.averageTableOccupancy,
          icon: "people-outline",
        },
      ],
    },
    {
      title: "Plats populaires",
      icon: "star-outline",
      data:
        stats.popularDishes.length === 0
          ? [
              {
                label: "Aucune donnée",
                value: "Aucun plat populaire enregistré",
                icon: "alert-circle-outline",
              },
            ]
          : stats.popularDishes.map((dish, index) => ({
              label: `Plat ${index + 1}`,
              value: JSON.stringify(dish), // Replace with proper formatting in future iterations
              icon: "fast-food-outline",
            })),
    },
    {
      title: "Réservations par période",
      icon: "calendar-outline",
      data:
        stats.reservationsByPeriod.length === 0
          ? [
              {
                label: "Aucune donnée",
                value: "Aucune réservation enregistrée",
                icon: "alert-circle-outline",
              },
            ]
          : stats.reservationsByPeriod.map((res, index) => ({
              label: res.period,
              value: res.totalReservations,
              icon: "time-outline",
            })),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Retour à la page précédente"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Ionicons
          name="restaurant-outline"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
          Statistiques du restaurant
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchStats}
          accessibilityLabel="Rafraîchir les statistiques"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.sectionCard}
          >
            <LinearGradient
              colors={["#ffffff", "#f8fafc"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.sectionHeader}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color="#3b82f6"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>
            {item.data.map((dataItem, dataIndex) => (
              <View key={dataIndex} style={styles.dataRow}>
                <Ionicons
                  name={dataItem.icon as any}
                  size={16}
                  color="#3b82f6"
                  style={styles.dataIcon}
                />
                <Text style={styles.dataLabel}>{dataItem.label} :</Text>
                <Text style={styles.dataValue}>{dataItem.value}</Text>
              </View>
            ))}
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
    padding: 12,
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
    padding: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  dataIcon: {
    marginRight: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
    textAlign: "right",
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
    marginTop: 8,
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

export default Restaurant;
