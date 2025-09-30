// app/(tabs)/restaurants/[id]/index.tsx
import axiosInstance from "@/api/axiosInstance";
import {
  createRestaurantTable,
  deleteRestaurantTable,
  getMenus,
  getTables,
  Menu,
  Table,
  TablePayload,
  updateRestaurantTable,
  UpdateTablePayload,
} from "@/api/restaurant";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AdminRestaurantDashboard = () => {
  const { id: businessId } = useLocalSearchParams<{ id: string }>();
  const [tables, setTables] = useState<Table[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal création / modification table
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableAvailable, setTableAvailable] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const tablesData = await getTables(businessId!);
      const menusData = await getMenus(businessId!);
      setTables(tablesData);
      setMenus(menusData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  // Création / modification table
  const openCreateModal = () => {
    setEditingTable(null);
    setTableName("");
    setTableCapacity("");
    setTableAvailable(true);
    setModalVisible(true);
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setTableName(table.name);
    setTableCapacity(String(table.capacity));
    setTableAvailable(table.isAvailable);
    setModalVisible(true);
  };

  const handleSaveTable = async () => {
    if (!tableName || !tableCapacity) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      if (editingTable) {
        // Update table
        const payload: UpdateTablePayload = {
          name: tableName,
          capacity: Number(tableCapacity),
          isAvailable: tableAvailable,
        };
        const updated = await updateRestaurantTable(
          businessId!,
          editingTable.id,
          payload
        );
        setTables((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        Alert.alert("Succès", `Table "${updated.name}" mise à jour !`);
      } else {
        // Create table
        const payload: TablePayload = {
          name: tableName,
          capacity: Number(tableCapacity),
        };
        const created = await createRestaurantTable(businessId!, payload);
        setTables((prev) => [...prev, created]);
        Alert.alert("Succès", `Table "${created.name}" créée !`);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder la table");
    }
  };

  // Suppression table avec nouvelle fonction
  const handleDeleteTable = (tableId: string, tableName: string) => {
    Alert.alert(
      "Confirmer la suppression",
      `Voulez-vous vraiment supprimer la table "${tableName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteRestaurantTable(
                businessId!,
                tableId
              );
              setTables(tables.filter((t) => t.id !== tableId));
              Alert.alert("Succès", response.message);
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer la table");
            }
          },
        },
      ]
    );
  };

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await axiosInstance.delete(`/restaurants/${businessId}/menus/${menuId}`);
      setMenus(menus.filter((m) => m.id !== menuId));
      Alert.alert("Succès", "Menu supprimé !");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer le menu");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BackButton />
      <Text style={styles.header}>
        Admin Dashboard - Restaurant {businessId}
      </Text>

      {/* Tables */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tables</Text>
          <TouchableOpacity onPress={openCreateModal}>
            <Ionicons name="add-circle-outline" size={28} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {tables.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardTitle}>{t.name}</Text>
            <Text>Capacité: {t.capacity}</Text>
            <Text>Disponible: {t.isAvailable ? "✅" : "❌"}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#059669" }]}
                onPress={() => openEditModal(t)}
              >
                <Text style={styles.btnText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#dc2626" }]}
                onPress={() => handleDeleteTable(t.id, t.name)}
              >
                <Text style={styles.btnText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Menus */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menus</Text>
        {menus.map((m) => (
          <View key={m.id} style={styles.card}>
            <Text style={styles.cardTitle}>{m.name}</Text>
            <Text>Prix: ${m.price}</Text>
            <Text>Actif: {m.isActive ? "✅" : "❌"}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#059669" }]}
                onPress={() => Alert.alert("Modifier", m.name)}
              >
                <Text style={styles.btnText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#dc2626" }]}
                onPress={() => handleDeleteMenu(m.id)}
              >
                <Text style={styles.btnText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Modal Création / Edition Table */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTable ? "Modifier Table" : "Nouvelle Table"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de la table"
              value={tableName}
              onChangeText={setTableName}
            />
            <TextInput
              style={styles.input}
              placeholder="Capacité"
              keyboardType="numeric"
              value={tableCapacity}
              onChangeText={setTableCapacity}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ marginRight: 8 }}>Disponible</Text>
              <TouchableOpacity
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: tableAvailable ? "#059669" : "#ccc",
                }}
                onPress={() => setTableAvailable(!tableAvailable)}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#2563eb" }]}
                onPress={handleSaveTable}
              >
                <Text style={styles.btnText}>
                  {editingTable ? "Sauvegarder" : "Créer"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#dc2626" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AdminRestaurantDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  btn: { flex: 1, padding: 8, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", gap: 8 },
});
