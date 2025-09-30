import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const handleSelectVariant = (variant: string) => {
    setSelectedVariant(variant);
    setShowVariantModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Détails du produit</Text>
      </View>

      <ScrollView>
        {/* Info produit */}
        <View style={styles.productCard}>
          <Text style={styles.productTitle}>Nom du produit</Text>
          <Text style={styles.productDescription}>
            Description courte du produit. Caractéristiques principales mises
            en avant.
          </Text>
          <Text style={styles.productPrice}>50 000 FCFA</Text>
        </View>

        {/* Choix de variante */}
        <View style={styles.variantContainer}>
          <Text style={styles.variantLabel}>Variante :</Text>
          <TouchableOpacity
            style={styles.variantButton}
            onPress={() => setShowVariantModal(true)}
          >
            <Text style={styles.variantButtonText}>
              {selectedVariant || "Choisir une variante"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#374151" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal variantes */}
      <Modal
        transparent
        animationType="slide"
        visible={showVariantModal}
        onRequestClose={() => setShowVariantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir une variante</Text>
            {["Rouge", "Bleu", "Vert"].map((variant) => (
              <Pressable
                key={variant}
                style={styles.variantOption}
                onPress={() => handleSelectVariant(variant)}
              >
                <Text style={styles.variantOptionText}>{variant}</Text>
              </Pressable>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVariantModal(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: "#111827",
  },
  productCard: {
    padding: 16,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  productDescription: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  productPrice: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
  variantContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  variantButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  variantButtonText: {
    color: "#374151",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    marginHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },
  variantOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  variantOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
