// components/Delivery/VehiclesData.tsx
import  { useEffect, useState } from "react";
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
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  deleteVehicle,
  getBusinessVehicles,
  createVehicle,
  updateVehicle,
  Vehicle,
  VehicleType,
} from "@/api/delivery/deliveryApi";

interface Props {
  businessId: string | null;
}

const VehiclesData = ({ businessId }: Props) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // États pour modal AJOUT
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    type: "MOTO" as VehicleType,
    licensePlate: "",
    brand: "",
    model: "",
    capacity: "",
  });

  // États pour modal MODIFICATION
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await getBusinessVehicles(businessId);
        setVehicles(data);
      } catch (err) {
        console.error("Erreur chargement véhicules :", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [businessId]);

  // === FONCTIONS AJOUT ===
  const resetAddForm = () => {
    setAddForm({
      name: "",
      type: "MOTO" as VehicleType,
      licensePlate: "",
      brand: "",
      model: "",
      capacity: "",
    });
  };

  const handleCreateVehicle = async () => {
    if (!businessId) return;

    if (
      !addForm.brand.trim() ||
      !addForm.model.trim() ||
      !addForm.licensePlate.trim()
    ) {
      Alert.alert(
        "Champs obligatoires",
        "Marque, modèle et plaque sont requis."
      );
      return;
    }

    setCreating(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticVehicle: Vehicle = {
      id: tempId,
      name: addForm.name,
      type: addForm.type,
      licensePlate: addForm.licensePlate,
      brand: addForm.brand,
      model: addForm.model,
      capacity: addForm.capacity,
      isActive: true,
      businessId: businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVehicles([optimisticVehicle, ...vehicles]);

    try {
      const newVehicle = await createVehicle(businessId, addForm);
      setVehicles((prev) =>
        prev.map((v) => (v.id === tempId ? newVehicle : v))
      );
      Alert.alert("Succès", "Véhicule ajouté avec succès !");
      setAddModalVisible(false);
      resetAddForm();
    } catch (err) {
      setVehicles(vehicles);
      Alert.alert("Erreur", "Impossible d'ajouter le véhicule.");
    } finally {
      setCreating(false);
    }
  };

  // === FONCTIONS MODIFICATION ===
  const openEditModal = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setEditForm({
      name: vehicle.name,
      type: vehicle.type,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      capacity: vehicle.capacity,
      isActive: vehicle.isActive,
    });
    setEditModalVisible(true);
  };

  const resetEditForm = () => {
    setCurrentVehicle(null);
    setEditForm({});
  };

  const handleUpdateVehicle = async () => {
    if (!currentVehicle) return;

    const updates: Partial<Vehicle> = {};
    if (editForm.name !== currentVehicle.name) updates.name = editForm.name;
    if (editForm.type !== currentVehicle.type) updates.type = editForm.type;
    if (editForm.licensePlate !== currentVehicle.licensePlate)
      updates.licensePlate = editForm.licensePlate;
    if (editForm.brand !== currentVehicle.brand) updates.brand = editForm.brand;
    if (editForm.model !== currentVehicle.model) updates.model = editForm.model;
    if (editForm.capacity !== currentVehicle.capacity)
      updates.capacity = editForm.capacity;
    if (editForm.isActive !== currentVehicle.isActive)
      updates.isActive = editForm.isActive;

    if (Object.keys(updates).length === 0) {
      Alert.alert("Aucune modification", "Aucun champ n'a été modifié.");
      return;
    }

    if (!updates.brand || !updates.model || !updates.licensePlate) {
      Alert.alert(
        "Champs obligatoires",
        "Marque, modèle et plaque ne peuvent pas être vides."
      );
      return;
    }

    setEditing(true);

    // Mise à jour optimiste
    const optimisticVehicle = { ...currentVehicle, ...updates };
    setVehicles((prev) =>
      prev.map((v) => (v.id === currentVehicle.id ? optimisticVehicle : v))
    );

    try {
      const updatedVehicle = await updateVehicle(currentVehicle.id, updates);
      setVehicles((prev) =>
        prev.map((v) => (v.id === currentVehicle.id ? updatedVehicle : v))
      );
      Alert.alert("Succès", "Véhicule mis à jour avec succès !");
      setEditModalVisible(false);
      resetEditForm();
    } catch (err) {
      // Rollback
      setVehicles((prev) =>
        prev.map((v) => (v.id === currentVehicle.id ? currentVehicle : v))
      );
      Alert.alert("Erreur", "Impossible de mettre à jour le véhicule.");
    } finally {
      setEditing(false);
    }
  };

  // === SUPPRESSION ===
  const handleDelete = (vehicleId: string, vehicleDisplay: string) => {
    Alert.alert(
      "Supprimer le véhicule",
      `Veux-tu vraiment supprimer ${vehicleDisplay} ?\nCette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const previousVehicles = vehicles;
            setVehicles(vehicles.filter((v) => v.id !== vehicleId));

            try {
              await deleteVehicle(vehicleId);
            } catch (err) {
              setVehicles(previousVehicles);
              Alert.alert("Erreur", "Impossible de supprimer le véhicule.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getVehicleIcon = (type: VehicleType): string => {
    switch (type) {
      case "MOTO":
      case "SCOOTER":
        return "bike-outline";
      case "VELO":
        return "bicycle-outline";
      case "VOITURE":
        return "car-outline";
      case "CAMIONNETTE":
        return "bus-outline";
      case "CAMION":
        return "truck-outline";
      case "DRONE":
        return "paper-plane-outline";
      default:
        return "car-sport-outline";
    }
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
    return labels[type];
  };

  // États spéciaux
  if (!businessId) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Aucun profil sélectionné</Text>
        <Text style={styles.emptySubtitle}>
          Sélectionne ton profil livreur pour voir tes véhicules.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A36C" />
        <Text style={styles.loadingText}>Chargement des véhicules...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cloud-offline-outline" size={80} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Erreur de connexion</Text>
        <Text style={styles.emptySubtitle}>
          Impossible de charger les véhicules. Réessaie plus tard.
        </Text>
      </View>
    );
  }

  const hasVehicles = vehicles.length > 0;

  return (
    <View style={styles.container}>
      {/* Bouton Ajouter */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFF" />
        <Text style={styles.addButtonText}>Ajouter un véhicule</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hasVehicles ? (
          vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={getVehicleIcon(vehicle.type)}
                    size={32}
                    color="#00A36C"
                  />
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.vehicleName}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text style={styles.vehiclePlate}>
                    {vehicle.licensePlate}
                  </Text>
                  {vehicle.name && (
                    <Text style={styles.vehicleCustomName}>
                      `{vehicle.name}`
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.statusChip,
                    vehicle.isActive ? styles.activeChip : styles.inactiveChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      vehicle.isActive
                        ? styles.activeText
                        : styles.inactiveText,
                    ]}
                  >
                    {vehicle.isActive ? "Actif" : "Inactif"}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {getVehicleLabel(vehicle.type)}
                  </Text>
                </View>

                {vehicle.capacity && (
                  <View style={styles.metaItem}>
                    <Ionicons name="cube-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>
                      Capacité : {vehicle.capacity}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(vehicle)}
                >
                  <Ionicons name="create-outline" size={20} color="#00A36C" />
                  <Text style={styles.editText}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDelete(
                      vehicle.id,
                      `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
                    )
                  }
                >
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                  <Text style={styles.deleteText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Aucun véhicule enregistré</Text>
            <Text style={styles.emptySubtitle}>
              Ajoute ton premier véhicule pour commencer à recevoir des courses
              adaptées.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* === MODAL AJOUT === */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !creating && setAddModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ajouter un véhicule</Text>
                <TouchableOpacity
                  onPress={() => !creating && setAddModalVisible(false)}
                  disabled={creating}
                >
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Nom personnalisé (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Ma super moto"
                  value={addForm.name}
                  onChangeText={(text) =>
                    setAddForm({ ...addForm, name: text })
                  }
                  editable={!creating}
                />

                <Text style={styles.label}>Type de véhicule *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={addForm.type}
                    onValueChange={(value) =>
                      setAddForm({ ...addForm, type: value as VehicleType })
                    }
                    enabled={!creating}
                  >
                    <Picker.Item label="Moto" value="MOTO" />
                    <Picker.Item label="Scooter" value="SCOOTER" />
                    <Picker.Item label="Vélo" value="VELO" />
                    <Picker.Item label="Voiture" value="VOITURE" />
                    <Picker.Item label="Camionnette" value="CAMIONNETTE" />
                    <Picker.Item label="Camion" value="CAMION" />
                    <Picker.Item label="Drone" value="DRONE" />
                    <Picker.Item label="Autre" value="AUTRE" />
                  </Picker>
                </View>

                <Text style={styles.label}>Marque *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Honda"
                  value={addForm.brand}
                  onChangeText={(text) =>
                    setAddForm({ ...addForm, brand: text.trim() })
                  }
                  editable={!creating}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Modèle *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: CBR 500"
                  value={addForm.model}
                  onChangeText={(text) =>
                    setAddForm({ ...addForm, model: text.trim() })
                  }
                  editable={!creating}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Plaque d&apos;immatriculation *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: AB-123-CD"
                  value={addForm.licensePlate}
                  onChangeText={(text) =>
                    setAddForm({ ...addForm, licensePlate: text.toUpperCase() })
                  }
                  editable={!creating}
                  autoCapitalize="characters"
                />

                <Text style={styles.label}>Capacité (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 30L, 2 colis, 15kg"
                  value={addForm.capacity}
                  onChangeText={(text) =>
                    setAddForm({ ...addForm, capacity: text })
                  }
                  editable={!creating}
                />
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
                  onPress={handleCreateVehicle}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Ajouter</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* === MODAL MODIFICATION === */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !editing && setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Modifier le véhicule</Text>
                <TouchableOpacity
                  onPress={() => !editing && setEditModalVisible(false)}
                  disabled={editing}
                >
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Nom personnalisé (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Ma super moto"
                  value={editForm.name || ""}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, name: text })
                  }
                  editable={!editing}
                />

                <Text style={styles.label}>Type de véhicule</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editForm.type || "MOTO"}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, type: value as VehicleType })
                    }
                    enabled={!editing}
                  >
                    <Picker.Item label="Moto" value="MOTO" />
                    <Picker.Item label="Scooter" value="SCOOTER" />
                    <Picker.Item label="Vélo" value="VELO" />
                    <Picker.Item label="Voiture" value="VOITURE" />
                    <Picker.Item label="Camionnette" value="CAMIONNETTE" />
                    <Picker.Item label="Camion" value="CAMION" />
                    <Picker.Item label="Drone" value="DRONE" />
                    <Picker.Item label="Autre" value="AUTRE" />
                  </Picker>
                </View>

                <Text style={styles.label}>Marque</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Honda"
                  value={editForm.brand || ""}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, brand: text.trim() })
                  }
                  editable={!editing}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Modèle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: CBR 500"
                  value={editForm.model || ""}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, model: text.trim() })
                  }
                  editable={!editing}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Plaque d&apos;immatriculation</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: AB-123-CD"
                  value={editForm.licensePlate || ""}
                  onChangeText={(text) =>
                    setEditForm({
                      ...editForm,
                      licensePlate: text.toUpperCase(),
                    })
                  }
                  editable={!editing}
                  autoCapitalize="characters"
                />

                <Text style={styles.label}>Capacité (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 30L, 2 colis, 15kg"
                  value={editForm.capacity || ""}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, capacity: text })
                  }
                  editable={!editing}
                />

                <View style={styles.switchRow}>
                  <Text style={styles.label}>Statut</Text>
                  <Switch
                    value={editForm.isActive ?? true}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, isActive: value })
                    }
                    disabled={editing}
                    trackColor={{ false: "#767577", true: "#00A36C" }}
                    thumbColor={editForm.isActive ? "#FFF" : "#f4f3f4"}
                  />
                  <Text style={styles.switchText}>
                    {editForm.isActive ? "Actif" : "Inactif"}
                  </Text>
                </View>
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
                  onPress={handleUpdateVehicle}
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
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00A36C",
    marginTop: 4,
  },
  vehicleCustomName: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 6,
  },

  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  activeChip: { backgroundColor: "#DCFCE7" },
  inactiveChip: { backgroundColor: "#F3F4F6" },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  activeText: { color: "#166534" },
  inactiveText: { color: "#666" },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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

  // Styles des modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  switchText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00A36C",
    marginRight: 10,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    backgroundColor: "#00A36C",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default VehiclesData;
