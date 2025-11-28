import { getTransactionsByBusiness, Transaction } from "@/api/transactions";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
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

// Available filter options
const PAYMENT_METHODS = ["Tous", "STRIPE", "MVOLA", "MANUAL"];
const STATUSES = [
  "Tous",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "PENDING_REFUND",
  "PARTIALLY_REFUNDED",
];

// Status color mapping
const STATUS_COLORS: { [key: string]: string } = {
  PENDING: "#FFA500",
  SUCCESS: "#28A745",
  FAILED: "#DC3545",
  REFUNDED: "#007BFF",
  PENDING_REFUND: "#6F42C1",
  PARTIALLY_REFUNDED: "#20C997",
};

const TransactionsDetails: React.FC = () => {
  const { id: businessId } = useLocalSearchParams<{ id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("Tous");
  const [status, setStatus] = useState<string>("Tous");
  const navigation = useNavigation();

  useEffect(() => {
    if (!businessId) return;

    const fetchTransactions = async () => {
      try {
        const res = await getTransactionsByBusiness(businessId);
        setTransactions(res.data);
        setFilteredTransactions(res.data); // Initialize filtered transactions
      } catch (error) {
        console.error("❌ Erreur fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [businessId]);

  // Apply filters when paymentMethod or status changes
  useEffect(() => {
    let filtered = transactions;
    if (paymentMethod !== "Tous") {
      filtered = filtered.filter((t) => t.provider === paymentMethod);
    }
    if (status !== "Tous") {
      filtered = filtered.filter((t) => t.status === status);
    }
    setFilteredTransactions(filtered);
  }, [paymentMethod, status, transactions]);

  const clearFilters = () => {
    setPaymentMethod("Tous");
    setStatus("Tous");
  };

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
          accessibilityLabel="Détails des transactions"
        >
          Transactions de l’entreprise
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Méthode de paiement</Text>
          <Picker
            selectedValue={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value)}
            style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
            itemStyle={styles.pickerItem}
            accessibilityLabel="Filtrer par méthode de paiement"
            accessibilityHint="Sélectionnez une méthode de paiement pour filtrer les transactions"
            accessibilityRole="menu"
          >
            {PAYMENT_METHODS.map((method) => (
              <Picker.Item
                key={method}
                label={method}
                value={method}
                color="#333"
              />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Statut</Text>
          <Picker
            selectedValue={status}
            onValueChange={(value) => setStatus(value)}
            style={[styles.picker, Platform.OS === "ios" && styles.pickerIOS]}
            itemStyle={styles.pickerItem}
            accessibilityLabel="Filtrer par statut"
            accessibilityHint="Sélectionnez un statut pour filtrer les transactions"
            accessibilityRole="menu"
          >
            {STATUSES.map((status) => (
              <Picker.Item
                key={status}
                label={status}
                value={status}
                color="#333"
              />
            ))}
          </Picker>
        </View>
        {(paymentMethod !== "Tous" || status !== "Tous") && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearFilters}
            accessibilityLabel="Réinitialiser les filtres"
            accessibilityHint="Supprime tous les filtres appliqués"
          >
            <Text style={styles.clearButtonText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#666" />
          <Text style={styles.emptySubtitle}>
            Chargement des transactions...
          </Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="business-outline"
            size={72}
            color="#999"
            accessibilityLabel="Icône d'entreprise"
            accessibilityHint="Indique qu'aucune transaction n'est disponible pour cette entreprise"
          />
          <Text
            style={styles.emptyTitle}
            accessibilityLabel="Aucune transaction"
            accessibilityHint="Aucune transaction n'a été trouvée pour cette entreprise"
          >
            Aucune transaction
          </Text>
          <Text style={styles.emptySubtitle}>
            Les transactions de cette entreprise apparaîtront ici dès qu’elles
            seront disponibles 🏢
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(index * 100).duration(500)}
            >
              <View style={styles.card}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  accessibilityLabel={`Transaction de ${item.amount} ${item.currencyCode}`}
                >
                  {item.amount} {item.currencyCode}
                </Text>
                <Text
                  style={[
                    styles.cardText,
                    { color: STATUS_COLORS[item.status ?? "N/A"] || "#666" },
                  ]}
                >
                  Statut: {item.status ?? "N/A"}
                </Text>
                <Text style={styles.cardText}>
                  Moyen de paiement: {item.provider ?? "N/A"}
                </Text>
                <Text style={styles.cardText}>
                  Commande: {item.order?.orderNumber ?? "N/A"}
                </Text>
                <Text style={styles.cardText}>
                  Client: {item.order?.customer?.firstName ?? "N/A"}
                </Text>
                <Text style={styles.cardText}>
                  Date:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "N/A"}
                </Text>
              </View>
            </Animated.View>
          )}
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
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pickerWrapper: {
    flex: 1,
    minWidth: 120,
    marginHorizontal: 6,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  picker: {
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  pickerIOS: {
    height: 150, // Larger height for iOS wheel picker
  },
  pickerItem: {
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    alignSelf: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  card: {
    padding: 16,
    marginVertical: 6,
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

export default TransactionsDetails;
