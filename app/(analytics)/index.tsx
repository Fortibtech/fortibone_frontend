import CashFlowChart from "@/components/Chart/CashFlowChart";
import ExpenseDistributionChart from "@/components/Chart/ExpenseDistributionChart";
import RevenueDistributionChart from "@/components/Chart/RevenueDistributionChart";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // Ajoute cette ligne en haut
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function StatistiquesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter(); // Déclare le router

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
