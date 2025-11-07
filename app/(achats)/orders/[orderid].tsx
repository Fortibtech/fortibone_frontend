// app/(achats)/orders/[orderid]/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// === Types ===
interface OrderItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
  currentStock?: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  supplier: string;
  supplierCategory: string;
  status: "En cours" | "Réceptionnée" | "Annulée";
  items: OrderItem[];
  total: number;
}

// === Props (reçoit l'ID via route) ===


export default function OrderScreen() {
  const { orderid } = useLocalSearchParams<{ orderid: string }>();

  // === Données mock (à remplacer par API) ===
  const order: OrderDetails = {
    id: orderid || "1",
    orderNumber: "#CMD-2025-001",
    supplier: "iPhone Paris",
    supplierCategory: "Téléphones & Accessoires",
    status: "En cours",
    items: [
      {
        id: "1",
        product: "iPhone 14 Pro Max 256Go - Noir",
        quantity: 5,
        unitPrice: 1099,
        totalPrice: 5495,
        sku: "KP84562MAP",
        currentStock: 10,
      },
    ],
    total: 5495,
  };

  // === États locaux ===
  const [modalVisible, setModalVisible] = useState(false);
  const [quantityReceived, setQuantityReceived] = useState("5");

  // === Handlers ===
  const openReceptionModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const confirmReception = () => {
    console.log("Réception confirmée pour", quantityReceived, "unités");
    closeModal();
    // TODO: Appeler API de réception
  };

  return (
    <SafeAreaView style={styles.container} >
      <StatusBar barStyle="dark-content" />

      {/* ==================== HEADER ==================== */}
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

      {/* ==================== FOURNISSEUR ==================== */}
      <View style={styles.supplierCard}>
        <View style={styles.supplierHeader}>
          <View style={styles.supplierIcon}>
            <Ionicons name="logo-apple" size={28} color="#000" />
          </View>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{order.supplier}</Text>
            <Text style={styles.supplierCategory}>
              {order.supplierCategory}
            </Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusLabel}>Statut</Text>
          <Text
            style={[
              styles.statusValue,
              order.status === "En cours" && styles.statusPending,
            ]}
          >
            {order.status}
          </Text>
        </View>
      </View>

      {/* ==================== PRODUITS ==================== */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Produits commandés</Text>

        {/* En-tête tableau */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colProduct]}>Produit</Text>
          <Text style={[styles.th, styles.colQty]}>Qté</Text>
          <Text style={[styles.th, styles.colPU]}>P.U</Text>
          <Text style={[styles.th, styles.colTotal]}>Total</Text>
          <View style={styles.colAction} />
        </View>

        {/* Lignes */}
        {order.items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.td, styles.colProduct]} numberOfLines={2}>
              {item.product}
            </Text>
            <Text style={[styles.td, styles.colQty]}>x{item.quantity}</Text>
            <Text style={[styles.td, styles.colPU]}>
              {item.unitPrice.toLocaleString()} €
            </Text>
            <Text style={[styles.td, styles.colTotal]}>
              {item.totalPrice.toLocaleString()} XAF
            </Text>
            <TouchableOpacity style={styles.colAction}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Total général */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {order.total.toLocaleString()} €
          </Text>
        </View>
      </View>

      {/* ==================== ACTIONS ==================== */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={openReceptionModal}
        >
          <Text style={styles.confirmText}>Confirmer Réception</Text>
        </TouchableOpacity>
      </View>

      {/* ==================== MODAL RÉCEPTION ==================== */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.handle} />
              <Text style={styles.modalTitle}>Réception de Stock</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Produit */}
              {order.items.map((item) => (
                <View key={item.id} style={styles.productCard}>
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons name="phone-portrait" size={60} color="#000" />
                  </View>
                  <View style={styles.productDetails}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{item.product}</Text>
                      {item.currentStock! < 5 && (
                        <View style={styles.lowStockBadge}>
                          <Text style={styles.lowStockText}>Faible</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sku}>SKU: {item.sku}</Text>
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="pricetag-outline"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.infoLabel}>Prix unitaire :</Text>
                      <Text style={styles.infoValue}>{item.unitPrice} €</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="cube-outline" size={16} color="#666" />
                      <Text style={styles.infoLabel}>Stock actuel :</Text>
                      <Text style={styles.infoValue}>{item.currentStock}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Quantité */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Quantité reçue <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.quantityInput}>
                  <Text style={styles.plus}>Plus</Text>
                  <TextInput
                    style={styles.input}
                    value={quantityReceived}
                    onChangeText={setQuantityReceived}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Text style={styles.unit}>Unité(s)</Text>
                </View>
              </View>

              {/* Facture */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Facture <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity style={styles.uploadBox}>
                  <Ionicons name="document-outline" size={40} color="#999" />
                  <Text style={styles.uploadText}>Importer un fichier</Text>
                  <Text style={styles.uploadHint}>PDF, DOCX • Max 5 Mo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.batchInfo}>
                <Text style={styles.batchLabel}>
                  Lot créé :{" "}
                  <Text style={styles.batchNumber}>
                    #L{order.id.padStart(3, "0")}
                  </Text>
                </Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={confirmReception}
              >
                <Text style={styles.modalConfirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// === STYLES COHÉRENTS ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
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
  },
  supplierInfo: { flex: 1 },
  supplierName: { fontSize: 16, fontWeight: "600", color: "#000" },
  supplierCategory: { fontSize: 13, color: "#666" },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  statusLabel: { fontSize: 13, color: "#666" },
  statusValue: { fontSize: 13, fontWeight: "500", color: "#000" },
  statusPending: { color: "#F59E0B" },
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  td: { fontSize: 14, color: "#000" },
  colProduct: { flex: 2 },
  colQty: { width: 50, textAlign: "center" },
  colPU: { width: 70, textAlign: "right" },
  colTotal: { width: 90, textAlign: "right" },
  colAction: { width: 30, alignItems: "center" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#000" },
  totalAmount: { fontSize: 16, fontWeight: "600", color: "#000" },
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
  confirmText: { fontSize: 15, fontWeight: "600", color: "#FFF" },

  // Modal
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
  productDetails: { flex: 1 },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: { fontSize: 18, fontWeight: "600", color: "#000" },
  lowStockBadge: {
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockText: { fontSize: 12, color: "#F59E0B", fontWeight: "500" },
  sku: { fontSize: 14, color: "#666", marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    marginLeft: "auto",
  },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 14, color: "#333", marginBottom: 8, fontWeight: "500" },
  required: { color: "#EF4444" },
  quantityInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
  },
  plus: { fontSize: 20, color: "#666", marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#000" },
  unit: { fontSize: 14, color: "#999" },
  uploadBox: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  uploadText: { fontSize: 15, color: "#333", marginTop: 12, fontWeight: "500" },
  uploadHint: { fontSize: 13, color: "#999", marginTop: 4 },
  batchInfo: { marginBottom: 16 },
  batchLabel: { fontSize: 14, color: "#666" },
  batchNumber: { color: "#000", fontWeight: "600" },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
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
