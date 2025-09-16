import { getOrderById } from "@/api/Orders";
import BackButton from "@/components/BackButton";
import { OrderResponse } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const fetchOrderDetails = async () => {
    if (!id || isLoading) return;

    try {
      setIsLoading(true);
      const response = await getOrderById(id as string);
      setOrder(response);
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
        setTimeout(() => fetchOrderDetails(), 1000);
        return;
      }

      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: err.message.includes("Transaction already closed")
          ? "Le serveur est surchargé. Veuillez réessayer plus tard ou contacter le support."
          : err.response?.data?.message?.join?.(", ") || err.message,
      });
      console.error("🛑 Erreur lors de la récupération des détails:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Déterminer le style du statut
  const getStatusStyle = (status: OrderResponse["status"]) => {
    switch (status) {
      case "PENDING":
        return { backgroundColor: "#F97316", text: "En cours" };
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

  const renderOrderLine = ({
    item,
    index,
  }: {
    item: OrderResponse["lines"][0];
    index: number;
  }) => (
    <Animated.View
      entering={FadeInUp.delay(100 * (index + 1)).duration(300)}
      layout={Layout.springify()}
    >
      <View style={styles.lineItem}>
        <Text style={styles.lineName}>
          {item.variant.product.name || "Produit"}
        </Text>
        <Text style={styles.lineInfo}>
          Quantité: {item.quantity} | Prix: {parseFloat(item.price).toFixed(2)}{" "}
          €
        </Text>
      </View>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#059669" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Commande introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>
        <Text style={styles.headerTitle}>Commande #{order.orderNumber}</Text>
      </View>
      <FlatList
        ListHeaderComponent={
          <Animated.View
            entering={FadeInUp.duration(300)}
            layout={Layout.springify()}
          >
            <View style={styles.orderDetails}>
              <Text style={styles.sectionTitle}>Détails de la commande</Text>
              <View style={styles.orderInfoContainer}>
                <Text style={styles.orderInfo}>Type: {order.type}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusStyle(order.status)
                        .backgroundColor,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusStyle(order.status).text}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderInfo}>
                Total: {parseFloat(order.totalAmount).toFixed(2)} €
              </Text>
              <Text style={styles.orderInfo}>
                Date: {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </Text>
              {order.notes && (
                <Text style={styles.orderInfo}>Notes: {order.notes}</Text>
              )}
              <Text style={styles.sectionTitle}>Client</Text>
              <Text style={styles.orderInfo}>
                Nom: {order.customer.firstName}
              </Text>
              <Text style={styles.sectionTitle}>Entreprise</Text>
              <Text style={styles.orderInfo}>Nom: {order.business.name}</Text>
              <Text style={styles.orderInfo}>
                Adresse: {order.business.address}
              </Text>
              <Text style={styles.sectionTitle}>Articles</Text>
            </View>
          </Animated.View>
        }
        data={order.lines}
        renderItem={renderOrderLine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  orderDetails: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  orderInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
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
  lineItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lineName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  lineInfo: {
    fontSize: 12,
    color: "#4B5563",
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 20, // Espacement entre le header et le contenu
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
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
});

export default OrderDetails;
