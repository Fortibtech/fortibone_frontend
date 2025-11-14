import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

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

const StatisticsSection = () => (
  <View style={styles.statisticsContainer}>
    <View style={styles.statisticsHeader}>
      <Text style={styles.statisticsTitle}>Statistiques des ventes</Text>
      <TouchableOpacity>
        <Text style={styles.voirPlus}>Voir plus</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.underline} />
  </View>
);
type AnalyticsComponentProps = { id: string };
export default function AnalyticsComponent({ id }: AnalyticsComponentProps) {
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

      <Text style={styles.sectionTitle}>Statistiques</Text>
      <StatisticsSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
    marginBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
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
