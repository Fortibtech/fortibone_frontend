import { getBusinessOrders } from "@/api/Orders";
import { OrderResponse } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VentesScreen() {
  const { businessId } = useLocalSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  const LIMIT = 10;
  const [activeTab, setActiveTab] = useState<"commandes" | "clients">(
    "commandes"
  );

  // États de recherche
  const [searchQueryCommandes, setSearchQueryCommandes] = useState("");
  const [searchQueryClients, setSearchQueryClients] = useState("");

  // ---------------------------
  // Récupération des commandes
  // ---------------------------
  const fetchOrders = async (
    newPage: number = 1,
    isRefresh: boolean = false
  ) => {
    if (!businessId || isLoading || (newPage > totalPages && !isRefresh))
      return;

    try {
      setIsLoading(true);
      if (isRefresh) setIsRefreshing(true);

      const response = await getBusinessOrders(businessId as string, {
        page: newPage,
        limit: LIMIT,
      });

      setOrders((prev) =>
        isRefresh || newPage === 1 ? response.data : [...prev, ...response.data]
      );
      setTotalPages(response.totalPages);
      setPage(newPage);
      setRetryCount(0);
    } catch (err: any) {
      if (
        err.message.includes("Transaction already closed") &&
        retryCount < MAX_RETRIES
      ) {
        setRetryCount(retryCount + 1);
        Toast.show({
          type: "info",
          text1: "Délai dépassé",
          text2: `Nouvelle tentative (${retryCount + 1}/${MAX_RETRIES})...`,
        });
        setTimeout(() => fetchOrders(newPage, isRefresh), 1000);
        return;
      }

      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: err.response?.data?.message?.join?.(", ") || err.message,
      });
      console.error("Erreur lors de la récupération des commandes:", err);
    } finally {
      setIsLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (businessId) fetchOrders();
  }, [businessId]);

  // Formatage des données pour l'UI
  const formattedOrders = orders.map((order) => {
    const date = new Date(order.createdAt);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

    const statusColor =
      order.status === "COMPLETED"
        ? "#00A36C"
        : order.status === "CANCELLED"
        ? "#FF4B4B"
        : "#FFA500";

    const articlesCount = order.lines?.length || 0;

    return {
      id: order.id,
      code: `#${order.orderNumber}`,
      client: `${order.customer.firstName} ${order.customer.lastName || ""}`,
      date: formattedDate,
      articles: articlesCount,
      color: statusColor,
      originalOrder: order,
    };
  });

  // Filtrage des commandes en fonction de la recherche
  const filteredOrders = formattedOrders.filter((order) => {
    const query = searchQueryCommandes.toLowerCase().trim();
    if (!query) return true;

    return (
      order.code.toLowerCase().includes(query) ||
      order.client.toLowerCase().includes(query) ||
      order.date.includes(query)
    );
  });

  // Clients dérivés des commandes
  const uniqueClients = Array.from(
    new Map(
      orders.map((o) => [
        o.customerId,
        {
          id: o.customerId,
          name: `${o.customer.firstName} ${o.customer.lastName || ""}`,
          email: `${o.customer.firstName.toLowerCase()}.${(
            o.customer.lastName || ""
          ).toLowerCase()}@example.com`,
          avatar: o.customer.profileImageUrl,
          commandes: orders.filter((ord) => ord.customerId === o.customerId)
            .length,
          ca:
            orders
              .filter((ord) => ord.customerId === o.customerId)
              .reduce((sum, ord) => sum + parseFloat(ord.totalAmount), 0)
              .toFixed(2)
              .replace(".", ",") + " €",
          panierMoyen:
            (
              orders
                .filter((ord) => ord.customerId === o.customerId)
                .reduce((sum, ord) => sum + parseFloat(ord.totalAmount), 0) /
              orders.filter((ord) => ord.customerId === o.customerId).length
            )
              .toFixed(2)
              .replace(".", ",") + " €",
          originalOrder: o,
        },
      ])
    ).values()
  );

  // Filtrage des clients en fonction de la recherche
  const filteredClients = uniqueClients.filter((client) => {
    const query = searchQueryClients.toLowerCase().trim();
    if (!query) return true;

    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

  // Navigation
  const handleOrderPress = (order: OrderResponse) => {
    router.push({
      pathname: "/order-details/[id]",
      params: { id: order.id.toString() },
    });
  };

  const handleOrderCustumerPress = (order: OrderResponse) => {
    router.push({
      pathname: "/custumer-order-details/[id]",
      params: { id: order.businessId.toString() },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* === HEADER === */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("commandes")}
            style={[styles.tab, activeTab === "commandes" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "commandes" && styles.activeTabText,
              ]}
            >
              Commandes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("clients")}
            style={[styles.tab, activeTab === "clients" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "clients" && styles.activeTabText,
              ]}
            >
              Clients
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.backButton} />
      </View>

      {/* Content */}
      {activeTab === "commandes" ? (
        <CommandesList
          orders={filteredOrders}
          isLoading={isLoading}
          onOrderPress={handleOrderPress}
          onCustomerPress={handleOrderCustumerPress}
          searchQuery={searchQueryCommandes}
          setSearchQuery={setSearchQueryCommandes}
        />
      ) : (
        <ClientsList
          clients={filteredClients}
          onCustomerPress={handleOrderCustumerPress}
          searchQuery={searchQueryClients}
          setSearchQuery={setSearchQueryClients}
        />
      )}
    </SafeAreaView>
  );
}

