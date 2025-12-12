// app/(professionnel)/produits/index.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useBusinessStore } from "@/store/businessStore";
import InventoryApp from "@/components/produits/InventoryApp";
import { ProductListScreen } from "@/components/produits/ProductListScreens";

const Produits = () => {
  const business = useBusinessStore((state) => state.business);

  const [activeTab, setActiveTab] = useState<"inventory" | "products">(
    "products"
  );

  if (!business) {
    return (
      <View style={styles.center}>
        <Text style={styles.noBusiness}>Aucune entreprise sélectionnée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "products" && styles.tabActive,
          ]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.tabTextActive,
            ]}
          >
            Catalogue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "inventory" && styles.tabActive,
          ]}
          onPress={() => setActiveTab("inventory")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "inventory" && styles.tabTextActive,
            ]}
          >
            Inventaire
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENU */}
      <View style={{ flex: 1 }}>
        {activeTab === "inventory" ? (
          <InventoryApp id={business.id} />
        ) : (
          <ProductListScreen />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafb",
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafb",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 12,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  tabActive: {
    backgroundColor: "#059669",
  },
  tabText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  tabTextActive: {
    color: "white",
  },
  noBusiness: {
    fontSize: 18,
    color: "#ef4444",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default Produits;
