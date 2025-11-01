import React, { JSX, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Types
interface Transaction {
  id: string;
  type: "income" | "expense";
  title: string;
  reference: string;
  date: string;
  amount: string;
  currency: string;
}

interface TransactionSection {
  id: number;
  section: string;
  items: Transaction[];
}

const TransactionHistory: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");

  const transactions: TransactionSection[] = [
    {
      id: 1,
      section: "AUJOURD'HUI",
      items: [
        {
          id: "T1",
          type: "income",
          title: "Paiement de John Doe",
          reference: "CMD-C/F/SI5125",
          date: "Aujourd'hui - 17:33",
          amount: "990 000,00",
          currency: "XAF",
        },
        {
          id: "T2",
          type: "income",
          title: "Paiement de John Doe",
          reference: "CMD-C/F/SI5125",
          date: "Aujourd'hui - 09:55",
          amount: "356 500,00",
          currency: "XAF",
        },
        {
          id: "T3",
          type: "expense",
          title: "Réapprovisionnement iPhone 14",
          reference: "CMD-F#/SI5125",
          date: "Aujourd'hui - 03:45",
          amount: "-5 250 000,00",
          currency: "XAF",
        },
      ],
    },
    {
      id: 2,
      section: "CETTE SEMAINE",
      items: [
        {
          id: "T4",
          type: "income",
          title: "Dépôt d'argent",
          reference: "D#FSI36516",
          date: "29 avril 2025 - 03:45",
          amount: "213 000,00",
          currency: "XAF",
        },
        {
          id: "T5",
          type: "income",
          title: "Dépôt d'argent",
          reference: "D#FSI36516",
          date: "29 avril 2025 - 03:45",
          amount: "65 500,00",
          currency: "XAF",
        },
        {
          id: "T6",
          type: "expense",
          title: "Retrait d'argent",
          reference: "D#FSI33545",
          date: "29 avril 2025 - 03:45",
          amount: "-3 115 000,00",
          currency: "XAF",
        },
        {
          id: "T7",
          type: "income",
          title: "Paiement de John Doe",
          reference: "Command#J123",
          date: "29 avril 2025 - 03:45",
          amount: "90 000,00",
          currency: "XAF",
        },
        {
          id: "T8",
          type: "expense",
          title: "Réapprovisionnement iPhone 14...",
          reference: "Command#J123",
          date: "29 avril 2025 - 03:45",
          amount: "-422 000,00",
          currency: "XAF",
        },
        {
          id: "T9",
          type: "income",
          title: "Dépôt d'argent",
          reference: "Command#J123",
          date: "29 avril 2025 - 03:45",
          amount: "56 500,00",
          currency: "XAF",
        },
      ],
    },
  ];

  const renderTransactionIcon = (type: "income" | "expense"): JSX.Element => {
    if (type === "income") {
      return (
        <View style={styles.iconContainer}>
          <Feather name="check" size={16} color="#4CAF50" />
        </View>
      );
    } else {
      return (
        <View style={styles.iconContainer}>
          <Feather name="arrow-up-right" size={16} color="#F44336" />
        </View>
      );
    }
  };

  const renderTransaction = (transaction: Transaction): JSX.Element => {
    const isExpense = transaction.type === "expense";
    const amountColor = isExpense ? "#F44336" : "#00BFA5";

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionItem}
        activeOpacity={0.7}
      >
        <View style={styles.transactionLeft}>
          {renderTransactionIcon(transaction.type)}
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {transaction.title}
            </Text>
            <Text style={styles.transactionReference}>
              {transaction.reference}
            </Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {transaction.amount} {transaction.currency}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique des Transactio...</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Feather name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une transaction"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton}>
          <Feather name="bar-chart-2" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {transactions.map((section: TransactionSection) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map((transaction: Transaction) =>
              renderTransaction(transaction)
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginLeft: 16,
  },
  menuButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  sortButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  transactionReference: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
  },
  transactionRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default TransactionHistory;
