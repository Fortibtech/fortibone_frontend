// components/VariantManagementModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Product, ProductVariant } from "@/api";

interface VariantManagementModalProps {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}

export const VariantManagementModal: React.FC<VariantManagementModalProps> = ({
  product,
  onClose,
  onSaved,
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>(
    product.variants || []
  );
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(
    new Set()
  );
  const [groupPrice, setGroupPrice] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const toggleVariantSelection = (variantId: string) => {
    setSelectedVariants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(variantId)) {
        newSet.delete(variantId);
      } else {
        newSet.add(variantId);
      }
      return newSet;
    });
  };

  const selectAllVariants = () => {
    const activeVariants = variants.filter((v) => v.quantityInStock > 0);
    setSelectedVariants(new Set(activeVariants.map((v) => v.id)));
  };

  const deselectAllVariants = () => {
    setSelectedVariants(new Set());
  };

  const handleApplyGroupPrice = () => {
    if (!groupPrice || selectedVariants.size === 0) {
      Alert.alert("Erreur", "Veuillez saisir un prix et sélectionner des variantes");
      return;
    }

    Alert.alert(
      "Appliquer le prix",
      `Voulez-vous appliquer ${groupPrice} KMF à ${selectedVariants.size} variante(s) ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Appliquer", onPress: confirmApplyGroupPrice },
      ]
    );
  };

  const confirmApplyGroupPrice = async () => {
    setIsApplying(true);
    // Ici, tu appellerais ton API pour mettre à jour les prix
    setTimeout(() => {
      setIsApplying(false);
      Alert.alert("Succès", "Prix appliqué avec succès");
      onSaved();
    }, 1000);
  };

  const handleSave = () => {
    onSaved();
  };

  const renderVariantRow = ({ item, index }: { item: ProductVariant; index: number }) => {
    const isActive = item.quantityInStock > 0;
    const isSelected = selectedVariants.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.variantRow, !isActive && styles.variantRowInactive]}
        onPress={() => isActive && toggleVariantSelection(item.id)}
        activeOpacity={0.7}
        disabled={!isActive}
      >
        <View
          style={[
            styles.variantIndicator,
            isActive && styles.variantIndicatorActive,
          ]}
        />

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => isActive && toggleVariantSelection(item.id)}
          disabled={!isActive}
        >
          {isSelected && isActive && (
            <View style={styles.checkboxChecked}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.variantInfo}>
          <Text style={styles.variantNumber}>{index + 1}</Text>
          <Text style={[styles.variantName, !isActive && styles.textInactive]}>
            {item.sku}
          </Text>
          <Text style={[styles.variantPrice, !isActive && styles.textInactive]}>
            {parseFloat(item.price).toLocaleString()}
          </Text>
          <Text style={[styles.variantSKU, !isActive && styles.textInactive]}>
            {item.barcode || "------"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const activeVariantsCount = variants.filter((v) => v.quantityInStock > 0).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Variantes</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>#</Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderCombinaison]}>
          Combinaison
        </Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderPrice]}>
          Prix (KMF)
        </Text>
        <Text style={[styles.tableHeaderText, styles.tableHeaderSKU]}>
          SKU Variante
        </Text>
      </View>

      {/* Variants List */}
      <FlatList
        data={variants}
        renderItem={renderVariantRow}
        keyExtractor={(item) => item.id}
        style={styles.variantsList}
        contentContainerStyle={styles.variantsListContent}
      />

      {/* Footer Info */}
      <View style={styles.footerInfo}>
        <Text style={styles.footerInfoText}>
          Variantes actif: {activeVariantsCount}/{variants.length} variantes
        </Text>
      </View>

      {/* Actions Groupées */}
      <View style={styles.groupActionsSection}>
        <Text style={styles.groupActionsTitle}>Actions Groupées</Text>

        <View style={styles.groupActionsRow}>
          <Text style={styles.groupActionsLabel}>Même prix pour tous</Text>
          <TouchableOpacity style={styles.selectAllButton} onPress={selectAllVariants}>
            <Text style={styles.selectAllButtonText}>Sélectionner tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceInputRow}>
          <TextInput
            style={styles.priceInput}
            placeholder="Entrez un prix"
            placeholderTextColor="#8B8B8B"
            value={groupPrice}
            onChangeText={setGroupPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyGroupPrice}
            disabled={isApplying || selectedVariants.size === 0}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#00D991" />
            ) : (
              <Text style={styles.applyButtonText}>Appliquer</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F7FA",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },

  // Table Header
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F7FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B8B8B",
    width: 40,
  },
  tableHeaderCombinaison: {
    flex: 1,
  },
  tableHeaderPrice: {
    width: 80,
  },
  tableHeaderSKU: {
    width: 120,
  },

  // Variants List
  variantsList: {
    flex: 1,
  },
  variantsListContent: {
    paddingBottom: 16,
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F7FA",
  },
  variantRowInactive: {
    opacity: 0.5,
  },
  variantIndicator: {
    width: 3,
    height: 40,
    backgroundColor: "#E8ECF0",
    borderRadius: 2,
    marginRight: 12,
  },
  variantIndicatorActive: {
    backgroundColor: "#00D991",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E8ECF0",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#00D991",
    alignItems: "center",
    justifyContent: "center",
  },
  variantInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  variantNumber: {
    fontSize: 14,
    color: "#8B8B8B",
    fontWeight: "600",
    width: 20,
  },
  variantName: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    flex: 1,
  },
  variantPrice: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    width: 80,
  },
  variantSKU: {
    fontSize: 13,
    color: "#8B8B8B",
    width: 120,
  },
  textInactive: {
    color: "#D1D5DB",
  },

  // Footer Info
  footerInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F7FA",
  },
  footerInfoText: {
    fontSize: 13,
    color: "#8B8B8B",
    textAlign: "right",
  },

  // Actions Groupées
  groupActionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FAFBFC",
    borderTopWidth: 1,
    borderTopColor: "#F5F7FA",
  },
  groupActionsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  groupActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  groupActionsLabel: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectAllButtonText: {
    fontSize: 14,
    color: "#00D991",
    fontWeight: "600",
  },
  priceInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF0",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1A1A1A",
  },
  applyButton: {
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#00D991",
    borderRadius: 10,
    minWidth: 100,
  },
  applyButtonText: {
    fontSize: 14,
    color: "#00D991",
    fontWeight: "600",
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F7FA",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#00D991",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});