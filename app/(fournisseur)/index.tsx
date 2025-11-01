// app/(tabs)/index.tsx
import { Business, BusinessesService, SelectedBusinessManager } from "@/api";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { Ionicons } from "@expo/vector-icons";
import { Route, router } from "expo-router";
import React, { useEffect, useState } from "react";
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
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MOCK_Notif = [
  {
    id: 1,
    type: "warning",
    message: "Stock faible sur 'Galaxy S23' (5 unités)",
    color: "#FEF3C7",
    borderColor: "#FBBF24",
    alertTextColor: "#FFB700FF",
    icon: "warning",
  },]
// Mock Data
const MOCK_ALERTS = [
  {
    id: 1,
    type: "warning",
    message: "Stock faible sur 'Galaxy S23' (5 unités)",
    color: "#FEF3C7",
    borderColor: "#FBBF24",
    alertTextColor: "#FFB700FF",
    icon: "warning",
  },
  {
    id: 2,
    type: "info",
    message: "3 commandes urgentes (prochaine : -14h 43min)",
    color: "#FEF3C7",
    borderColor: "#FBBF24",
    alertTextColor: "#FFB700FF",
    icon: "time",
  },
  {
    id: 3,
    type: "error",
    message: "2 retards de livraison (+4h)",
    color: "#FEE2E2",
    borderColor: "#EF4444",
    alertTextColor: "#F50B0BFF",
    icon: "alert-circle",
  },
];

const MOCK_SALES_DATA = [
  { day: "21", value: 30000 },
  { day: "28", value: 28000 },
  { day: "2", value: 26000 },
  { day: "7", value: 34000 },
  { day: "12", value: 24000 },
  { day: "17", value: 46000 },
  { day: "22", value: 30000 },
];

const MOCK_TOP_PRODUCTS = [
  { name: "iPhone 14", percentage: 34, color: "#F97316", lots: 420 },
  { name: "Galaxy S23", percentage: 25, color: "#10B981", lots: 309 },
  { name: "Pixel 8", percentage: 19, color: "#7C3AED", lots: 235 },
  { name: "Xiaomi 14", percentage: 11, color: "#C026D3", lots: 136 },
  { name: "Huawei P20 Pro", percentage: 11, color: "#FBBF24", lots: 136 },
];

const MOCK_RECENT_ORDERS = [
  { id: "#CMD-001", client: "Supermarché Central", total: "450k" },
  { id: "#CMD-002", client: "Boutique de Bob", total: "120k" },
  { id: "#CMD-003", client: "Épicerie du Coin", total: "380k" },
  { id: "#CMD-004", client: "Mini-Market Express", total: "95k" },
];

const HomePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"Juin" | "Mensuel">("Juin");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const businessesResponse = await BusinessesService.getBusinesses();
      setBusinesses(businessesResponse);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleBusinessSelect = async (business: Business) => {
    try {
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
      Alert.alert("Succès", `Entreprise "${business.name}" sélectionnée`);
      if(business.type==="COMMERCANT"){
              router.push('/(professionnel)')
            }
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'entreprise");
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <BusinessSelector
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/pro/createBusiness")}
        onManageBusiness={() => router.push("/pro/profile")}
      />

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatar}>
          <Ionicons name="person" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderNotif = () => (
    <View style={styles.section}>
      {/* <Text style={styles.sectionTitle}>Alertes Prioritaires</Text> */}
      {MOCK_Notif.map((alert) => (
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
            <Text style={[styles.alertText,{color: `${alert.alertTextColor}`}]}>{alert.message}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
  const renderAlerts = () => (
    <View style={styles.sectionAlerts}>
      <View style={styles.sectionViewTitle}>
        <Text style={styles.sectionTitle}>Alertes Prioritaires</Text>
      </View>
      {MOCK_ALERTS.map((alert) => (
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
            <Text style={[styles.alertText,{color: `${alert.alertTextColor}`,}]}>{alert.message}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderQuickSummary = () => (
    <View style={styles.section}>
      <View style={styles.sectionViewTitle}>
        <Text style={styles.sectionTitle}>Résumé Rapide</Text>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: "#FBBF24" }]}>90k</Text>
          <Text style={styles.summaryLabel}>CA du mois</Text>
        </View>
        <View style={styles.summaryCardCA}>
          <Text style={[styles.summaryValue, { color: "#8B5CF6" }]}>8</Text>
          <Text style={styles.summaryLabel}>Commandes en attente</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: "#EC4899" }]}>12</Text>
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
         <Image source={require('@/assets/images/Analytiques.png')} style={styles.avatarAnalytic} />
        <Text style={styles.analyticsButtonText}>Analytics Avancées</Text>
        <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
      </TouchableOpacity>
    </View>
  );

  const renderSalesChart = () => {
    const maxValue = Math.max(...MOCK_SALES_DATA.map((d) => d.value));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CA des 30 derniers jours</Text>
        <View style={styles.chartContainer}>
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisLabel}>500K</Text>
            <Text style={styles.yAxisLabel}>400K</Text>
            <Text style={styles.yAxisLabel}>300K</Text>
            <Text style={styles.yAxisLabel}>200K</Text>
            <Text style={styles.yAxisLabel}>100K</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
          <View style={styles.chartBars}>
            {MOCK_SALES_DATA.map((data, index) => {
              const height = (data.value / maxValue) * 160;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: height,
                          backgroundColor:
                            data.day === "22" ? "#EC4899" : "#EC4899",
                        },
                      ]}
                    >
                      {/* {data.day === "17" && (
                        <View style={styles.barTooltip}>
                          <Text style={styles.barTooltipText}>
                            {(data.value / 1000).toFixed(0)}K
                          </Text>
                        </View>
                      )} */}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      data.day === "22" && styles.barLabelActive,
                    ]}
                  >
                    {data.day}
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
    const totalLots = MOCK_TOP_PRODUCTS.reduce(
      (sum, product) => sum + product.lots,
      0
    );

    // Donut chart parameters
    const size = 240;
    const strokeWidth = 45;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const outerRadius = radius + strokeWidth / 2;
    const innerRadius = radius - strokeWidth / 2;
    const gapAngle = 2; // Gap between segments in degrees

    // Calculate segments with proper angles and gaps
    let cumulativeAngle = 0;
    const segments = MOCK_TOP_PRODUCTS.map((product) => {
      const segmentAngle = (product.percentage / 100) * 360;
      const startAngle = cumulativeAngle + gapAngle / 2;
      const endAngle = cumulativeAngle + segmentAngle - gapAngle / 2;
      const middleAngle = (startAngle + endAngle) / 2;
      
      cumulativeAngle += segmentAngle;
      
      return {
        ...product,
        startAngle,
        endAngle,
        middleAngle,
        segmentAngle,
      };
    });

    // Helper function to convert polar to cartesian coordinates
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    // Helper function to create donut arc path
    const describeArc = (startAngle: number, endAngle: number) => {
      const outerStart = polarToCartesian(center, center, outerRadius, endAngle);
      const outerEnd = polarToCartesian(center, center, outerRadius, startAngle);
      const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
      const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      const pathData = [
        "M", outerStart.x, outerStart.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
        "L", innerEnd.x, innerEnd.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "Z"
      ].join(" ");

      return pathData;
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 5 Produits par volume</Text>

        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "Juin" && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod("Juin")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "Juin" && styles.periodButtonTextActive,
              ]}
            >
              Juin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "Mensuel" && styles.periodButtonInactive,
            ]}
            onPress={() => setSelectedPeriod("Mensuel")}
          >
            <Text style={styles.periodButtonText}>Mensuel</Text>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.donutChartContainer}>
          {/* SVG Donut Chart */}
          <View style={styles.donutChartWrapper}>
            <Svg width={size} height={size}>
              {segments.map((segment, index) => {
                const pathData = describeArc(segment.startAngle, segment.endAngle);
                
                // Calculate label position (centered on segment at middle radius)
                const labelRadius = radius;
                const labelPos = polarToCartesian(center, center, labelRadius, segment.middleAngle);

                return (
                  <G key={index}>
                    {/* Arc segment as a path */}
                    <Path
                      d={pathData}
                      fill={segment.color}
                    />
                    {/* Percentage label - centered */}
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
            
            {/* Center Text */}
            <View style={styles.donutCenter}>
              <Text style={styles.donutCenterValue}>{totalLots}</Text>
              <Text style={styles.donutCenterLabel}>Lots</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.productLegend}>
            <View style={styles.legendRow}>
              {MOCK_TOP_PRODUCTS.slice(0, 3).map((product, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: product.color },
                    ]}
                  />
                  <Text style={styles.legendText}>{product.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.legendRow}>
              {MOCK_TOP_PRODUCTS.slice(3).map((product, index) => (
                <View key={index + 3} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: product.color },
                    ]}
                  />
                  <Text style={styles.legendText}>{product.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRecentOrders = () => (
    <View style={styles.section}>
      <View style={styles.sectionViewTitle}>
        <Text style={styles.sectionTitle}>Commandes Récentes</Text>
      </View>
      <View style={styles.ordersTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>#</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Client</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>
            Total
          </Text>
        </View>
        {MOCK_RECENT_ORDERS.map((order, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{order.id}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{order.client}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
              {order.total}
            </Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllButtonText}>Voir toutes les commandes</Text>
        <Ionicons name="chevron-forward" size={20} color="#10B981" />
      </TouchableOpacity>
    </View>
  );

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
            {renderRecentOrders()}
            {renderAlerts()}
            {renderSalesChart()}
            {renderTopProducts()}
          </>
        ) : (
          renderNoBusinessSelected()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    borderColor: '#EEF0F4',
    padding: 10,
    borderRadius: 25
  },
  sectionViewTitle: {
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },

  // Alerts
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    // borderWidth: 1,
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

  // Quick Summary
  summaryRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 16,
    justifyContent: "center",
    alignContent: 'center',
    alignItems: 'center'
  },
  summaryCardCA: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    borderColor: '#D8D8D8FF',
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
    borderColor: '#D8D8D8FF',
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
    borderColor: '#DAD6D6FF',
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

  // Sales Chart
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
  barTooltip: {
    position: "absolute",
    top: -30,
    backgroundColor: "#1F2937",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  barTooltipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
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

  // Top Products
  periodSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    justifyContent: 'space-between'
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
  },

  // Recent Orders
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

  // No Business
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