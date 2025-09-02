// src/screens/CategoryDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getCategoryById } from "@/api/Categories";
import BackButton from "@/components/BackButton";

const CategoryDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  console.log("id de la categorie", id);
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(id);
        setCategory(data);
      } catch (err) {
        console.error("⚠️ Erreur catégorie", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00C851" />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.center}>
        <Text>Catégorie introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Bouton retour */}
      <BackButton />

      <Text style={styles.title}>{category.name}</Text>
      <Text style={styles.desc}>{category.description}</Text>

      <Text style={styles.subtitle}>Attributs :</Text>
      <FlatList
        data={category.attributes}
        keyExtractor={(attr) => attr.id}
        renderItem={({ item }) => (
          <Text style={styles.attr}>- {item.name}</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00C851",
    marginBottom: 8,
  },
  desc: { fontSize: 15, color: "#666", marginBottom: 16 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 12, color: "#333" },
  attr: { fontSize: 14, color: "#666", marginVertical: 4 },
});

export default CategoryDetailScreen;
