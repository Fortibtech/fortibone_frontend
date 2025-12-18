import { getOrderById, updateOrderStatus } from "@/api/Orders";
import { BusinessesService } from "@/api";
import {
  createEstimation,
  DeliveryService,
  CreateEstimationPayload,
  DeliveryEstimationResponse,
} from "@/api/delivery/deliveryApi";
import { OrderResponse } from "@/types/orders";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  TextInput,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { CarrierOption } from "@/api/services/businessesService";

// Récupère la hauteur de l'écran pour adapter la modal
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Coordonnées par défaut du commerçant (point de récupération)
const INITIAL_PICKUP = {
  latitude: 4.0511,
  longitude: 9.7679,
};

export default function OrderDetails() {
  // === PARAMÈTRES DE LA ROUTE ===
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // === ÉTATS GÉNÉRAUX ===
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // === ÉTATS POUR LES LIVREURS ===
  const [businesses, setBusinesses] = useState<CarrierOption[]>([]);
  const [loadingCarriers, setLoadingCarriers] = useState(true);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // === ÉTATS POUR LES COORDONNÉES ===
  const [pickupCoords, setPickupCoords] = useState<{
    latitude: number;
    longitude: number;
  }>(INITIAL_PICKUP);
  const [deliveryCoords, setDeliveryCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // === ÉTATS POUR LES MODALS ===
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  // === ÉTATS POUR L'ESTIMATION ===
  const [estimating, setEstimating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [estimationResult, setEstimationResult] =
    useState<DeliveryEstimationResponse | null>(null);

  // === ÉTATS POUR LA CRÉATION DE LIVRAISON ===
  const [creatingDelivery, setCreatingDelivery] = useState(false);

  // === ÉTATS POUR LES ADRESSES ET LE PAYEUR ===
  const [pickupAddress, setPickupAddress] = useState("Adresse du commerçant");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Adresse de livraison"
  );
  const [feePayer, setFeePayer] = useState<"SENDER" | "RECEIVER">("SENDER");

  // === CHARGEMENT DES LIVREURS ===
  const loadInitialData = async () => {
    try {
      setLoadingCarriers(true);
      const all: CarrierOption[] = await BusinessesService.getCarriers();
      const carriers = all.filter((b) => b.type === "LIVREUR");
      setBusinesses(carriers);

      if (carriers.length > 0) {
        setSelectedCarrierId(carriers[0].id);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de charger les livreurs.");
    } finally {
      setLoadingCarriers(false);
    }
  };

  // === CHARGEMENT DES DÉTAILS DE LA COMMANDE ===
  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response: any = await getOrderById(id);
      setOrder(response);

      // Si la commande a déjà des coordonnées de livraison, on les charge
      if (response.deliveryLatitude && response.deliveryLongitude) {
        setDeliveryCoords({
          latitude: response.deliveryLatitude,
          longitude: response.deliveryLongitude,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger la commande",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    loadInitialData();
    fetchOrderDetails();
  }, [id]);

  // === LIVREUR SÉLECTIONNÉ ===
  const selectedCarrier = businesses.find((b) => b.id === selectedCarrierId);

  // === FONCTION : ESTIMER LA LIVRAISON ===
  const handleEstimateDelivery = async () => {
    if (!order || !selectedCarrierId || !deliveryCoords) {
      Toast.show({
        type: "error",
        text1: "Données manquantes",
        text2: "Veuillez sélectionner un livreur et définir les deux points",
      });
      return;
    }

    const payload: CreateEstimationPayload = {
      pickupLat: pickupCoords.latitude,
      pickupLng: pickupCoords.longitude,
      deliveryLat: deliveryCoords.latitude,
      deliveryLng: deliveryCoords.longitude,
      carrierId: selectedCarrierId,
    };

    setEstimating(true);
    try {
      const estimation = await createEstimation(payload);
      setEstimationResult(estimation);
      setModalVisible(true);

      Toast.show({
        type: "success",
        text1: "Estimation réussie",
        text2: `${estimation.totalCost} ${
          estimation.currency
        } • ${estimation.distanceKm.toFixed(1)} km`,
      });
    } catch (error: any) {
      console.error("❌ Erreur estimation:", error.message);
      Toast.show({
        type: "error",
        text1: "Échec",
        text2: error.message || "Impossible d’estimer le coût",
      });
    } finally {
      setEstimating(false);
    }
  };

  // === FONCTION : CRÉER LA DEMANDE DE LIVRAISON ===
  const handleCreateDeliveryRequest = async () => {
    if (!order || !selectedCarrierId || !estimationResult || !deliveryCoords) {
      Toast.show({
        type: "error",
        text1: "Données incomplètes",
        text2: "Veuillez d'abord estimer la livraison",
      });
      return;
    }

    if (!pickupAddress.trim() || !deliveryAddress.trim()) {
      Toast.show({
        type: "error",
        text1: "Adresses requises",
        text2: "Veuillez saisir les adresses de récupération et livraison",
      });
      return;
    }

    setCreatingDelivery(true);

    try {
      const payload = {
        orderId: order.id,
        carrierId: selectedCarrierId,
        pickupAddress: pickupAddress.trim(),
        pickupLat: pickupCoords.latitude,
        pickupLng: pickupCoords.longitude,
        deliveryAddress: deliveryAddress.trim(),
        deliveryLat: deliveryCoords.latitude,
        deliveryLng: deliveryCoords.longitude,
        distanceMeters: Math.round(estimationResult.distanceKm * 1000),
        estimatedCost: estimationResult.totalCost,
        feePayer: feePayer,
      };

      const deliveryRequest = await DeliveryService.createDeliveryRequest(
        payload
      );

      Toast.show({
        type: "success",
        text1: "Livraison demandée avec succès !",
        text2: `Code de suivi : ${deliveryRequest.deliveryCode}`,
      });

      setModalVisible(false);
    } catch (error: any) {
      console.error("❌ Erreur création livraison :", error);

      let message = "Échec de la création de la demande";
      if (error.response?.status === 409) {
        message = "Une demande de livraison existe déjà pour cette commande.";
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      Toast.show({
        type: "info",
        text1: "Action impossible",
        text2: message,
      });
    } finally {
      setCreatingDelivery(false);
    }
  };

  // === FONCTION : RECENTRER LA CARTE SUR LE POINT DE LIVRAISON ===
  const focusOnDelivery = () => {
    if (mapRef.current && deliveryCoords) {
      mapRef.current.animateToRegion(
        {
          latitude: deliveryCoords.latitude,
          longitude: deliveryCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  // === FORMATAGE DE DATE ===
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // === CONFIGURATION DES STATUTS DE COMMANDE ===
  const getStatusConfig = (status: OrderResponse["status"]) => {
    const map: Record<
      OrderResponse["status"],
      { text: string; color: string; bg: string }
    > = {
      PENDING_PAYMENT: {
        text: "En attente de paiement",
        color: "#F97316",
        bg: "#FFF7ED",
      },
      PENDING: { text: "Nouvelle commande", color: "#EA580C", bg: "#FFEDD5" },
      CONFIRMED: { text: "Confirmée", color: "#8B5CF6", bg: "#F5F3FF" },
      PROCESSING: { text: "En préparation", color: "#D97706", bg: "#FFFBEB" },
      SHIPPED: { text: "Expédiée", color: "#2563EB", bg: "#EFF6FF" },
      DELIVERED: { text: "Livrée", color: "#16A34A", bg: "#F0FDF4" },
      COMPLETED: { text: "Terminée", color: "#059669", bg: "#ECFDF5" },
      CANCELLED: { text: "Annulée", color: "#EF4444", bg: "#FEF2F2" },
      REFUNDED: { text: "Remboursée", color: "#6B7280", bg: "#F3F4F6" },
      PAID: { text: "Payée", color: "#059669", bg: "#D1FAE5" },
    };
    return map[status] || { text: status, color: "#666", bg: "#F3F4F6" };
  };

  // === MISE À JOUR DU STATUT DE LA COMMANDE ===
  const handleStatusUpdate = async (newStatus: OrderResponse["status"]) => {
    if (!order || updating) return;
    setUpdating(true);
    try {
      const updatedOrder = await updateOrderStatus(order.id, {
        status: newStatus as any,
      });
      const mergedOrder = {
        ...updatedOrder,
        customer: order.customer,
        business: order.business,
        lines: updatedOrder.lines || order.lines,
      };
      setOrder(mergedOrder as any);
      Toast.show({
        type: "success",
        text1: "Succès",
        text2: `Commande marquée comme ${getStatusConfig(
          newStatus
        ).text.toLowerCase()}`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Action impossible",
        text2: err.response?.data?.message || err.message || "Erreur inconnue",
      });
    } finally {
      setUpdating(false);
    }
  };

  // === ÉCRAN DE CHARGEMENT ===
  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A36C" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const total = parseFloat(order.totalAmount).toFixed(2).replace(".", ",");
  const statusConfig = getStatusConfig(order.status);

  // === RENDER PRINCIPAL ===
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* === HEADER === */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.cmdCode}>Commande #{order.orderNumber}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* === INFOS CLIENT ET STATUT === */}
        <View style={styles.clientCard}>
          <View style={styles.clientInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {order.customer.firstName[0]}
                {order.customer.lastName?.[0] || ""}
              </Text>
            </View>
            <View>
              <Text style={styles.clientLabel}>Client</Text>
              <Text style={styles.clientName}>
                {order.customer.firstName} {order.customer.lastName || ""}
              </Text>
            </View>
          </View>

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Statut</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
        </View>

        {/* === INFOS RAPIDES (date, table, notes) === */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          {order.tableNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Table</Text>
              <Text style={styles.infoValue}>N°{order.tableNumber}</Text>
            </View>
          )}
          {order.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* === LISTE DES ARTICLES === */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Articles commandés</Text>
          {order.lines.map((line) => {
            const pu = parseFloat(line.price).toFixed(2).replace(".", ",");
            const totalLine = (parseFloat(line.price) * line.quantity)
              .toFixed(2)
              .replace(".", ",");
            return (
              <View key={line.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2 }]}>
                  {line.variant?.name || "Article"}
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "center" }]}>
                  x{line.quantity}
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {pu} KMF
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {totalLine} KMF
                </Text>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total} KMF</Text>
          </View>
        </View>

        {/* === BLOC LIVRAISON === */}
        {businesses.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Livraison</Text>

            {/* Choix du livreur */}
            <Text style={styles.infoLabel}>Choisir le livreur</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              disabled={loadingCarriers}
            >
              <Text style={styles.dropdownText}>
                {selectedCarrier
                  ? selectedCarrier.name
                  : "Sélectionner un livreur"}
              </Text>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownList}>
                {businesses.map((carrier) => (
                  <TouchableOpacity
                    key={carrier.id}
                    style={[
                      styles.dropdownItem,
                      selectedCarrierId === carrier.id &&
                        styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCarrierId(carrier.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCarrierId === carrier.id &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {carrier.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Bouton carte */}
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setMapVisible(true)}
            >
              <Ionicons name="map-outline" size={20} color="#2563EB" />
              <Text style={styles.mapButtonText}>
                Définir les points de récupération et livraison sur la carte
              </Text>
            </TouchableOpacity>

            {/* Bouton estimation */}
            <TouchableOpacity
              style={[
                styles.estimateBtn,
                (!selectedCarrierId || !deliveryCoords || estimating) &&
                  styles.estimateBtnDisabled,
              ]}
              onPress={handleEstimateDelivery}
              disabled={!selectedCarrierId || !deliveryCoords || estimating}
            >
              {estimating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.estimateText}>Estimer la livraison</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* === ACTIONS CONFIRMER / ANNULER === */}
        <View style={styles.footer}>
          {order.status === "PENDING" && (
            <>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleStatusUpdate("CANCELLED")}
                disabled={updating}
              >
                <Text style={styles.cancelText}>
                  {updating ? "Annulation..." : "Annuler"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleStatusUpdate("CONFIRMED")}
                disabled={updating}
              >
                <Text style={styles.actionText}>
                  {updating ? "Confirmation..." : "Confirmer"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* === MODAL CARTE === */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => setMapVisible(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>
              Choisir les points de récupération et livraison
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              {deliveryCoords && (
                <TouchableOpacity
                  onPress={focusOnDelivery}
                  style={styles.focusButton}
                >
                  <Ionicons name="location" size={36} color="#FFFFFF" />
                  <Text style={styles.focusButtonText}>
                    Retrouver livraison
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setMapVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: pickupCoords.latitude,
              longitude: pickupCoords.longitude,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }}
            onPress={(e) => {
              if (!deliveryCoords) {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setDeliveryCoords({ latitude, longitude });
              }
            }}
          >
            <Marker
              coordinate={pickupCoords}
              title="Récupération du colis"
              draggable
              onDragEnd={(e) => setPickupCoords(e.nativeEvent.coordinate)}
              pinColor="#00A36C"
            />
            {deliveryCoords && (
              <Marker
                coordinate={deliveryCoords}
                title="Livraison"
                draggable
                onDragEnd={(e) => setDeliveryCoords(e.nativeEvent.coordinate)}
                pinColor="#EF4444"
              />
            )}
          </MapView>

          <View style={styles.mapFooter}>
            <Text style={styles.mapLegend}>
              🟢 Vert : Récupération • 🔴 Rouge : Livraison
            </Text>
            <TouchableOpacity
              style={styles.confirmMapBtn}
              onPress={() => {
                if (!deliveryCoords) {
                  Toast.show({
                    type: "error",
                    text1: "Point manquant",
                    text2: "Veuillez définir le point de livraison",
                  });
                  return;
                }
                Toast.show({
                  type: "success",
                  text1: "Points enregistrés",
                  text2: "Vous pouvez estimer la livraison",
                });
                setMapVisible(false);
              }}
            >
              <Text style={styles.confirmMapText}>Confirmer les points</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* === MODAL ESTIMATION - VERSION FINALE (scrollable + bouton fixe) === */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFixed}>
            {/* En-tête de la modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Estimation de livraison</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {estimationResult && selectedCarrier && (
              <>
                {/* Contenu scrollable - toute l'estimation + adresses */}
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 100,
                  }}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.modalBody}>
                    {/* Nom du livreur */}
                    <Text style={styles.carrierName}>
                      {selectedCarrier.name}
                    </Text>

                    {/* Distance et tarif */}
                    <View style={styles.estimationRow}>
                      <Text style={styles.estimationLabel}>Distance</Text>
                      <Text style={styles.estimationValue}>
                        {estimationResult.distanceKm.toFixed(2)} km
                      </Text>
                    </View>
                    <View style={styles.estimationRow}>
                      <Text style={styles.estimationLabel}>Tarif appliqué</Text>
                      <Text style={styles.estimationValue}>
                        {estimationResult.tariffName}
                      </Text>
                    </View>

                    {/* Détail du coût */}
                    <View style={styles.breakdown}>
                      <Text style={styles.breakdownTitle}>Détail du coût</Text>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Prix de base</Text>
                        <Text style={styles.breakdownValue}>
                          {estimationResult.costBreakdown.basePrice}{" "}
                          {estimationResult.currency}
                        </Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Prix par km</Text>
                        <Text style={styles.breakdownValue}>
                          {estimationResult.costBreakdown.pricePerKm}{" "}
                          {estimationResult.currency}
                        </Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Coût distance</Text>
                        <Text style={styles.breakdownValue}>
                          {estimationResult.costBreakdown.distanceCost}{" "}
                          {estimationResult.currency}
                        </Text>
                      </View>
                    </View>

                    {/* Total */}
                    <View style={styles.totalEstimation}>
                      <Text style={styles.totalEstimationLabel}>
                        Coût total livraison
                      </Text>
                      <Text style={styles.totalEstimationValue}>
                        {estimationResult.totalCost} {estimationResult.currency}
                      </Text>
                    </View>

                    {/* Adresses et choix du payeur */}
                    <View style={styles.addressSection}>
                      <Text style={styles.sectionTitle}>
                        Adresses de livraison
                      </Text>

                      <Text style={styles.inputLabel}>
                        Adresse de récupération
                      </Text>
                      <TextInput
                        style={styles.addressInput}
                        value={pickupAddress}
                        onChangeText={setPickupAddress}
                        placeholder="Ex: 123 Rue Principale, Douala"
                        multiline
                      />

                      <Text style={styles.inputLabel}>
                        Adresse de livraison
                      </Text>
                      <TextInput
                        style={styles.addressInput}
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        placeholder="Ex: Appartement 4B, Akwa"
                        multiline
                      />

                      <Text style={styles.sectionTitle}>
                        Qui paie les frais ?
                      </Text>
                      <View style={styles.feePayerButtons}>
                        <TouchableOpacity
                          style={[
                            styles.feeBtn,
                            feePayer === "SENDER" && styles.feeBtnSelected,
                          ]}
                          onPress={() => setFeePayer("SENDER")}
                        >
                          <Text
                            style={[
                              styles.feeBtnText,
                              feePayer === "SENDER" &&
                                styles.feeBtnTextSelected,
                            ]}
                          >
                            Commerçant
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.feeBtn,
                            feePayer === "RECEIVER" && styles.feeBtnSelected,
                          ]}
                          onPress={() => setFeePayer("RECEIVER")}
                        >
                          <Text
                            style={[
                              styles.feeBtnText,
                              feePayer === "RECEIVER" &&
                                styles.feeBtnTextSelected,
                            ]}
                          >
                            Client
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {/* Bouton toujours visible en bas */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[
                      styles.createDeliveryBtn,
                      creatingDelivery && styles.createDeliveryBtnDisabled,
                    ]}
                    onPress={handleCreateDeliveryRequest}
                    disabled={creatingDelivery}
                  >
                    {creatingDelivery ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.createDeliveryText}>
                        Créer une demande de livraison
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* === TOAST (à placer à la fin du render principal, pas ici mais dans App.tsx) === */}
      {/* <Toast /> doit être dans ton App.tsx pour fonctionner correctement */}
    </SafeAreaView>
  );
}

// === TOUS LES STYLES (avec les ajouts pour la modal) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backBtn: { padding: 6 },
  cmdCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
    textAlign: "center",
  },

  clientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  clientInfo: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00A36C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  clientLabel: { fontSize: 13, color: "#666" },
  clientName: { fontSize: 16, fontWeight: "600", color: "#111", flexShrink: 1 },
  statusBox: { alignItems: "flex-end", justifyContent: "center" },
  statusLabel: { fontSize: 13, color: "#666", marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-end",
  },
  statusText: { fontSize: 12, fontWeight: "600" },

  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 4,
    gap: 8,
  },
  infoLabel: { color: "#666", fontSize: 14, marginBottom: 6, marginTop: 8 },
  infoValue: {
    color: "#333",
    fontWeight: "500",
    fontSize: 14,
    flexShrink: 1,
    textAlign: "right",
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  td: { fontSize: 14, color: "#333" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalLabel: { fontSize: 18, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#00A36C" },

  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  dropdownText: { fontSize: 15, color: "#333", fontWeight: "500" },
  dropdownList: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemSelected: { backgroundColor: "#EFF6FF" },
  dropdownItemText: { fontSize: 15, color: "#333" },
  dropdownItemTextSelected: { color: "#2563EB", fontWeight: "600" },

  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  mapButtonText: { color: "#2563EB", fontWeight: "600", fontSize: 15 },

  estimateBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  estimateBtnDisabled: { backgroundColor: "#93C5FD" },
  estimateText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  footer: { marginHorizontal: 16, marginBottom: 40, gap: 12 },
  actionBtn: {
    backgroundColor: "#00A36C",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },

  addressSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  inputLabel: { fontSize: 14, color: "#666", marginBottom: 6, marginTop: 12 },
  addressInput: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: "top",
  },
  feePayerButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  feeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  feeBtnSelected: { backgroundColor: "#00A36C" },
  feeBtnText: { fontSize: 15, fontWeight: "600", color: "#666" },
  feeBtnTextSelected: { color: "#fff" },
  createDeliveryBtnDisabled: { backgroundColor: "#93C5FD", opacity: 0.7 },

  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mapTitle: { fontSize: 18, fontWeight: "700" },
  focusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 6,
  },
  focusButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  mapLegend: {
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    marginBottom: 12,
  },
  mapFooter: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  confirmMapBtn: {
    backgroundColor: "#00A36C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmMapText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  // === STYLES DE LA MODAL ESTIMATION (corrigés) ===
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentFixed: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    height: SCREEN_HEIGHT * 0.85, // 85% de la hauteur de l'écran
    maxHeight: SCREEN_HEIGHT * 0.9,
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  modalBody: { paddingTop: 10 },
  modalFooter: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  carrierName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00A36C",
    marginBottom: 16,
    textAlign: "center",
  },
  estimationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  estimationLabel: { fontSize: 15, color: "#666" },
  estimationValue: { fontSize: 15, fontWeight: "600", color: "#111" },
  breakdown: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  breakdownTitle: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  breakdownLabel: { color: "#666" },
  breakdownValue: { fontWeight: "500" },
  totalEstimation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalEstimationLabel: { fontSize: 18, fontWeight: "700" },
  totalEstimationValue: { fontSize: 20, fontWeight: "700", color: "#00A36C" },
  createDeliveryBtn: {
    backgroundColor: "#00A36C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createDeliveryText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
