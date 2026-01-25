// components/Achat/CompanyProfile.tsx
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Business, BusinessesService } from "@/api";

interface Props {
  onSearch: (text: string) => void;
  onFilterPress: () => void;
  businessId: string; // ← Corrigé : businessId (pas bussinessId)
}
export default function CompanyProfile({
  onSearch,
  onFilterPress,
  businessId,
}: Props) {
  const [searchText, setSearchText] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadBusiness = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const data = await BusinessesService.getBusinessById(businessId);
      setBusiness(data);
    } catch (error: any) {
      console.error("Erreur chargement business:", error);
      alert("Impossible de charger les infos de l'entreprise");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [businessId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBusiness();
  }, [loadBusiness]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { opacity: 0.7 }]}>
          <View
            style={[styles.logoContainer, { backgroundColor: "#f0f0f0" }]}
          />
          <View style={{ flex: 1 }}>
            <View
              style={{
                height: 20,
                backgroundColor: "#f0f0f0",
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <View
              style={{
                height: 16,
                backgroundColor: "#f0f0f0",
                borderRadius: 4,
                width: "60%",
              }}
            />
          </View>
        </View>
        <View style={[styles.searchContainer, { opacity: 0.7 }]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", color: "#999", padding: 20 }}>
          Entreprise non trouvée
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER ENTREPRISE */}
      {/* <View style={styles.header}>
        <View style={styles.logoContainer}>
          {business.logoUrl ? (
            <Image
              source={{ uri: business.logoUrl }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{business.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyName} numberOfLines={2}>
            {business.name}
          </Text>

          <View style={styles.badgeContainer}>
            {business.isVerified && (
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={16} color="#4bf218ff" />
                <Text style={styles.verifiedText}>Vérifiée</Text>
              </View>
            )}

            <View style={styles.ratingBadge}>
              <Feather name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>
                {business.averageRating.toFixed(1)} ({business.reviewCount})
              </Text>
            </View>
          </View>

          {business.description && (
            <Text style={styles.description} numberOfLines={3}>
              {business.description}
            </Text>
          )}

          <View style={styles.ownerInfo}>
            <Feather name="user" size={14} color="#666" />
            <Text style={styles.ownerText}>
              {business.owner.firstName} {business.owner.lastName}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() =>
            router.push({
              pathname: "/(achats)/details/[bussinessId]",
              params: { bussinessId: businessId },
            })
          }
        >
          <Feather name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View> */}

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            onSearch(text);
          }}
        />
        <TouchableOpacity onPress={onFilterPress}>
          <Feather name="sliders" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    padding: 16,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14, // ← réduit de 20 → 14
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // ← réduit de 20 → 12
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, // ← ombre plus légère
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  logoContainer: {
    marginRight: 16,
  },
  appleLogo: {
    width: 80,
    height: 80,
    backgroundColor: "#000",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    lineHeight: 24,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 14,
    color: "#1877F2",
    fontWeight: "500",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#FFC107",
    fontWeight: "600",
  },
  chevronButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    padding: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ownerText: {
    fontSize: 13,
    color: "#666",
  },
  moreBtn: {
    padding: 8,
    marginLeft: 8,
  },
});
