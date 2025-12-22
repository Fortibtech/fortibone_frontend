import { getBusinesses } from "@/api/client/business";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { width } = Dimensions.get("window");

interface Category {
  id: string;
  name: string;
}

interface Enterprise {
  id: string;
  name: string;
  rating: number;
  category: string;
  image: string;
  categoryId: string;
}

const EnterprisePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "Tout" },
  ]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadEnterprises = async () => {
      try {
        setLoading(true);
        const res = await getBusinesses();

        // 🔥 Debug: Afficher la structure des données reçues
        if (res.data && res.data.length > 0) {
          console.log(
            "Structure API complète:",
            JSON.stringify(res.data[0], null, 2)
          );
        }

        const mapped: Enterprise[] = res.data
          .filter((b: any) => b.type !== "FOURNISSEUR")
          .map((b: any) => {
            // 🔥 Détection intelligente de l'image avec tous les cas possibles
            let imageUrl =
              "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image";

            // Essayer différentes propriétés dans l'ordre de priorité
            const possibleImageFields = [
              b.image,
              b.logoUrl,
              b.logo,
              b.coverImageUrl,
              b.coverImage,
              b.imageUrl,
              b.thumbnail,
              b.picture,
            ];

            // Trouver la première image valide
            const foundImage = possibleImageFields.find(
              (img) => img && typeof img === "string" && img.trim() !== ""
            );

            if (foundImage) {
              imageUrl = foundImage;

              // 🔥 Corriger les URLs sans protocole
              if (
                !imageUrl.startsWith("http://") &&
                !imageUrl.startsWith("https://")
              ) {
                imageUrl = `https://${imageUrl}`;
              }

              // 🔥 Éviter les placeholders en production
              if (imageUrl.includes("via.placeholder.com")) {
                console.warn(`⚠️ Placeholder détecté pour: ${b.name}`);
              }
            } else {
              console.warn(`⚠️ Aucune image trouvée pour: ${b.name}`);
            }

            return {
              id: b.id,
              name: b.name || "Sans nom",
              rating: b.averageRating || b.rating || 0,
              category: b.type || "Non classé",
              image: imageUrl,
              categoryId: (b.type || "autre").toLowerCase(),
            };
          });

        console.log(`✅ ${mapped.length} entreprises chargées`);
        setEnterprises(mapped);

        // 🔥 Génération dynamique des catégories
        const uniqueTypes = Array.from(
          new Set(mapped.map((e) => e.categoryId))
        );

        const dynamicCategories: Category[] = uniqueTypes.map((type) => ({
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " "),
        }));

        setCategories([{ id: "all", name: "Tout" }, ...dynamicCategories]);
      } catch (err) {
        console.error("❌ Erreur chargement entreprises:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEnterprises();
  }, []);

  const navigateToEnterpriseDetails = (
    enterpriseId: string,
    enterpriseName: string
  ): void => {
    router.push({
      pathname: "/enterprise-details/[id]",
      params: { id: enterpriseId, name: enterpriseName },
    });
  };

  const filteredEnterprises = useMemo(() => {
    return enterprises.filter((enterprise) => {
      const matchCategory =
        activeCategory === "all" || enterprise.categoryId === activeCategory;
      const matchSearch = enterprise.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [enterprises, activeCategory, searchText]);

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <Pressable
        onPress={() => searchInputRef.current?.focus()}
        accessibilityLabel="Rechercher une entreprise"
      >
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
      </Pressable>
      <TextInput
        ref={searchInputRef}
        placeholder="Rechercher par nom ou categorie..."
        placeholderTextColor="#999"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        accessibilityLabel="Barre de recherche"
      />
      {searchText.length > 0 && (
        <Pressable
          onPress={() => setSearchText("")}
          accessibilityLabel="Effacer la recherche"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color="#999"
            style={styles.clearIcon}
          />
        </Pressable>
      )}
    </View>
  );

  const renderCategoryTabs = (): JSX.Element => (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {categories.map((category: Category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              activeCategory === category.id && styles.activeTab,
            ]}
            onPress={() => setActiveCategory(category.id)}
            activeOpacity={0.7}
            accessibilityLabel={`Filtrer par ${category.name}`}
          >
            {activeCategory === category.id && (
              <Ionicons name="flame-outline" size={20} color={"red"} />
            )}
            <Text
              style={[
                styles.tabText,
                activeCategory === category.id && styles.activeTabText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEnterpriseCard = ({
    item,
  }: {
    item: Enterprise;
  }): JSX.Element => (
    <TouchableOpacity
      style={styles.enterpriseCard}
      onPress={() => navigateToEnterpriseDetails(item.id, item.name)}
      activeOpacity={0.8}
      accessibilityLabel={`Voir détails de ${item.name}`}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.enterpriseImage}
        resizeMode="cover"
        onError={(error) => {
          console.log(`❌ Erreur image pour ${item.name}: ${item.image}`);
        }}
      />
      <View style={styles.enterpriseContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.enterpriseTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.enterpriseCategory}>{item.category}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEnterpriseGrid = (): JSX.Element => {
    if (loading) {
      return (
        <View style={{ flex: 1, alignItems: "center", marginTop: 50 }}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Chargement des entreprises...
          </Text>
        </View>
      );
    }

    if (filteredEnterprises.length === 0) {
      return (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={{ marginTop: 10, fontSize: 16, color: "#666" }}>
            Aucune entreprise trouvée
          </Text>
          {searchText.length > 0 && (
            <Text style={{ marginTop: 5, fontSize: 14, color: "#999" }}>
              Essayez un autre terme de recherche
            </Text>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={filteredEnterprises}
        renderItem={renderEnterpriseCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderCategoryTabs()}
      {renderEnterpriseGrid()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  clearIcon: { marginLeft: 8 },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#333",
    fontSize: 16,
  },
  tabContainer: { paddingVertical: 12 },
  tabScrollContent: { paddingHorizontal: 16 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#E8E9ED",
    minHeight: 48,
  },
  activeTab: {
    backgroundColor: "#00C851",
    borderColor: "#00C851",
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: { fontSize: 14, fontWeight: "500", color: "#666" },
  activeTabText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  grid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  enterpriseCard: {
    width: (width - 56) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  enterpriseImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5F6FA",
  },
  enterpriseContent: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  enterpriseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  enterpriseCategory: { fontSize: 12, color: "#666", marginBottom: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 13, color: "#333", marginLeft: 4, fontWeight: "500" },
});

export default EnterprisePage;
