import { getBusinesses, BusinessType } from "@/api/client/business";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  type?: BusinessType | "all";
}

const EnterprisePage: React.FC = () => {
  // Catégories basées sur le type d'entreprise
  const categories: Category[] = [
    { id: "all", name: "Tout", type: "all" },
    { id: "restaurateur", name: "Restaurants", type: "RESTAURATEUR" },
    { id: "commercant", name: "Commerçants", type: "COMMERCANT" },
  ];

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [enterprises, setEnterprises] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const searchInputRef = useRef<TextInput>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // ==================== FONCTION DE CHARGEMENT AVEC FILTRES BACKEND ====================
  const loadEnterprises = useCallback(
    async (page: number = 1, resetData: boolean = false) => {
      try {
        setLoading(true);

        // Récupère le type correspondant à la catégorie active
        const currentCategory = categories.find((c) => c.id === activeCategory);
        const businessType =
          currentCategory?.type !== "all"
            ? (currentCategory?.type as BusinessType)
            : undefined;

        // 🔥 APPEL API AVEC TOUS LES FILTRES
        const res: GetBusinessesResponse = await getBusinesses({
          type: businessType, // ✅ Filtrage par type (backend)
          search: searchText || undefined, // ✅ Recherche textuelle (backend)
          page: page, // ✅ Pagination (backend)
          limit: 90, // 20 entreprises par page
        });

        const processedData: Business[] = res.data.map((b) => {
          let imageUrl =
            "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image";
          const possible = [b.logoUrl, b.coverImageUrl].filter(Boolean);
          if (possible.length > 0) {
            imageUrl = possible[0];
            if (!imageUrl.startsWith("http")) imageUrl = `https://${imageUrl}`;
          }
          return { ...b, imageUrl };
        });

        // ✅ Filtrage par secteur (optionnel frontend car pas disponible dans l'API)
        const filteredBySector = selectedSector
          ? processedData.filter(
              (b) =>
                b.activitySector?.toLowerCase().trim() ===
                selectedSector.toLowerCase()
            )
          : processedData;

        if (resetData) {
          setEnterprises(filteredBySector);
        } else {
          setEnterprises((prev) => [...prev, ...filteredBySector]);
        }

        // Mise à jour de la pagination
        const total = res.pagination?.totalPages || res.totalPages || 1;
        setTotalPages(total);
        setHasMore(page < total);
        setCurrentPage(page);
      } catch (err) {
        console.error("Erreur chargement entreprises:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeCategory, searchText, selectedSector]
  );

  // ==================== CHARGEMENT DES SECTEURS DISPONIBLES ====================
  const loadAvailableSectors = useCallback(async () => {
    try {
      // Charge TOUTES les entreprises pour extraire les secteurs uniques
      const res: GetBusinessesResponse = await getBusinesses({
        limit: 1000, // Grande limite pour récupérer tous les secteurs
      });

      const sectors = res.data
        .map((b) => b.activitySector?.trim())
        .filter(Boolean) as string[];

      const uniqueSectors = Array.from(new Set(sectors)).sort();
      setAvailableSectors(uniqueSectors);
    } catch (err) {
      console.error("Erreur chargement secteurs:", err);
    }
  }, []);

  // ==================== EFFETS ====================

  // Chargement initial des secteurs
  useEffect(() => {
    loadAvailableSectors();
  }, []);

  // Rechargement quand les filtres changent
  useEffect(() => {
    loadEnterprises(1, true); // Reset à la page 1
  }, [activeCategory, selectedSector]);

  // Debounce pour la recherche textuelle
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      loadEnterprises(1, true); // Reset à la page 1
    }, 500); // Attend 500ms après la dernière saisie

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchText]);

  // ==================== NAVIGATION ====================
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

  // ==================== PAGINATION INFINIE ====================
  const loadMoreEnterprises = () => {
    if (!loading && hasMore) {
      loadEnterprises(currentPage + 1, false);
    }
  };

  // ==================== RENDERS ====================
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
        placeholder="Rechercher par nom..."
        placeholderTextColor="#999"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Dropdown pour filtrer par secteur */}
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

      {/* Modal Dropdown pour secteur d'activité */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownMenu}>
              <ScrollView showsVerticalScrollIndicator={true}>
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
              </ScrollView>
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
        <View style={{ flex: 1 }}>
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

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#00C851" />
      </View>
    );
  };

  const renderEnterpriseGrid = () => {
    if (loading && enterprises.length === 0) {
      return (
        <View style={{ flex: 1, alignItems: "center", marginTop: 50 }}>
          <ActivityIndicator size="large" color="#00C851" />
        </View>
      );
    }

    if (enterprises.length === 0) {
      return (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Ionicons name="search-outline" size={80} color="#E0E0E0" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#999" }}>
            Aucune entreprise trouvée
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={enterprises}
        renderItem={renderEnterpriseCard}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreEnterprises}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
    justifyContent: "center",
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
    alignItems: "flex-start",
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
