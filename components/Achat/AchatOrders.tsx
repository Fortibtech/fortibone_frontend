import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMyOrders } from "@/api/Orders";
import { MyOrder } from "@/types/orders";

// === Props du composant ===
interface AchatOrdersProps {
  searchQuery: string;
}

export default function AchatOrders({ searchQuery }: AchatOrdersProps) {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // === Récupération des commandes ===
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getMyOrders({ type: "PURCHASE" }); // 🔹 type filtré : achats
        setOrders(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erreur de chargement des commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // === Filtrage en temps réel avec useMemo ===
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.notes?.toLowerCase().includes(query) // tu peux ajuster ici
    );
  }, [searchQuery, orders]);

  // === Rendu d'une ligne de commande ===
  const renderOrderItem = ({ item }: { item: MyOrder }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.colOrder]}>{item.orderNumber}</Text>
      <Text style={[styles.cell, styles.colSupplier]} numberOfLines={1}>
        {item.business?.name || "—"}
      </Text>
      <Text style={[styles.cell, styles.colDate]}>
        {new Date(item.createdAt).toLocaleDateString("fr-FR")}
      </Text>
      <Text style={[styles.cell, styles.colArticles]}>—</Text>
      <Text style={[styles.cell, styles.colTotal]}>
        {parseFloat(item.totalAmount).toLocaleString("fr-FR")} FCFA
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

  // === États de chargement / erreur ===
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#00B87C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* === En-tête === */}
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

            {/* === Liste === */}
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

// === Styles cohérents avec ton design ===
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
  colOrder: { width: 130, fontWeight: "600" },
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
