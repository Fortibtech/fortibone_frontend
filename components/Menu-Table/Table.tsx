// components/Table.tsx

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  createReservation,
  getTables,
  Table as TableType,
} from "@/api/menu/tableApi"; // Assure-toi que cette fonction fait bien POST /orders

const Table = ({ restaurantsId }: { restaurantsId: string }) => {
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal réservation
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const data = await getTables(restaurantsId);
        setTables(data);
      } catch (err) {
        setError("Impossible de charger les tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [restaurantsId]);

  const openReservationModal = (table: TableType) => {
    setSelectedTable(table);
    // Date par défaut : aujourd'hui + 1 heure (pour éviter les dates passées)
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1);
    defaultDate.setMinutes(0);
    setSelectedDate(defaultDate);
    setNotes("");
    setModalVisible(true);
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      // Garde l'heure actuelle si on change seulement la date
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setSelectedDate(newDate);
      if (Platform.OS === "android") setShowTimePicker(true);
    }
  };

  const onTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (time) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const confirmReservation = async () => {
    if (!selectedTable || !restaurantsId) {
      Alert.alert("Erreur", "Informations manquantes.");
      return;
    }

    // Vérification date future
    if (selectedDate <= new Date()) {
      Alert.alert(
        "Date invalide",
        "Veuillez choisir une date et heure dans le futur."
      );
      return;
    }

    setReserving(true);

    // Payload EXACTEMENT conforme à la doc Swagger pour une réservation
    const payload = {
      type: "RESERVATION",
      businessId: restaurantsId,
      tableId: selectedTable.id,
      reservationDate: selectedDate.toISOString(),
      notes: notes.trim() || undefined,
      lines: [], // ← Tableau vide obligatoire
      // Les autres champs optionnels sont omis (useWallet, shippingFee, etc.)
    };

    try {
      await createReservation(payload);

      Alert.alert(
        "Réservation confirmée ! 🎉",
        `Table ${selectedTable.name} (${
          selectedTable.capacity
        } places)\nréservée le ${selectedDate.toLocaleDateString(
          "fr-FR"
        )} à ${selectedDate.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}.\n\n${notes ? "Note : " + notes : ""}`,
        [{ text: "Super !", onPress: () => setModalVisible(false) }]
      );

      // Optionnel : rafraîchir les tables pour mettre à jour la disponibilité
      // await fetchTables();
    } catch (err: any) {
      const messages = err?.response?.data?.message;
      const errorText = Array.isArray(messages)
        ? messages.join("\n")
        : err?.response?.data?.error || "Erreur lors de la réservation.";
      Alert.alert("Réservation échouée", errorText);
    } finally {
      setReserving(false);
    }
  };

  // ... Le reste du rendu (loading, error, empty) inchangé ...

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (tables.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Aucune table disponible</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.tableCard,
              !item.isAvailable && styles.tableUnavailable,
            ]}
          >
            <Text style={styles.tableName}>{item.name}</Text>
            <Text style={styles.tableCapacity}>{item.capacity} places</Text>
            <Text
              style={[
                styles.tableStatus,
                item.isAvailable ? styles.available : styles.unavailable,
              ]}
            >
              {item.isAvailable ? "Disponible" : "Indisponible"}
            </Text>

            {item.isAvailable && (
              <TouchableOpacity
                style={styles.reserveButton}
                onPress={() => openReservationModal(item)}
              >
                <Text style={styles.reserveButtonText}>Réserver</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Modal de réservation */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Réserver {selectedTable?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedTable?.capacity} places
            </Text>

            {/* Date */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            {/* Heure */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateText}>
                {selectedDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {/* Notes */}
            <TextInput
              style={styles.notesInput}
              placeholder="Notes (ex: anniversaire, allergies...)"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            {/* Pickers */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                onChange={onTimeChange}
              />
            )}

            {/* Boutons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={reserving}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  reserving && styles.disabledButton,
                ]}
                onPress={confirmReservation}
                disabled={reserving}
              >
                {reserving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Styles inchangés (identiques à ta version précédente)
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  tableCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableUnavailable: { opacity: 0.5 },
  tableName: { fontSize: 16, fontWeight: "600", color: "#121f3e" },
  tableCapacity: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  tableStatus: { marginTop: 6, fontSize: 13, fontWeight: "600" },
  available: { color: "#059669" },
  unavailable: { color: "#dc2626" },
  reserveButton: {
    marginTop: 10,
    backgroundColor: "#059669",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  reserveButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  errorText: { color: "#dc2626", fontSize: 14 },
  emptyText: { color: "#6b7280", fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  notesInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f3f4f6" },
  cancelButtonText: { color: "#374151", fontWeight: "600" },
  confirmButton: { backgroundColor: "#059669" },
  confirmButtonText: { color: "#fff", fontWeight: "600" },
  disabledButton: { opacity: 0.7 },
});

export default Table;
