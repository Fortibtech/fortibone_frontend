import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CashFlowChart from "@/components/Chart/CashFlowChart";
import ExpenseBreakdownChart from "@/components/Chart/ExpenseBreakdownChart";
import TotalExpensesCard from "@/components/cards/TotalExpensesCard";
import AvailableBalanceCard from "@/components/cards/AvailableBalanceCard";
import BackButtonAdmin from "@/components/Admin/BackButton";

const { width } = Dimensions.get("window");

export default function StatsDashboard() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButtonAdmin />
          <Text style={styles.headerTitle}>Statistiques</Text>
          <TouchableOpacity>
            <Feather name="more-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={styles.cardsContainer}>
          <AvailableBalanceCard
            currency="KMF"
            backgroundColor="#E8F5E9"
            iconColor="#4CAF50"
          />

          <TotalExpensesCard
            currency="KMF"
            backgroundColor="#FFF9E6"
            iconColor="#FFC107"
          />
        </View>

        {/* Répartition des Revenus */}
        <CashFlowChart period="6m" />

        {/* Répartition des dépenses */}
        <ExpenseBreakdownChart />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  cardsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
    backgroundColor: "#FFF",
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: "#666",
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    gap: 4,
  },
  periodButtonActive: {
    backgroundColor: "#E8F5E9",
  },
  periodText: {
    fontSize: 14,
    color: "#666",
  },
  periodTextActive: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  chart: {
    flexDirection: "row",
    height: 240,
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 10,
    color: "#999",
  },
  chartScroll: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 220,
    gap: 12,
    paddingBottom: 20,
  },
  barGroup: {
    alignItems: "center",
    gap: 8,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 200,
  },
  bar: {
    width: 12,
    borderRadius: 4,
    position: "relative",
  },
  revenueBar: {
    backgroundColor: "#4CAF50",
  },
  expenseBar: {
    backgroundColor: "#F44336",
  },
  stackedBar: {
    width: 20,
    flexDirection: "column-reverse",
    height: 200,
    gap: 2,
  },
  stackedSegment: {
    width: "100%",
    borderRadius: 4,
    position: "relative",
  },
  monthLabel: {
    fontSize: 10,
    color: "#999",
  },
  tooltip: {
    position: "absolute",
    top: -25,
    left: -10,
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tooltipText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    alignItems: "center",
    marginVertical: 24,
  },
  donut: {
    width: 180,
    height: 180,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  donutSegment: {
    position: "absolute",
  },
  donutCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  donutLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
  },
  donutValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  revenueItems: {
    gap: 16,
    marginTop: 16,
  },
  revenueItem: {
    gap: 8,
  },
  revenueItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  revenueItemLabel: {
    fontSize: 14,
    color: "#666",
  },
  revenueItemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  expenseLegend: {
    gap: 16,
    marginTop: 16,
  },
  expenseItem: {
    gap: 8,
  },
  expenseItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expenseItemLabel: {
    fontSize: 14,
    color: "#666",
  },
  expenseItemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
