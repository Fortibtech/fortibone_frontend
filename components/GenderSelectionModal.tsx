import React, { useState } from "react";
import { Modal, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "./CustomButton"; // Adjust path as needed

const GenderSelectionModal = ({
  visible,
  onClose,
  onSelect,
  selectedGender,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: string) => void;
  selectedGender: string;
}) => {
  const [tempSelectedGender, setTempSelectedGender] =
    useState<string>(selectedGender);

  const handleSave = () => {
    if (tempSelectedGender) {
      onSelect(tempSelectedGender);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sélectionnez le sexe</Text>
          <View style={styles.genderOptions}>
            {["Masculin", "Féminin"].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  tempSelectedGender === gender && styles.selectedOption,
                ]}
                onPress={() => setTempSelectedGender(gender)}
              >
                <Text
                  style={[
                    styles.genderText,
                    tempSelectedGender === gender && styles.selectedText,
                  ]}
                >
                  {gender}
                </Text>
                <View
                  style={[
                    styles.radioButton,
                    tempSelectedGender === gender && styles.radioButtonSelected,
                  ]}
                >
                  {tempSelectedGender === gender && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalButtonContainer}>
            <CustomButton
              title="Save"
              onPress={handleSave}
              backgroundColor={tempSelectedGender ? "#00C851" : "#E0E0E0"}
              textColor={tempSelectedGender ? "#fff" : "#999"}
              width="100%"
              height={40}
              borderRadius={20}
              fontSize={14}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
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
  genderOptions: { marginBottom: 20 },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectedOption: { backgroundColor: "#E8F5E8", borderColor: "#00C851" },
  genderText: { fontSize: 16, fontWeight: "500", color: "#111" },
  selectedText: { color: "#00C851" },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioButtonSelected: { backgroundColor: "#00C851", borderColor: "#00C851" },
  modalButtonContainer: { width: "100%" },
});

export default GenderSelectionModal;
