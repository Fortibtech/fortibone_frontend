// app/(delivery)/vehicles/index.tsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SelectedBusinessManager } from "@/api";
import { SafeAreaView } from "react-native-safe-area-context";
import Map from "@/components/Vehicule/Map";
import VehiclesData from "@/components/Vehicule/VehiclesData";

type TabType = "VEHICLES" | "MAP";

const Vehicles = () => {
  const [activeTab, setActiveTab] = useState<TabType>("VEHICLES");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* === ONGLETS (identiques à Revenus / Zone et tarifs) === */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "VEHICLES" && styles.tabActive]}
          onPress={() => setActiveTab("VEHICLES")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "VEHICLES" && styles.tabTextActive,
            ]}
          >
            Véhicules
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "MAP" && styles.tabActive]}
          onPress={() => setActiveTab("MAP")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "MAP" && styles.tabTextActive,
            ]}
          >
            Carte
          </Text>
        </TouchableOpacity>
      </View>

      {/* === CONTENU === */}
      {activeTab === "VEHICLES" ? (
        <VehiclesData businessId={businessId} />
      ) : (
        // === ONGLETS CARTE ===
        <Map businessId={businessId} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

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

  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  vehicleCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00A36C",
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginTop: 4,
  },
  vehiclePlate: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
  },
  defaultChip: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },

  vehicleMeta: {
    flexDirection: "row",
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#444",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#00A36C",
    fontWeight: "600",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#00A36C",
    borderStyle: "dashed",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#00A36C",
  },

  mapContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    marginTop: 24,
  },
  mapSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});

export default Vehicles;
