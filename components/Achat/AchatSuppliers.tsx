// components/Achat/AchatSuppliers.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Business, BusinessesService } from "@/api";

// === Props du composant ===
interface AchatSuppliersProps {
  searchQuery: string; // Reçu du parent (AchatsScreen)
}

export default function AchatSuppliers({ searchQuery }: AchatSuppliersProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // === Chargement des fournisseurs ===
  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await BusinessesService.getBusinesses();
      setBusinesses(data);
    } catch (error) {
      alert("Erreur de chargement des fournisseurs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchissement pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  }, [loadSuppliers]);

  // Chargement initial
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // === FILTRAGE EN TEMPS RÉEL ===
  // 1. On garde uniquement les FOURNISSEURS
  // 2. On filtre par nom (insensible à la casse et aux espaces)
  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return businesses
      .filter((b) => b.type === "FOURNISSEUR")
      .filter((b) => {
        if (!query) return true; // Si vide → tout afficher
        return b.name.toLowerCase().includes(query);
      });
  }, [businesses, searchQuery]);

  // === État de chargement initial ===
  if (loading && businesses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B87C" />
        <Text style={styles.loadingText}>Chargement des fournisseurs...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.grid}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#00B87C"]}
          tintColor="#00B87C"
        />
      }
    >
      {/* === Message vide ou pas de résultat === */}
      {filteredSuppliers.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchQuery
            ? `Aucun fournisseur trouvé pour "${searchQuery}"`
            : "Aucun fournisseur disponible"}
        </Text>
      ) : (
        /* === Grille de cartes === */
        filteredSuppliers.map((supplier) => (
          <TouchableOpacity
            key={supplier.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/(achats)/[bussinessId]",
                params: { bussinessId: supplier.id }, // typo "businessId" → corrigée dans le routeur si besoin
              })
            }
            accessibilityLabel={`Voir ${supplier.name}`}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              {supplier.logoUrl ? (
                <Image
                  source={{ uri: supplier.logoUrl }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.logoPlaceholder}>Box</Text>
              )}
            </View>

            {/* Infos */}
            <Text style={styles.name} numberOfLines={1}>
              {supplier.name}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {supplier.description || "Fournisseur"}
            </Text>
            <Text style={styles.reviews}>{supplier.reviewCount || 0} avis</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

// === STYLES (inchangés) ===
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14 },
  grid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  logo: { width: 50, height: 50 },
  logoPlaceholder: { fontSize: 28, color: "#9CA3AF" },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 4,
  },
  reviews: { fontSize: 11, color: "#9CA3AF" },
  emptyText: {
    width: "100%",
    textAlign: "center",
    marginTop: 32,
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
