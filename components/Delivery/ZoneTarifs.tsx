// components/Delivery/ZoneTarifs.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  getTariffs,
  getBusinessVehicles,
  VehicleType,
  Vehicle,
} from "@/api/delivery/deliveryApi";
import {
  createTariff,
  deleteTariff,
  Tariff,
  updateTariff,
} from "@/api/delivery/ariffApi";

interface Props {
  businessId: string | null;
  currency?: string | null;
}

const ZoneTarifs = ({ businessId, currency }: Props) => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [error, setError] = useState(false);

  // Modal Ajout
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    basePrice: "",
    pricePerKm: "",
    minDistance: "",
    maxDistance: "",
    vehicleType: null as VehicleType | null,
  });

  // Modal Modification
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentTariff, setCurrentTariff] = useState<Tariff | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    basePrice: "",
    pricePerKm: "",
    minDistance: "",
    maxDistance: "",
    vehicleType: null as VehicleType | null,
  });

  // Chargement des tarifs
  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    const fetchTariffs = async () => {
      try {
        setLoading(true);
        setError(false);
        const data: any = await getTariffs(businessId);
        setTariffs(data);
      } catch (err) {
        console.error("Erreur lors du chargement des tarifs :", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTariffs();
  }, [businessId]);

  // Chargement des véhicules pour les types
  useEffect(() => {
    if (!businessId) {
      setLoadingVehicles(false);
      return;
    }

    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const data = await getBusinessVehicles(businessId);
        setVehicles(data);
      } catch (err) {
        console.error("Erreur lors du chargement des véhicules :", err);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [businessId]);

  const availableVehicleTypes = Array.from(
    new Set(vehicles.map((v) => v.type))
  ).sort();

  // === AJOUT ===
  const resetAddForm = () => {
    setAddForm({
      name: "",
      basePrice: "",
      pricePerKm: "",
      minDistance: "",
      maxDistance: "",
      vehicleType: null,
    });
  };

  const handleCreateTariff = async () => {
    if (!businessId) return;

    const baseNum = parseFloat(addForm.basePrice);
    const kmNum = parseFloat(addForm.pricePerKm);
    const minDist = parseInt(addForm.minDistance) || 0;
    const maxDist = addForm.maxDistance ? parseInt(addForm.maxDistance) : null;

    if (
      !addForm.name.trim() ||
      isNaN(baseNum) ||
      isNaN(kmNum) ||
      baseNum < 0 ||
      kmNum < 0
    ) {
      Alert.alert("Données invalides", "Vérifie le nom et les prix.");
      return;
    }
    if (maxDist !== null && minDist > maxDist) {
      Alert.alert("Distance invalide", "Min > Max");
      return;
    }

    setCreating(true);

    const payload: any = {
      name: addForm.name.trim(),
      basePrice: baseNum,
      pricePerKm: kmNum,
      minDistance: minDist,
      maxDistance: maxDist,
      vehicleType: addForm.vehicleType,
    };

    const tempId = `temp-${Date.now()}`;
    const optimistic: Tariff = {
      id: tempId,
      ...payload,
      basePrice: baseNum.toString(),
      pricePerKm: kmNum.toString(),
      minDistance: minDist,
      maxDistance: maxDist ?? 0,
      vehicleType: addForm.vehicleType,
      businessId: businessId!,
      createdAt: "",
      updatedAt: "",
    };
    setTariffs([optimistic, ...tariffs]);

    try {
      const newTariff = await createTariff(businessId, payload);
      setTariffs((prev) => prev.map((t) => (t.id === tempId ? newTariff : t)));
      Alert.alert("Succès", "Tarif créé !");
      setAddModalVisible(false);
      resetAddForm();
    } catch (err) {
      setTariffs(tariffs);
      Alert.alert("Erreur", "Impossible de créer le tarif.");
    } finally {
      setCreating(false);
    }
  };

  // === MODIFICATION ===
  const openEditModal = (tariff: Tariff) => {
    setCurrentTariff(tariff);
    setEditForm({
      name: tariff.name,
      basePrice: tariff.basePrice,
      pricePerKm: tariff.pricePerKm,
      minDistance: tariff.minDistance.toString(),
      maxDistance: tariff.maxDistance ? tariff.maxDistance.toString() : "",
      vehicleType: tariff.vehicleType as VehicleType | null,
    });
    setEditModalVisible(true);
  };

  const handleUpdateTariff = async () => {
    if (!currentTariff || !businessId) return;

    const baseNum = parseFloat(editForm.basePrice);
    const kmNum = parseFloat(editForm.pricePerKm);
    const minDist = parseInt(editForm.minDistance) || 0;
    const maxDist = editForm.maxDistance
      ? parseInt(editForm.maxDistance)
      : null;

    if (
      !editForm.name.trim() ||
      isNaN(baseNum) ||
      isNaN(kmNum) ||
      baseNum < 0 ||
      kmNum < 0
    ) {
      Alert.alert("Données invalides", "Vérifie le nom et les prix.");
      return;
    }
    if (maxDist !== null && minDist > maxDist) {
      Alert.alert("Distance invalide", "Min > Max");
      return;
    }

    const payload: any = {
      name: editForm.name.trim(),
      basePrice: baseNum,
      pricePerKm: kmNum,
      minDistance: minDist,
      maxDistance: maxDist,
      vehicleType: editForm.vehicleType,
    };

    setEditing(true);

    // Mise à jour optimiste
    const optimisticTariff = {
      ...currentTariff,
      ...payload,
      basePrice: baseNum.toString(),
      pricePerKm: kmNum.toString(),
    };
    setTariffs((prev) =>
      prev.map((t) => (t.id === currentTariff.id ? optimisticTariff : t))
    );

    try {
      const updated = await updateTariff(currentTariff.id, payload);
      setTariffs((prev) =>
        prev.map((t) => (t.id === currentTariff.id ? updated : t))
      );
      Alert.alert("Succès", "Tarif modifié !");
      setEditModalVisible(false);
      setCurrentTariff(null);
    } catch (err) {
      setTariffs((prev) =>
        prev.map((t) => (t.id === currentTariff.id ? currentTariff : t))
      );
      Alert.alert("Erreur", "Impossible de modifier le tarif.");
    } finally {
      setEditing(false);
    }
  };

  // === SUPPRESSION ===
  const handleDeleteTariff = (tariffId: string, tariffName: string) => {
    Alert.alert(
      "Supprimer le tarif",
      `Supprimer définitivement "${tariffName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const previous = tariffs;
            setTariffs(tariffs.filter((t) => t.id !== tariffId));
            try {
              await deleteTariff(tariffId);
              Alert.alert("Succès", "Tarif supprimé.");
            } catch (err) {
              setTariffs(previous);
              Alert.alert("Erreur", "Échec de la suppression.");
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: string) => {
    const num = parseInt(price, 10);
    return isNaN(num)
      ? `— ${currency}`
      : num.toLocaleString("fr") + " " + currency;
  };

  const getDistanceText = (min: number, max: number | null) => {
    if (min === 0) return max ? `Jusqu’à ${max} km` : "Sans limite";
    return max ? `${min} à ${max} km` : `À partir de ${min} km`;
  };

  const getVehicleLabel = (type: VehicleType): string => {
    const labels: Record<VehicleType, string> = {
      MOTO: "Moto",
      VELO: "Vélo",
      SCOOTER: "Scooter",
      VOITURE: "Voiture",
      CAMIONNETTE: "Camionnette",
      CAMION: "Camion",
      DRONE: "Drone",
      AUTRE: "Autre",
    };
    return labels[type] || type;
  };

  // États spéciaux
  if (!businessId) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Aucun profil sélectionné</Text>
        <Text style={styles.emptySubtitle}>
          Sélectionne ton profil livreur pour voir les zones et tarifs.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A36C" />
        <Text style={styles.loadingText}>Chargement des tarifs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cloud-offline-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Erreur de chargement</Text>
        <Text style={styles.emptySubtitle}>
          Impossible de récupérer les tarifs. Réessaie plus tard.
        </Text>
      </View>
    );
  }

  const hasTariffs = tariffs.length > 0;

  return (
    <View style={styles.container}>
      {/* Bouton Ajouter */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Ajouter un tarif</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Zones et tarifs</Text>
          <Text style={styles.subtitle}>
            Tarifs appliqués selon la zone et la distance de livraison
          </Text>
        </View>

        {hasTariffs ? (
          tariffs.map((tariff) => (
            <View key={tariff.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.zoneName}>{tariff.name}</Text>
                <Ionicons name="map-outline" size={28} color="#00A36C" />
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={18} color="#00A36C" />
                  <Text style={styles.metaLabel}>Forfait de base</Text>
                  <Text style={styles.metaValue}>
                    {formatPrice(tariff.basePrice)}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="speedometer-outline" size={18} color="#444" />
                  <Text style={styles.metaLabel}>Prix par km</Text>
                  <Text style={styles.metaValue}>
                    {formatPrice(tariff.pricePerKm)}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="navigate-outline" size={18} color="#444" />
                  <Text style={styles.metaLabel}>Distance</Text>
                  <Text style={styles.metaValue}>
                    {getDistanceText(
                      tariff.minDistance,
                      tariff.maxDistance || null
                    )}
                  </Text>
                </View>
              </View>

              {tariff.vehicleType && (
                <View style={styles.vehicleChip}>
                  <Ionicons name="bicycle-outline" size={16} color="#666" />
                  <Text style={styles.vehicleText}>
                    {getVehicleLabel(tariff.vehicleType)}
                  </Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(tariff)}
                >
                  <Ionicons name="create-outline" size={20} color="#00A36C" />
                  <Text style={styles.editText}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTariff(tariff.id, tariff.name)}
                >
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                  <Text style={styles.deleteText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Aucune zone configurée</Text>
            <Text style={styles.emptySubtitle}>
              Ajoute tes premiers tarifs pour définir les prix de livraison.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* === MODAL AJOUT === */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nouvelle zone tarifaire</Text>
                <TouchableOpacity
                  onPress={() => !creating && setAddModalVisible(false)}
                  disabled={creating}
                >
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Les mêmes champs que pour edit, réutilisés */}
                <Text style={styles.label}>Nom de la zone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Centre-ville"
                  value={addForm.name}
                  onChangeText={(t) => setAddForm({ ...addForm, name: t })}
                  editable={!creating}
                />

                <Text style={styles.label}>Forfait de base ({currency}) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2000"
                  keyboardType="numeric"
                  value={addForm.basePrice}
                  onChangeText={(t) =>
                    setAddForm({
                      ...addForm,
                      basePrice: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!creating}
                />

                <Text style={styles.label}>Prix par km ({currency}) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="500"
                  keyboardType="numeric"
                  value={addForm.pricePerKm}
                  onChangeText={(t) =>
                    setAddForm({
                      ...addForm,
                      pricePerKm: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!creating}
                />

                <Text style={styles.label}>Distance min (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={addForm.minDistance}
                  onChangeText={(t) =>
                    setAddForm({
                      ...addForm,
                      minDistance: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!creating}
                />

                <Text style={styles.label}>Distance max (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vide = illimité"
                  keyboardType="numeric"
                  value={addForm.maxDistance}
                  onChangeText={(t) =>
                    setAddForm({
                      ...addForm,
                      maxDistance: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!creating}
                />

                {availableVehicleTypes.length > 0 && (
                  <>
                    <Text style={styles.label}>
                      Type de véhicule (optionnel)
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={addForm.vehicleType}
                        onValueChange={(v) =>
                          setAddForm({
                            ...addForm,
                            vehicleType: v as VehicleType | null,
                          })
                        }
                        enabled={!creating}
                      >
                        <Picker.Item label="Tous les véhicules" value={null} />
                        {availableVehicleTypes.map((type) => (
                          <Picker.Item
                            key={type}
                            label={getVehicleLabel(type)}
                            value={type}
                          />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => !creating && setAddModalVisible(false)}
                  disabled={creating}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    creating && styles.disabledButton,
                  ]}
                  onPress={handleCreateTariff}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Créer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* === MODAL MODIFICATION === */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Modifier la zone tarifaire
                </Text>
                <TouchableOpacity
                  onPress={() => !editing && setEditModalVisible(false)}
                  disabled={editing}
                >
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Nom de la zone *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                  editable={!editing}
                />

                <Text style={styles.label}>Forfait de base ({currency}) *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editForm.basePrice}
                  onChangeText={(t) =>
                    setEditForm({
                      ...editForm,
                      basePrice: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!editing}
                />

                <Text style={styles.label}>Prix par km ({currency}) *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editForm.pricePerKm}
                  onChangeText={(t) =>
                    setEditForm({
                      ...editForm,
                      pricePerKm: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!editing}
                />

                <Text style={styles.label}>Distance min (km)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editForm.minDistance}
                  onChangeText={(t) =>
                    setEditForm({
                      ...editForm,
                      minDistance: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!editing}
                />

                <Text style={styles.label}>Distance max (km)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editForm.maxDistance}
                  onChangeText={(t) =>
                    setEditForm({
                      ...editForm,
                      maxDistance: t.replace(/[^0-9]/g, ""),
                    })
                  }
                  editable={!editing}
                />

                {availableVehicleTypes.length > 0 && (
                  <>
                    <Text style={styles.label}>
                      Type de véhicule (optionnel)
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={editForm.vehicleType}
                        onValueChange={(v) =>
                          setEditForm({
                            ...editForm,
                            vehicleType: v as VehicleType | null,
                          })
                        }
                        enabled={!editing}
                      >
                        <Picker.Item label="Tous les véhicules" value={null} />
                        {availableVehicleTypes.map((type) => (
                          <Picker.Item
                            key={type}
                            label={getVehicleLabel(type)}
                            value={type}
                          />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => !editing && setEditModalVisible(false)}
                  disabled={editing}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    editing && styles.disabledButton,
                  ]}
                  onPress={handleUpdateTariff}
                  disabled={editing}
                >
                  {editing ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { padding: 16, paddingBottom: 100 },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A36C",
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },

  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 8, lineHeight: 22 },

  card: {
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
    alignItems: "center",
    marginBottom: 20,
  },
  zoneName: { fontSize: 19, fontWeight: "600", color: "#111", flex: 1 },

  metaRow: { marginBottom: 14 },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  metaLabel: { marginLeft: 10, fontSize: 14, color: "#666", flex: 1 },
  metaValue: { fontSize: 15, fontWeight: "600", color: "#00A36C" },

  vehicleChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
    marginBottom: 20,
  },
  vehicleText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#166534",
    fontWeight: "500",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
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

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  deleteText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#DC2626",
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F8F9FA",
  },
  emptyState: {
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
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    fontSize: 16,
  },
  pickerContainer: {
    marginHorizontal: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalActions: { flexDirection: "row", padding: 20, gap: 12 },
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
});

export default ZoneTarifs;
