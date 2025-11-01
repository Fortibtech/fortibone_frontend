import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Données fictives pour les transactions
const fakeTransactions = [
  {
    id: "CMP-2025-03-001",
    date: "03 Mai 2025",
    amount: -7750000,
    type: "outgoing",
  },
  {
    id: "CMP-2025-03-002",
    date: "02 Mai 2025",
    amount: 990000,
    type: "incoming",
  },
  {
    id: "CMP-2025-03-003",
    date: "01 Mai 2025",
    amount: -1250000,
    type: "outgoing",
  },
  {
    id: "CMP-2025-03-004",
    date: "30 Avr 2025",
    amount: 550000,
    type: "incoming",
  },
  {
    id: "CMP-2025-03-005",
    date: "29 Avr 2025",
    amount: -3200000,
    type: "outgoing",
  },
  {
    id: "CMP-2025-03-006",
    date: "28 Avr 2025",
    amount: 1800000,
    type: "incoming",
  },
  {
    id: "CMP-2025-03-007",
    date: "27 Avr 2025",
    amount: -450000,
    type: "outgoing",
  },
  {
    id: "CMP-2025-03-008",
    date: "26 Avr 2025",
    amount: 720000,
    type: "incoming",
  },
  {
    id: "CMP-2025-03-009",
    date: "25 Avr 2025",
    amount: -1200000,
    type: "outgoing",
  },
  {
    id: "CMP-2025-03-010",
    date: "24 Avr 2025",
    amount: 2500000,
    type: "incoming",
  },
  {
    id: "CMP-2025-03-011",
    date: "23 Avr 2025",
    amount: -950000,
    type: "outgoing",
  },
  {
    id: "CMP-2025-03-012",
    date: "22 Avr 2025",
    amount: 430000,
    type: "incoming",
  },
  {
    id: "CMP-2025-03-013",
    date: "21 Avr 2025",
    amount: -600000,
    type: "outgoing",
  },
  {
    id: "CMP-2025-03-014",
    date: "20 Avr 2025",
    amount: 1500000,
    type: "incoming",
  },
  {
    id: "CMP-2025-03-015",
    date: "19 Avr 2025",
    amount: -2000000,
    type: "outgoing",
  },
];

export const RecentTransactions = () => {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  return (
    <View style={[styles.container, { width: width - 32 }]}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions Récentes</Text>
        <TouchableOpacity
          onPress={() => router.push("/finance/Transactions")} // Remplacez par le chemin approprié
          style={styles.seeMore}
        >
          <Text style={styles.seeMoreText}>Voir plus</Text>
          <Ionicons name="chevron-forward" size={16} color="#58617b" />
        </TouchableOpacity>
      </View>

      {/* Liste des transactions */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {fakeTransactions.map((transaction, index) => (
          <View key={index} style={styles.transactionItem}>
            {/* Icône */}
            <View style={styles.iconContainer}>
              <Feather
                name={
                  transaction.type === "incoming"
                    ? "arrow-up-right"
                    : "arrow-down-left"
                }
                size={16}
                color={transaction.type === "incoming" ? "#00af66" : "#ef4444"}
                style={styles.arrow}
              />
            </View>

            {/* Détails */}
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionId}>{transaction.id}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>

            {/* Montant */}
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  {
                    color:
                      transaction.type === "incoming" ? "#00af66" : "#ef4444",
                  },
                ]}
              >
                {transaction.type === "incoming" ? "+" : "-"}
                {Math.abs(transaction.amount).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <Text style={styles.currency}> KMF</Text>
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RecentTransactions;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eef0f4",
    marginTop: 16, // Espace par rapport aux composants au-dessus
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  scrollView: {
    minHeight: 200, // Limite la hauteur pour éviter un ScrollView trop grand
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f4",
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#f6f8f9",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  arrow: {
    transform: [{ rotate: "20deg" }], // Cohérent avec StatsCard
  },
  transactionDetails: {
    flex: 1,
    justifyContent: "center",
  },
  transactionId: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
    color: "#58617b",
    fontWeight: "400",
    marginTop: 4,
  },
  amountContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  currency: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
});
