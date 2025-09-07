// ProductOptionsSelector.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface Attribute {
  id: string;
  name: string;
  categoryId: string;
}
interface AttributeValue {
  id: string;
  value: string;
  attributeId: string;
  variantId: string;
  attribute: Attribute;
}
interface Variant {
  id: string;
  sku: string;
  price: string;
  quantityInStock: number;
  imageUrl: string;
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

  const selectedVariant = product.variants.find(
    (v) =>
      v.attributeValues.find((av) => av.attribute.name === "Taille")?.value ===
        selectedSize &&
      v.attributeValues.find((av) => av.attribute.name === "Couleur")?.value ===
        selectedColor
  );

  // notifier le parent dès que la variante change
  React.useEffect(() => {
    onVariantSelect(selectedVariant || null);
  }, [selectedSize, selectedColor]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Taille :</Text>
      <Picker
        selectedValue={selectedSize}
        onValueChange={(value) => setSelectedSize(value)}
      >
        <Picker.Item label="Sélectionnez une taille" value={null} />
        {sizes.map((size) => (
          <Picker.Item key={size} label={size} value={size} />
        ))}
      </Picker>

      <Text style={styles.label}>Couleur :</Text>
      <Picker
        selectedValue={selectedColor}
        onValueChange={(value) => setSelectedColor(value)}
      >
        <Picker.Item label="Sélectionnez une couleur" value={null} />
        {colors.map((color) => (
          <Picker.Item key={color} label={color} value={color} />
        ))}
      </Picker>

      {selectedVariant && (
        <Text style={styles.stock}>
          {selectedVariant.quantityInStock > 0
            ? `${selectedVariant.quantityInStock} en stock`
            : "Rupture de stock"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: "bold", marginTop: 16 },
  stock: { marginVertical: 10, fontWeight: "bold", color: "green" },
});

export default ProductOptionsSelector;
