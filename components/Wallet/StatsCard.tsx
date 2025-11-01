import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const StatsCard = () => {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      {/* Ligne 1 */}
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
        <TouchableOpacity
          onPress={() => router.push("/finance/Stats")}
          style={styles.seeMore}
        >
          <Text style={styles.seeMoreText}>Voir plus</Text>
          <Ionicons name="chevron-forward" size={16} color="#58617b" />
        </TouchableOpacity>
      </View>

      {/* Ligne 2 */}
      <View style={styles.statsRow}>
        {/* Entrées */}
        <View style={styles.statBox}>
          <View style={styles.ligne}>
            <Feather
              name="arrow-up-right"
              size={16}
              color="#00af66"
              style={styles.arrow}
            />
            <Text style={styles.statLabel}>Entrées</Text>
          </View>
          <View style={styles.statBottom}>
            <Text style={styles.statAmount}>2 450 KMF</Text>
            <Text style={styles.statPercent}>+16%</Text>
          </View>
        </View>

        {/* Sorties */}
        <View style={styles.statBox}>
          <View style={styles.ligne}>
            <Feather
              name="arrow-down-left"
              size={16}
              color="#ef4444"
              style={styles.arrow}
            />
            <Text style={[styles.statLabel, { color: "#ef4444" }]}>
              Sorties
            </Text>
          </View>
          <View style={styles.statBottom}>
            <Text style={[styles.statAmount, { color: "#ef4444" }]}>
              1 245 KMF
            </Text>
            <Text style={[styles.statPercent, { color: "#ef4444" }]}>
              -0.8%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default StatsCard;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12, // Augmenté pour plus d'espace
  },
  title: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: "#58617b",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statBox: {
    flex: 1,
    height: 90, // Légèrement augmenté pour accueillir la disposition verticale
    borderWidth: 1,
    borderColor: "#eef0f4",
    borderRadius: 16,
    padding: 12,
    flexDirection: "column", // Explicite pour clarté
    justifyContent: "space-between",
  },
  arrow: {
    transform: [{ rotate: "20deg" }],
    marginBottom: 8, // Augmenté pour séparer la flèche du label
  },
  statLabel: {
    fontSize: 12,
    color: "#58617b",
    fontWeight: "500",
    marginBottom: 8, // Ajouté pour espacer le label du statBottom
  },
  statBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#58617b",
  },
  statPercent: {
    fontSize: 12,
    fontWeight: "500",
    color: "#00af66",
  },

  ligne: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
  },
});
