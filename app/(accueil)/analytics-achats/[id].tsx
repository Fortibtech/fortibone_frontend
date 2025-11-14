import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { StockCard } from "@/components/accueil/StockCard";
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
  const stockData = [
    {
      icon: "package" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
      title: "Produits en Stock",
      value: "56",
    },
    {
      icon: "dollar-sign" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
      title: "Valeur du Stock",
      value: "32 463 000 KMF",
    },
    {
      icon: "alert-triangle" as keyof typeof Feather.glyphMap,
      iconColor: "#F59E0B",
      iconBgColor: "#FEF3C7",
      title: "Stock Faible",
      value: "7",
    },
    {
      icon: "box" as keyof typeof Feather.glyphMap,
      iconColor: "#6B7280",
      iconBgColor: "#F3F4F6",
      title: "Rupture de Stock",
      value: "1",
    },
    {
      icon: "clock" as keyof typeof Feather.glyphMap,
      iconColor: "#3B82F6",
      iconBgColor: "#DBEAFE",
      title: "En Voie d'Expiration",
      value: "3",
    },
    {
      icon: "x-circle" as keyof typeof Feather.glyphMap,
      iconColor: "#EF4444",
      iconBgColor: "#FEE2E2",
      title: "Expiré",
      value: "4",
    },
    {
      icon: "trending-down" as keyof typeof Feather.glyphMap,
      iconColor: "#EF4444",
      iconBgColor: "#FEE2E2",
      title: "Total Pertes",
      value: "9",
    },
    {
      icon: "image" as keyof typeof Feather.glyphMap,
      iconColor: "#EF4444",
      iconBgColor: "#FEE2E2",
      title: "Valeur Pertes",
      value: "766 500 KMF",
    },
    {
      icon: "refresh-cw" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
      title: "Taux de Rotation",
      value: "11.6",
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
