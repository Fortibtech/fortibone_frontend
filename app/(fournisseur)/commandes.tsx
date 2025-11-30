import { getBusinessOrders } from "@/api/Orders";
import { OrderResponse } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Business, SelectedBusinessManager } from "@/api";

export default function VentesScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 2;
  const LIMIT = 10;

  const [activeTab, setActiveTab] = useState<"commandes" | "clients">("commandes");
  const previousBusinessIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const [searchQueryCommandes, setSearchQueryCommandes] = useState("");
  const [searchQueryClients, setSearchQueryClients] = useState("");

  // CHARGEMENT INITIAL
  useEffect(() => {
    checkForBusinessChange();
  }, []);

  const checkForBusinessChange = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      const currentBusiness = await SelectedBusinessManager.getSelectedBusiness();

      if (!currentBusiness) {
        Alert.alert("Aucune entreprise", "Veuillez en sélectionner une.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      const hasChanged =
        !selectedBusiness ||
        selectedBusiness.id !== currentBusiness.id ||
        previousBusinessIdRef.current !== currentBusiness.id;

      if (hasChanged) {
        console.log("Entreprise chargée :", currentBusiness.name, `(ID: ${currentBusiness.id})`);
        setSelectedBusiness(currentBusiness);
        previousBusinessIdRef.current = currentBusiness.id;

        // Reset complet
        setOrders([]);
        setPage(1);
        setTotalPages(1);
        setRetryCount(0);
      }
    } catch (error) {
      console.error("Erreur chargement entreprise :", error);
      Alert.alert("Erreur", "Impossible de charger l'entreprise");
    } finally {
      isLoadingRef.current = false;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setOrders([]);
    setPage(1);
    await checkForBusinessChange();
    setRefreshing(false);
  }, []);

  // FONCTION CLÉ : AVEC LOGS COMPLÈTES
  const fetchOrders = useCallback(
    async (newPage: number = 1, isRefresh: boolean = false) => {
      if (!selectedBusiness?.id || isLoading || (newPage > totalPages && !isRefresh)) {
        return;
      }

      try {
        setIsLoading(true);
        if (isRefresh) setIsRefreshing(true);

        console.log("Appel API → getBusinessOrders");
        console.log("Business ID :", selectedBusiness.id);
        console.log("Page :", newPage, "| Limit :", LIMIT);

        const response = await getBusinessOrders(selectedBusiness.id, {
          page: newPage,
          limit: LIMIT,
        });

        // LOGS ULTRA IMPORTANTS
        console.log("API Response complète :", response);
        console.log("response.data :", response.data);
        console.log("Nombre de commandes reçues :", response.data?.length ?? 0);
        console.log("totalPages :", response.totalPages);

        if (!response?.data || !Array.isArray(response.data)) {
          console.log("Aucune commande reçue ou format invalide");
          setOrders([]);
          setTotalPages(1);
          return;
        }

        const newOrders = response.data as OrderResponse[];

        setOrders((prev) =>
          isRefresh || newPage === 1
            ? newOrders
            : [...prev, ...newOrders]
        );

        setTotalPages(response.totalPages || 1);
        setPage(newPage);
        setRetryCount(0);

        console.log("Orders mis à jour dans le state :", newOrders.length, "commandes");
      } catch (err: any) {
        console.error("ERREUR fetchOrders :", err);
        console.error("Détail erreur :", err.response?.data || err.message);

        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: err.response?.data?.message || "Impossible de charger les commandes",
        });
      } finally {
        setIsLoading(false);
        if (isRefresh) setIsRefreshing(false);
      }
    },
    [selectedBusiness?.id, isLoading]
  );

  // CHARGEMENT AUTOMATIQUE QUAND L'ENTREPRISE EST PRÊTE
  useEffect(() => {
    if (selectedBusiness?.id) {
      console.log("Entreprise prête → Chargement des commandes (page 1)");
      fetchOrders(1, false);
    }
  }, [selectedBusiness?.id]);

  // FORMATAGE
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

    return {
      id: order.id,
      code: `#${order.orderNumber}`,
      client: `${order.customer.firstName} ${order.customer.lastName || ""}`.trim(),
      date: formattedDate,
      articles: order.lines?.length || 0,
      color: statusColor,
      originalOrder: order,
    };
  });

  const filteredOrders = formattedOrders.filter((order) => {
    const q = searchQueryCommandes.toLowerCase().trim();
    if (!q) return true;
    return (
      order.code.toLowerCase().includes(q) ||
      order.client.toLowerCase().includes(q) ||
      order.date.includes(q)
    );
  });

  const uniqueClients = Array.from(
    new Map(
      orders.map((o) => [
        o.customerId,
        {
          id: o.customerId,
          name: `${o.customer.firstName} ${o.customer.lastName || ""}`.trim(),
          email: `${o.customer.firstName.toLowerCase()}.${(
            o.customer.lastName || ""
          ).toLowerCase()}@example.com`,
          avatar: o.customer.profileImageUrl,
          commandes: orders.filter((ord) => ord.customerId === o.customerId).length,
          ca: orders
            .filter((ord) => ord.customerId === o.customerId)
            .reduce((sum, ord) => sum + parseFloat(ord.totalAmount || "0"), 0)
            .toFixed(2)
            .replace(".", ",") + " €",
          panierMoyen:
            orders.filter((ord) => ord.customerId === o.customerId).length > 0
              ? (
                  orders
                    .filter((ord) => ord.customerId === o.customerId)
                    .reduce((sum, ord) => sum + parseFloat(ord.totalAmount || "0"), 0) /
                  orders.filter((ord) => ord.customerId === o.customerId).length
                )
                  .toFixed(2)
                  .replace(".", ",") + " €"
              : "0,00 €",
        },
      ])
    ).values()
  );

  const filteredClients = uniqueClients.filter((client) => {
    const q = searchQueryClients.toLowerCase().trim();
    if (!q) return true;
    return client.name.toLowerCase().includes(q) || client.email.toLowerCase().includes(q);
  });

  const handleOrderPress = (order: OrderResponse) => {
    router.push({ pathname: "/order-details/[id]", params: { id: order.id.toString() } });
  };

  const handleCustomerPress = (customerId: string) => {
    router.push({
      pathname: "/custumer-order-details/[id]",
      params: { id: customerId, businessId: selectedBusiness?.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab("commandes")}
              style={[styles.tab, activeTab === "commandes" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "commandes" && styles.activeTabText]}>
                Commandes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("clients")}
              style={[styles.tab, activeTab === "clients" && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === "clients" && styles.activeTabText]}>
                Clients
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.backButton} />
        </View>

        {/* CONTENU */}
        {activeTab === "commandes" ? (
          <CommandesList
            orders={filteredOrders}
            isLoading={isLoading && orders.length === 0}
            onOrderPress={handleOrderPress}
            onCustomerPress={(order) => handleCustomerPress(order.customerId)}
            searchQuery={searchQueryCommandes}
            setSearchQuery={setSearchQueryCommandes}
          />
        ) : (
          <ClientsList
            clients={filteredClients}
            onCustomerPress={handleCustomerPress}
            searchQuery={searchQueryClients}
            setSearchQuery={setSearchQueryClients}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// === COMMANDES LIST ===
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
  setSearchQuery: (q: string) => void;
}) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A36C" />
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16 }}>
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
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push("/(orders)/screen/NouvelleCommande")}
        >
          <Ionicons name="add" size={18} color="#00A36C" />
          <Text style={styles.newBtnText}>Nouvelle</Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Aucune commande trouvée" : "Aucune commande pour cette entreprise"}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1 }]}>#</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Client</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Date</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Art.</Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                <Text style={[styles.cell, { flex: 1 }]}>{item.code}</Text>
                <TouchableOpacity onPress={() => onCustomerPress(item.originalOrder)} style={{ flex: 2 }}>
                  <Text style={[styles.cell, styles.clickableText]}>{item.client}</Text>
                </TouchableOpacity>
                <Text style={[styles.cell, { flex: 2 }]}>{item.date}</Text>
                <Text style={[styles.cell, { flex: 1 }]}>{item.articles}</Text>
                <TouchableOpacity onPress={() => onOrderPress(item.originalOrder)} style={styles.eyeButton}>
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

