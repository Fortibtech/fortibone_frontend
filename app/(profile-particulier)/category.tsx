// src/screens/CategoriesScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axiosInstance from "@/api/axiosInstance";
import BackButton from "@/components/BackButton"; // <-- ton bouton custom
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Category = {
  id: string | number;
  name: string;
  description: string;
};

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.log("❌ Erreur lors du fetch des catégories :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec le bouton retour */}
      <View style={styles.header}>
        <BackButton size={45} />
        <Text style={styles.title}>Catégories</Text>
      </View>

      {/* Liste des catégories */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/category/[id]",
                params: { id: item.id.toString() },
              })
            }
          >
            <Ionicons name="pricetags-outline" size={28} color="#00C851" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.desc}>
                {item.description || "Pas de description"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  desc: { fontSize: 14, color: "#666" },
});