// === COMPOSANT COMMANDES ===
function CommandesList({
  orders,
  isLoading,
  onOrderPress,
  onCustomerPress,
  searchQuery,
  setSearchQuery,
}: {
  orders: any[];
  isLoading: boolean;
  onOrderPress: (order: OrderResponse) => void;
  onCustomerPress: (order: OrderResponse) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  if (isLoading && orders.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00A36C" />
        <Text style={{ marginTop: 10, color: "#777" }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Search + New */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#777" />
          <TextInput
            placeholder="Rechercher un client, code..."
            style={{ flex: 1, marginLeft: 6 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="filter-outline" size={18} color="#777" />
          )}
        </View>
        <TouchableOpacity style={styles.newBtn}>
          <Ionicons name="add" size={18} color="#00A36C" />
          <Text style={styles.newBtnText}>Nouvelle Commande</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="search-outline" size={48} color="#CCC" />
          <Text style={{ color: "#777", marginTop: 12 }}>
            {searchQuery ? "Aucun résultat trouvé" : "Aucune commande trouvée"}
          </Text>
          {searchQuery && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: "#00A36C", fontWeight: "600" }}>
                Effacer la recherche
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1 }]}>#</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Client</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Date</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Articles</Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View
                  style={[styles.colorBar, { backgroundColor: item.color }]}
                />
                <Text style={[styles.cell, { flex: 1 }]}>{item.code}</Text>

                {/* Client cliquable */}
                <TouchableOpacity
                  onPress={() => onCustomerPress(item.originalOrder)}
                  style={{ flex: 2 }}
                >
                  <Text style={[styles.cell, styles.clickableText]}>
                    {item.client}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.cell, { flex: 2 }]}>{item.date}</Text>
                <Text style={[styles.cell, { flex: 1 }]}>{item.articles}</Text>

                {/* Icône œil */}
                <TouchableOpacity
                  onPress={() => onOrderPress(item.originalOrder)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="eye-outline" size={20} color="#00A36C" />
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

// === COMPOSANT CLIENTS ===
function ClientsList({
  clients,
  onCustomerPress,
  searchQuery,
  setSearchQuery,
}: {
  clients: any[];
  onCustomerPress: (order: OrderResponse) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#777" />
          <TextInput
            placeholder="Rechercher un client..."
            style={{ flex: 1, marginLeft: 6 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="filter-outline" size={18} color="#777" />
          )}
        </View>
        <TouchableOpacity style={styles.newBtn}>
          <Ionicons name="person-add-outline" size={18} color="#00A36C" />
          <Text style={styles.newBtnText}>Nouveau Client</Text>
        </TouchableOpacity>
      </View>

      {clients.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="people-outline" size={48} color="#CCC" />
          <Text style={{ color: "#777", marginTop: 12 }}>
            {searchQuery ? "Aucun client trouvé" : "Aucun client disponible"}
          </Text>
          {searchQuery && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: "#00A36C", fontWeight: "600" }}>
                Effacer la recherche
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.clientCard}>
              <Image
                source={{
                  uri: item.avatar || "https://via.placeholder.com/50",
                }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientEmail}>{item.email}</Text>
                <View style={styles.clientStats}>
                  <Text style={styles.stat}>
                    CA total : <Text style={styles.bold}>{item.ca}</Text>
                  </Text>
                  <Text style={styles.stat}>
                    Commandes :{" "}
                    <Text style={styles.bold}>{item.commandes}</Text>
                  </Text>
                  <Text style={styles.stat}>
                    Panier moyen :{" "}
                    <Text style={styles.bold}>{item.panierMoyen}</Text>
                  </Text>
                </View>

                {/* Bouton "Voir détails" */}
                <TouchableOpacity
                  onPress={() => onCustomerPress(item.originalOrder)}
                >
                  <Text style={styles.detailsLink}>Voir détails</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F5F7",
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 12,
    height: 40,
    justifyContent: "center",
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 0,
  },
  tabText: { fontWeight: "600", color: "#555", fontSize: 14 },
  activeTab: { backgroundColor: "#E8FFF1" },
  activeTabText: { color: "#00A36C", fontWeight: "600" },
  searchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F6F6F6",
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    alignItems: "center",
  },
  newBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#00A36C",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  newBtnText: { color: "#00A36C", fontWeight: "600", marginLeft: 4 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
    paddingBottom: 6,
    alignItems: "center",
  },
  headerCell: { fontWeight: "600", color: "#555" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F2F2F2",
  },
  colorBar: { width: 3, height: 25, marginRight: 8, borderRadius: 2 },
  cell: { color: "#333", fontSize: 14 },
  clickableText: { color: "#00A36C", fontWeight: "600" },
  eyeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  clientCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  clientName: { fontWeight: "600", fontSize: 16, color: "#111" },
  clientEmail: { color: "#777", fontSize: 13, marginBottom: 4 },
  clientStats: { marginTop: 4 },
  stat: { color: "#444", fontSize: 13 },
  bold: { fontWeight: "600", color: "#000" },
  detailsLink: {
    marginTop: 6,
    color: "#00A36C",
    fontWeight: "600",
    fontSize: 13,
  },
});
