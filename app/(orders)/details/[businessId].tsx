import { getBusinessOrders, updateOrderStatus } from "@/api/Orders";
import BackButton from "@/components/BackButton";
import { OrderResponse, UpdateOrderStatusPayload } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const BusinessOrders = () => {
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

  // ---------------------------
  // API: mise à jour du statut
  // ---------------------------
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: UpdateOrderStatusPayload["status"]
  ) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, {
        status: newStatus,
      });

      // Mettre à jour la liste localement
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

      Toast.show({
        type: "success",
        text1: "Succès",
        text2: `Statut mis à jour en "${newStatus}"`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: err.response?.data?.message || err.message,
      });
      console.error("🛑 Erreur updateOrderStatus:", err);
    }
  };

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
      console.error("🛑 Erreur lors de la récupération des commandes:", err);
    } finally {
      setIsLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [businessId]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchOrders(page + 1);
    }
  };

  const handleRefresh = () => {
    fetchOrders(1, true);
  };

  const handleOrderPress = (order: OrderResponse) => {
    router.push({
      pathname: "/order-details/[id]",
      params: { id: order.id.toString() },
    });
  };

  const getStatusStyle = (status: OrderResponse["status"]) => {
    switch (status) {
      case "PENDING":
        return { backgroundColor: "#F97316", text: "En attente" };
      case "COMPLETED":
        return { backgroundColor: "#059669", text: "Terminée" };
      case "CANCELLED":
      case "REFUNDED":
        return {
          backgroundColor: "#FF3B30",
          text: status === "CANCELLED" ? "Annulée" : "Remboursée",
        };
      default:
        return { backgroundColor: "#6B7280", text: status };
    }
  };

  // ---------------------------
  // Rendu d'une commande
  // ---------------------------
  const renderOrderItem = ({ item }: { item: OrderResponse }) => (
    <Animated.View
      entering={FadeInUp.delay(100 * orders.indexOf(item)).duration(300)}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => handleOrderPress(item)}
        accessibilityLabel={`Voir les détails de la commande ${item.orderNumber}`}
      >
        <View style={styles.orderDetails}>
          <Text style={styles.orderNumber}>Commande #{item.orderNumber}</Text>
          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderInfo}>Type: {item.type}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusStyle(item.status).backgroundColor,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusStyle(item.status).text}
              </Text>
            </View>
          </View>
          <Text style={styles.orderInfo}>
            Total: {parseFloat(item.totalAmount).toFixed(2)} €
          </Text>
          <Text style={styles.orderInfo}>
            Client: {item.customer?.firstName || "Inconnu"}
          </Text>
          <Text style={styles.orderInfo}>
            Date: {new Date(item.createdAt).toLocaleDateString("fr-FR")}
          </Text>
          {item.notes && (
            <Text style={styles.orderNotes}>Notes: {item.notes}</Text>
          )}

          {/* Boutons statut */}
          <View style={{ flexDirection: "row", marginTop: 8, gap: 10 }}>
            {/* {item.status !== "CONFIRMED" && (
              <TouchableOpacity
                style={[styles.statusAction, { backgroundColor: "#3B82F6" }]}
                onPress={() => handleUpdateStatus(item.id, "CONFIRMED")}
              >
                <Text style={styles.statusActionText}>Confirmer</Text>
              </TouchableOpacity>
            )} */}
            {item.status !== "CANCELLED" && (
              <TouchableOpacity
                style={[styles.statusAction, { backgroundColor: "#EF4444" }]}
                onPress={() => handleUpdateStatus(item.id, "CANCELLED")}
              >
                <Text style={styles.statusActionText}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#333" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>
        <Text style={styles.headerTitle}>Commandes de l&lsquo;entreprise</Text>
      </View>
      {orders.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Aucune commande trouvée</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            isLoading && !isRefreshing ? (
              <ActivityIndicator
                size="large"
                color="#059669"
                style={styles.loader}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
  },
  backButtonContainer: {
    position: "absolute",
    left: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 20, // Espacement entre le header et la liste
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  orderDetails: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  orderInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderInfo: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  orderNotes: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#4B5563",
    fontWeight: "500",
  },
  loader: {
    marginVertical: 20,
  },
  statusAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusActionText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default BusinessOrders;
