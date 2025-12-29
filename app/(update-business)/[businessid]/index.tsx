import EditBusinessCommercant from "@/components/update/CommercantComponent";
import EditBusinessLivreur from "@/components/update/DeliveryComposant";
import EditBusinessFournisseur from "@/components/update/FournisseurComponent";
import EditBusinessRestaurateur from "@/components/update/RestaurateurComponent"; // ← Assure-toi que le nom correspond à ton fichier

import { useLocalSearchParams } from "expo-router";

import { StyleSheet, View, Text } from "react-native";

const Index = () => {
  const { businessId, type } = useLocalSearchParams<{
    businessId: string;
    type: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR" | "LIVREUR"; // ← LIVREUR ajouté
  }>();

  const renderComponent = () => {
    switch (type) {
      case "COMMERCANT":
        return <EditBusinessCommercant id={businessId} />;
      case "FOURNISSEUR":
        return <EditBusinessFournisseur id={businessId} />;
      case "RESTAURATEUR":
        return <EditBusinessRestaurateur id={businessId} />;
      case "LIVREUR":
        return <EditBusinessLivreur id={businessId} />;
      default:
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              Type de commerce inconnu : {type}
            </Text>
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderComponent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  fallbackText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});

export default Index;
