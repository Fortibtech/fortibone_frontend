// app/(achats)/orders/[orderid]/index.tsx
"use client";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getOrderById,
  updateOrderStatus,
  type OrderResponse,
} from "@/api/Orders";

export default function OrderScreen() {
  const { orderid } = useLocalSearchParams<{ orderid: string }>();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantityReceived, setQuantityReceived] = useState("");
  const [receiving, setReceiving] = useState(false);

  // Chargement de la commande
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderid) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderById(orderid);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderid]);

  // Pré-remplir la quantité si une seule ligne
  useEffect(() => {
    if (order?.lines.length === 1) {
      setQuantityReceived(order.lines[0].quantity.toString());
    }
  }, [order]);

  const openReceptionModal = () => setModalVisible(true);

  // Annuler = fermer modale + retour à l'écran précédent
  const closeModalAndGoBack = () => {
    setModalVisible(false);
    setQuantityReceived("");
    router.back();
  };

  // Confirmation de réception
  const confirmReception = async () => {
    if (!order?.id) return;

    const qty = parseInt(quantityReceived, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide");
      return;
    }

    setReceiving(true);
    try {
      await updateOrderStatus(order.id, { status: "DELIVERED" });

      const updatedOrder = await getOrderById(order.id);
      setOrder(updatedOrder);

      Alert.alert(
        "Succès",
        order.status === "DELIVERED"
          ? "Cette commande est déjà marquée comme LIVRÉE"
          : "La commande a bien été marquée comme LIVRÉE",
        [{ text: "OK", onPress: () => setModalVisible(false) }]
      );
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "";

      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("delivered")
      ) {
        Alert.alert(
          "Information",
          "Cette commande a déjà été marquée comme livrée",
          [{ text: "OK", onPress: () => setModalVisible(false) }]
        );
      } else {
        Alert.alert(
          "Erreur",
          message || "Impossible de confirmer la réception"
        );
      }
    } finally {
      setReceiving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PROCESSING":
        return "#F59E0B";
      case "DELIVERED":
      case "COMPLETED":
        return "#00B87C";
      case "CANCELLED":
      case "REFUNDED":
        return "#EF4444";
      default:
        return "#666";
    }
  };

  const formatStatus = (status: string) =>
    status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

  // Écrans de chargement / erreur
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00B87C" />
          <Text style={styles.loadingText}>Chargement de la commande...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Commande introuvable</Text>
          <Text style={styles.errorMessage}>{error || "Erreur inconnue"}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.replace("/(tabs)/achats")}
          >
            <Text style={styles.retryText}>Retour aux commandes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* FOURNISSEUR */}
      <View style={styles.supplierCard}>
        <View style={styles.supplierHeader}>
          <View style={styles.supplierIcon}>
            {order.business.logoUrl ? (
              <Image
                source={{ uri: order.business.logoUrl }}
                style={styles.logo}
              />
            ) : (
              <Ionicons name="storefront" size={28} color="#666" />
            )}
          </View>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{order.business.name}</Text>
            <Text style={styles.supplierCategory}>
              {order.business.description || "Fournisseur"}
            </Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusLabel}>Statut</Text>
          <Text
            style={[
              styles.statusValue,
              { color: getStatusColor(order.status) },
            ]}
          >
            {formatStatus(order.status)}
          </Text>
        </View>
      </View>

      {/* PRODUITS */}
      <ScrollView style={styles.productsSection}>
        <Text style={styles.sectionTitle}>
          Produits commandés ({order.lines.length})
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colProduct]}>Produit</Text>
          <Text style={[styles.th, styles.colQty]}>Qté</Text>
          <Text style={[styles.th, styles.colPU]}>P.U</Text>
          <Text style={[styles.th, styles.colTotal]}>Total</Text>
        </View>

        {order.lines.map((line) => {
          const totalPrice = line.quantity * Number(line.price);
          return (
            <View key={line.id} style={styles.tableRow}>
              <Text style={[styles.td, styles.colProduct]} numberOfLines={2}>
                {line.variant.product.name}
                {line.variant.name !== "Default"
                  ? ` - ${line.variant.name}`
                  : ""}
              </Text>
              <Text style={[styles.td, styles.colQty]}>x{line.quantity}</Text>
              <Text style={[styles.td, styles.colPU]}>
                {Number(line.price).toLocaleString()} FCFA
              </Text>
              <Text style={[styles.td, styles.colTotal]}>
                {totalPrice.toLocaleString()} FCFA
              </Text>
            </View>
          );
        })}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {Number(order.totalAmount).toLocaleString()} FCFA
          </Text>
        </View>

        {order.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes :</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* ACTIONS PRINCIPALES */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={closeModalAndGoBack}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            order.status === "DELIVERED" && styles.confirmBtnDisabled,
          ]}
          onPress={openReceptionModal}
          disabled={order.status === "DELIVERED"}
        >
          <Text style={styles.confirmText}>
            {order.status === "DELIVERED"
              ? "Déjà livrée"
              : "Confirmer réception"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODALE RÉCEPTION */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModalAndGoBack}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.handle} />
              <Text style={styles.modalTitle}>Réception de Stock</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={closeModalAndGoBack}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {order.lines.map((line) => {
                const totalPrice = line.quantity * Number(line.price);
                return (
                  <View key={line.id} style={styles.productCard}>
                    <View style={styles.productImagePlaceholder}>
                      {line.variant.product.images?.[0] ? (
                        <Image
                          source={{ uri: line.variant.product.images[0] }}
                          style={styles.productImage}
                        />
                      ) : (
                        <Ionicons name="cube" size={50} color="#999" />
                      )}
                    </View>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName}>
                        {line.variant.product.name}
                        {line.variant.name !== "Default"
                          ? ` - ${line.variant.name}`
                          : ""}
                      </Text>
                      <Text style={styles.sku}>
                        SKU: {line.variant.sku || "N/A"}
                      </Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Prix unitaire :</Text>
                        <Text style={styles.infoValue}>
                          {Number(line.price).toLocaleString()} FCFA
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          Quantité commandée :
                        </Text>
                        <Text style={styles.infoValue}>{line.quantity}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total :</Text>
                        <Text style={styles.infoValue}>
                          {totalPrice.toLocaleString()} FCFA
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Quantité reçue <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.quantityInput}
                  value={quantityReceived}
                  onChangeText={setQuantityReceived}
                  keyboardType="numeric"
                  placeholder="Ex: 5"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Facture <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity style={styles.uploadBox}>
                  <Ionicons name="document-outline" size={40} color="#999" />
                  <Text style={styles.uploadText}>Importer un fichier</Text>
                  <Text style={styles.uploadHint}>
                    PDF, JPG, PNG • Max 5 Mo
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.batchInfo}>
                <Text style={styles.batchLabel}>
                  Lot créé :{" "}
                  <Text style={styles.batchNumber}>#L{order.id.slice(-4)}</Text>
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={closeModalAndGoBack}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  receiving && styles.modalConfirmDisabled,
                ]}
                onPress={confirmReception}
                disabled={receiving || order.status === "DELIVERED"}
              >
                {receiving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    {order.status === "DELIVERED"
                      ? "Déjà confirmée"
                      : "Confirmer la réception"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Tous les styles (inchangés)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  errorText: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 40,
    marginTop: 8,
  },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#00B87C",
    borderRadius: 8,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
  modalConfirmDisabled: { opacity: 0.6 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: { padding: 4 },
  orderNumber: { fontSize: 16, fontWeight: "600", color: "#000" },
  menuButton: { padding: 4 },
  supplierCard: { backgroundColor: "#FFFFFF", marginTop: 8, padding: 16 },
  supplierHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  supplierIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  logo: { width: 48, height: 48, borderRadius: 8 },
  supplierInfo: { flex: 1 },
  supplierName: { fontSize: 16, fontWeight: "600", color: "#000" },
  supplierCategory: { fontSize: 13, color: "#666" },
  statusBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  statusLabel: { fontSize: 13, color: "#666" },
  statusValue: { fontSize: 13, fontWeight: "600" },
  productsSection: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    padding: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  th: { fontSize: 12, color: "#666", fontWeight: "500" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  td: { fontSize: 14, color: "#000" },
  colProduct: { flex: 2 },
  colQty: { width: 60, textAlign: "center" },
  colPU: { width: 90, textAlign: "right" },
  colTotal: { width: 100, textAlign: "right", fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#000" },
  totalAmount: { fontSize: 18, fontWeight: "600", color: "#00B87C" },
  notes: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  notesLabel: { fontWeight: "600", marginBottom: 4 },
  notesText: { color: "#444" },
  actions: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#00B87C",
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#00B87C" },
  confirmBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#00B87C",
    alignItems: "center",
  },
  confirmBtnDisabled: { backgroundColor: "#999" },
  confirmText: { fontSize: 15, fontWeight: "600", color: "#FFF" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#000" },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: { padding: 20 },
  productCard: { flexDirection: "row", marginBottom: 24 },
  productImagePlaceholder: {
    width: 100,
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  productImage: { width: 100, height: 120, borderRadius: 12 },
  productDetails: { flex: 1 },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  sku: { fontSize: 13, color: "#666", marginBottom: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, color: "#000", fontWeight: "500" },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 14, color: "#333", marginBottom: 8, fontWeight: "500" },
  required: { color: "#EF4444" },
  quantityInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    textAlign: "center",
  },
  uploadBox: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  uploadText: { fontSize: 15, color: "#333", marginTop: 12, fontWeight: "500" },
  uploadHint: { fontSize: 13, color: "#999", marginTop: 4 },
  batchInfo: { marginBottom: 16, alignItems: "center" },
  batchLabel: { fontSize: 14, color: "#666" },
  batchNumber: { color: "#00B87C", fontWeight: "600" },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: "#00B87C" },
  modalConfirm: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#00B87C",
    alignItems: "center",
  },
  modalConfirmText: { fontSize: 15, fontWeight: "600", color: "#FFF" },
});
