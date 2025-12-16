// app/(fournisseur)/index.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

import { Business, BusinessesService } from "@/api";
import {
  AnalyticsOverview,
  getAnalyticsOverview,
  getInventory,
  getOrders,
  getPendingOrdersCount,
  getSales,
  InventoryResponse,
  OrdersResponse,
  SalesResponse,
} from "@/api/analytics";

import BusinessSelector from "@/components/Business/BusinessSelector";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { useBusinessStore } from "@/store/businessStore";
type PeriodUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

interface PeriodSelection {
  unit: PeriodUnit;
  year: number;
  month?: number;
  label: string;
}

const HomePage: React.FC = () => {
  const business = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);
  const redirectByBusinessType = (type: Business["type"]) => {
    const routes: Record<Business["type"], string> = {
      COMMERCANT: "/(professionnel)",
      RESTAURATEUR: "/(restaurants)",
      FOURNISSEUR: "/(fournisseur)",
      LIVREUR: "/(delivery)",
    };

    const target = routes[type];

    // Sécurité : on ne reste JAMAIS sur fournisseur si ce n'est pas FOURNISSEUR
    if (target && type !== "FOURNISSEUR") {
      router.replace(target);
    }
  };
  const { version } = useBusinessStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { uri } = useUserAvatar();

  const [topProductsPeriod, setTopProductsPeriod] = useState<PeriodSelection>({
    unit: "MONTH",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    label: getMonthName(new Date().getMonth()),
  });
  const [showPeriodModal, setShowPeriodModal] = useState(false);

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

  // ===================== UTILITAIRES =====================
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

  const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    return { startDate, endDate };
  };

  const getLast30DaysDates = () => {
    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    const startDate = start.toISOString().split("T")[0];
    return { startDate, endDate };
  };

  const getPeriodDates = (period: PeriodSelection) => {
    const { unit, year, month } = period;
    if (unit === "YEAR")
      return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
    if (unit === "MONTH" && month) {
      const lastDay = new Date(year, month, 0).getDate();
      return {
        startDate: `${year}-${String(month).padStart(2, "0")}-01`,
        endDate: `${year}-${String(month).padStart(2, "0")}-${String(
          lastDay
        ).padStart(2, "0")}`,
      };
    }
    return getCurrentMonthDates();
  };

  // ===================== CHARGEMENT =====================
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const all = await BusinessesService.getBusinesses();
      setBusinesses(all);

      // Cas 1 : une entreprise est déjà sélectionnée en store
      if (business) {
        if (business.type !== "FOURNISSEUR") {
          redirectByBusinessType(business.type);
          return;
        }
        return;
      }

      // Cas 2 : aucune entreprise sélectionnée
      if (all.length > 0) {
        const first = all.find((b) => b.type === "FOURNISSEUR") || all[0];
        await BusinessesService.selectBusiness(first);
        setBusiness(first);

        if (first.type !== "FOURNISSEUR") {
          redirectByBusinessType(first.type);
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les entreprises");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadInitialData();
  }, []);
  useEffect(() => {
    if (!business) return;

    if (business.type !== "FOURNISSEUR") {
      redirectByBusinessType(business.type);
    }
  }, [business?.id]);
  useFocusEffect(
    useCallback(() => {
      if (business?.id) {
        loadAnalytics();
        loadTopProducts();
      }
    }, [business?.id, topProductsPeriod])
  );

  const loadAnalytics = async () => {
    if (!business?.id) return;
    setAnalyticsLoading(true);
    try {
      const { startDate: monthStart, endDate: monthEnd } =
        getCurrentMonthDates();
      const { startDate: days30Start, endDate: days30End } =
        getLast30DaysDates();

      const [monthly, inventory, sales30, pending, orders] = await Promise.all([
        getAnalyticsOverview(business.id, monthStart, monthEnd),
        getInventory(business.id),
        getSales(business.id, {
          startDate: days30Start,
          endDate: days30End,
          unit: "DAY",
        }),
        getPendingOrdersCount(business.id, "SALE"),
        getOrders(business.id, { limit: 4, page: 1 }),
      ]);

      setMonthlyOverview(monthly);
      setInventoryData(inventory);
      setSalesData30Days(sales30);
      setPendingOrdersCount(pending);
      setRecentOrders(orders);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadTopProducts = async () => {
    if (!business?.id) return;
    setTopProductsLoading(true);
    try {
      const { startDate, endDate } = getPeriodDates(topProductsPeriod);
      const data = await getSales(business.id, {
        startDate,
        endDate,
        unit: topProductsPeriod.unit,
      });
      setTopProductsData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTopProductsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (business?.id) {
      await Promise.all([loadAnalytics(), loadTopProducts()]);
    }
    setRefreshing(false);
  };

  const handleBusinessSelect = async (selected: Business) => {
    try {
      await BusinessesService.selectBusiness(selected);
      setBusiness(selected);
      Alert.alert("Succès", `"${selected.name}" sélectionné`);

      redirectByBusinessType(selected.type);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de changer d'entreprise");
    }
  };
  const formatNumber = (num: number = 0) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(num);

  const formatCurrency = (num: number = 0) =>
    num >= 1000 ? `${Math.round(num / 1000)}k` : formatNumber(num);

  const getTotalAlertsCount = () =>
    inventoryData
      ? inventoryData.productsLowStock.length +
        inventoryData.expiringProducts.length
      : 0;

  const handleMonthChange = (direction: "prev" | "next") => {
    const currentMonth = topProductsPeriod.month || new Date().getMonth() + 1;
    const currentYear = topProductsPeriod.year;

    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === "prev") {
      newMonth = currentMonth - 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth = currentMonth + 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }

    setTopProductsPeriod({
      unit: "MONTH",
      year: newYear,
      month: newMonth,
      label: getMonthName(newMonth - 1),
    });
  };

  const handleUnitChange = (unit: PeriodUnit) => {
    const now = new Date();
    setTopProductsPeriod({
      unit,
      year: now.getFullYear(),
      month: unit === "MONTH" ? now.getMonth() + 1 : undefined,
      label:
        unit === "MONTH"
          ? getMonthName(now.getMonth())
          : unit === "YEAR"
          ? `${now.getFullYear()}`
          : unit,
    });
    setShowPeriodModal(false);
  };

  // ===================== TOUS LES RENDERS =====================
  const renderHeader = () => (
    <View style={styles.header}>
      <BusinessSelector
        businesses={businesses}
        selectedBusiness={business}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/(create-business)/")}
        onManageBusiness={() => router.push("/pro/ManageBusinessesScreen")}
        refreshKey={version}
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
            source={uri ? { uri } : require("@/assets/images/icon.png")}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotif = () => {
    if (!inventoryData) return null;

    if (inventoryData.expiringProducts.length > 0) {
      const p = inventoryData.expiringProducts[0];
      const days = Math.ceil(
        (new Date(p.expirationDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
      return (
        <View style={styles.section}>
          <View
            style={[
              styles.alertCard,
              { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={{ color: "#DC2626" }}>
                {p.productName} expire dans {days} jour{days > 1 ? "s" : ""} (
                {p.quantity} unités)
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
      const p = inventoryData.productsLowStock[0];
      return (
        <View style={styles.section}>
          <View
            style={[
              styles.alertCard,
              { backgroundColor: "#FEF3C7", borderColor: "#FBBF24" },
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons name="warning" size={20} color="#FBBF24" />
              <Text style={{ color: "#D97706" }}>
                Stock faible : {p.productName} ({p.quantityInStock} unités)
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
      alerts.push({
        id: 1,
        message: `${inventoryData.expiringProducts.length} produit${
          inventoryData.expiringProducts.length > 1 ? "s" : ""
        } expire${
          inventoryData.expiringProducts.length > 1 ? "nt" : ""
        } bientôt`,
        color: "#FEE2E2",
        borderColor: "#EF4444",
        textColor: "#DC2626",
        icon: "alert-circle",
      });
    }
    if (inventoryData.productsLowStock.length > 0) {
      alerts.push({
        id: 2,
        message: `${inventoryData.productsLowStock.length} produit${
          inventoryData.productsLowStock.length > 1 ? "s" : ""
        } en stock faible`,
        color: "#FEF3C7",
        borderColor: "#FBBF24",
        textColor: "#D97706",
        icon: "warning",
      });
    }

    if (alerts.length === 0) return null;

    return (
      <View style={styles.sectionAlerts}>
        <View style={styles.sectionViewTitle}>
          <Text style={styles.sectionTitle}>Alertes Prioritaires</Text>
        </View>
        {alerts.map((a) => (
          <View
            key={a.id}
            style={[
              styles.alertCard,
              { backgroundColor: a.color, borderColor: a.borderColor },
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons name={a.icon as any} size={20} color={a.borderColor} />
              <Text style={{ color: a.textColor }}>{a.message}</Text>
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
            business && router.push(`(analytics)?id=${business.id}`)
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
        label: "Ventes",
        icon: "cash",
        route: "/(accueil)/analytics-vente/[id]",
      },
      {
        label: "Achats",
        icon: "cart",
        route: "/(accueil)/analytics-achats/[id]",
      },
      {
        label: "Stock",
        icon: "cube",
        route: "/(accueil)/analytics-stocks/[id]",
      },
    ];

    return (
      <View style={styles.section}>
        <View style={styles.sectionViewTitle}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
        </View>
        <View style={styles.statisticsRow}>
          {stats.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.statisticsCard}
              onPress={() =>
                business &&
                router.push({ pathname: s.route, params: { id: business.id } })
              }
            >
              <View style={styles.statisticsIconContainer}>
                <Ionicons name={s.icon as any} size={28} color="#1BB874" />
              </View>
              <View style={styles.statisticsContent}>
                <Text style={styles.statisticsLabel}>{s.label}</Text>
                <Ionicons name="chevron-forward" size={12} color="#1BB874" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSalesChart = () => {
    if (!salesData30Days || salesData30Days.salesByPeriod.length === 0)
      return null;

    const data = salesData30Days.salesByPeriod;
    const max = Math.max(...data.map((d) => d.totalAmount));
    const last7 = data.slice(-7);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CA des 30 derniers jours</Text>
        <View style={styles.chartContainer}>
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisLabel}>{formatCurrency(max)}</Text>
            <Text style={styles.yAxisLabel}>{formatCurrency(max * 0.8)}</Text>
            <Text style={styles.yAxisLabel}>{formatCurrency(max * 0.6)}</Text>
            <Text style={styles.yAxisLabel}>{formatCurrency(max * 0.4)}</Text>
            <Text style={styles.yAxisLabel}>{formatCurrency(max * 0.2)}</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
          <View style={styles.chartBars}>
            {last7.map((d, i) => {
              const h = (d.totalAmount / max) * 160;
              const day = new Date(d.period).getDate();
              const today = i === last7.length - 1;
              return (
                <View key={i} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: h,
                          backgroundColor: today ? "#10B981" : "#EC4899",
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.barLabel, today && styles.barLabelActive]}
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
            <Text style={styles.noDataText}>Aucune donnée disponible</Text>
          </View>
        </View>
      );
    }

    const top = topProductsData.topSellingProducts.slice(0, 5);
    const total = top.reduce((s, p) => s + p.totalQuantitySold, 0);

    const size = 240;
    const stroke = 45;
    const center = size / 2;
    const radius = (size - stroke) / 2;
    const outer = radius + stroke / 2;
    const inner = radius - stroke / 2;
    const gap = 2;

    const colors = ["#F97316", "#10B981", "#7C3AED", "#C026D3", "#FBBF24"];

    let angle = 0;
    const segments = top.map((p, i) => {
      const pct =
        p.revenuePercentage ||
        (p.totalRevenue / topProductsData.totalRevenue) * 100;
      const segmentAngle = (pct / 100) * 360;
      const start = angle + gap / 2;
      const end = angle + segmentAngle - gap / 2;
      const mid = (start + end) / 2;
      angle += segmentAngle;

      return { ...p, pct: Math.round(pct), color: colors[i], start, end, mid };
    });

    const polarToCartesian = (
      cx: number,
      cy: number,
      r: number,
      deg: number
    ) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const describeArc = (start: number, end: number) => {
      const oStart = polarToCartesian(center, center, outer, end);
      const oEnd = polarToCartesian(center, center, outer, start);
      const iStart = polarToCartesian(center, center, inner, end);
      const iEnd = polarToCartesian(center, center, inner, start);
      const large = end - start <= 180 ? "0" : "1";

      return [
        "M",
        oStart.x,
        oStart.y,
        "A",
        outer,
        outer,
        0,
        large,
        0,
        oEnd.x,
        oEnd.y,
        "L",
        iEnd.x,
        iEnd.y,
        "A",
        inner,
        inner,
        0,
        large,
        1,
        iStart.x,
        iStart.y,
        "Z",
      ].join(" ");
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 Produits par volume</Text>

        <View style={styles.periodSelector}>
          {topProductsPeriod.unit === "MONTH" && (
            <>
              <TouchableOpacity
                style={styles.periodNavigationButton}
                onPress={() => handleMonthChange("prev")}
              >
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, styles.periodButtonActive]}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    styles.periodButtonTextActive,
                  ]}
                >
                  {topProductsPeriod.label}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.periodNavigationButton}
                onPress={() => handleMonthChange("next")}
              >
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.periodButton, styles.periodButtonInactive]}
            onPress={() => setShowPeriodModal(true)}
          >
            <Text style={styles.periodButtonText}>
              {topProductsPeriod.unit === "DAY"
                ? "Jour"
                : topProductsPeriod.unit === "WEEK"
                ? "Semaine"
                : topProductsPeriod.unit === "MONTH"
                ? "Mensuel"
                : "Annuel"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.donutChartContainer}>
          <View style={styles.donutChartWrapper}>
            <Svg width={size} height={size}>
              {segments.map((s, i) => {
                const d = describeArc(s.start, s.end);
                const pos = polarToCartesian(center, center, radius, s.mid);
                return (
                  <G key={i}>
                    <Path d={d} fill={s.color} />
                    <SvgText
                      x={pos.x}
                      y={pos.y}
                      fontSize="16"
                      fontWeight="700"
                      fill="#FFFFFF"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {s.pct}%
                    </SvgText>
                  </G>
                );
              })}
            </Svg>
            <View style={styles.donutCenter}>
              <Text style={styles.donutCenterValue}>{total}</Text>
              <Text style={styles.donutCenterLabel}>Unités</Text>
            </View>
          </View>

          <View style={styles.productLegend}>
            <View style={styles.legendRow}>
              {segments.slice(0, 3).map((p, i) => (
                <View key={i} style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: p.color }]}
                  />
                  <Text style={styles.legendText} numberOfLines={1}>
                    {p.productName}
                  </Text>
                </View>
              ))}
            </View>
            {segments.length > 3 && (
              <View style={styles.legendRow}>
                {segments.slice(3).map((p, i) => (
                  <View key={i + 3} style={styles.legendItem}>
                    <View
                      style={[styles.legendColor, { backgroundColor: p.color }]}
                    />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {p.productName}
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
    if (!recentOrders || recentOrders.data.length === 0) return null;

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
          {recentOrders.data.map((o, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {o.orderNumber}
              </Text>
              <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                {o.customer
                  ? `${o.customer.firstName} ${o.customer.lastName}`
                  : "Client inconnu"}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                {formatCurrency(o.totalAmount)}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/commandes")}
        >
          <Text style={styles.viewAllButtonText}>
            Voir toutes les commandes
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>
    );
  };

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

  // ===================== JSX =====================
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
          />
        }
        style={styles.pd}
      >
        {business ? (
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
          <View style={styles.noBusinessContainer}>
            <Ionicons name="business-outline" size={80} color="#E0E0E0" />
            <Text style={styles.noBusinessTitle}>
              Aucune entreprise sélectionnée
            </Text>
            <Text style={styles.noBusinessText}>
              Sélectionnez une entreprise pour voir vos statistiques
            </Text>
          </View>
        )}
      </ScrollView>
      {renderPeriodModal()}
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  pd: {
    marginHorizontal: 20,
  },
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
    flexDirection: "column",
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
