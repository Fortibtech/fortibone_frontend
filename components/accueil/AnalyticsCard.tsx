import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import RevenueDistributionChart from "@/components/Chart/RevenueDistributionChart";
import ExpenseDistributionChart from "@/components/Chart/ExpenseDistributionChart";
import { SalesByCategoryChart } from "@/components/Chart/SalesBarChart";
import { getSales, SalesResponse } from "@/api/analytics";
import { useEffect, useState } from "react";
type FeatherIconName =
  | "filter"
  | "bold"
  | "underline"
  | "search"
  | "repeat"
  | "anchor"
  | "link"
  | "map"
  | "shopping-cart"
  | "type"
  | "key"
  | "image"
  | "menu"
  | "radio"
  | "arrow-down"
  | "arrow-up"
  | "bar-chart"
  | "dollar-sign"
  | "shopping-bag"
  | "package"
  | undefined;

interface props {
  icon: FeatherIconName;
  title: string;
  onPress: () => void;
}

const AnalyticsCard = ({ icon, title, onPress }: props) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Feather name={icon} size={24} color="#10b981" />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Feather name="chevron-right" size={20} color="#9ca3af" />
  </TouchableOpacity>
);

type AnalyticsComponentProps = { id: string };

export default function AnalyticsComponent({ id }: AnalyticsComponentProps) {
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("grahp id du bussines en cours", id);
  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getSales(id);
      setData(result);
    } catch (error) {
      console.error("❌ Erreur lors du fetch overview:", error);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [id]);

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
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.cardsRow}>
        <AnalyticsCard
          icon="dollar-sign"
          title="Ventes"
          onPress={() =>
            router.push({
              pathname: "/(accueil)/analytics-vente/[id]",
              params: { id },
            })
          }
        />
        <AnalyticsCard
          icon="shopping-bag"
          title="Achats"
          onPress={() =>
            router.push({
              pathname: "/(accueil)/analytics-achats/[id]",
              params: { id },
            })
          }
        />
        <AnalyticsCard
          icon="package"
          title="Stock"
          onPress={() =>
            router.push({
              pathname: "/(accueil)/analytics-stocks/[id]",
              params: { id },
            })
          }
        />
      </View>
      {/* Nouveau bouton livreurs*/}
      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => router.push("/(carriers)/")}
      >
        <Ionicons name="pricetag" size={20} color="#6366F1" />
        <Text style={styles.statsButtonText}>Tarifs des livreurs</Text>
        <Ionicons name="chevron-forward" size={20} color="#6366F1" />
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Statistiques</Text>
      <SalesByCategoryChart data={data.salesByPeriod} />
      <ExpenseDistributionChart businessId={id} />
      <RevenueDistributionChart businessId={id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Nouveau bouton stats
  statsButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 100,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,

    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },
  statisticsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statisticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statisticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  voirPlus: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  underline: {
    height: 3,
    width: 60,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
});
