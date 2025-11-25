import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Business, BusinessesService } from "@/api";
import { router, useFocusEffect } from "expo-router";
import BackButtonAdmin from "@/components/Admin/BackButton"; // ← ton composant
const ManageBusinessesScreen: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(
    null
  );

  // Chargement des données (initial + refresh)
  const loadBusinesses = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const businessesResponse = await BusinessesService.getBusinesses();
      setBusinesses([...businessesResponse].reverse()); // plus récent en haut
    } catch (error) {
      console.error("Erreur chargement commerces:", error);
      Alert.alert("Erreur", "Impossible de charger vos commerces");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recharge la liste à chaque fois que l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      loadBusinesses();
    }, [loadBusinesses])
  );
  const confirmDelete = async () => {
    if (!businessToDelete) return;

    try {
      await BusinessesService.deleteBusiness(businessToDelete.id);
      Alert.alert(
        "Supprimé !",
        `"${businessToDelete.name}" a été supprimé avec succès.`
      );
      loadBusinesses(); // recharge la liste
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer ce commerce.");
    } finally {
      setDeleteModalVisible(false);
      setBusinessToDelete(null);
    }
  };

  const openEdit = (business: Business) => {
    router.push({
      pathname: "/(update-business)/[businessid]",
      params: {
        businessId: business.id,
        type: business.type,
      } as any,
    });
  };

  const renderItem = ({ item }: { item: Business }) => (
    <View style={styles.businessCard}>
      <View style={styles.businessInfo}>
        <View style={styles.iconContainer}>
          <Ionicons name="storefront" size={28} color="#00C851" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.businessName}>{item.name}</Text>
          <Text style={styles.businessType}>
            {item.type === "COMMERCANT" ? "Commerçant" : "Fournisseur"} •{" "}
            {item.type}
          </Text>
          {item.address && (
            <Text style={styles.businessAddress} numberOfLines={1}>
              {item.address}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEdit(item)}
        >
          <Feather name="edit-2" size={20} color="#059669" />
          <Text style={styles.editText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setBusinessToDelete(item);
            setDeleteModalVisible(true);
          }}
        >
          <Feather name="trash-2" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00C851" />
        <Text style={{ marginTop: 16, color: "#666" }}>
          Chargement de vos commerces...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER AVEC BOUTON RETOUR */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Gérer mes commerces</Text>
          <Text style={styles.subtitle}>
            {businesses.length} commerce{businesses.length > 1 ? "s" : ""}
          </Text>
        </View>
        <View style={{ width: 48 }} /> {/* Espace symétrique à droite */}
      </View>

      <FlatList
        data={businesses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadBusinesses(true)}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>Aucun commerce</Text>
            <Text style={styles.emptyText}>Créez votre premier commerce !</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Modal de suppression */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Ionicons name="warning" size={48} color="#ef4444" />
            <Text style={styles.deleteTitle}>Supprimer ce commerce ?</Text>
            <Text style={styles.deleteMessage}>
              Le commerce{" "}
              <Text style={{ fontWeight: "700" }}>
                {businessToDelete?.name || "inconnu"}
              </Text>{" "}
              sera définitivement supprimé.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  title: { fontSize: 26, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 4 },

  businessCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  businessInfo: { flexDirection: "row", flex: 1 },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  businessName: { fontSize: 17, fontWeight: "600", color: "#111" },
  businessType: {
    fontSize: 13,
    color: "#059669",
    marginTop: 4,
    fontWeight: "600",
  },
  businessAddress: { fontSize: 13, color: "#888", marginTop: 6 },

  actions: { flexDirection: "row", alignItems: "center", gap: 16 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F7F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  editText: { color: "#059669", fontWeight: "600", fontSize: 14 },
  deleteButton: { padding: 10 },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#999", marginTop: 20 },
  emptyText: { fontSize: 15, color: "#aaa", marginTop: 8 },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModal: {
    backgroundColor: "#fff",
    width: "88%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  deleteTitle: { fontSize: 20, fontWeight: "700", marginTop: 16 },
  deleteMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginVertical: 12,
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { fontWeight: "600", color: "#666" },
  confirmBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: { fontWeight: "700", color: "#fff" },
});

export default ManageBusinessesScreen;
