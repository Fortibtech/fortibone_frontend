import { getTopCustomers, TopCustomer } from "@/api/analytics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

const Customers = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTopCustomers(id);
      setCustomers(data.topCustomers);
    } catch (err) {
      console.error("❌ Erreur API customers:", err);
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
        <Text style={styles.loadingText}>Chargement des clients...</Text>
      </View>
    );
  }

  if (error || customers.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="sad-outline" size={40} color="#6b7280" />
        <Text style={styles.errorText}>{error || "Aucun client trouvé."}</Text>
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
          name="people-outline"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header}>Top clients</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={customers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={0.8}>
            <Animated.View
              entering={FadeInUp.delay(index * 100).springify()}
              layout={Layout.springify()}
              style={styles.card}
            >
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardContent}>
                {item.profileImageUrl ? (
                  <Image
                    source={{ uri: item.profileImageUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Ionicons name="person-outline" size={30} color="#6b7280" />
                  </View>
                )}
                <View style={styles.customerInfo}>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="cart-outline"
                      size={16}
                      color="#3b82f6"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                      {item.totalOrdersPlaced} commande(s)
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="cash-outline"
                      size={16}
                      color="#3b82f6"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                      Dépensé : {item.totalAmountSpent} €
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
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

export default Customers;
