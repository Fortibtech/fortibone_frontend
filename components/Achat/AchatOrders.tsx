// components/Achat/AchatOrders.tsx
import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

// === Type pour une commande ===
export interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  date: string;
  articles: number;
  total: number;
}

// === Props du composant ===
interface AchatOrdersProps {
  searchQuery: string;
}

// === Données mock (à remplacer par API plus tard) ===
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "#CMD-202501",
    supplier: "iPhone Paris",
    date: "15/10/2025",
    articles: 8,
    total: 37000,
  },
  {
    id: "2",
    orderNumber: "#CMD-202502",
    supplier: "BCE Sarl",
    date: "28/06/2025",
    articles: 5,
    total: 8000,
  },
  {
    id: "3",
    orderNumber: "#CMD-202503",
    supplier: "Malic Gros Ltd",
    date: "02/11/2025",
    articles: 11,
    total: 5000,
  },
];

export default function AchatOrders({ searchQuery }: AchatOrdersProps) {
  // === Filtrage en temps réel avec useMemo ===
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_ORDERS;

    const query = searchQuery.toLowerCase().trim();
    return MOCK_ORDERS.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.supplier.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // === Rendu d'une ligne de commande ===
  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.colOrder]}>{item.orderNumber}</Text>
      <Text style={[styles.cell, styles.colSupplier]} numberOfLines={1}>
        {item.supplier}
      </Text>
      <Text style={[styles.cell, styles.colDate]}>{item.date}</Text>
      <Text style={[styles.cell, styles.colArticles]}>{item.articles}</Text>
      <Text style={[styles.cell, styles.colTotal]}>
        {item.total.toLocaleString("fr-FR")} FCFA
      </Text>
      <View style={styles.colActions}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(achats)/orders/[orderid]",
              params: { orderid: item.id },
            })
          }
          style={styles.actionButton}
          accessibilityLabel={`Voir la commande ${item.orderNumber}`}
          accessibilityHint="Ouvre les détails de la commande"
        >
          <Feather name="eye" size={16} color="#00B87C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* === Tableau responsive avec scroll horizontal === */}
      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* En-tête */}
            <View style={styles.header}>
              <Text style={[styles.headerText, styles.colOrder]}>
                # Commande
              </Text>
              <Text style={[styles.headerText, styles.colSupplier]}>
                Fournisseur
              </Text>
              <Text style={[styles.headerText, styles.colDate]}>Date</Text>
              <Text style={[styles.headerText, styles.colArticles]}>Art.</Text>
              <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
              <Text style={[styles.headerText, styles.colActions]}>Action</Text>
            </View>

            {/* Corps */}
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id}
              renderItem={renderOrderItem}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "Aucune commande trouvée pour votre recherche"
                      : "Aucune commande disponible"}
                  </Text>
                </View>
              }
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// === STYLES COHÉRENTS AVEC LE PARENT ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  tableWrapper: {
    flex: 1,
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  cell: {
    fontSize: 14,
    color: "#111827",
  },
  colOrder: { width: 110, fontWeight: "600" },
  colSupplier: { width: 150, flexShrink: 1 },
  colDate: { width: 100, color: "#6B7280" },
  colArticles: { width: 60, textAlign: "center", color: "#6B7280" },
  colTotal: { width: 110, textAlign: "right", fontWeight: "600" },
  colActions: { width: 60, alignItems: "center" },
  actionButton: {
    padding: 6,
    backgroundColor: "#E8F5F0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00B87C",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
