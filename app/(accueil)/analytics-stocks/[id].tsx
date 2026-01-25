import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { StockCard } from "@/components/accueil/StockCard";
import { useLocalSearchParams } from "expo-router";
import {
  getInventory,
  InventoryResponse,
  ProductLowStock,
  ExpiringProduct,
  LossByMovementType,
} from "@/api/analytics";
import { formatMoney } from "@/utils/formatMoney";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

const { height: screenHeight } = Dimensions.get("window");

const Header: React.FC = () => (
  <View style={styles.header}>
    <BackButtonAdmin />
    <Text style={styles.headerTitle}>Suivi de l&apos;Inventaire</Text>
    <View style={styles.placeholder} />
  </View>
);

const InventoryAnalyticsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const business = useBusinessStore((state) => state.business);
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"lowStock" | "expiring" | "losses" | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getInventory(id as string);
      if (business?.currencyId) {
        const currencySymbol = await getCurrencySymbolById(business.currencyId);
        setSymbol(currencySymbol);
      }
      setData(result);
    } catch (err) {
      console.error("Erreur fetch inventory analytics:", err);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openModal = useCallback((type: "lowStock" | "expiring" | "losses") => {
    setModalType(type);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setModalType(null);
  }, []);

  // Format date d'expiration
  const formatExpirationDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 3600 * 24));

    const formatted = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if (diffDays < 0) return `Expiré depuis ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? "s" : ""}`;
    if (diffDays === 0) return "Expire aujourd'hui !";
    if (diffDays <= 7) return `Expire dans ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    return `Expire le ${formatted}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement de l&apos;inventaire...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Feather name="alert-triangle" size={64} color="#F87171" />
        <Text style={styles.errorText}>{error || "Aucune donnée trouvée."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cards = [
    {
      title: "Valeur du stock",
      value: `${formatMoney(data.currentInventoryValue)} ${symbol || ""}`,
      icon: "dollar-sign" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
    },
    {
      title: "Unités en stock",
      value: data.totalUnitsInStock.toLocaleString(),
      icon: "package" as keyof typeof Feather.glyphMap,
      iconColor: "#F59E0B",
      iconBgColor: "#FEF3C7",
    },
    {
      title: "Produits en alerte stock",
      value: data.productsLowStock.length,
      icon: "alert-triangle" as keyof typeof Feather.glyphMap,
      iconColor: "#EF4444",
      iconBgColor: "#FEE2E2",
      onPress: () => openModal("lowStock"),
    },
    {
      title: "Produits expirants",
      value: data.expiringProducts.length,
      icon: "clock" as keyof typeof Feather.glyphMap,
      iconColor: "#F97316",
      iconBgColor: "#FFEDD5",
      onPress: () => openModal("expiring"),
    },
    {
      title: "Types de pertes",
      value: data.lossesByMovementType.length,
      icon: "trending-down" as keyof typeof Feather.glyphMap,
      iconColor: "#8B5CF6",
      iconBgColor: "#EDE9FE",
      onPress: () => openModal("losses"),
    },
  ];

  // Render items pour modals
  const renderLowStockItem = ({ item }: { item: ProductLowStock }) => (
    <View style={styles.modalItem}>
      <View style={styles.alertIcon}>
        <Feather name="alert-triangle" size={32} color="#EF4444" />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemSku}>SKU: {item.sku}</Text>
        <Text style={styles.itemDetail}>
          Stock actuel : <Text style={styles.bold}>{item.quantityInStock}</Text> unités
        </Text>
        <Text style={styles.itemDetail}>
          Seuil alerte : <Text style={styles.bold}>{item.alertThreshold}</Text> unités
        </Text>
        <Text style={styles.urgencyText}>
          {item.quantityInStock === 0 ? "En rupture !" : "Réapprovisionner rapidement"}
        </Text>
      </View>
    </View>
  );

  const renderExpiringItem = ({ item }: { item: ExpiringProduct }) => (
    <View style={styles.modalItem}>
      <View style={styles.alertIcon}>
        <Feather name="clock" size={32} color="#F97316" />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemSku}>Lot : {item.batchId.slice(-8)}</Text>
        <Text style={styles.itemDetail}>
          Quantité : <Text style={styles.bold}>{item.quantity}</Text> unités
        </Text>
        <Text style={[styles.expirationText, styles.bold]}>
          {formatExpirationDate(item.expirationDate)}
        </Text>
      </View>
    </View>
  );

  const renderLossItem = ({ item }: { item: LossByMovementType }) => (
    <View style={styles.modalItem}>
      <View style={styles.lossIcon}>
        <Feather name="trending-down" size={32} color="#8B5CF6" />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.movementType}</Text>
        <Text style={styles.itemDetail}>
          Quantité perdue : <Text style={styles.bold}>{item.totalQuantity.toLocaleString()}</Text> unités
        </Text>
        <Text style={styles.itemDetail}>
          Valeur perdue : <Text style={styles.bold}>{formatMoney(item.totalValue)} {symbol}</Text>
        </Text>
      </View>
    </View>
  );

  const getModalTitle = () => {
    switch (modalType) {
      case "lowStock": return "Produits en alerte stock";
      case "expiring": return "Produits expirants bientôt";
      case "losses": return "Pertes par type de mouvement";
      default: return "";
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {cards.map((item, index) => (
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

      {/* Modal détails */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.dragIndicator} />

            <FlatList
              data={
                modalType === "lowStock"
                  ? data.productsLowStock
                  : modalType === "expiring"
                  ? data.expiringProducts
                  : data.lossesByMovementType
              }
              renderItem={
                modalType === "lowStock"
                  ? renderLowStockItem
                  : modalType === "expiring"
                  ? renderExpiringItem
                  : renderLossItem
              }
              keyExtractor={(item, index) =>
                modalType === "lowStock"
                  ? (item as ProductLowStock).variantId
                  : modalType === "expiring"
                  ? (item as ExpiringProduct).batchId
                  : index.toString()
              }
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="check-circle" size={48} color="#10B981" />
                  <Text style={styles.emptyText}>Aucune alerte pour le moment</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#4B5563", fontWeight: "500" },
  errorText: { fontSize: 16, color: "#DC2626", textAlign: "center", marginHorizontal: 32, marginBottom: 20 },
  retryButton: { backgroundColor: "#3B82F6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  placeholder: { width: 32 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#111827", flex: 1 },
  dragIndicator: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", marginVertical: 8 },
  modalList: { paddingHorizontal: 16, paddingBottom: 32 },

  modalItem: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lossIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemInfo: { flex: 1, justifyContent: "center" },
  itemName: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  itemSku: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  itemDetail: { fontSize: 14, color: "#374151", marginVertical: 2 },
  bold: { fontWeight: "700", color: "#111827" },
  urgencyText: { fontSize: 14, color: "#EF4444", fontWeight: "600", marginTop: 6 },
  expirationText: { fontSize: 15, fontWeight: "700", marginTop: 6 },

  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#10B981", marginTop: 12, fontWeight: "600" },
});

export default InventoryAnalyticsScreen;