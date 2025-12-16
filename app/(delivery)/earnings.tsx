import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectedBusinessManager } from "@/api";
import Revenus from "@/components/Delivery/Revenus";
import ZoneTarifs from "@/components/Delivery/ZoneTarifs";
import BackButtonAdmin from "@/components/Admin/BackButton";
const DeliveryEarningsScreen: React.FC = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"REVENU" | "TARIFS">("REVENU");
  const init = async () => {
    try {
      setLoading(true);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      if (!selected) {
        Alert.alert(
          "Aucun profil livreur",
          "Sélectionne un profil de livraison pour voir les revenus."
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
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.loadingText}>Chargement des revenus...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* === HEADER === */}
      <View style={styles.headerRow}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("REVENU")}
            style={[styles.tab, activeTab === "REVENU" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "REVENU" && styles.activeTabText,
              ]}
            >
              Revenus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("TARIFS")}
            style={[styles.tab, activeTab === "TARIFS" && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "TARIFS" && styles.activeTabText,
              ]}
            >
              Zone et tarifs
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === "REVENU" ? (
        <Revenus businessId={businessId} />
      ) : (
        <ZoneTarifs businessId={businessId} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  tabText: { fontWeight: "600", color: "#555", fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6b7280" },
  backBtn: { padding: 8 },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F5F7",
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 12,
    height: 40,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 0,
  },
  activeTab: { backgroundColor: "#E8FFF1" },
  activeTabText: { color: "#00A36C", fontWeight: "600" },
});

export default DeliveryEarningsScreen;
