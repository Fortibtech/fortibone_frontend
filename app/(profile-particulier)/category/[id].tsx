import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getCategoryById } from "@/api/Categories";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";

// Responsive dimensions
const { width } = Dimensions.get("window");
const isTablet = width >= 600;

type Category = {
  id: string | number;
  name: string;
  description: string;
  attributes: { id: string; name: string }[];
};

const CategoryDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation pour fade-in

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(id);
        setCategory(data);
        // Lancer l'animation après chargement
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error("⚠️ Erreur catégorie", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  // Rendu d'un attribut sous forme de carte
  const renderAttribute = ({
    item,
    index,
  }: {
    item: { id: string; name: string };
    index: number;
  }) => {
    const cardAnim = new Animated.Value(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100, // Effet cascade
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={[styles.attributeCard, { opacity: cardAnim }]}>
        <TouchableOpacity style={styles.attributeContent} activeOpacity={0.7}>
          <Ionicons
            name="checkmark-circle-outline"
            size={isTablet ? 24 : 20}
            color="#059669"
          />
          <Text style={styles.attributeText}>{item.name}</Text>
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
        <Text style={styles.loadingText}>Chargement de la catégorie...</Text>
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.centered}>
        <Ionicons name="sad-outline" size={isTablet ? 100 : 80} color="#ccc" />
        <Text style={styles.errorText}>Catégorie introuvable</Text>
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
          {category.name}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {category.description || "Pas de description disponible"}
        </Text>
      </View>

      {/* Liste des attributs */}
      <View style={styles.attributesSection}>
        <Text style={styles.subtitle}>
          Attributs ({category.attributes.length})
        </Text>
        <FlatList
          data={category.attributes}
          keyExtractor={(attr) => attr.id}
          renderItem={renderAttribute}
          contentContainerStyle={styles.attributesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyAttributes}>
              <Text style={styles.emptyAttributesText}>
                Aucun attribut trouvé
              </Text>
            </View>
          }
        />
      </View>
    </Animated.View>
  );
};

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
    flex: 1, // Pousse le titre au centre
  },
  headerTitle: {
    flex: 2,
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
  errorText: {
    marginTop: 12,
    fontSize: isTablet ? 20 : 18,
    color: "#666",
    fontWeight: "500",
  },
  descriptionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  description: {
    fontSize: isTablet ? 16 : 15,
    color: "#666",
    lineHeight: isTablet ? 24 : 22,
  },
  attributesSection: {
    flex: 1,
  },
  subtitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  attributesList: {
    paddingBottom: 120, // Espace pour scroll
  },
  attributeCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  attributeContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: isTablet ? 16 : 12,
  },
  attributeText: {
    fontSize: isTablet ? 16 : 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  emptyAttributes: {
    padding: 16,
    alignItems: "center",
  },
  emptyAttributesText: {
    fontSize: isTablet ? 16 : 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default CategoryDetailScreen;
