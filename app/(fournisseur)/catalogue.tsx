import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SelectedBusinessManager, Business } from "@/api";
import InventoryApp from "@/components/produits/InventoryApp";
import { ProductListScreen } from "@/components/produits/ProductListScreens";
const Produits = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "products">(
    "products"
  );
  const loadCurrentBusiness = useCallback(async () => {
    try {
      setLoading(true);
      const currentBusiness =
        await SelectedBusinessManager.getSelectedBusiness();

      console.log(
        "Produit - Current Business ID :",
        currentBusiness?.id || "aucune"
      );
      console.log(
        "Produit - Business Name :",
        currentBusiness?.name || "aucune"
      );

      setBusiness(currentBusiness);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'entreprise :", error);
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentBusiness();
  }, [loadCurrentBusiness]);

  useFocusEffect(
    useCallback(() => {
      loadCurrentBusiness();
    }, [loadCurrentBusiness])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#059669" />
      ) : business ? (
        <View style={styles.header}>
          {/* HEADER */}
          {/* ---------------- HEADER TABS ---------------- */}
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

          {/* ---------------- CONTENT ---------------- */}
          <View style={{ flex: 1 }}>
            {activeTab === "inventory" ? (
              <InventoryApp id={business.id} />
            ) : (
              <ProductListScreen />
            )}
          </View>
        </View>
      ) : (
        <Text style={styles.noBusiness}>Aucune entreprise sélectionnée</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fafafb",
    paddingTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111827",
  },

  tabsContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 10,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    width: 180,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#059669",
  },

  tabText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },

  tabTextActive: {
    color: "white",
  },

  noBusiness: {
    fontSize: 18,
    color: "#ef4444",
    textAlign: "center",
  },
});

export default Produits;
