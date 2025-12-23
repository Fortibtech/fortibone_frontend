import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectedBusinessManager } from "@/api";
import Revenus from "@/components/Delivery/Revenus";
import ZoneTarifs from "@/components/Delivery/ZoneTarifs";
type TabType = "REVENU" | "TARIFS";

const DeliveryEarningsScreen: React.FC = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("REVENU");

  const init = async () => {
    try {
      setLoading(true);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      if (!selected || selected.type !== "LIVREUR") {
        Alert.alert(
          "Profil requis",
          "Sélectionne un profil livreur pour accéder aux revenus."
        );
        setLoading(false);
        return;
      }
      setBusinessId(selected.id);
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les revenus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A36C" />
          <Text style={styles.loadingText}>Chargement des revenus...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* === ONGLETS (identiques à DeliveryRequestsScreen) === */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "REVENU" && styles.tabActive]}
          onPress={() => setActiveTab("REVENU")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "REVENU" && styles.tabTextActive,
            ]}
          >
            Revenus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "TARIFS" && styles.tabActive]}
          onPress={() => setActiveTab("TARIFS")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "TARIFS" && styles.tabTextActive,
            ]}
          >
            Zone et tarifs
          </Text>
        </TouchableOpacity>
      </View>

      {/* === CONTENU === */}
      {activeTab === "REVENU" ? (
        <Revenus businessId={businessId} />
      ) : (
        <ZoneTarifs businessId={businessId} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },

  // === STYLE DES ONGLETS (copié/collevé et adapté depuis DeliveryRequestsScreen) ===
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#00A36C",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  tabTextActive: {
    fontWeight: "700",
    color: "#00A36C",
  },
});

export default DeliveryEarningsScreen;
