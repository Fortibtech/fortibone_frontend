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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

// Interface pour les éléments de données dans les sections
interface SectionData {
  id: string;
  label: string;
  value: string;
  icon: string;
  actions?: { label: string; onPress: () => void; color: string }[];
}

// Interface pour les sections
interface Section {
  title: string;
  icon: string;
  action: () => void;
  actionIcon: string;
  actionLabel: string;
  data: SectionData[];
}

const AdminRestaurantDashboard = () => {
  const { id: businessId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableAvailable, setTableAvailable] = useState(true);

  const loadData = async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const [tablesData, menusData] = await Promise.all([
        getTables(businessId),
        getMenus(businessId),
      ]);
      setTables(tablesData);
      setMenus(menusData);
    } catch (error) {
      console.error("❌ Erreur chargement données:", error);
      setError("Échec du chargement des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

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
              await deleteRestaurantTable(businessId!, tableId);
              setTables(tables.filter((t) => t.id !== tableId));
              Alert.alert("Succès", `Table "${tableName}" supprimée !`);
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer la table");
            }
          },
        },
      ]
    );
  };

  const handleDeleteMenu = async (menuId: string, menuName: string) => {
    Alert.alert(
      "Confirmer la suppression",
      `Voulez-vous vraiment supprimer le menu "${menuName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(
                `/restaurants/${businessId}/menus/${menuId}`
              );
              setMenus(menus.filter((m) => m.id !== menuId));
              Alert.alert("Succès", `Menu "${menuName}" supprimé !`);
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer le menu");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="sad-outline" size={40} color="#6b7280" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadData}
          accessibilityLabel="Réessayer de charger les données"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections: Section[] = [
    {
      title: "Tables",
      icon: "cafe-outline",
      action: openCreateModal,
      actionIcon: "add-circle-outline",
      actionLabel: "Ajouter une table",
      data:
        tables.length === 0
          ? [
              {
                id: "empty",
                label: "Aucune table",
                value: "Aucune table trouvée",
                icon: "alert-circle-outline",
              },
            ]
          : tables.map((table) => ({
              id: table.id,
              label: table.name,
              value: `Capacité: ${table.capacity} | Disponible: ${
                table.isAvailable ? "✅ Oui" : "❌ Non"
              }`,
              icon: table.isAvailable
                ? "checkmark-circle-outline"
                : "close-circle-outline",
              actions: [
                {
                  label: "Modifier",
                  onPress: () => openEditModal(table),
                  color: "#059669",
                },
                {
                  label: "Supprimer",
                  onPress: () => handleDeleteTable(table.id, table.name),
                  color: "#dc2626",
                },
              ],
            })),
    },
    {
      title: "Menus",
      icon: "restaurant-outline",
      action: () => Alert.alert("Info", "Ajout de menu à implémenter"),
      actionIcon: "add-circle-outline",
      actionLabel: "Ajouter un menu",
      data:
        menus.length === 0
          ? [
              {
                id: "empty",
                label: "Aucun menu",
                value: "Aucun menu trouvé",
                icon: "alert-circle-outline",
              },
            ]
          : menus.map((menu) => ({
              id: menu.id,
              label: menu.name,
              value: `${menu.description || "Pas de description"} | Prix: ${
                menu.price
              } FCFA | Actif: ${menu.isActive ? "✅ Oui" : "❌ Non"}`,
              icon: "fast-food-outline",
              actions: [
                {
                  label: "Modifier",
                  onPress: () =>
                    Alert.alert("Info", `Modifier ${menu.name} à implémenter`),
                  color: "#059669",
                },
                {
                  label: "Supprimer",
                  onPress: () => handleDeleteMenu(menu.id, menu.name),
                  color: "#dc2626",
                },
              ],
            })),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Retour à la page précédente"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Ionicons
          name="restaurant-outline"
          size={28}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
          Gestion du restaurant
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadData}
          accessibilityLabel="Rafraîchir les données"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.sectionCard}
          >
            <LinearGradient
              colors={["#ffffff", "#f8fafc"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color="#3b82f6"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
              <TouchableOpacity
                onPress={item.action}
                style={styles.addButton}
                accessibilityLabel={item.actionLabel}
                accessibilityRole="button"
              >
                <Ionicons name={item.actionIcon} size={20} color="#3b82f6" />
                <Text style={styles.addButtonText}>{item.actionLabel}</Text>
              </TouchableOpacity>
            </View>
            {item.data.map((dataItem, dataIndex) => (
              <View key={dataItem.id} style={styles.dataRow}>
                <Ionicons
                  name={dataItem.icon}
                  size={16}
                  color="#3b82f6"
                  style={styles.dataIcon}
                />
                <View style={styles.dataContent}>
                  <Text style={styles.dataLabel}>{dataItem.label}</Text>
                  <Text style={styles.dataValue}>{dataItem.value}</Text>
                  {dataItem.actions && (
                    <View style={styles.actionsRow}>
                      {dataItem.actions.map(
                        (
                          action: {
                            label: string;
                            onPress: () => void;
                            color: string;
                          },
                          actionIndex: number
                        ) => (
                          <TouchableOpacity
                            key={actionIndex}
                            style={[
                              styles.actionButton,
                              { backgroundColor: action.color },
                            ]}
                            onPress={action.onPress}
                            accessibilityLabel={action.label}
                            accessibilityRole="button"
                          >
                            <Text style={styles.actionButtonText}>
                              {action.label}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInUp.springify()}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTable ? "Modifier Table" : "Nouvelle Table"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Fermer la fenêtre"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nom de la table"
              value={tableName}
              onChangeText={setTableName}
              accessibilityLabel="Nom de la table"
            />
            <TextInput
              style={styles.input}
              placeholder="Capacité"
              keyboardType="numeric"
              value={tableCapacity}
              onChangeText={setTableCapacity}
              accessibilityLabel="Capacité de la table"
            />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Disponible</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: tableAvailable ? "#059669" : "#6b7280" },
                ]}
                onPress={() => setTableAvailable(!tableAvailable)}
                accessibilityLabel={
                  tableAvailable
                    ? "Désactiver la disponibilité"
                    : "Activer la disponibilité"
                }
                accessibilityRole="button"
              >
                <Text style={styles.toggleText}>
                  {tableAvailable ? "Oui" : "Non"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#3b82f6" }]}
                onPress={handleSaveTable}
                accessibilityLabel={
                  editingTable ? "Sauvegarder la table" : "Créer la table"
                }
                accessibilityRole="button"
              >
                <Text style={styles.modalButtonText}>
                  {editingTable ? "Sauvegarder" : "Créer"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#dc2626" }]}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Annuler"
                accessibilityRole="button"
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 12,
    marginRight: 12,
  },
  headerIcon: {
    marginRight: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  refreshButton: {
    padding: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#3b82f6",
    marginLeft: 4,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  dataIcon: {
    marginRight: 8,
  },
  dataContent: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  dataValue: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AdminRestaurantDashboard;
