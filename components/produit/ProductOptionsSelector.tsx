// ProductOptionsSelector.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AttributeValue {
  attribute: { name: string };
  value: string;
}
interface Variant {
  id: string;
  price: string;
  quantityInStock: number;
  attributeValues: AttributeValue[];
}
interface Product {
  id: string;
  name: string;
  variants: Variant[];
}

interface Props {
  product: Product;
  onVariantSelect: (variant: Variant | null) => void;
}

const ProductOptionsSelector: React.FC<Props> = ({
  product,
  onVariantSelect,
}) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const sizes = Array.from(
    new Set(
      product.variants
        .map(
          (v) =>
            v.attributeValues.find((av) => av.attribute.name === "Taille")
              ?.value
        )
        .filter(Boolean)
    )
  );

  const colors = Array.from(
    new Set(
      product.variants
        .map(
          (v) =>
            v.attributeValues.find((av) => av.attribute.name === "Couleur")
              ?.value
        )
        .filter(Boolean)
    )
  );

  const selectedVariant = product.variants.find((v) => {
    const sizeMatch =
      !selectedSize ||
      v.attributeValues.find((av) => av.attribute.name === "Taille")?.value ===
        selectedSize;
    const colorMatch =
      !selectedColor ||
      v.attributeValues.find((av) => av.attribute.name === "Couleur")?.value ===
        selectedColor;
    return sizeMatch && colorMatch;
  });

  const handleConfirm = () => {
    onVariantSelect(selectedVariant || null);
    setModalVisible(false);
  };

  const displayText =
    selectedSize && selectedColor
      ? `${selectedSize} • ${selectedColor}`
      : selectedSize
      ? selectedSize
      : selectedColor
      ? selectedColor
      : "Choisir les options";

  return (
    <>
      {/* Bouton principal */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.triggerText}>{displayText}</Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      {/* Bottom Sheet 60% de l'écran */}
      <Modal visible={modalVisible} transparent animationType="slide">
        {/* Fond semi-transparent */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />

        {/* Contenu qui prend 60% */}
        <View
          style={[
            styles.modalWrapper,
            { height: SCREEN_HEIGHT * 0.6, paddingBottom: insets.bottom },
          ]}
        >
          <SafeAreaView style={styles.modalContent}>
            {/* Barre de traction */}
            <View style={styles.dragHandle} />

            <Text style={styles.title}>Sélectionner les options</Text>

            {/* Taille */}
            {sizes.length > 0 && (
              <View style={styles.pickerBlock}>
                <Text style={styles.label}>Taille</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedSize}
                    onValueChange={setSelectedSize}
                  >
                    <Picker.Item label="Choisir une taille" value={null} />
                    {sizes.map((s) => (
                      <Picker.Item key={s} label={s!} value={s!} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Couleur */}
            {colors.length > 0 && (
              <View style={styles.pickerBlock}>
                <Text style={styles.label}>Couleur</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedColor}
                    onValueChange={setSelectedColor}
                  >
                    <Picker.Item label="Choisir une couleur" value={null} />
                    {colors.map((c) => (
                      <Picker.Item key={c} label={c!} value={c!} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Stock */}
            {selectedVariant && (
              <Text
                style={[
                  styles.stock,
                  selectedVariant.quantityInStock === 0 && styles.outOfStock,
                ]}
              >
                {selectedVariant.quantityInStock > 0
                  ? `${selectedVariant.quantityInStock} en stock`
                  : "Rupture de stock"}
              </Text>
            )}

            {/* Bouton Confirmer */}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmer la sélection</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  triggerText: { fontSize: 16, color: "#111", fontWeight: "500" },
  chevron: { fontSize: 14, color: "#888" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#111",
  },

  pickerBlock: { marginBottom: 16 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  stock: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#16a34a",
  },
  outOfStock: { color: "#e11d48" },

  confirmBtn: {
    marginTop: "auto",
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default ProductOptionsSelector;
