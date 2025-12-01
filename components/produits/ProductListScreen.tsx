import React, { useEffect } from "react";
import { View, Text } from "react-native";

type ProductListScreenProps = {
  id: string;
};

const ProductListScreen: React.FC<ProductListScreenProps> = ({ id }) => {
  useEffect(() => {
    console.log("📦 ProductListScreen → id reçu :", id);
  }, [id]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Liste des produits (ID: {id})
      </Text>
    </View>
  );
};

export default ProductListScreen;
