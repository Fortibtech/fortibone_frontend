"use client";

import {
  type Business,
  BusinessesService,
  SelectedBusinessManager,
} from "@/api";
import {
  type AnalyticsOverview,
  getAnalyticsOverview,
  getInventory,
  getOrders,
  getPendingOrdersCount,
  getSales,
  type InventoryResponse,
  type OrdersResponse,
  type SalesResponse,
} from "@/api/analytics";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import { type Route, router } from "expo-router";
import type React from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type PeriodUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";
type AnalyticsRoutes =
  | "/(accueil)/analytics-vente/[id]"
  | "/(accueil)/analytics-achats/[id]"
  | "/(accueil)/analytics-stocks/[id]";
interface PeriodSelection {
  unit: PeriodUnit;
  year: number;
  month?: number; // Pour MONTH et DAY
  label: string;
}

const HomePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ État dynamique pour la période des top produits
  const [topProductsPeriod, setTopProductsPeriod] = useState<PeriodSelection>({
    unit: "MONTH",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    label: getMonthName(new Date().getMonth()),
  });
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // ✅ États pour les analytics
  const [monthlyOverview, setMonthlyOverview] =
    useState<AnalyticsOverview | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryResponse | null>(
    null
  );
  const [salesData30Days, setSalesData30Days] = useState<SalesResponse | null>(
    null
  );
  const [topProductsData, setTopProductsData] = useState<SalesResponse | null>(
    null
  );
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<OrdersResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [topProductsLoading, setTopProductsLoading] = useState(false);
  const user = useUserStore.getState().userProfile;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      loadAnalytics();
    }
  }, [selectedBusiness]);

  // ✅ Recharger les top produits quand la période change
  useEffect(() => {
    if (selectedBusiness && topProductsPeriod) {
      loadTopProducts();
    }
  }, [topProductsPeriod, selectedBusiness]);

  // ✅ Fonction utilitaire pour obtenir le nom du mois
  function getMonthName(monthIndex: number): string {
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return months[monthIndex];
  }

  // ✅ Fonction pour obtenir les dates selon la période sélectionnée
  const getPeriodDates = (
    period: PeriodSelection
  ): { startDate: string; endDate: string } => {
    const { unit, year, month } = period;

    if (unit === "YEAR") {
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      };
    }

    if (unit === "MONTH" && month) {
      const lastDay = new Date(year, month, 0).getDate();
      return {
        startDate: `${year}-${String(month).padStart(2, "0")}-01`,
        endDate: `${year}-${String(month).padStart(2, "0")}-${String(
          lastDay
        ).padStart(2, "0")}`,
      };
    }

    // Par défaut, retourner le mois en cours
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    return {
      startDate: `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
      endDate: `${currentYear}-${String(currentMonth).padStart(
        2,
        "0"
      )}-${String(lastDay).padStart(2, "0")}`,
    };
  };

  // ✅ Fonction pour obtenir les dates du mois en cours
  const getCurrentMonthDates = (): { startDate: string; endDate: string } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    return { startDate, endDate };
  };

  const getLast30DaysDates = (): { startDate: string; endDate: string } => {
    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    const startDate = start.toISOString().split("T")[0];
    return { startDate, endDate };
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const businessesResponse = await BusinessesService.getBusinesses();

      setBusinesses(businessesResponse);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected);
      if (selected?.type !== "FOURNISSEUR") {
        router.push("/(professionnel)");
      }
      if (selected && !businessesResponse.find((b) => b.id === selected.id)) {
        await BusinessesService.clearSelectedBusiness();
        setSelectedBusiness(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour charger les analytics (sans top produits)
  const loadAnalytics = async () => {
    if (!selectedBusiness) return;

    try {
      setAnalyticsLoading(true);

      const { startDate: monthStart, endDate: monthEnd } =
        getCurrentMonthDates();
      const { startDate: days30Start, endDate: days30End } =
        getLast30DaysDates();

      // Charger toutes les données en parallèle (sauf top produits)
      const [
        monthlyData,
        inventoryResponse,
        sales30Days,
        pendingCount,
        ordersResponse,
      ] = await Promise.all([
        getAnalyticsOverview(selectedBusiness.id, monthStart, monthEnd),
        getInventory(selectedBusiness.id),
        getSales(selectedBusiness.id, {
          startDate: days30Start,
          endDate: days30End,
          unit: "DAY",
        }),
        getPendingOrdersCount(selectedBusiness.id, "SALE"),
        getOrders(selectedBusiness.id, {
          limit: 4,
          page: 1,
        }),
      ]);

      setMonthlyOverview(monthlyData);
      setInventoryData(inventoryResponse);
      setSalesData30Days(sales30Days);
      setPendingOrdersCount(pendingCount);
      setRecentOrders(ordersResponse);
    } catch (error) {
      console.error("Erreur lors du chargement des analytics:", error);
      Alert.alert("Erreur", "Impossible de charger les statistiques");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ✅ Fonction séparée pour charger les top produits
  const loadTopProducts = async () => {
    if (!selectedBusiness) return;

    try {
      setTopProductsLoading(true);

      const { startDate, endDate } = getPeriodDates(topProductsPeriod);

      const topProducts = await getSales(selectedBusiness.id, {
        startDate,
        endDate,
        unit: topProductsPeriod.unit,
      });

      setTopProductsData(topProducts);
    } catch (error) {
      console.error("Erreur lors du chargement des top produits:", error);
      Alert.alert("Erreur", "Impossible de charger les top produits");
    } finally {
      setTopProductsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (selectedBusiness) {
      await loadAnalytics();
      await loadTopProducts();
    }
    setRefreshing(false);
  };

  const handleBusinessSelect = async (business: Business) => {
    try {
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
      Alert.alert("Succès", `Entreprise "${business.name}" sélectionnée`);
      if (business.type !== "FOURNISSEUR") {
        router.push("/(professionnel)");
      }
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'entreprise");
    }
  };

  // ✅ Fonction utilitaire pour formater les nombres
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000) {
      return `${Math.round(num / 1000)}k`;
    }
    return formatNumber(num);
  };

  // ✅ Calculer le nombre total d'alertes
  const getTotalAlertsCount = (): number => {
    if (!inventoryData) return 0;
    return (
      inventoryData.productsLowStock.length +
      inventoryData.expiringProducts.length
    );
  };

  // ✅ Fonction pour changer de mois
  const handleMonthChange = (direction: "prev" | "next") => {
    const currentMonth = topProductsPeriod.month || new Date().getMonth() + 1;
    const currentYear = topProductsPeriod.year;

    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === "prev") {
      newMonth = currentMonth - 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear = currentYear - 1;
      }
    } else {
      newMonth = currentMonth + 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear = currentYear + 1;
      }
    }

    setTopProductsPeriod({
      unit: "MONTH",
      year: newYear,
      month: newMonth,
      label: getMonthName(newMonth - 1),
    });
  };

  // ✅ Fonction pour changer d'unité de période
  const handleUnitChange = (unit: PeriodUnit) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let label = "";
    if (unit === "YEAR") {
      label = `${currentYear}`;
    } else if (unit === "MONTH") {
      label = getMonthName(currentMonth - 1);
    } else if (unit === "WEEK") {
      label = "Semaine";
    } else {
      label = "Jour";
    }

    setTopProductsPeriod({
      unit,
      year: currentYear,
      month: unit === "MONTH" ? currentMonth : undefined,
      label,
    });
    setShowPeriodModal(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <BusinessSelector
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/(create-business)/")}
        onManageBusiness={() => router.push("/pro/ManageBusinessesScreen")}
      />

      <View style={styles.headerRight}>
      
        <TouchableOpacity style={styles.iconButton}>
          {getTotalAlertsCount() > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{getTotalAlertsCount()}</Text>
            </View>
          )}
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push("/fournisseurSetting")}
        >
          <Image
            source={
              user?.profileImageUrl
                ? { uri: user.profileImageUrl }
                : require("@/assets/images/icon.png")
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotif = () => {
    if (!inventoryData) return null;

    if (inventoryData.expiringProducts.length > 0) {
      const firstExpiringProduct = inventoryData.expiringProducts[0];
      const expirationDate = new Date(firstExpiringProduct.expirationDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return (
        <View style={styles.section}>
          <View
            style={[
              styles.alertCard,
              {
                backgroundColor: "#FEE2E2",
                borderColor: "#EF4444",
              },
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={[styles.alertText, { color: "#F50B0BFF" }]}>
                `{firstExpiringProduct.productName}` expire dans{" "}
                {daysUntilExpiry} jour{daysUntilExpiry > 1 ? "s" : ""} (
                {firstExpiringProduct.quantity} unités)
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (inventoryData.productsLowStock.length > 0) {
      const firstLowStockProduct = inventoryData.productsLowStock[0];

      return (
        <View style={styles.section}>
          <View
            style={[
              styles.alertCard,
              {
                backgroundColor: "#FEF3C7",
                borderColor: "#FBBF24",
              },
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons name="warning" size={20} color="#FBBF24" />
              <Text style={[styles.alertText, { color: "#FFB700FF" }]}>
                Stock faible sur `{firstLowStockProduct.productName}` (
                {firstLowStockProduct.quantityInStock} unités)
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderAlerts = () => {
    if (!inventoryData) return null;

    const alerts = [];

    if (inventoryData.expiringProducts.length > 0) {
      const expiringCount = inventoryData.expiringProducts.length;
      const totalExpiringQuantity = inventoryData.expiringProducts.reduce(
        (sum, product) => sum + product.quantity,
        0
      );

      alerts.push({
        id: 1,
        type: "error",
        message: `${expiringCount} produit${
          expiringCount > 1 ? "s" : ""
        } expire${
          expiringCount > 1 ? "nt" : ""
        } bientôt (${totalExpiringQuantity} unités)`,
        color: "#FEE2E2",
        borderColor: "#EF4444",
        alertTextColor: "#F50B0BFF",
        icon: "alert-circle",
      });
    }

    if (inventoryData.productsLowStock.length > 0) {
      alerts.push({
        id: 2,
        type: "warning",
        message: `${inventoryData.productsLowStock.length} produit${
          inventoryData.productsLowStock.length > 1 ? "s" : ""
        } en stock faible`,
        color: "#FEF3C7",
        borderColor: "#FBBF24",
        alertTextColor: "#FFB700FF",
        icon: "warning",
      });
    }

    if (alerts.length === 0) return null;

    return (
      <View style={styles.sectionAlerts}>
        <View style={styles.sectionViewTitle}>
          <Text style={styles.sectionTitle}>Alertes Prioritaires</Text>
        </View>
        {alerts.map((alert) => (
          <View
            key={alert.id}
            style={[
              styles.alertCard,
              {
                backgroundColor: alert.color,
                borderColor: alert.borderColor,
              },
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons
                name={alert.icon as any}
                size={20}
                color={alert.borderColor}
              />
              <Text style={[styles.alertText, { color: alert.alertTextColor }]}>
                {alert.message}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderQuickSummary = () => {
    if (analyticsLoading) {
      return (
        <View style={styles.section}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionViewTitle}>
          <Text style={styles.sectionTitle}>Résumé Rapide</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#FBBF24" }]}>
              {monthlyOverview
                ? formatCurrency(monthlyOverview.totalSalesAmount)
                : "--"}
            </Text>
            <Text style={styles.summaryLabel}>CA du mois</Text>
          </View>
          <View style={styles.summaryCardCA}>
            <Text style={[styles.summaryValue, { color: "#8B5CF6" }]}>
              {pendingOrdersCount}
            </Text>
            <Text style={styles.summaryLabel}>Commandes en attente</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#EC4899" }]}>
              {inventoryData ? inventoryData.productsLowStock.length : 0}
            </Text>
            <Text style={styles.summaryLabel}>Stocks faibles</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.analyticsButton}
          onPress={() =>
            selectedBusiness &&
            router.push(`(analytics)?id=${selectedBusiness.id}` as Route)
          }
        >
          <Image
            source={require("@/assets/images/Analytiques.png")}
            style={styles.avatarAnalytic}
          />
          <Text style={styles.analyticsButtonText}>Analytics Avancées</Text>
          <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatistics = () => {
    const stats = [
      {
        id: 1,
        bussinesId: businesses[0].id,
        label: "Ventes",
        icon: "cash",
        route: "/(accueil)/analytics-vente/[id]" as const,
      },
      {
        id: 2,
        bussinesId: businesses[0].id,
        label: "Achats",
        icon: "cart",
        route: "/(accueil)/analytics-achats/[id]" as const,
      },
      {
        id: 3,
        bussinesId: businesses[0].id,
        label: "Stock",
        icon: "cube",
        route: "/(accueil)/analytics-stocks/[id]" as const,
      },
    ] as const;
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", businesses[0].id);
    return (
      <View style={styles.section}>
        <View style={styles.sectionViewTitle}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
        </View>
        <View style={styles.statisticsRow}>
          {stats.map((stat) => (
            <TouchableOpacity
              key={stat.id}
              style={styles.statisticsCard}
              onPress={() =>
                router.push({
                  pathname: stat.route satisfies AnalyticsRoutes,
                  params: { id: String(stat.bussinesId) },
                })
              }
            >
              <View>
                <View style={styles.statisticsIconContainer}>
                  <Ionicons name={stat.icon as any} size={28} color="#1BB874" />
                </View>

                <View style={styles.statisticsContent}>
                  <Text style={styles.statisticsLabel}>{stat.label}</Text>
                  <Ionicons name="chevron-forward" size={12} color="#1BB874" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSalesChart = () => {
    if (!salesData30Days || salesData30Days.salesByPeriod.length === 0) {
      return null;
    }

    const salesByPeriod = salesData30Days.salesByPeriod;
    const maxValue = Math.max(...salesByPeriod.map((d) => d.totalAmount));
    const last7Days = salesByPeriod.slice(-7);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CA des 30 derniers jours</Text>
        <View style={styles.chartContainer}>
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisLabel}>{formatCurrency(maxValue)}</Text>
            <Text style={styles.yAxisLabel}>
              {formatCurrency(maxValue * 0.8)}
            </Text>
            <Text style={styles.yAxisLabel}>
              {formatCurrency(maxValue * 0.6)}
            </Text>
            <Text style={styles.yAxisLabel}>
              {formatCurrency(maxValue * 0.4)}
            </Text>
            <Text style={styles.yAxisLabel}>
              {formatCurrency(maxValue * 0.2)}
            </Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
          <View style={styles.chartBars}>
            {last7Days.map((data, index) => {
              const height = (data.totalAmount / maxValue) * 160;
              const day = new Date(data.period).getDate();
              const isToday = index === last7Days.length - 1;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: height,
                          backgroundColor: isToday ? "#10B981" : "#EC4899",
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.barLabel, isToday && styles.barLabelActive]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // ✅ Modal pour sélectionner le type de période
  const renderPeriodModal = () => (
    <Modal
      visible={showPeriodModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPeriodModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPeriodModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sélectionner une période</Text>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleUnitChange("DAY")}
          >
            <Text style={styles.modalOptionText}>Jour</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleUnitChange("WEEK")}
          >
            <Text style={styles.modalOptionText}>Semaine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleUnitChange("MONTH")}
          >
            <Text style={styles.modalOptionText}>Mois</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleUnitChange("YEAR")}
          >
            <Text style={styles.modalOptionText}>Année</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowPeriodModal(false)}
          >
            <Text style={styles.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ✅ Top produits avec sélecteur de période dynamique
  const renderTopProducts = () => {
    if (topProductsLoading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Produits par volume</Text>
          <View style={styles.donutChartContainer}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        </View>
      );
    }

    if (!topProductsData || topProductsData.topSellingProducts.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Produits par volume</Text>
          <View style={styles.donutChartContainer}>
            <Text style={styles.noDataText}>
              Aucune donnée disponible pour cette période
            </Text>
          </View>
        </View>
      );
    }

    const topProducts = topProductsData.topSellingProducts.slice(0, 5);
    const totalQuantity = topProducts.reduce(
      (sum, p) => sum + p.totalQuantitySold,
      0
    );

    const size = 240;
    const strokeWidth = 45;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const outerRadius = radius + strokeWidth / 2;
    const innerRadius = radius - strokeWidth / 2;
    const gapAngle = 2;

    const colors = ["#F97316", "#10B981", "#7C3AED", "#C026D3", "#FBBF24"];

    let cumulativeAngle = 0;
    const segments = topProducts.map((product, index) => {
      const percentage =
        product.revenuePercentage ||
        (product.totalRevenue /
          topProducts.reduce((sum, p) => sum + p.totalRevenue, 0)) *
          100;
      const segmentAngle = (percentage / 100) * 360;
      const startAngle = cumulativeAngle + gapAngle / 2;
      const endAngle = cumulativeAngle + segmentAngle - gapAngle / 2;
      const middleAngle = (startAngle + endAngle) / 2;

      cumulativeAngle += segmentAngle;

      return {
        ...product,
        percentage: Math.round(percentage),
        color: colors[index],
        startAngle,
        endAngle,
        middleAngle,
        segmentAngle,
      };
    });

    const polarToCartesian = (
      centerX: number,
      centerY: number,
      radius: number,
      angleInDegrees: number
    ) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const describeArc = (startAngle: number, endAngle: number) => {
      const outerStart = polarToCartesian(
        center,
        center,
        outerRadius,
        endAngle
      );
      const outerEnd = polarToCartesian(
        center,
        center,
        outerRadius,
        startAngle
      );
      const innerStart = polarToCartesian(
        center,
        center,
        innerRadius,
        endAngle
      );
      const innerEnd = polarToCartesian(
        center,
        center,
        innerRadius,
        startAngle
      );

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      const pathData = [
        "M",
        outerStart.x,
        outerStart.y,
        "A",
        outerRadius,
        outerRadius,
        0,
        largeArcFlag,
        0,
        outerEnd.x,
        outerEnd.y,
        "L",
        innerEnd.x,
        innerEnd.y,
        "A",
        innerRadius,
        innerRadius,
        0,
        largeArcFlag,
        1,
        innerStart.x,
        innerStart.y,
        "Z",
      ].join(" ");

      return pathData;
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 Produits par volume</Text>

        {/* ✅ Sélecteur de période dynamique */}
        <View style={styles.periodSelector}>
          {/* Bouton mois précédent (seulement pour MONTH) */}
          {topProductsPeriod.unit === "MONTH" && (
            <TouchableOpacity
              style={styles.periodNavigationButton}
              onPress={() => handleMonthChange("prev")}
            >
              <Ionicons name="chevron-back" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Affichage de la période actuelle */}
          <TouchableOpacity
            style={[styles.periodButton, styles.periodButtonActive]}
          >
            <Text
              style={[styles.periodButtonText, styles.periodButtonTextActive]}
            >
              {topProductsPeriod.label}
            </Text>
          </TouchableOpacity>

          {/* Bouton mois suivant (seulement pour MONTH) */}
          {topProductsPeriod.unit === "MONTH" && (
            <TouchableOpacity
              style={styles.periodNavigationButton}
              onPress={() => handleMonthChange("next")}
            >
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Sélecteur de type de période */}
          <TouchableOpacity
            style={[styles.periodButton, styles.periodButtonInactive]}
            onPress={() => setShowPeriodModal(true)}
          >
            <Text style={styles.periodButtonText}>
              {topProductsPeriod.unit === "DAY" && "Jour"}
              {topProductsPeriod.unit === "WEEK" && "Semaine"}
              {topProductsPeriod.unit === "MONTH" && "Mensuel"}
              {topProductsPeriod.unit === "YEAR" && "Annuel"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.donutChartContainer}>
          <View style={styles.donutChartWrapper}>
            <Svg width={size} height={size}>
              {segments.map((segment, index) => {
                const pathData = describeArc(
                  segment.startAngle,
                  segment.endAngle
                );
                const labelRadius = radius;
                const labelPos = polarToCartesian(
                  center,
                  center,
                  labelRadius,
                  segment.middleAngle
                );

                return (
                  <G key={index}>
                    <Path d={pathData} fill={segment.color} />
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y}
                      fontSize="16"
                      fontWeight="700"
                      fill="#FFFFFF"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {segment.percentage}%
                    </SvgText>
                  </G>
                );
              })}
            </Svg>

            <View style={styles.donutCenter}>
              <Text style={styles.donutCenterValue}>{totalQuantity}</Text>
              <Text style={styles.donutCenterLabel}>Unités</Text>
            </View>
          </View>

          <View style={styles.productLegend}>
            <View style={styles.legendRow}>
              {segments.slice(0, 3).map((product, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: product.color },
                    ]}
                  />
                  <Text style={styles.legendText} numberOfLines={1}>
                    {product.productName}
                  </Text>
                </View>
              ))}
            </View>
            {segments.length > 3 && (
              <View style={styles.legendRow}>
                {segments.slice(3).map((product, index) => (
                  <View key={index + 3} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: product.color },
                      ]}
                    />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {product.productName}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderRecentOrders = () => {
    if (!recentOrders || recentOrders.data.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionViewTitle}>
          <Text style={styles.sectionTitle}>Commandes Récentes</Text>
        </View>
        <View style={styles.ordersTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>#</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Client</Text>
            <Text
              style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}
            >
              Total
            </Text>
          </View>
          {recentOrders.data.map((order, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {order.orderNumber}
              </Text>
              <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                {order.customer
                  ? `${order.customer.firstName} ${order.customer.lastName}`
                  : "Client inconnu"}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => {
            router.push("/commandes");
          }}
        >
          <Text style={styles.viewAllButtonText}>
            Voir toutes les commandes
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderNoBusinessSelected = () => (
    <View style={styles.noBusinessContainer}>
      <Ionicons name="business-outline" size={80} color="#E0E0E0" />
      <Text style={styles.noBusinessTitle}>Aucune entreprise sélectionnée</Text>
      <Text style={styles.noBusinessText}>
        Sélectionnez une entreprise pour voir vos statistiques
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
          />
        }
      >
        {selectedBusiness ? (
          <>
            {renderNotif()}
            {renderQuickSummary()}
            {renderStatistics()}
            {renderRecentOrders()}
            {renderAlerts()}
            {renderSalesChart()}
            {renderTopProducts()}
          </>
        ) : (
          renderNoBusinessSelected()
        )}
      </ScrollView>
      {renderPeriodModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  statisticsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statisticsCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statisticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  statisticsContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 26,
  },
  statisticsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionAlerts: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    padding: 10,
    borderRadius: 25,
  },
  sectionViewTitle: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  alertText: {
    fontSize: 13,
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 16,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  summaryCardCA: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    borderColor: "#D8D8D8FF",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    backgroundColor: "#FFFFFF",
    borderColor: "#D8D8D8FF",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  analyticsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DAD6D6FF",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarAnalytic: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  analyticsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  chartContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  yAxisLabels: {
    justifyContent: "space-between",
    paddingRight: 8,
    paddingVertical: 4,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  chartBars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 160,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: 24,
    borderRadius: 4,
    position: "relative",
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    color: "#9CA3AF",
  },
  barLabelActive: {
    color: "#10B981",
    fontWeight: "600",
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodNavigationButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    gap: 4,
  },
  periodButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#10B981",
  },
  periodButtonInactive: {
    backgroundColor: "#F3F4F6",
    borderColor: "#F3F4F6",
  },
  periodButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  modalCancelButton: {
    marginTop: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  donutChartContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  donutChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  donutCenter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  donutCenterValue: {
    fontSize: 40,
    fontWeight: "700",
    color: "#000",
  },
  donutCenterLabel: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 4,
  },
  productLegend: {
    gap: 16,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  noDataText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 40,
  },
  ordersTable: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableCell: {
    fontSize: 14,
    color: "#374151",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 4,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  noBusinessContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noBusinessTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  noBusinessText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HomePage;
