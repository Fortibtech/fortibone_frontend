// screens/DeliveryRequestsScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  getIncomingDeliveryRequests,
  getActiveDeliveryRequests,
  acceptDelivery,
  rejectDeliveryRequest,
  completeDelivery,
  pickupDeliveryRequest, // ← Ajouté
  getBusinessVehicles,
  IncomingDeliveryRequest,
  Vehicle,
} from "@/api/delivery/deliveryApi";
import { SelectedBusinessManager } from "@/api";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";

type TabType = "INCOMING" | "ACTIVE";

export default function DeliveryRequestsScreen() {
  const [tab, setTab] = useState<TabType>("INCOMING");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<
    IncomingDeliveryRequest[]
  >([]);
  const [activeRequests, setActiveRequests] = useState<
    IncomingDeliveryRequest[]
  >([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal Acceptation avec choix véhicule
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [currentRequestToAccept, setCurrentRequestToAccept] =
    useState<IncomingDeliveryRequest | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );

  // Modal Validation livraison
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [validating, setValidating] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [deliveryCode, setDeliveryCode] = useState("");
  const business = useBusinessStore((state) => state.business);
    const [symbol, setSymbol] = useState<string | null>(null);
  // Modal Détails de la demande
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentRequestDetails, setCurrentRequestDetails] =
    useState<IncomingDeliveryRequest | null>(null);

  /* ===================== CHARGEMENT ===================== */
  const loadIncoming = async (id: string) => {
    try {
      const data = await getIncomingDeliveryRequests(id);
      setIncomingRequests(data);
    } catch (error) {
      console.error("Erreur incoming :", error);
    }
  };

  const loadActive = async (id: string) => {
    try {
      const data = await getActiveDeliveryRequests(id);
      setActiveRequests(data);
    } catch (error) {
      console.error("Erreur active :", error);
    }
  };

  useEffect(() => {
    const fetchSymbol = async () => {
      if (business) {
        const symbol = await getCurrencySymbolById(business.currencyId);
        setSymbol(symbol);
      }
    };
    fetchSymbol();
  }, [business]);
  const loadVehicles = async (id: string) => {
    try {
      const data = await getBusinessVehicles(id);
      setVehicles(data.filter((v) => v.isActive));
    } catch (error) {
      console.error("Erreur chargement véhicules :", error);
      setVehicles([]);
    }
  };

  const init = async () => {
    try {
      setLoading(true);
      const selectedBusiness =
        await SelectedBusinessManager.getSelectedBusiness();
      if (!selectedBusiness || selectedBusiness.type !== "LIVREUR") {
        Alert.alert(
          "Profil requis",
          "Sélectionne un profil livreur pour continuer."
        );
        return;
      }
      setBusinessId(selectedBusiness.id);
      await Promise.all([
        loadIncoming(selectedBusiness.id),
        loadActive(selectedBusiness.id),
        loadVehicles(selectedBusiness.id),
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const onRefresh = useCallback(async () => {
    if (!businessId) return;
    setRefreshing(true);
    await Promise.all([
      loadIncoming(businessId),
      loadActive(businessId),
      loadVehicles(businessId),
    ]);
    setRefreshing(false);
  }, [businessId]);

  /* ===================== ACCEPTATION ===================== */
  const openAcceptModal = (request: IncomingDeliveryRequest) => {
    if (vehicles.length === 0) {
      Alert.alert(
        "Aucun véhicule",
        "Ajoute d'abord un véhicule actif dans ton profil."
      );
      return;
    }
    setCurrentRequestToAccept(request);
    setSelectedVehicleId(null);
    setAcceptModalVisible(true);
  };

  const handleAcceptDelivery = async () => {
    if (!currentRequestToAccept || !selectedVehicleId) return;

    setActionLoadingId(currentRequestToAccept.id);
    setIncomingRequests((prev) =>
      prev.filter((r) => r.id !== currentRequestToAccept.id)
    );

    try {
      await acceptDelivery(currentRequestToAccept.id, selectedVehicleId);
      Alert.alert(
        "Succès",
        "Livraison acceptée ! Elle est maintenant en cours."
      );
      setAcceptModalVisible(false);
      setCurrentRequestToAccept(null);
      if (businessId) await loadActive(businessId);
    } catch (error: any) {
      setIncomingRequests((prev) => [currentRequestToAccept, ...prev]);
      const msg =
        error?.response?.data?.message || "Impossible d'accepter la livraison.";
      Alert.alert("Erreur", msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ===================== REFUS ===================== */
  const handleReject = async (request: IncomingDeliveryRequest) => {
    Alert.alert(
      "Refuser la demande",
      "Es-tu sûr de vouloir refuser cette livraison ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser",
          style: "destructive",
          onPress: async () => {
            setActionLoadingId(request.id);
            setIncomingRequests((prev) =>
              prev.filter((r) => r.id !== request.id)
            );

            try {
              await rejectDeliveryRequest(request.id);
            } catch (error) {
              setIncomingRequests((prev) => [request, ...prev]);
              Alert.alert("Erreur", "Impossible de refuser la demande.");
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  /* ===================== CONFIRMER RETRAIT ===================== */
  const handlePickup = async (requestId: string) => {
    Alert.alert(
      "Confirmer le retrait",
      "As-tu bien récupéré le colis chez le commerçant ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, j'ai le colis",
          onPress: async () => {
            setActionLoadingId(requestId);

            // Mise à jour optimiste
            setActiveRequests((prev) =>
              prev.map((r) =>
                r.id === requestId
                  ? ({ ...r, status: "PICKED_UP" } as IncomingDeliveryRequest)
                  : r
              )
            );

            try {
              await pickupDeliveryRequest(requestId);
              Alert.alert(
                "Succès",
                "Retrait confirmé ! En route vers le client 🚀"
              );
              if (businessId) await loadActive(businessId);
            } catch (error: any) {
              // Rollback
              setActiveRequests((prev) =>
                prev.map((r) =>
                  r.id === requestId ? { ...r, status: "ACTIVE" } : r
                )
              );
              const msg =
                error?.response?.data?.message ||
                "Impossible de confirmer le retrait.";
              Alert.alert("Erreur", msg);
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  /* ===================== VALIDATION LIVRAISON ===================== */
  const openCompleteModal = (requestId: string) => {
    setCurrentRequestId(requestId);
    setDeliveryCode("");
    setCompleteModalVisible(true);
  };

  const handleCompleteDelivery = async () => {
    if (!currentRequestId || !deliveryCode.trim()) {
      Alert.alert(
        "Code requis",
        "Entre le code de sécurité fourni par le client."
      );
      return;
    }

    setValidating(true);
    const previousActive = activeRequests;
    setActiveRequests(activeRequests.filter((r) => r.id !== currentRequestId));

    try {
      await completeDelivery(currentRequestId, {
        deliveryCode: deliveryCode.trim(),
      });
      Alert.alert(
        "Succès",
        "Livraison validée avec succès ! Merci pour ton travail 🚀"
      );
      setCompleteModalVisible(false);
      if (businessId) await loadActive(businessId);
    } catch (error: any) {
      setActiveRequests(previousActive);
      const msg =
        error?.response?.data?.message || "Code incorrect ou erreur serveur.";
      Alert.alert("Échec", msg);
    } finally {
      setValidating(false);
    }
  };

  /* ===================== DÉTAILS ===================== */
  const openDetailsModal = (request: IncomingDeliveryRequest) => {
    setCurrentRequestDetails(request);
    setDetailsModalVisible(true);
  };

  /* ===================== FORMATAGE ===================== */
  const formatDistance = (meters: number) => (meters / 1000).toFixed(1);
  const formatCost = (cost: string) => parseInt(cost).toLocaleString();

  const getFeePayerLabel = (payer: "SENDER" | "RECEIVER") =>
    payer === "SENDER" ? "Commerçant" : "Client";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "En attente", color: "#92400E", bg: "#FEF3C7" };
      case "ACTIVE":
        return { label: "Acceptée", color: "#1E40AF", bg: "#DBEAFE" };
      case "PICKED_UP":
        return { label: "Colis récupéré", color: "#166534", bg: "#DCFCE7" };
      default:
        return { label: status, color: "#666", bg: "#F3F4F6" };
    }
  };

  const getVehicleDisplayName = (vehicle: Vehicle) => {
    if (vehicle.name) return vehicle.name;
    return `${vehicle.brand} ${vehicle.model}`;
  };

  /* ===================== RENDER CARTE ===================== */
  const renderRequest = ({ item }: { item: IncomingDeliveryRequest }) => {
    const distanceKm = formatDistance(item.distanceMeters);
    const statusConfig = getStatusConfig(item.status);
    const isPending = item.status === "PENDING";
    const isActive = item.status === "ACCEPTED";
    const isPickedUp = item.status === "PICKED_UP";
    const isActionLoading = actionLoadingId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => isPending && openDetailsModal(item)}
        disabled={!isPending}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.senderRow}>
              {item.sender.logoUrl ? (
                <Image
                  source={{ uri: item.sender.logoUrl }}
                  style={styles.senderLogo}
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="storefront" size={24} color="#999" />
                </View>
              )}
              <View>
                <Text style={styles.senderName}>{item.sender.name}</Text>
                <Text style={styles.orderNumber}>
                  Commande #{item.order.orderNumber}
                </Text>
              </View>
            </View>

            <View
              style={[styles.statusChip, { backgroundColor: statusConfig.bg }]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="storefront-outline" size={18} color="#666" />
            <Text style={styles.addressText} numberOfLines={2}>
              {item.pickupAddress}
            </Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.addressText} numberOfLines={2}>
              {item.deliveryAddress}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={16} color="#444" />
              <Text style={styles.metaText}>{distanceKm} km</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={16} color="#444" />
              <Text style={styles.metaText}>
                {formatCost(item.estimatedCost)} {symbol}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="card-outline" size={16} color="#444" />
              <Text style={styles.metaText}>
                Payé par {getFeePayerLabel(item.feePayer)}
              </Text>
            </View>
          </View>

          {isPending && (
            <>
              <View style={styles.detailsHint}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#00A36C"
                />
                <Text style={styles.detailsHintText}>
                  Touche pour voir les détails
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(item)}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <Text style={styles.rejectText}>Refuser</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => openAcceptModal(item)}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color="#16A34A" />
                  ) : (
                    <Text style={styles.acceptText}>Accepter</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Bouton Confirmer retrait - seulement si ACTIVE */}
          {isActive && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.pickupBtn]}
              onPress={() => handlePickup(item.id)}
              disabled={isActionLoading}
            >
              <Ionicons name="bag-check-outline" size={20} color="#FFF" />
              <Text style={styles.pickupText}>
                Confirmer le retrait du colis
              </Text>
            </TouchableOpacity>
          )}

          {/* Bouton Valider livraison - seulement si PICKED_UP */}
          {isPickedUp && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={() => openCompleteModal(item.id)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFF"
              />
              <Text style={styles.completeText}>Valider la livraison</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A36C" />
          <Text style={styles.loadingText}>Chargement des demandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const data = tab === "INCOMING" ? incomingRequests : activeRequests;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "INCOMING" && styles.tabActive]}
          onPress={() => setTab("INCOMING")}
        >
          <Text
            style={[styles.tabText, tab === "INCOMING" && styles.tabTextActive]}
          >
            En attente ({incomingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "ACTIVE" && styles.tabActive]}
          onPress={() => setTab("ACTIVE")}
        >
          <Text
            style={[styles.tabText, tab === "ACTIVE" && styles.tabTextActive]}
          >
            En cours ({activeRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00A36C"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={
                tab === "INCOMING" ? "mail-open-outline" : "bicycle-outline"
              }
              size={80}
              color="#E0E0E0"
            />
            <Text style={styles.emptyTitle}>
              {tab === "INCOMING"
                ? "Aucune demande en attente"
                : "Aucune livraison en cours"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tab === "INCOMING"
                ? "Les nouvelles demandes apparaîtront ici."
                : "Une fois acceptée, tes courses seront listées ici."}
            </Text>
          </View>
        }
      />

      {/* Modal Choix Véhicule */}
      <Modal visible={acceptModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choisir un véhicule</Text>
                <TouchableOpacity onPress={() => setAcceptModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleOption,
                      selectedVehicleId === vehicle.id &&
                        styles.vehicleOptionSelected,
                    ]}
                    onPress={() => setSelectedVehicleId(vehicle.id)}
                  >
                    <Ionicons
                      name={
                        selectedVehicleId === vehicle.id
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={24}
                      color="#00A36C"
                    />
                    <Text style={styles.vehicleOptionText}>
                      {getVehicleDisplayName(vehicle)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setAcceptModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    !selectedVehicleId && styles.disabledButton,
                  ]}
                  onPress={handleAcceptDelivery}
                  disabled={!selectedVehicleId}
                >
                  <Text style={styles.confirmButtonText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Validation livraison */}
      <Modal visible={completeModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Valider la livraison</Text>
                <TouchableOpacity
                  onPress={() => !validating && setCompleteModalVisible(false)}
                  disabled={validating}
                >
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  Demande au client le code de sécurité à 4 chiffres.
                </Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Ex: 1234"
                  value={deliveryCode}
                  onChangeText={setDeliveryCode}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!validating}
                  autoFocus
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => !validating && setCompleteModalVisible(false)}
                  disabled={validating}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    validating && styles.disabledButton,
                  ]}
                  onPress={handleCompleteDelivery}
                  disabled={validating}
                >
                  {validating ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Valider</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Détails */}
      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setDetailsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Détails de la demande</Text>
                <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {currentRequestDetails && (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Commerçant</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Nom :</Text>
                        <Text style={styles.detailValue}>
                          {currentRequestDetails.sender.name}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Commande</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Numéro :</Text>
                        <Text style={styles.detailValue}>
                          #{currentRequestDetails.order.orderNumber}
                        </Text>
                      </View>
                      {currentRequestDetails.order.notes && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Notes :</Text>
                          <Text style={styles.detailValue}>
                            {currentRequestDetails.order.notes}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Retrait</Text>
                      <Text style={styles.detailValue}>
                        {currentRequestDetails.pickupAddress}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Livraison</Text>
                      <Text style={styles.detailValue}>
                        {currentRequestDetails.deliveryAddress}
                      </Text>
                      {currentRequestDetails.deliveryNotes && (
                        <>
                          <Text style={styles.detailLabel}>Instructions :</Text>
                          <Text style={styles.detailValue}>
                            {currentRequestDetails.deliveryNotes}
                          </Text>
                        </>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>
                        Informations
                      </Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Distance :</Text>
                        <Text style={styles.detailValue}>
                          {formatDistance(currentRequestDetails.distanceMeters)}{" "}
                          km
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Coût estimé :</Text>
                        <Text style={styles.detailValue}>
                          {formatCost(currentRequestDetails.estimatedCost)} {symbol}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          Frais payés par :
                        </Text>
                        <Text style={styles.detailValue}>
                          {getFeePayerLabel(currentRequestDetails.feePayer)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.rejectBtn]}
                  onPress={() => {
                    setDetailsModalVisible(false);
                    handleReject(currentRequestDetails!);
                  }}
                >
                  <Text style={styles.rejectText}>Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.acceptBtn]}
                  onPress={() => {
                    setDetailsModalVisible(false);
                    openAcceptModal(currentRequestDetails!);
                  }}
                >
                  <Text style={styles.acceptText}>Accepter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },

  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: { flex: 1, paddingVertical: 16, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#00A36C" },
  tabText: { fontSize: 16, color: "#666" },
  tabTextActive: { fontWeight: "700", color: "#00A36C" },

  listContent: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 12,
  },
  senderRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  senderLogo: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  senderName: { fontSize: 16, fontWeight: "600", color: "#111" },
  orderNumber: { fontSize: 13, color: "#666", marginTop: 2 },

  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "600" },

  addressRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 10 },
  addressText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#444",
    flex: 1,
    lineHeight: 20,
  },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaText: { marginLeft: 8, fontSize: 13, color: "#444", fontWeight: "500" },

  actionsRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  rejectBtn: { backgroundColor: "#FEE2E2", flex: 1 },
  acceptBtn: { backgroundColor: "#DCFCE7", flex: 1 },
  pickupBtn: { backgroundColor: "#2563EB" },
  completeBtn: { backgroundColor: "#00A36C" },
  rejectText: { color: "#DC2626", fontWeight: "600" },
  acceptText: { color: "#16A34A", fontWeight: "600" },
  pickupText: { color: "#FFF", fontWeight: "600", marginLeft: 8 },
  completeText: { color: "#FFF", fontWeight: "600", marginLeft: 8 },

  detailsHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  detailsHintText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#00A36C",
    fontWeight: "500",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#111", marginTop: 20 },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  detailsModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    flex: 1,
    maxHeight: "85%",
    justifyContent: "space-between",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111" },

  vehicleOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  vehicleOptionSelected: { backgroundColor: "#ECFDF5" },
  vehicleOptionText: { marginLeft: 12, fontSize: 16, color: "#111" },

  modalBody: { alignItems: "center" },
  modalSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 6,
    width: "100%",
    backgroundColor: "#F8F9FA",
    marginBottom: 20,
  },

  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#F3F4F6" },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#666" },
  confirmButton: { backgroundColor: "#00A36C" },
  confirmButtonText: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  disabledButton: { opacity: 0.7 },

  detailSection: { marginBottom: 20 },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  detailRow: { marginBottom: 8 },
  detailLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  detailValue: { fontSize: 16, color: "#111", lineHeight: 22 },
});
