import { Business, getBusinessesRestaurant } from "@/api/client/business";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const FavoritesPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await getBusinessesRestaurant();
        setRestaurants(res.data);
      } catch (err) {
        console.error("❌ Erreur lors du fetch des restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Restaurants</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#333" />
          ) : restaurants.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={72} color="#ccc" />
              <Text style={styles.emptyTitle}>Aucun restaurant trouvé</Text>
              <Text style={styles.emptySubtitle}>
                La liste des restaurants sera affichée ici dès que le service
                sera prêt 🍴
              </Text>
            </View>
          ) : (
            <FlatList
              data={restaurants}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: `/(restaurants)/restaurants-details/[restaurantsId]`,
                      params: { restaurantsId: item.id }, 
                    })
                  } 
                >
                  <Image
                    source={{ uri: item.coverImageUrl || item.logoUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text
                      style={styles.cardSubtitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.description}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.3,
    maxWidth: width - 80,
    textAlign: "center",
  },
  content: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", paddingHorizontal: 40 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, color: "#666", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 150 },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  cardSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
});

export default FavoritesPage;
