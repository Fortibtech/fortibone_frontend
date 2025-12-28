import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { StockCard } from "@/components/accueil/StockCard";
import { useLocalSearchParams } from "expo-router";
import { getSales, SalesResponse } from "@/api/analytics";
import { formatMoney } from "@/utils/formatMoney";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

const Header: React.FC = () => (
  <View style={styles.header}>
    <BackButtonAdmin />
    <Text style={styles.headerTitle}>Statistiques des Ventes</Text>
    <View style={styles.placeholder} />
  </View>
);

const StockTrackingScreen: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<SalesResponse | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"products" | "categories" | null>(
    null
  );

  const openModal = (type: "products" | "categories") => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getSales(id);
      if (business) {
        const currSymbol = await getCurrencySymbolById(business.currencyId);
        setSymbol(currSymbol);
      }
      setData(result);
    } catch (err) {
      console.error("❌ Erreur fetch sales:", err);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Calculs agrégés (correction importante)
  const totalRevenue =
    data?.salesByPeriod.reduce((sum, p) => sum + p.totalAmount, 0) ?? 0;
  const totalItemsSold =
    data?.salesByPeriod.reduce((sum, p) => sum + p.totalItems, 0) ?? 0;

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
      title: "Montant total des ventes",
      value: `${formatMoney(totalRevenue)} ${symbol || ""}`,
      icon: "dollar-sign" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
    },
    {
      title: "Articles vendus",
      value: totalItemsSold,
      icon: "shopping-cart" as keyof typeof Feather.glyphMap,
      iconColor: "#3B82F6",
      iconBgColor: "#DBEAFE",
      onPress: () => openModal("products"),
    },
    {
      title: "Revenu par catégorie",
      value: `${formatMoney(
        data.salesByProductCategory.reduce((sum, c) => sum + c.totalRevenue, 0)
      )} ${symbol || ""}`,
      icon: "layers" as keyof typeof Feather.glyphMap,
      iconColor: "#F59E0B",
      iconBgColor: "#FEF3C7",
      onPress: () => openModal("categories"),
    },
    {
      title: "Produits vendus (catégories)",
      value: data.salesByProductCategory.reduce(
        (sum, c) => sum + c.totalItemsSold,
        0
      ),
      icon: "tag" as keyof typeof Feather.glyphMap,
      iconColor: "#8B5CF6",
      iconBgColor: "#EDE9FE",
      onPress: () => openModal("products"),
    },
    {
      title: "Top produit vendu (quantité)",
      value: data.topSellingProducts?.[0]?.totalQuantitySold ?? 0,
      icon: "package" as keyof typeof Feather.glyphMap,
      iconColor: "#F97316",
      iconBgColor: "#FFEDD5",
      onPress: () => openModal("products"),
    },
    {
      title: "Top produit revenu",
      value: `${formatMoney(data.topSellingProducts?.[0]?.totalRevenue ?? 0)} ${
        symbol || ""
      }`,
      icon: "trending-up" as keyof typeof Feather.glyphMap,
      iconColor: "#06B6D4",
      iconBgColor: "#CFFAFE",
      onPress: () => openModal("products"),
    },
    {
      title: "Pourcentage du top produit",
      value: `${data.topSellingProducts?.[0]?.revenuePercentage ?? 0}%`,
      icon: "percent" as keyof typeof Feather.glyphMap,
      iconColor: "#84CC16",
      iconBgColor: "#ECFCCB",
    },
  ];

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.modalItem}>
      <Image
        source={{ uri: item.variantImageUrl }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productSku}>SKU: {item.sku}</Text>
        <Text>Quantité: {item.totalQuantitySold}</Text>
        <Text>
          Revenu: {formatMoney(item.totalRevenue)} {symbol}
        </Text>
        {item.revenuePercentage && (
          <Text>{item.revenuePercentage.toFixed(1)}% du CA</Text>
        )}
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <View style={styles.modalItem}>
      <View style={styles.categoryIcon}>
        <Feather name="folder" size={30} color="#6B7280" />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.categoryName}</Text>
        <Text>Articles vendus: {item.totalItemsSold}</Text>
        <Text>
          Revenu: {formatMoney(item.totalRevenue)} {symbol}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
              onPress={item.onPress}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modal natif style bottom sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          {/* Petite barre indicative */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === "products"
                ? "Top Produits Vendus"
                : "Revenu par Catégorie"}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={
              modalType === "products"
                ? data.topSellingProducts
                : data.salesByProductCategory
            }
            renderItem={
              modalType === "products" ? renderProductItem : renderCategoryItem
            }
            keyExtractor={(item) =>
              modalType === "products" ? item.variantId : item.categoryId
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
          />
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80%", // occupe 80% de l'écran
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    alignSelf: "center",
    marginTop: 12,
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalItem: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  productSku: {
    fontSize: 14,
    color: "#6B7280",
    marginVertical: 4,
  },
});

export default StockTrackingScreen;
