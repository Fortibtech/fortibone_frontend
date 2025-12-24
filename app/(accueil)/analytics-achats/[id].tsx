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
import { useLocalSearchParams } from "expo-router";
import { getSales, SalesResponse } from "@/api/analytics";
import { formatMoney } from "@/utils/formatMoney";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
// Composant Header
const Header: React.FC<{ onBackPress?: () => void }> = ({ onBackPress }) => {
  return (
    <View style={styles.header}>
      <BackButtonAdmin />
      <Text style={styles.headerTitle}>Analytics Achats</Text>
      <View style={styles.placeholder} />
    </View>
  );
};
const StockTrackingScreen: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<SalesResponse | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getSales(id);
      if (business) {
        const symbol = await getCurrencySymbolById(business.currencyId);
        setSymbol(symbol);
      }
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
  console.log("ANALITICS id du bussines en achat", id);
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
      title: "Montant total des ventes",
      value: `${formatMoney(data.salesByPeriod?.[0]?.totalRevenue ?? 0)} ${
        symbol || ""
      }`,

      icon: "dollar-sign" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
    },
    {
      title: "Articles vendus",
      value: data.salesByPeriod?.[0]?.totalItems ?? 0,
      icon: "shopping-cart" as keyof typeof Feather.glyphMap,
      iconColor: "#3B82F6",
      iconBgColor: "#DBEAFE",
    },
    {
      title: "Revenu par catégorie",
      value: `${formatMoney(
        data.salesByProductCategory?.reduce(
          (sum, c) => sum + (c.totalRevenue || 0),
          0
        ) ?? 0
      )} ${symbol || ""}`,
      icon: "layers" as keyof typeof Feather.glyphMap,
      iconColor: "#F59E0B",
      iconBgColor: "#FEF3C7",
    },
    {
      title: "Produits vendus (catégories)",
      value: data.salesByProductCategory?.reduce(
        (sum, c) => sum + (c.totalItemsSold || 0),
        0
      ),
      icon: "tag" as keyof typeof Feather.glyphMap,
      iconColor: "#8B5CF6",
      iconBgColor: "#EDE9FE",
    },
    {
      title: "Top produit vendu (quantité)",
      value: data.topSellingProducts?.[0]?.totalQuantitySold ?? 0,
      icon: "package" as keyof typeof Feather.glyphMap,
      iconColor: "#F97316",
      iconBgColor: "#FFEDD5",
    },
    {
      title: "Top produit revenu",
      value: `${formatMoney(data.topSellingProducts?.[0]?.totalRevenue ?? 0)} ${
        symbol || ""
      }`,
      icon: "trending-up" as keyof typeof Feather.glyphMap,
      iconColor: "#06B6D4",
      iconBgColor: "#CFFAFE",
    },
    {
      title: "Pourcentage du top produit",
      value: `${data.topSellingProducts?.[0]?.revenuePercentage ?? 0}%`,
      icon: "percent" as keyof typeof Feather.glyphMap,
      iconColor: "#84CC16",
      iconBgColor: "#ECFCCB",
    },
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
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
  backButton: {
    padding: 4,
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
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
