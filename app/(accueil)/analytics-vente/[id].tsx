import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { StockCard } from "@/components/accueil/StockCard";
import { AnalyticsOverview, getAnalyticsOverview } from "@/api/analytics";
import { useLocalSearchParams } from "expo-router";
// Composant Header
const Header: React.FC<{ onBackPress?: () => void }> = ({ onBackPress }) => {
  return (
    <View style={styles.header}>
      <BackButtonAdmin />
      <Text style={styles.headerTitle}>Analytics Ventes</Text>
      <View style={styles.placeholder} />
    </View>
  );
};
const StockTrackingScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalyticsOverview(id);
      setData(result);
    } catch (error) {
      console.error("❌ Erreur lors du fetch overview:", error);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || "Aucune donnée trouvée."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const stockData = [
    {
      icon: "dollar-sign" as keyof typeof Feather.glyphMap, // ✅ équivalent de "cash-outline"
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
      title: "Total des ventes",
      value: `${data.totalSalesAmount} KMF`,
    },
    {
      title: "Commandes totales",
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
      value: data.totalSalesOrders,
      icon: "shopping-cart" as keyof typeof Feather.glyphMap, // ✅ équivalent de "cart"
    },

    {
      title: "Valeur moyenne commande",
      value: data.averageOrderValue,
      icon: "percent" as keyof typeof Feather.glyphMap, // équiv. "calculator-outline"
      iconColor: "#3B82F6",
      iconBgColor: "#DBEAFE",
    },
    {
      title: "Produits vendus",
      value: data.totalProductsSold,
      icon: "package" as keyof typeof Feather.glyphMap, // équiv. "cube-outline"
      iconColor: "#F59E0B",
      iconBgColor: "#FEF3C7",
    },
    {
      title: "Total des achats",
      value: data.totalPurchaseAmount,
      icon: "credit-card" as keyof typeof Feather.glyphMap, // équiv. "wallet-outline"
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
    },
    {
      title: "Commandes d'achat",
      value: data.totalPurchaseOrders,
      icon: "shopping-bag" as keyof typeof Feather.glyphMap, // équiv. "bag-handle-outline"
      iconColor: "#8B5CF6",
      iconBgColor: "#EDE9FE",
    },
    {
      title: "Valeur de l'inventaire",
      value: data.currentInventoryValue,
      icon: "archive" as keyof typeof Feather.glyphMap, // équiv. "archive-outline"
      iconColor: "#F97316",
      iconBgColor: "#FFEDD5",
    },
    {
      title: "Membres totaux",
      value: data.totalMembers,
      icon: "users" as keyof typeof Feather.glyphMap, // équiv. "person-circle-outline"
      iconColor: "#06B6D4",
      iconBgColor: "#CFFAFE",
    },
    {
      title: "Clients uniques",
      value: data.uniqueCustomers,
      icon: "user-check" as keyof typeof Feather.glyphMap, // équiv. "people-outline"
      iconColor: "#84CC16",
      iconBgColor: "#ECFCCB",
    },
    {
      title: "Note moyenne",
      value: data.averageBusinessRating,
      icon: "star" as keyof typeof Feather.glyphMap, // équiv. "star-outline"
      iconColor: "#FACC15",
      iconBgColor: "#FEF9C3",
    },
    {
      title: "Total des avis",
      value: data.totalBusinessReviews,
      icon: "message-circle" as keyof typeof Feather.glyphMap, // équiv. "chatbubble-outline"
      iconColor: "#6366F1",
      iconBgColor: "#E0E7FF",
    }
  ];

  const handleCardPress = (title: string) => {
    console.log(`Pressed: ${title}`);
  };

  return (
    <View style={styles.container}>
      <Header onBackPress={() => console.log("Back pressed")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {stockData.map((item, index) => (
            <StockCard
              key={index}
              icon={item.icon}
              iconColor={item.iconColor}
              iconBgColor={item.iconBgColor}
              title={item.title}
              value={item.value}
              onPress={() => handleCardPress(item.title)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  backButton: {
    padding: 4,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});

export default StockTrackingScreen;
