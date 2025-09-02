import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from "react-native";

const DatePickerModal = ({
  visible,
  onClose,
  onSelect,
  selectedDate,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
}) => {
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowAndroidPicker(false);
      if (event.type === "set" && date) {
        setTempDate(date);
        onSelect(date);
      }
      onClose();
    } else if (date) {
      setTempDate(date);
    }
  };

  const handleConfirm = () => {
    onSelect(tempDate);
    onClose();
  };

  React.useEffect(() => {
    if (visible && Platform.OS === "android") setShowAndroidPicker(true);
  }, [visible]);

  if (Platform.OS === "android" && showAndroidPicker) {
    return (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
        maximumDate={new Date()}
      />
    );
  }

  if (Platform.OS === "ios") {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateModalContainer}>
            <Text style={styles.modalTitle}>Sélectionner une date</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={styles.datePicker}
            />
            <View style={styles.dateModalButtons}>
              <TouchableOpacity
                style={[styles.dateButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dateModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 350,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    marginBottom: 20,
  },
  datePicker: { width: "100%", marginBottom: 20 },
  dateModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  confirmButton: { backgroundColor: "#00C851" },
  cancelButtonText: { fontSize: 16, fontWeight: "500", color: "#666" },
  confirmButtonText: { fontSize: 16, fontWeight: "500", color: "#fff" },
});

export default DatePickerModal;
