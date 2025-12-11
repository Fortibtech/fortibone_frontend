// app/(restaurants)/tables/index.tsx
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// API
import { getTables, Table } from "@/api/menu/tableApi";
import {
  createRestaurantTable,
  updateRestaurantTable,
  deleteRestaurantTable,
  type TablePayload,
} from "@/api/menu/tableApi";
import { useSelectedBusiness } from "@/api/hooks";

const TablesScreen = () => {
  const { selectedBusiness, loading: businessLoading } = useSelectedBusiness();
  const restaurantId = selectedBusiness?.id;

  const [tables, setTables] = useState<Table[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const loadTables = async () => {
    if (!restaurantId) return;
    try {
      setLoadingTables(true);
      const data = await getTables(restaurantId);
      setTables(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les tables");
    } finally {
      setLoadingTables(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (restaurantId) loadTables();
  }, [restaurantId]);

  const onRefresh = () => {
    if (!restaurantId) return;
    setRefreshing(true);
    loadTables();
  };

  const openCreateModal = () => {
    setEditingTable(null);
    setTableName("");
    setCapacity("");
    setIsAvailable(true);
    setModalVisible(true);
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setTableName(table.name);
    setCapacity(String(table.capacity)); // ← String garanti
    setIsAvailable(table.isAvailable);
    setModalVisible(true);
  };

  // FONCTION CORRIGÉE – Plus jamais de capacity = 0 ou NaN
  const saveTable = async () => {
    if (!tableName.trim()) {
      Alert.alert("Erreur", "Le nom de la table est obligatoire");
      return;
    }

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert("Erreur", "Le nombre de places doit être un nombre positif");
      return;
    }

    if (!restaurantId) {
      Alert.alert("Erreur", "Restaurant non disponible");
      return;
    }

    try {
      setSaving(true);

      if (editingTable) {
        // MISE À JOUR
        const payload: TablePayload = {};

        if (tableName !== editingTable.name) payload.name = tableName;
        if (capacityNum !== editingTable.capacity)
          payload.capacity = capacityNum;
        if (isAvailable !== editingTable.isAvailable)
          payload.isAvailable = isAvailable;

        if (Object.keys(payload).length === 0) {
          setModalVisible(false);
          return;
        }

        const updatedTable = await updateRestaurantTable(
          restaurantId,
          editingTable.id,
          payload
        );
        setTables((prev) =>
          prev.map((t) => (t.id === updatedTable.id ? updatedTable : t))
        );
        Alert.alert("Succès", "Table modifiée avec succès");
      } else {
        // CRÉATION
        const payload: TablePayload = {
          name: tableName,
          capacity: capacityNum,
        };
        const newTable = await createRestaurantTable(restaurantId, payload);
        setTables((prev) => [...prev, newTable]);
        Alert.alert("Succès", `Table "${newTable.name}" créée !`);
      }

      setModalVisible(false);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Une erreur est survenue";
      Alert.alert("Erreur", Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  // SUPPRESSION (inchangée)
  const removeTable = async (tableId: string) => {
    if (!restaurantId) return;

    Alert.alert("Supprimer la table", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const previousTables = [...tables];
          setTables((prev) => prev.filter((t) => t.id !== tableId));
          setDeletingTableId(tableId);

          try {
            await deleteRestaurantTable(restaurantId, tableId);
            Alert.alert("Succès", "Table supprimée avec succès");
          } catch (error: any) {
            setTables(previousTables);
            const msg =
              error.response?.data?.message ||
              "Impossible de supprimer la table";
            Alert.alert("Erreur", msg);
          } finally {
            setDeletingTableId(null);
          }
        },
      },
    ]);
  };

  // Reste du code (render, loading, etc.) identique
  if (businessLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Chargement du restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedBusiness) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={60} color="#999" />
          <Text style={styles.errorText}>Aucun restaurant sélectionné</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderTable = ({ item }: { item: Table }) => (
    <View style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableNumber}>Table {item.name}</Text>
          <Text style={styles.seats}>{item.capacity} places</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.isAvailable ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[styles.statusText, !item.isAvailable && { color: "#666" }]}
          >
            {item.isAvailable ? "Disponible" : "Indisponible"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => router.push(`/(restaurants)/tables/qr/${item.id}`)}
        >
          <Ionicons name="qr-code-outline" size={20} color="#7C3AED" />
          <Text style={styles.qrText}>QR Code</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Ionicons name="create-outline" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeTable(item.id)}
            disabled={deletingTableId === item.id}
            style={{ marginLeft: 16 }}
          >
            {deletingTableId === item.id ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Tables</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {loadingTables && tables.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <FlatList
            data={tables}
            renderItem={renderTable}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              tables.length === 0 ? styles.emptyList : styles.list
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#7C3AED"]}
              />
            }
            ListEmptyComponent={
              !loadingTables && (
                <View style={styles.empty}>
                  <Ionicons name="cafe-outline" size={90} color="#E0E0E0" />
                  <Text style={styles.emptyTitle}>Aucune table</Text>
                  <Text style={styles.emptySubtitle}>
                    Ajoutez votre première table
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={openCreateModal}
                  >
                    <Text style={styles.emptyButtonText}>
                      + Ajouter une table
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            }
          />
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTable ? "Modifier" : "Nouvelle"} table
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Nom / Numéro</Text>
              <TextInput
                style={styles.input}
                value={tableName}
                onChangeText={setTableName}
                placeholder="ex: 7 ou Terrasse 1"
              />

              <Text style={styles.label}>Places</Text>
              <TextInput
                style={styles.input}
                value={capacity}
                onChangeText={(text) =>
                  setCapacity(text.replace(/[^0-9]/g, ""))
                } // ← Bonus : accepte seulement les chiffres
                keyboardType="numeric"
                placeholder="4"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Disponible</Text>
                <Switch value={isAvailable} onValueChange={setIsAvailable} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={saveTable}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveText}>Sauvegarder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TablesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: "#999",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#000" },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  emptyList: { flex: 1 },
  tableCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tableNumber: { fontSize: 18, fontWeight: "700", color: "#000" },
  seats: { fontSize: 14, color: "#666", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  activeBadge: { backgroundColor: "#ECFDF5" },
  inactiveBadge: { backgroundColor: "#F3F4F6" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#10B981" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qrButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  qrText: { color: "#7C3AED", fontWeight: "600" },
  rightActions: { flexDirection: "row" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginTop: 20, color: "#333" },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: "#7C3AED",
    borderRadius: 30,
  },
  emptyButtonText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#000" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelText: { color: "#666", fontWeight: "600" },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveText: { color: "#FFF", fontWeight: "600" },
});
