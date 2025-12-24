import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { X, Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Product } from "@/app/(inventory)/details/[businessId]";

interface StockReceptionModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  onValidate: (data: {
    quantity: number;
    receptionDate: Date;
    expirationDate: Date;
    lotNumber: string;
  }) => void;
  symbol: string;
}

export default function StockReceptionModal({
  visible,
  onClose,
  product,
  onValidate,
  symbol,
}: StockReceptionModalProps) {
  const [quantity, setQuantity] = useState(10);
  const [receptionDate, setReceptionDate] = useState(new Date());
  const [expirationDate, setExpirationDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [showReceptionPicker, setShowReceptionPicker] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);
  const [lotNumber, setLotNumber] = useState("#004");

  const handleValidate = () => {
    onValidate({
      quantity,
      receptionDate,
      expirationDate,
      lotNumber,
    });
    onClose();
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calcul du statut de stock
  const getStockStatus = (stock: number): "Faible" | "Moyen" | "Bon" => {
    if (stock <= 10) return "Faible";
    if (stock <= 50) return "Moyen";
    return "Bon";
  };

  const stockStatus = getStockStatus(product.quantityInStock);

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case "Faible":
        return { bg: "#FFF3E0", text: "#FF9800" };
      case "Moyen":
        return { bg: "#FFF9E6", text: "#FFC107" };
      case "Bon":
        return { bg: "#E8F5E9", text: "#4CAF50" };
      default:
        return { bg: "#F0F0F0", text: "#666" };
    }
  };

  const badgeColors = getStockBadgeColor(stockStatus);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerHandle} />
            <Text style={styles.headerTitle}>Réception de Stock</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Card */}
            <View style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={() => console.log("Image failed to load")}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={styles.phoneIcon} />
                  </View>
                )}
              </View>

              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View
                    style={[
                      styles.stockBadge,
                      { backgroundColor: badgeColors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockBadgeText,
                        { color: badgeColors.text },
                      ]}
                    >
                      {stockStatus}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sku}>SKU: {product.sku}</Text>

                <View style={styles.productDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Prix Unitaire</Text>
                    <Text style={styles.detailValue}>
                      {product.price} {symbol || ""}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stock Actuel</Text>
                    <Text style={styles.detailValue}>
                      {product.quantityInStock}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quantité reçue */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Quantité reçue <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10) || 0;
                    setQuantity(num);
                  }}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.unitLabel}>Unité(s)</Text>
              </View>
            </View>

            {/* Dates */}
            <View style={styles.datesContainer}>
              {/* Date de réception */}
              <View style={styles.dateField}>
                <Text style={styles.label}>
                  Date de réception <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowReceptionPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatDate(receptionDate)}
                  </Text>
                  <Calendar size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Date de péremption */}
              <View style={styles.dateField}>
                <Text style={styles.label}>
                  Date de péremption <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowExpirationPicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formatDate(expirationDate)}
                  </Text>
                  <Calendar size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Lot créé */}
            <View style={styles.lotInfo}>
              <Text style={styles.lotText}>Lot créé: {lotNumber}</Text>
            </View>

            {/* Date Pickers */}
            {showReceptionPicker && (
              <DateTimePicker
                value={receptionDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowReceptionPicker(false);
                  if (selectedDate) setReceptionDate(selectedDate);
                }}
              />
            )}

            {showExpirationPicker && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowExpirationPicker(false);
                  if (selectedDate) setExpirationDate(selectedDate);
                }}
              />
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidate}
            >
              <Text style={styles.validateButtonText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// === Styles (inchangés, juste corrigés) ===
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 0,
    flex: 1, // Ajouté
    justifyContent: "space-between", // Ajouté
  },
  header: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    position: "relative",
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  productImageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 100,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneIcon: {
    width: 30,
    height: 50,
    backgroundColor: "#BBB",
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  sku: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  productDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  changeProductButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeProductText: {
    color: "#00B87C",
    fontSize: 13,
    fontWeight: "500",
    marginRight: 4,
  },
  changeProductIcon: {
    color: "#00B87C",
    fontSize: 16,
    fontWeight: "600",
  },
  field: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  required: {
    color: "#FF5252",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#00B87C",
  },
  quantityInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 8,
  },
  unitLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  datesContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateText: {
    fontSize: 14,
    color: "#000",
  },
  lotInfo: {
    marginTop: 16,
    paddingVertical: 12,
  },
  lotText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  bottomActions: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  validateButton: {
    flex: 2,
    backgroundColor: "#00B87C",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  validateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
