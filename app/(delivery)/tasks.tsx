// app/(delivery)/tasks.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { SelectedBusinessManager } from "@/api";

type DeliveryStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "REJECTED";

interface DeliveryRequest {
  id: string;
  status: DeliveryStatus;
  orderId: string;
  pickupAddress: string;
  deliveryAddress: string;
  distanceMeters: number;
  estimatedCost: number;
  feePayer: "CLIENT" | "MERCHANT";
  createdAt: string;
}

const DeliveryTasksScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [incoming, setIncoming] = useState<DeliveryRequest[]>([]);
  const [active, setActive] = useState<DeliveryRequest[]>([]);
  const [tab, setTab] = useState<"INCOMING" | "ACTIVE">("INCOMING");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      if (!selected) {
        Alert.alert(
          "Aucun profil livreur",
          "Sélectionne un profil de livraison pour voir les demandes."
        );
        setLoading(false);
        return;
      }
      setBusinessId(selected.id);
      await loadData();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les demandes de livraison.");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // TODO: brancher sur tes vraies routes :
      //  - GET /delivery/requests/incoming
      //  - GET /delivery/requests/active
      // Pour l’instant, mock simple.
      const fakeIncoming: DeliveryRequest[] = [
        {
          id: "req_1",
          status: "PENDING",
          orderId: "CMD-1001",
          pickupAddress: "Restaurant Le Soleil, Centre-ville",
          deliveryAddress: "Quartier Lac, Immeuble Horizon",
          distanceMeters: 4800,
          estimatedCost: 1500,
          feePayer: "CLIENT",
          createdAt: new Date().toISOString(),
        },
      ];
      const fakeActive: DeliveryRequest[] = [
        {
          id: "req_2",
          status: "PICKED_UP",
          orderId: "CMD-1000",
          pickupAddress: "Fournisseur Express, Zone Nord",
          deliveryAddress: "Résidence Palmier, Bloc B",
          distanceMeters: 7200,
          estimatedCost: 2200,
          feePayer: "MERCHANT",
          createdAt: new Date().toISOString(),
        },
      ];
      setIncoming(fakeIncoming);
      setActive(fakeActive);
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de rafraîchir les demandes.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAccept = async (id: string) => {
    try {
      // TODO: PATCH /delivery/requests/{id}/accept
      Alert.alert("Succès", "Course acceptée.");
      await loadData();
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'accepter cette course.");
    }
  };

  const handleReject = async (id: string) => {
    Alert.alert(
      "Refuser la course",
      "Es-tu sûr de vouloir refuser cette demande ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: PATCH /delivery/requests/{id}/reject
              Alert.alert("Info", "Course refusée.");
              await loadData();
            } catch (e) {
              Alert.alert("Erreur", "Impossible de refuser la course.");
            }
          },
        },
      ]
    );
  };

  const handlePickup = async (id: string) => {
    try {
      // TODO: PATCH /delivery/requests/{id}/pickup
      Alert.alert("Succès", "Colis récupéré. Statut mis à jour.");
      await loadData();
    } catch (e) {
      Alert.alert("Erreur", "Impossible de confirmer la récupération.");
    }
  };

  const handleComplete = async (id: string) => {
    // Ici tu pourras ouvrir un modal pour saisir le code
    Alert.alert(
      "Valider la livraison",
      "Plus tard : saisir le code de livraison et appeler l’API /complete."
    );
  };

  const km = (m: number) => (m / 1000).toFixed(1);

  const renderChipStatus = (status: DeliveryStatus) => {
    let label = "";
    let bg = "";
    let color = "#111827";

    switch (status) {
      case "PENDING":
        label = "En attente";
        bg = "#FEF3C7";
        break;
      case "ACCEPTED":
        label = "Acceptée";
        bg = "#DBEAFE";
        break;
      case "PICKED_UP":
        label = "En livraison";
        bg = "#DCFCE7";
        break;
      case "DELIVERED":
        label = "Livrée";
        bg = "#E5E7EB";
        break;
      case "REJECTED":
        label = "Refusée";
        bg = "#FEE2E2";
        break;
      default:
        label = status;
        bg = "#E5E7EB";
    }

    return (
      <View style={[styles.statusChip, { backgroundColor: bg }]}>
        <Text style={[styles.statusChipText, { color }]}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: DeliveryRequest }) => {
    const distanceKm = km(item.distanceMeters);
    const payerLabel =
      item.feePayer === "CLIENT"
        ? "Frais payés par le client"
        : "Frais payés par le commerçant";

    const isPending = item.status === "PENDING";
    const isPicked = item.status === "PICKED_UP";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/(delivery)/request-details" as any,
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.orderId}</Text>
          {renderChipStatus(item.status)}
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="storefront-outline" size={18} color="#6b7280" />
          <Text style={styles.cardText} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={18} color="#6b7280" />
          <Text style={styles.cardText} numberOfLines={1}>
            {item.deliveryAddress}
          </Text>
        </View>

        <View style={styles.cardMetaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="navigate-outline" size={14} color="#4b5563" />
            <Text style={styles.metaChipText}>{distanceKm} km</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="cash-outline" size={14} color="#4b5563" />
            <Text style={styles.metaChipText}>
              {item.estimatedCost.toLocaleString()} KMF
            </Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="person-outline" size={14} color="#4b5563" />
            <Text style={styles.metaChipText}>{payerLabel}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {isPending && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectBtn]}
                onPress={() => handleReject(item.id)}
              >
                <Text style={styles.actionButtonText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptBtn]}
                onPress={() => handleAccept(item.id)}
              >
                <Text style={styles.actionButtonText}>Accepter</Text>
              </TouchableOpacity>
            </>
          )}

          {!isPending && !isPicked && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryBtn]}
              onPress={() => handlePickup(item.id)}
            >
              <Text style={styles.actionButtonText}>Je récupère le colis</Text>
            </TouchableOpacity>
          )}

          {isPicked && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryBtn]}
              onPress={() => handleComplete(item.id)}
            >
              <Text style={styles.actionButtonText}>Valider la livraison</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const data = tab === "INCOMING" ? incoming : active;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.loadingText}>Chargement des courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Courses</Text>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tab === "INCOMING" && styles.tabActive]}
          onPress={() => setTab("INCOMING")}
        >
          <Text
            style={[styles.tabText, tab === "INCOMING" && styles.tabTextActive]}
          >
            En attente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "ACTIVE" && styles.tabActive]}
          onPress={() => setTab("ACTIVE")}
        >
          <Text
            style={[styles.tabText, tab === "ACTIVE" && styles.tabTextActive]}
          >
            En cours
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C851"]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons
              name={
                tab === "INCOMING" ? "mail-open-outline" : "bicycle-outline"
              }
              size={60}
              color="#E0E0E0"
            />
            <Text style={styles.emptyTitle}>
              {tab === "INCOMING"
                ? "Aucune demande en attente"
                : "Aucune livraison en cours"}
            </Text>
            <Text style={styles.emptyText}>
              Les nouvelles demandes apparaîtront ici dès qu&apos;elles seront
              disponibles.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6b7280" },

  headerBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    margin: 16,
    borderRadius: 999,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  tabTextActive: { color: "#111827", fontWeight: "700" },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },

  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChipText: { fontSize: 12, fontWeight: "600" },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  cardText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#4b5563",
    flex: 1,
  },

  cardMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaChipText: { marginLeft: 4, fontSize: 11, color: "#4b5563" },

  actionsRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  rejectBtn: { backgroundColor: "#FEE2E2" },
  acceptBtn: { backgroundColor: "#DCFCE7" },
  primaryBtn: { backgroundColor: "#00C851" },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  empty: {
    paddingTop: 60,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#111827",
  },
  emptyText: { fontSize: 13, color: "#6b7280", textAlign: "center" },
});

export default DeliveryTasksScreen;
