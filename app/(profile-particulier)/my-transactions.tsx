import { getTransactions, Transaction } from "@/api/transactions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔥 Get screen width for responsive design
const { width } = Dimensions.get("window");

const MyTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await getTransactions(); // API call
        setTransactions(res.data);
      } catch (err) {
        console.error("Erreur récupération transactions :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Retour à la page précédente"
          accessibilityHint="Navigue vers l'écran précédent"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
          accessibilityLabel="Mes transactions"
        >
          Mes Transactions
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#666" />
          <Text style={styles.emptySubtitle}>
            Chargement des transactions...
          </Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="wallet-outline"
            size={72}
            color="#999"
            accessibilityLabel="Icône de portefeuille"
            accessibilityHint="Indique qu'aucune transaction n'est disponible"
          />
          <Text
            style={styles.emptyTitle}
            accessibilityLabel="Aucune transaction"
            accessibilityHint="Aucune transaction n'a été trouvée pour le moment"
          >
            Aucune transaction
          </Text>
          <Text style={styles.emptySubtitle}>
            Vos transactions apparaîtront ici dès que vous en aurez effectué une
            💸
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 100).duration(500)}
            >
              <View style={styles.card}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  accessibilityLabel={`Transaction avec ${item.order.business.name}`}
                >
                  {item.order.business.name} — {item.order.orderNumber}
                </Text>
                <Text style={styles.cardText}>
                  Montant: {item.amount} {item.currencyCode}
                </Text>
                <Text style={styles.cardText}>Statut: {item.status}</Text>
                <Text style={styles.cardText}>
                  Date: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.3,
    maxWidth: width - 80,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: "#6200EE",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 12,
  },
  card: {
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});

export default MyTransactions;
