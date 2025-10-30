import {
  getSales,
  SalesByPeriod,
  SalesByProductCategory,
  TopSellingProduct,
} from "@/api/analytics";
import CashFlowChart from "@/components/Chart/CashFlowChart";
import ExpenseDistributionChart from "@/components/Chart/ExpenseDistributionChart";
import RevenueDistributionChart from "@/components/Chart/RevenueDistributionChart";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // Ajoute cette ligne en haut
import { useEffect, useState } from "react";

import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { SafeAreaView } from "react-native-safe-area-context";
const { width } = Dimensions.get("window");
type FilterType = "Jan" | "Mensuel";

interface LegendItem {
  name: string;
  color: string;
}

interface RevenueItem {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface DepenseItem {
  name: string;
  amount: string;
  color: string;
}

export default function StatistiquesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter(); // Déclare le router
  const [tresorerieFilter, setTresorerieFilter] = useState<FilterType>("Jan");
  const [revenuFilter, setRevenuFilter] = useState<FilterType>("Jan");
  const [depenseFilter, setDepenseFilter] = useState<FilterType>("Jan");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salesByPeriod, setSalesByPeriod] = useState<SalesByPeriod[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<
    TopSellingProduct[]
  >([]);
  const [salesByProductCategory, setSalesByProductCategory] = useState<
    SalesByProductCategory[]
  >([]);
  // Charger les ventes pour l'entreprise sélectionnée
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await getSales(id);
        setSalesByPeriod(data.salesByPeriod);
        setTopSellingProducts(data.topSellingProducts); // ✅ ajouté
        setSalesByProductCategory(data.salesByProductCategory); // ✅ ajouté
      } catch (error) {
        console.error("Erreur fetch sales:", error);
      }
    };
    fetchSales();
  }, [id]);
  // Configuration commune des graphiques
  const chartConfig: AbstractChartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#E5E5E5",
      strokeWidth: 1,
    },
  };

  // Données fake pour les graphiques
  const tresorerieLegend: LegendItem[] = [
    { name: "Revenus", color: "#00D09C" },
    { name: "Dépenses", color: "#FF6B6B" },
  ];

  const tresorerieData = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
    datasets: [
      {
        data: [30, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
      },
      {
        data: [20, 35, 60, 50, 70, 55],
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
      },
    ],
  };

  const revenusDonutData: RevenueItem[] = [
    {
      name: "iPhone 16",
      amount: 119900000,
      color: "#4169E1",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "iPhone 14 Pro",
      amount: 67180000,
      color: "#FFA500",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Casque",
      amount: 52899990,
      color: "#00D09C",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  const depensesData = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
    datasets: [
      {
        data: [250, 280, 320, 310, 380, 350],
      },
      {
        data: [150, 120, 180, 140, 160, 170],
      },
    ],
  };

  const depensesLegend: DepenseItem[] = [
    { name: "Réapprovisionnement", amount: "920 000,00", color: "#FF6B6B" },
    { name: "Salaires", amount: "140 000,00", color: "#FFD700" },
  ];

  const totalRevenus = revenusDonutData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistiques</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Revenue Cards */}
        {/* <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Revenus du mois</Text>
            <Text style={styles.cardValue}>
              990 000,00 <Text style={styles.currency}>XAF</Text>
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Dépenses du mois</Text>
            <Text style={styles.cardValue}>
              990 000,00 <Text style={styles.currency}>XAF</Text>
            </Text>
          </View>
        </View> */}

        {/* Flux de trésorerie */}
        <CashFlowChart businessId={id} />

        {/* Répartition des Revenus */}
        <RevenueDistributionChart businessId={id} />

        {/* Répartition des dépenses */}
        <ExpenseDistributionChart businessId={id} />

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
  },
  cardLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  currency: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666",
  },
  chartCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#00D09C",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  filterBtnActive: {
    backgroundColor: "#E8FFF6",
  },
  filterBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  filterBtnTextActive: {
    color: "#00D09C",
    fontWeight: "600",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  donutContainer: {
    position: "relative",
    alignItems: "center",
    marginVertical: 16,
  },
  donutCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -60 }, { translateY: -30 }],
    alignItems: "center",
  },
  donutCenterLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  donutCenterValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  donutCenterCurrency: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  revenusLegend: {
    marginTop: 16,
    gap: 12,
  },
  revenuLegendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenuLegendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  revenuLegendText: {
    fontSize: 14,
    color: "#333",
  },
  revenuLegendAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  depensesLegend: {
    marginTop: 16,
    gap: 12,
  },
  depenseLegendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  depenseLegendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  depenseLegendText: {
    fontSize: 14,
    color: "#333",
  },
  depenseLegendAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
});
