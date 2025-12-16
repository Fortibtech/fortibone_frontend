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
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Business, GetBusinessesResponse } from "@/api/client/business";

const { width } = Dimensions.get("window");

interface Category {
  id: string;
  name: string;
}

const EnterprisePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "Tout" },
  ]);
  const [activeCategory, setActiveCategory] = useState<string>("all"); // Basé sur type
  const [enterprises, setEnterprises] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null); // Filtre dropdown par activitySector
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const searchInputRef = useRef<TextInput>(null);

  // Liste des secteurs uniques pour le dropdown
  const availableSectors = useMemo(() => {
    const sectors = enterprises
      .map((b) => b.activitySector?.trim())
      .filter(Boolean);
    return Array.from(new Set(sectors)).sort();
  }, [enterprises]);

  useEffect(() => {
    const loadEnterprises = async () => {
      try {
        setLoading(true);
        const res: GetBusinessesResponse = await getBusinesses();

        const filtered: Business[] = res.data
          .filter((b) => b.type === "RESTAURATEUR" || b.type === "COMMERCANT")
          .map((b) => {
            let imageUrl =
              "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image";
            const possible = [b.logoUrl, b.coverImageUrl].filter(Boolean);
            if (possible.length > 0) {
              imageUrl = possible[0];
              if (!imageUrl.startsWith("http"))
                imageUrl = `https://${imageUrl}`;
            }
            return { ...b, imageUrl };
          });

        setEnterprises(filtered);

        // 🔥 Tabs basés sur le TYPE (comme au début)
        const typeCategories: Category[] = [
          { id: "restaurateur", name: "Restaurants" },
          { id: "commercant", name: "Commerçants" },
        ];

        setCategories([{ id: "all", name: "Tout" }, ...typeCategories]);
      } catch (err) {
        console.error("Erreur chargement entreprises:", err);
      } finally {
        setLoading(false);
      }
    };
    loadEnterprises();
  }, []);

  const navigateToDetails = (business: Business) => {
    if (business.type === "RESTAURATEUR") {
      router.push({
        pathname: "/(client-restaurant)/restaurants-details/[restaurantsId]",
        params: { restaurantsId: business.id, name: business.name },
      });
    } else {
      router.push({
        pathname: "/enterprise-details/[id]",
        params: { id: business.id, name: business.name },
      });
    }
  };

  const filteredEnterprises = useMemo(() => {
    return enterprises.filter((business) => {
      const typeLower = business.type.toLowerCase();

      // Filtre par tab (type : restaurateur / commercant)
      const matchTab = activeCategory === "all" || typeLower === activeCategory; // "restaurateur" ou "commercant"

      // Filtre par dropdown (activitySector)
      const sectorLower = business.activitySector?.toLowerCase().trim() || "";
      const matchSector =
        !selectedSector || sectorLower === selectedSector.toLowerCase();

      // Recherche par nom
      const matchSearch = business.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return matchTab && matchSector && matchSearch;
    });
  }, [enterprises, activeCategory, selectedSector, searchText]);

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <Pressable onPress={() => searchInputRef.current?.focus()}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
      </Pressable>

      <TextInput
        ref={searchInputRef}
        placeholder="Rechercher par nom ou secteur..."
        placeholderTextColor="#999"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Icône dropdown pour filtrer par secteur d'activité */}
      <Pressable
        onPress={() => setDropdownVisible(true)}
        style={styles.dropdownTrigger}
      >
        <Ionicons
          name="chevron-down"
          size={22}
          color={selectedSector ? "#00C851" : "#999"}
        />
      </Pressable>

      {searchText.length > 0 && (
        <Pressable onPress={() => setSearchText("")} style={{ marginLeft: 8 }}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </Pressable>
      )}

      {/* Modal Dropdown pour activitySector */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  !selectedSector && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedSector(null);
                  setDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownText}>Tous les secteurs</Text>
                {!selectedSector && (
                  <Ionicons name="checkmark" size={20} color="#00C851" />
                )}
              </TouchableOpacity>

              {availableSectors.map((sector) => (
                <TouchableOpacity
                  key={sector}
                  style={[
                    styles.dropdownItem,
                    selectedSector?.toLowerCase() === sector.toLowerCase() &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedSector(sector);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </Text>
                  {selectedSector?.toLowerCase() === sector.toLowerCase() && (
                    <Ionicons name="checkmark" size={20} color="#00C851" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );

  const renderCategoryTabs = (): JSX.Element => (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              activeCategory === category.id && styles.activeTab,
            ]}
            onPress={() => setActiveCategory(category.id)}
            activeOpacity={0.7}
          >
            {activeCategory === category.id && (
              <Ionicons name="flame-outline" size={20} color="red" />
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

  const renderEnterpriseCard = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.enterpriseCard}
      onPress={() => navigateToDetails(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item.coverImageUrl ||
            "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image",
        }}
        style={styles.enterpriseImage}
        resizeMode="cover"
      />
      <View style={styles.enterpriseContent}>
        <View>
          <Text style={styles.enterpriseTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.enterpriseCategory}>
            {item.activitySector
              ? item.activitySector.charAt(0).toUpperCase() +
                item.activitySector.slice(1)
              : "Non spécifié"}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.averageRating || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEnterpriseGrid = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, alignItems: "center", marginTop: 50 }}>
          <ActivityIndicator size="large" color="#00C851" />
        </View>
      );
    }

    if (filteredEnterprises.length === 0) {
      return (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Text>Aucune entreprise trouvée.</Text>
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
  searchInput: { flex: 1, height: 48, color: "#333", fontSize: 16 },
  dropdownTrigger: { paddingHorizontal: 8, justifyContent: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    width: "85%",
    maxHeight: "70%",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemActive: { backgroundColor: "#f0fff4" },
  dropdownText: { fontSize: 16, color: "#333" },
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
  grid: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 16 },
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
  enterpriseImage: { width: "100%", height: 120, backgroundColor: "#CCCCCC" },
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
