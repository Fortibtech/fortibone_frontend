import EditBusinessCommercant from "@/components/update/CommercantComponent";
import EditBusinessFournisseur from "@/components/update/FournisseurComponent";
import RestaurateurComponent from "@/components/update/RestaurateurComponent";
import { useLocalSearchParams } from "expo-router";

import { StyleSheet, View, Text } from "react-native";

const Index = () => {
  const { businessId, type } = useLocalSearchParams<{
    businessId: string;
    type: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
  }>();

  const renderComponent = () => {
    switch (type) {
      case "COMMERCANT":
        return <EditBusinessCommercant id={businessId} />;
      case "FOURNISSEUR":
        return <EditBusinessFournisseur id={businessId} />;
      case "RESTAURATEUR":
        return <RestaurateurComponent id={businessId} />;
      default:
        return <Text>Type inconnu</Text>;
    }
  };

  return <View style={styles.container}>{renderComponent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default Index;
