// app/(restaurants)/tables/index.tsx
import React, { useState } from "react";
import {
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

const INITIAL_TABLES = [
  { id: "1", number: 1, seats: 4, isActive: true },
  { id: "2", number: 2, seats: 6, isActive: true },
  { id: "3", number: 3, seats: 2, isActive: true },
  { id: "4", number: 4, seats: 8, isActive: false },
  { id: "5", number: 5, seats: 4, isActive: true },
  { id: "6", number: 6, seats: 10, isActive: true },
  { id: "7", number: 7, seats: 4, isActive: true },
  { id: "8", number: 8, seats: 6, isActive: true },
  { id: "9", number: 9, seats: 2, isActive: true },
  { id: "10", number: 10, seats: 12, isActive: true },
  // Ajoutés pour forcer le scroll
];

const TablesScreen = () => {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [refreshing, setRefreshing] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [isActive, setIsActive] = useState(true);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const openCreateModal = () => {
    setEditingTable(null);
    setTableNumber("");
    setSeats("");
    setIsActive(true);
    setModalVisible(true);
  };

  const openEditModal = (table: any) => {
    setEditingTable(table);
    setTableNumber(String(table.number));
    setSeats(String(table.seats));
    setIsActive(table.isActive);
    setModalVisible(true);
  };

  const saveTable = () => {
    if (!tableNumber || !seats) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    const number = parseInt(tableNumber);
    const seatCount = parseInt(seats);

    if (isNaN(number) || isNaN(seatCount) || number < 1 || seatCount < 1) {
      Alert.alert("Erreur", "Valeurs invalides");
      return;
    }

    if (editingTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === editingTable.id
            ? { ...t, number, seats: seatCount, isActive }
            : t
        )
      );
    } else {
      const newTable = {
        id: Date.now().toString(),
        number,
        seats: seatCount,
        isActive,
      };
      setTables((prev) => [...prev, newTable]);
    }

    setModalVisible(false);
  };

  const removeTable = (id: string) => {
    Alert.alert("Supprimer", "Supprimer cette table ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => setTables((prev) => prev.filter((t) => t.id !== id)),
      },
    ]);
  };

  const renderTable = ({ item }: { item: (typeof INITIAL_TABLES)[0] }) => (
    <View style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableNumber}>Table n°{item.number}</Text>
          <Text style={styles.seats}>{item.seats} places</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[styles.statusText, !item.isActive && { color: "#666" }]}
          >
            {item.isActive ? "Active" : "Désactivée"}
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
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fixe */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Tables</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* La clé : FlatList dans un View avec flex: 1 */}
      <View style={styles.listContainer}>
        <FlatList
          data={tables}
          renderItem={renderTable}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            tables.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#7C3AED"]}
            />
          }
          ListEmptyComponent={
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
                <Text style={styles.emptyButtonText}>+ Ajouter une table</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Modal */}
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
              <Text style={styles.label}>Numéro</Text>
              <TextInput
                style={styles.input}
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="numeric"
                placeholder="7"
              />

              <Text style={styles.label}>Places</Text>
              <TextInput
                style={styles.input}
                value={seats}
                onChangeText={setSeats}
                keyboardType="numeric"
                placeholder="4"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveTable}>
                <Text style={styles.saveText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
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

  // La ligne magique qui répare le scroll
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
  saveText: { color: "#FFF", fontWeight: "600" },
});

export default TablesScreen;
