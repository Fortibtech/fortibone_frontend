// app/(app)/orders/[id].tsx

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
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { getOrderById, updateOrderStatus } from "@/api/Orders";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
import { useBusinessStore } from "@/store/businessStore";

import { OrderResponse } from "@/types/orders";
import {
  createDeliveryEstimate,
  createDeliveryRequest,
  EstimateOption,
  EstimateResponse,
} from "@/api/delivery/estimateApi";
import { getLivreurs, Livreur } from "@/api/delivery/getApi";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const INITIAL_PICKUP = {
  latitude: 4.0511,
  longitude: 9.7679,
};

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Livreur
  const [businesses, setBusinesses] = useState<Livreur[]>([]); // Pour compatibilité
  const [allLivreurs, setAllLivreurs] = useState<Livreur[]>([]); // Tous les livreurs
  const [loadingCarriers, setLoadingCarriers] = useState(true);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Recherche dans dropdown

  // Coordonnées
  const [pickupCoords] = useState(INITIAL_PICKUP);
  const [deliveryCoords, setDeliveryCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Modals
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const business = useBusinessStore((state) => state.business);
  const [symbol, setSymbol] = useState<string | null>(null);

  // Estimation
  const [estimating, setEstimating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [estimationResult, setEstimationResult] =
    useState<EstimateResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<EstimateOption | null>(
    null
  );

  // Création livraison
  const [creatingDelivery, setCreatingDelivery] = useState(false);

  // Adresses & payeur
  const [pickupAddress, setPickupAddress] = useState("Adresse du commerçant");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Adresse de livraison"
  );
  const [feePayer, setFeePayer] = useState<"SENDER" | "RECEIVER">("SENDER");

  /* ===================== CHARGEMENT DES LIVREURS DISPONIBLES ===================== */
  const loadCarriers = async () => {
    try {
      setLoadingCarriers(true);

      const response = await getLivreurs({
        limit: 100,
      });

      const carriers = response.data;

      setAllLivreurs(carriers);
      setBusinesses(carriers);

      if (carriers.length === 0) {
        Toast.show({
          type: "info",
          text1: "Aucun livreur disponible",
          text2: "Réessayez plus tard",
        });
        setSelectedCarrierId(null);
      } else {
        setSelectedCarrierId(carriers[0].id);
      }

      if (business?.currencyId) {
        const sym = await getCurrencySymbolById(business.currencyId);
        setSymbol(sym || "FCFA");
      }
    } catch (error: any) {
      console.error("Erreur chargement livreurs :", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les livreurs",
      });
      setAllLivreurs([]);
      setBusinesses([]);
      setSelectedCarrierId(null);
    } finally {
      setLoadingCarriers(false);
    }
  };

  /* ===================== CHARGEMENT COMMANDE ===================== */
  const fetchOrder = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await getOrderById(id);
      setOrder(response);

      if (response.deliveryLatitude && response.deliveryLongitude) {
        setDeliveryCoords({
          latitude: response.deliveryLatitude,
          longitude: response.deliveryLongitude,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger la commande",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCarriers();
    fetchOrder();
  }, [id]);

  const selectedCarrier = allLivreurs.find((b) => b.id === selectedCarrierId);

  /* ===================== ESTIMATION ===================== */
  const handleEstimate = async () => {
    if (!order || !selectedCarrierId || !deliveryCoords) {
      Toast.show({
        type: "error",
        text1: "Données manquantes",
        text2: "Sélectionne un livreur et définis le point de livraison",
      });
      return;
    }

    const payload = {
      pickupLat: pickupCoords.latitude,
      pickupLng: pickupCoords.longitude,
      deliveryLat: deliveryCoords.latitude,
      deliveryLng: deliveryCoords.longitude,
      carrierId: selectedCarrierId,
    };

    setEstimating(true);
    try {
      const result = await createDeliveryEstimate(payload);
      setEstimationResult(result);

      if (result.options.length > 0) {
        setSelectedOption(result.options[0]);
      }

      setModalVisible(true);

      Toast.show({
        type: "success",
        text1: "Estimation réussie",
        text2: `${result.distanceKm.toFixed(1)} km • ${
          result.options.length
        } option(s)`,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Échec estimation",
        text2: error.response?.data?.message || "Erreur serveur",
      });
    } finally {
      setEstimating(false);
    }
  };

  /* ===================== CRÉATION DEMANDE ===================== */
  const handleCreateDelivery = async () => {
    if (
      !order ||
      !selectedCarrierId ||
      !estimationResult ||
      !selectedOption ||
      !deliveryCoords
    ) {
      Toast.show({
        type: "error",
        text1: "Données incomplètes",
        text2: "Choisis un tarif",
      });
      return;
    }

    if (!pickupAddress.trim() || !deliveryAddress.trim()) {
      Toast.show({ type: "error", text1: "Adresses requises" });
      return;
    }

    setCreatingDelivery(true);

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
      estimatedCost: selectedOption.totalCost,
      feePayer,
      tariffId: selectedOption.tariffId,
    };

    try {
      const response = await createDeliveryRequest(payload);

      Toast.show({
        type: "success",
        text1: "Demande créée !",
        text2: `Code de suivi : ${response.deliveryCode}`,
      });

      setModalVisible(false);
      setEstimationResult(null);
      setSelectedOption(null);
    } catch (error: any) {
      const msg =
        error.response?.status === 409
          ? "Une demande existe déjà pour cette commande"
          : error.response?.data?.message || "Erreur lors de la création";

      Toast.show({ type: "error", text1: "Échec", text2: msg });
    } finally {
      setCreatingDelivery(false);
    }
  };

  /* ===================== UTILITAIRES ===================== */
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

  const handleStatusUpdate = async (newStatus: OrderResponse["status"]) => {
    if (!order || updating) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, { status: newStatus });
      setOrder({ ...order, ...updated, status: newStatus });
      Toast.show({ type: "success", text1: "Statut mis à jour" });
    } catch {
      Toast.show({ type: "error", text1: "Échec mise à jour statut" });
    } finally {
      setUpdating(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
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

        {/* Client & Statut */}
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

        {/* Infos rapides */}
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

        {/* Articles */}
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
                  {pu} {symbol}
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {totalLine} {symbol}
                </Text>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {total} {symbol}
            </Text>
          </View>
        </View>

        {/* Bloc Livraison */}
        {allLivreurs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Livraison</Text>

            <Text style={styles.infoLabel}>Choisir le livreur</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              disabled={loadingCarriers}
            >
              <Text style={styles.dropdownText} numberOfLines={1}>
                {selectedCarrier
                  ? selectedCarrier.name
                  : loadingCarriers
                  ? "Chargement..."
                  : "Sélectionner un livreur"}
              </Text>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un livreur..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />

                <ScrollView
                  style={styles.dropdownList}
                  keyboardShouldPersistTaps="handled"
                >
                  {allLivreurs
                    .filter((carrier) =>
                      carrier.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((carrier) => (
                      <TouchableOpacity
                        key={carrier.id}
                        style={[
                          styles.dropdownItem,
                          selectedCarrierId === carrier.id &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedCarrierId(carrier.id);
                          setSearchQuery("");
                          setDropdownOpen(false);
                        }}
                      >
                        <View style={styles.dropdownItemContent}>
                          <View style={styles.onlineIndicator}>
                            <View
                              style={[
                                styles.onlineDot,
                                {
                                  backgroundColor: carrier.isOnline
                                    ? "#16A34A"
                                    : "#9CA3AF",
                                },
                              ]}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedCarrierId === carrier.id &&
                                  styles.dropdownItemTextSelected,
                              ]}
                            >
                              {carrier.name}
                            </Text>
                            {carrier.averageRating > 0 && (
                              <Text style={styles.ratingText}>
                                ⭐ {carrier.averageRating.toFixed(1)} (
                                {carrier.reviewCount})
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}

                  {allLivreurs.filter((c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <Text style={styles.noResultText}>
                      Aucun livreur trouvé
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setMapVisible(true)}
            >
              <Ionicons name="map-outline" size={20} color="#2563EB" />
              <Text style={styles.mapButtonText}>
                Définir les points de récupération et livraison sur la carte
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.estimateBtn,
                (!selectedCarrierId || !deliveryCoords || estimating) &&
                  styles.estimateBtnDisabled,
              ]}
              onPress={handleEstimate}
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

        {/* Actions commande */}
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

      {/* Modal Carte */}
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
                    Centrer sur livraison
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
              title="Récupération"
              pinColor="#00A36C"
            />
            {deliveryCoords && (
              <Marker
                coordinate={deliveryCoords}
                title="Livraison"
                pinColor="#EF4444"
                draggable
                onDragEnd={(e) => setDeliveryCoords(e.nativeEvent.coordinate)}
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
                    text2: "Définis le point de livraison",
                  });
                  return;
                }
                Toast.show({ type: "success", text1: "Points enregistrés" });
                setMapVisible(false);
              }}
            >
              <Text style={styles.confirmMapText}>Confirmer les points</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal Estimation */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFixed}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Choisir une option de livraison
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {estimationResult && selectedCarrier && (
              <>
                <ScrollView
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 100,
                  }}
                >
                  <View style={styles.modalBody}>
                    <Text style={styles.carrierName}>
                      {selectedCarrier.name}
                    </Text>

                    <View style={styles.estimationRow}>
                      <Text style={styles.estimationLabel}>Distance</Text>
                      <Text style={styles.estimationValue}>
                        {estimationResult.distanceKm.toFixed(2)} km
                      </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Options disponibles</Text>

                    {estimationResult.options.length === 0 ? (
                      <Text
                        style={{
                          color: "#666",
                          textAlign: "center",
                          marginVertical: 20,
                        }}
                      >
                        Aucune option disponible pour ce trajet
                      </Text>
                    ) : (
                      estimationResult.options.map((option) => (
                        <TouchableOpacity
                          key={option.tariffId}
                          style={[
                            styles.optionCard,
                            selectedOption?.tariffId === option.tariffId &&
                              styles.optionCardSelected,
                          ]}
                          onPress={() => setSelectedOption(option)}
                        >
                          <View style={styles.optionHeader}>
                            <Text style={styles.optionName}>
                              {option.tariffName}
                            </Text>
                            <Text style={styles.optionVehicle}>
                              {option.vehicleType}
                            </Text>
                          </View>
                          <Text style={styles.optionPrice}>
                            {option.totalCost} {option.currency}
                          </Text>
                          {selectedOption?.tariffId === option.tariffId && (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#00A36C"
                              style={{
                                position: "absolute",
                                right: 12,
                                top: 12,
                              }}
                            />
                          )}
                        </TouchableOpacity>
                      ))
                    )}

                    <View style={styles.addressSection}>
                      <Text style={styles.sectionTitle}>Adresses</Text>
                      <Text style={styles.inputLabel}>Récupération</Text>
                      <TextInput
                        style={styles.addressInput}
                        value={pickupAddress}
                        onChangeText={setPickupAddress}
                        placeholder="Ex: 123 Rue Principale"
                        multiline
                      />

                      <Text style={styles.inputLabel}>Livraison</Text>
                      <TextInput
                        style={styles.addressInput}
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        placeholder="Ex: Appartement 4B"
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

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[
                      styles.createDeliveryBtn,
                      (!selectedOption || creatingDelivery) &&
                        styles.createDeliveryBtnDisabled,
                    ]}
                    onPress={handleCreateDelivery}
                    disabled={!selectedOption || creatingDelivery}
                  >
                    {creatingDelivery ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.createDeliveryText}>
                        Créer la demande de livraison
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
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
  infoLabel: { color: "#666", fontSize: 14 },
  infoValue: {
    color: "#333",
    fontWeight: "500",
    fontSize: 14,
    flexShrink: 1,
    textAlign: "right",
  },
  addressSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FAFAFA", // Légère distinction visuelle
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginHorizontal: -20, // Pour que le fond aille jusqu'aux bords du modal
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
  dropdownText: { fontSize: 15, color: "#333", fontWeight: "500", flex: 1 },

  // Nouveau dropdown avec recherche
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    maxHeight: 300,
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
  searchInput: {
    margin: 12,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    fontSize: 15,
  },
  dropdownList: { maxHeight: 240 },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemSelected: { backgroundColor: "#EFF6FF" },
  dropdownItemContent: { flexDirection: "row", alignItems: "center" },
  onlineIndicator: { marginRight: 12 },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  dropdownItemText: { fontSize: 15, color: "#333" },
  dropdownItemTextSelected: { color: "#2563EB", fontWeight: "600" },
  ratingText: { fontSize: 13, color: "#666", marginTop: 2 },
  noResultText: {
    textAlign: "center",
    padding: 20,
    color: "#999",
    fontStyle: "italic",
  },

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

  // Modal Carte
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

  // Modal Estimation
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentFixed: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    height: SCREEN_HEIGHT * 0.85,
    maxHeight: SCREEN_HEIGHT * 0.9,
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginTop: 24,
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

  createDeliveryBtn: {
    backgroundColor: "#00A36C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createDeliveryBtnDisabled: { backgroundColor: "#93C5FD", opacity: 0.7 },
  createDeliveryText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  optionCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  optionCardSelected: { borderColor: "#00A36C", backgroundColor: "#ECFDF5" },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionName: { fontSize: 16, fontWeight: "600", color: "#111" },
  optionVehicle: { fontSize: 14, color: "#666" },
  optionPrice: { fontSize: 18, fontWeight: "700", color: "#00A36C" },
});
