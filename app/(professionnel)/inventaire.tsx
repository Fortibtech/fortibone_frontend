// src/screens/InventoryScreen.tsx
import { BusinessesService } from "@/api/services/businessesService"; // ✅ adapte le chemin
import { Business } from "@/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InventoryScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const response = await BusinessesService.getBusinesses(); // ✅ pagination si besoin
        setBusinesses(response.data);
      } catch (error) {
        console.error("❌ Erreur lors du fetch businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        await BusinessesService.selectBusiness(item);
        router.push(`/(inventory)/details/${item.id}`);
      }}
    >
      <Ionicons
        name="business-outline"
        size={28}
        color="#2c3e50"
        style={styles.icon}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        {item.address ? (
          <Text style={styles.description}>{item.address}</Text>
        ) : (
          <Text style={styles.description}>Aucune adresse fournie</Text>
        )}
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Header avec titre + description */}
      <View style={styles.header}>
        <Ionicons name="list-outline" size={32} color="#2c3e50" />
        <Text style={styles.headerTitle}>Inventaires des entreprises</Text>
        <Text style={styles.headerDescription}>
          Consultez les inventaires de chaque entreprise en cliquant dessus.
        </Text>
      </View>

      {/* ✅ Liste des entreprises */}
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Aucune entreprise disponible
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#ecf0f1",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    color: "#2c3e50",
  },
  headerDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  icon: { marginRight: 12 },
  info: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#2c3e50",
  },
  description: { fontSize: 14, color: "#666" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
