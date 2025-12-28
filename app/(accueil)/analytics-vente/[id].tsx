import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import BackButtonAdmin from "@/components/Admin/BackButton";
import { StockCard } from "@/components/accueil/StockCard";
import { useLocalSearchParams } from "expo-router";
import { AnalyticsOverview, getAnalyticsOverview } from "@/api/analytics";
import { formatMoney } from "@/utils/formatMoney";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

const { height: screenHeight } = Dimensions.get("window");

const Header: React.FC = () => (
  <View style={styles.header}>
    <BackButtonAdmin />
    <Text style={styles.headerTitle}>Vue d&#39;ensemble</Text>
    <View style={styles.placeholder} />
  </View>
);

const AnalyticsOverviewScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const business = useBusinessStore((state) => state.business);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalyticsOverview(id as string);
      if (business?.currencyId) {
        const currencySymbol = await getCurrencySymbolById(business.currencyId);
        setSymbol(currencySymbol);
      }
      setData(result);
    } catch (err) {
      console.error("Erreur fetch overview:", err);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openModal = useCallback((title: string, description: string) => {
    setModalContent({ title, description });
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setModalContent(null);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Feather name="alert-triangle" size={64} color="#F87171" />
        <Text style={styles.errorText}>
          {error || "Aucune donnée trouvée."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const overviewData = [
    {
      title: "Total des ventes",
      value: `${formatMoney(data.totalSalesAmount)} ${symbol || ""}`,
      icon: "dollar-sign" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
    },
    {
      title: "Commandes totales",
      value: data.totalSalesOrders.toLocaleString(),
      icon: "shopping-cart" as keyof typeof Feather.glyphMap,
      iconColor: "#10B981",
      iconBgColor: "#D1FAE5",
    },
    {
      title: "Panier moyen",
      value: `${formatMoney(data.averageOrderValue)} ${symbol || ""}`,
      icon: "trending-up" as keyof typeof Feather.glyphMap,
      iconColor: "#3B82F6",
      iconBgColor: "#DBEAFE",
    },
    {
      title: "Produits vendus",
      value: data.totalProductsSold.toLocaleString(),
      icon: "package" as keyof typeof Feather.glyphMap,
      iconColor: "#F59E0B",
      iconBgColor: "#FEF3C7",
    },
    {
      title: "Total des achats",
      value: `${formatMoney(data.totalPurchaseAmount)} ${symbol || ""}`,
      icon: "credit-card" as keyof typeof Feather.glyphMap,
      iconColor: "#EF4444",
      iconBgColor: "#FEE2E2",
    },
    {
      title: "Commandes d'achat",
      value: data.totalPurchaseOrders.toLocaleString(),
      icon: "shopping-bag" as keyof typeof Feather.glyphMap,
      iconColor: "#8B5CF6",
      iconBgColor: "#EDE9FE",
    },
    {
      title: "Valeur du stock",
      value: `${formatMoney(data.currentInventoryValue)} ${symbol || ""}`,
      icon: "archive" as keyof typeof Feather.glyphMap,
      iconColor: "#F97316",
      iconBgColor: "#FFEDD5",
      onPress: () =>
        openModal(
          "Valeur de l'inventaire",
          "Ceci représente la valeur totale estimée de tous les produits actuellement en stock dans votre entreprise."
        ),
    },
    {
      title: "Membres de l'équipe",
      value: data.totalMembers,
      icon: "users" as keyof typeof Feather.glyphMap,
      iconColor: "#06B6D4",
      iconBgColor: "#CFFAFE",
      onPress: () =>
        openModal(
          "Membres de l'équipe",
          `${data.totalMembers} personne${data.totalMembers > 1 ? "s" : ""} ${
            data.totalMembers > 1 ? "ont" : "a"
          } accès à cette entreprise (propriétaire et administrateurs inclus).`
        ),
    },
    {
      title: "Clients uniques",
      value: data.uniqueCustomers.toLocaleString(),
      icon: "user-check" as keyof typeof Feather.glyphMap,
      iconColor: "#84CC16",
      iconBgColor: "#ECFCCB",
      onPress: () =>
        openModal(
          "Clients uniques",
          `${data.uniqueCustomers} client${
            data.uniqueCustomers > 1 ? "s" : ""
          } différent${data.uniqueCustomers > 1 ? "s" : ""} ${
            data.uniqueCustomers > 1 ? "ont" : "a"
          } passé au moins une commande sur cette période.`
        ),
    },
    {
      title: "Note moyenne",
      value: `${data.averageBusinessRating.toFixed(1)} ⭐`,
      icon: "star" as keyof typeof Feather.glyphMap,
      iconColor: "#FACC15",
      iconBgColor: "#FEF9C3",
      onPress: () =>
        openModal(
          "Évaluation de l'entreprise",
          `Note moyenne : ${data.averageBusinessRating.toFixed(
            1
          )} / 5\nBasée sur ${data.totalBusinessReviews} avis clients`
        ),
    },
    {
      title: "Total des avis",
      value: data.totalBusinessReviews.toLocaleString(),
      icon: "message-circle" as keyof typeof Feather.glyphMap,
      iconColor: "#6366F1",
      iconBgColor: "#E0E7FF",
      onPress: () =>
        openModal(
          "Évaluation de l'entreprise",
          `Note moyenne : ${data.averageBusinessRating.toFixed(
            1
          )} / 5\nBasée sur ${data.totalBusinessReviews} avis clients`
        ),
    },
  ];

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {overviewData.map((item, index) => (
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

      {/* Modal explicative */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalContent?.title}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.dragIndicator} />
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                {modalContent?.description}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
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
    marginTop: 12,
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginHorizontal: 32,
    marginBottom: 20,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.6,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  dragIndicator: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    textAlign: "center",
  },
  modalCloseButton: {
    marginTop: 24,
    alignSelf: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AnalyticsOverviewScreen;
