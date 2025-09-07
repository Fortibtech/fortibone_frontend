import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import axiosInstance from "@/api/axiosInstance";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Responsive dimensions
const { width } = Dimensions.get("window");
const isTablet = width >= 600;

type Category = {
  id: string | number;
  name: string;
  description: string;
};

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation pour fade-in
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data);
        // Lancer l'animation après chargement
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.log("❌ Erreur lors du fetch des catégories :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Animation pour chaque carte
  const renderCategoryCard = ({
    item,
    index,
  }: {
    item: Category;
    index: number;
  }) => {
    const cardAnim = new Animated.Value(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100, // Décalage pour effet cascade
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={[styles.card, { opacity: cardAnim }]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() =>
            router.push({
              pathname: "/category/[id]",
              params: { id: item.id.toString() },
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="pricetags-outline"
            size={isTablet ? 32 : 28}
            color="#059669"
          />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description || "Pas de description disponible"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size={isTablet ? "large" : "small"}
          color="#059669"
        />
        <Text style={styles.loadingText}>Chargement des catégories...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton size={isTablet ? 50 : 45} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          Catégories ({categories.length})
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Liste des catégories ou message vide */}
      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="sad-outline"
            size={isTablet ? 100 : 80}
            color="#ccc"
          />
          <Text style={styles.emptyText}>Aucune catégorie trouvée</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderCategoryCard}
          showsVerticalScrollIndicator={false}
          numColumns={isTablet ? 2 : 1} // Deux colonnes sur tablette
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: width * 0.04, // Responsive padding
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 50,
  },
  headerLeft: {
    flex: 0,
    justifyContent: "center",
  },
  headerRight: {
    flex: 1, // Prend l'espace restant pour pousser le titre au centre
  },
  headerTitle: {
    flex: 2, // Prend plus d'espace que les côtés pour être centré
    fontSize: isTablet ? 26 : 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: isTablet ? 18 : 16,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: isTablet ? 20 : 18,
    color: "#666",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 120, // Espace pour scroll
  },
  card: {
    flex: isTablet ? 0.48 : 1, // Responsive pour grille tablette
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: isTablet ? width * 0.01 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: isTablet ? 16 : 12,
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: isTablet ? 15 : 14,
    color: "#666",
    lineHeight: isTablet ? 22 : 20,
  },
});