// === CLIENTS LIST ===
function ClientsList({
  clients,
  onCustomerPress,
  searchQuery,
  setSearchQuery,
}: {
  clients: any[];
  onCustomerPress: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
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
          ) : null}
        </View>
      </View>

      {clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>Aucun client trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
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
                <TouchableOpacity onPress={() => onCustomerPress(item.id)}>
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
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
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
  },
  tab: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 20 },
  tabText: { fontWeight: "600", color: "#555", fontSize: 14 },
  activeTab: { backgroundColor: "#E8FFF1" },
  activeTabText: { color: "#00A36C", fontWeight: "600" },
  searchRow: { flexDirection: "row", marginVertical: 16, alignItems: "center" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F6F6F6",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginRight: 10,
  },
  newBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#00A36C",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  newBtnText: { color: "#00A36C", fontWeight: "600", marginLeft: 4 },
  tableHeader: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#E5E5E5" },
  headerCell: { fontWeight: "600", color: "#555", fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderColor: "#F2F2F2" },
  colorBar: { width: 4, height: 30, borderRadius: 2, marginRight: 10 },
  cell: { color: "#333", fontSize: 14 },
  clickableText: { color: "#00A36C", fontWeight: "600" },
  eyeButton: { padding: 8 },
  clientCard: { flexDirection: "row", backgroundColor: "#F9F9F9", borderRadius: 16, padding: 14, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  clientName: { fontWeight: "600", fontSize: 16, color: "#111" },
  clientEmail: { color: "#777", fontSize: 13 },
  clientStats: { marginTop: 8, gap: 4 },
  stat: { fontSize: 13, color: "#444" },
  bold: { fontWeight: "600", color: "#000" },
  detailsLink: { marginTop: 10, color: "#00A36C", fontWeight: "600", fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 },
  loadingText: { marginTop: 10, color: "#777" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 },
  emptyText: { color: "#777", marginTop: 12, textAlign: "center" },
});