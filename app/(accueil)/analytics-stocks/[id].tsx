import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { StockCard } from "@/components/accueil/StockCard";
import { useLocalSearchParams } from "expo-router";
import { getInventory, InventoryResponse } from "@/api/analytics";
// Composant Header
const Header: React.FC<{ onBackPress?: () => void }> = ({ onBackPress }) => {
  return (
    <View style={styles.header}>
      <BackButtonAdmin />
      <Text style={styles.headerTitle}>Suivi des Stocks</Text>
      <View style={styles.placeholder} />
    </View>
  );
};
const StockTrackingScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getInventory(id);
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
  console.log("ANALITICS id du bussines en STOCK", id);
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
      title: "Valeur du stock",
      value: data.currentInventoryValue,
      icon: "dollar-sign" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
    },
    {
      title: "Unités en stock",
      value: data.totalUnitsInStock,
      icon: "package" as keyof typeof Feather.glyphMap,
      iconColor: "#F59E0B",
      iconBgColor: "#FEF3C7",
    },
    {
      title: "Produits en rupture",
      value: data.productsLowStock.length,
      icon: "alert-triangle" as keyof typeof Feather.glyphMap,
      iconColor: "#EF4444",
      iconBgColor: "#FEE2E2",
    },
    {
      title: "Produits expirants",
      value: data.expiringProducts.length,
      icon: "clock" as keyof typeof Feather.glyphMap,
      iconColor: "#3B82F6",
      iconBgColor: "#DBEAFE",
    },
    {
      title: "Pertes enregistrées",
      value: data.lossesByMovementType.length,
      icon: "activity" as keyof typeof Feather.glyphMap,
      iconColor: "#8B5CF6",
      iconBgColor: "#EDE9FE",
    },
  ];

  const handleCardPress = (title: string) => {
    console.log(`Pressed: ${title}`);
  };
  console.log(data);
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
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
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
