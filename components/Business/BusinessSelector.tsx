import { Business } from "@/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BusinessSelectorProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onBusinessSelect: (business: Business) => void;
  loading?: boolean;
  onAddBusiness: () => void;
  onManageBusiness: () => void;
}

const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  businesses,
  selectedBusiness,
  onBusinessSelect,
  loading = false,
  onAddBusiness,
  onManageBusiness,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (business: Business) => {
    onBusinessSelect(business);
    setIsVisible(false);
  };

  const renderBusinessItem = ({ item }: { item: Business }) => {
    const isSelected = selectedBusiness?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.businessItem, isSelected? {borderWidth:1, borderColor: '#00C851', borderRadius: 20, margin: 5} : {borderWidth: 0} ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.businessIcon}>
          <Ionicons name="storefront" size={24} color="#666" />
        </View>
        <Text style={styles.businessName} numberOfLines={1}>
          {item.name}
        </Text>
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={28} color="#00C851" />
        ) : (
          <View style={styles.radioButton} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.triggerLeft}>
          <Ionicons name="storefront" size={20} color="#666" />
          <View style={styles.triggerInfo}>
            <Text style={styles.triggerLabel}>Commerce actuel</Text>
            <Text style={styles.triggerValue} numberOfLines={1}>
              {selectedBusiness?.name || "Sélectionner"}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <View style={{ width: 70, borderWidth: 2, borderRadius: 5, justifyContent:'center', alignContent:'center', alignItems:'center', margin:10 }} /> */}
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mes Commerces</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Business List */}
            <View style={styles.listContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00C851" />
                </View>
              ) : (
                <FlatList
                  data={businesses}
                  renderItem={renderBusinessItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            {/* Bottom Buttons */}
            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setIsVisible(false);
                  onAddBusiness();
                }}
              >
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => {
                  setIsVisible(false);
                  onManageBusiness();
                }}
              >
                <Text style={styles.manageButtonText}>Gérer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginHorizontal: 12,
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  triggerInfo: {
    marginLeft: 8,
    flex: 1,
  },
  triggerLabel: {
    fontSize: 10,
    color: "#999",
  },
  triggerValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    maxHeight: "70%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    // borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  listContainer: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  businessItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: "#F5F5F5",
  },
  businessIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  businessName: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D0D0D0",
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
    // borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#00C851",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  manageButton: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  manageButtonText: {
    color: "#00C851",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BusinessSelector;