import { getMyOrders } from "@/api/Orders";
import BackButton from "@/components/BackButton";
import { MyOrder, MyOrdersResponse } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const YourOrders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  const LIMIT = 10;

  const fetchOrders = async (
    newPage: number = 1,
    isRefresh: boolean = false
  ) => {
    if (isLoading || (newPage > totalPages && !isRefresh)) return;

    try {
      setIsLoading(true);
      if (isRefresh) setIsRefreshing(true);

      const response: MyOrdersResponse = await getMyOrders({
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
        text2: err.message.includes("Transaction already closed")
          ? "Le serveur est surchargé. Veuillez réessayer plus tard."
          : err.response?.data?.message?.join?.(", ") || err.message,
      });
    } finally {
      setIsLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages) fetchOrders(page + 1);
  };

  const handleRefresh = () => fetchOrders(1, true);

  const handleOrderPress = (order: MyOrder) => {
    router.push({
      pathname: "/order-details/[id]",
      params: { id: order.id.toString() },
    });
  };

  // Statuts parfaitement clairs pour le client
  const getStatusStyle = (status: MyOrder["status"]) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          text: "En attente de paiement",
          color: "#F97316",
          bg: "#FFEDD5",
        };
      case "PENDING":
        return { text: "Nouvelle commande", color: "#EA580C", bg: "#FFF7C2" };
      case "CONFIRMED":
        return { text: "Confirmée", color: "#7C3AED", bg: "#EDE9FE" };
      case "PROCESSING":
        return { text: "En préparation", color: "#D97706", bg: "#FFFBEB" };
      case "SHIPPED":
        return { text: "Expédiée", color: "#2563EB", bg: "#DBEAFE" };
      case "DELIVERED":
        return { text: "Livrée", color: "#16A34A", bg: "#DCFCE7" };
      case "COMPLETED":
        return { text: "Terminée", color: "#059669", bg: "#D1FAE5" };
      case "CANCELLED":
        return { text: "Annulée", color: "#EF4444", bg: "#FECACA" };
      case "PAID":
        return { text: "Payée", color: "#059669", bg: "#D1FAE5" };
      case "REFUNDED":
        return { text: "Remboursée", color: "#6B7280", bg: "#E5E7EB" };
      default:
        return { text: status, color: "#6B7280", bg: "#F3F4F6" };
    }
  };

  const renderOrderItem = ({ item }: { item: MyOrder }) => {
    const status = getStatusStyle(item.status);

    return (
      <Animated.View
        entering={FadeInUp.delay(80).duration(400)}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={styles.orderItem}
          onPress={() => handleOrderPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.orderDetails}>
            <Text style={styles.orderNumber}>Commande #{item.orderNumber}</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.orderInfo}>
                Total :{" "}
                {parseFloat(item.totalAmount).toFixed(2).replace(".", ",")} KMF
              </Text>

              {/* Badge qui ressort clairement */}
              <View
                style={[styles.statusBadge, { backgroundColor: status.bg }]}
              >
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.text}
                </Text>
              </View>
            </View>

            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>

            {item.notes && (
              <Text style={styles.orderNotes} numberOfLines={2}>
                Note : {item.notes}
              </Text>
            )}
          </View>

          <Ionicons name="chevron-forward" size={26} color="#aaa" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>
        <Text style={styles.headerTitle}>Vos commandes</Text>
      </View>

      {orders.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={90} color="#ddd" />
          <Text style={styles.emptyTitle}>Aucune commande pour le moment</Text>
          <Text style={styles.emptySubtitle}>
            Elles apparaîtront ici dès que vous en passerez une
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.6}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            isLoading && page > 1 ? (
              <ActivityIndicator
                size="large"
                color="#00A36C"
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
  },
  backButtonContainer: { position: "absolute", left: 16, zIndex: 10 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1f2937" },

  listContent: { padding: 16 },

  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  orderDetails: { flex: 1 },

  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap", // s’adapte aux petits écrans
    gap: 6,
  },

  orderInfo: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    flexShrink: 1, // évite que le texte pousse le badge hors écran
  },

  orderDate: { fontSize: 13, color: "#6b7280" },

  orderNotes: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
    fontStyle: "italic",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
  },

  emptySubtitle: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
});

export default YourOrders;
