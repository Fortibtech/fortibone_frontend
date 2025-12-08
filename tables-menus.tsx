// app/(restaurants)/tables-menus.tsx
import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

import {
  MenuItem,
  Table,
  TablePayload,
  UpdateTablePayload,
  createMenu,
  createRestaurantTable,
  deleteMenu,
  deleteRestaurantTable,
  getMenus,
  getTables,
  getVariants,
  updateMenu,
  updateRestaurantTable,
} from "@/api/restaurant";
import { SelectedBusinessManager } from "@/api";

interface SectionData {
  id: string;
  label: string;
  value: string;
  icon: string;
  actions?: { label: string; onPress: () => void; color: string }[];
}

interface Section {
  title: string;
  icon: string;
  action: () => void;
  actionIcon: string;
  actionLabel: string;
  data: SectionData[];
}

interface Menu {
  id: string;
  name: string;
  description: string;
  price: string;
  isActive: boolean;
  businessId: string;
  menuItems: MenuItem[];
}

const TablesMenusScreen: React.FC = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [tables, setTables] = useState<Table[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableAvailable, setTableAvailable] = useState(true);

  const [menuName, setMenuName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuVariantId, setMenuVariantId] = useState("");
  const [menuActive, setMenuActive] = useState(true);
  const [variants, setVariants] = useState<
    { variantId: string; name: string }[]
  >([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const selected = await SelectedBusinessManager.getSelectedBusiness();
        if (!selected) {
          setError("Aucun restaurant sélectionné");
          setLoading(false);
          return;
        }
        setBusinessId(selected.id);
        await loadData(selected.id);
      } catch (e) {
        console.error(e);
        setError("Erreur de chargement");
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      const [tablesData, menusData] = await Promise.all([
        getTables(id),
        getMenus(id),
      ]);
      setTables(tablesData);
      setMenus(menusData.map((m) => ({ ...m, price: String(m.price) })));
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Échec du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTable(null);
    setTableName("");
    setTableCapacity("");
    setTableAvailable(true);
    setModalVisible(true);
  };

  const openEditTableModal = (table: Table) => {
    setEditingTable(table);
    setTableName(table.name);
    setTableCapacity(String(table.capacity));
    setTableAvailable(table.isAvailable);
    setModalVisible(true);
  };

  const handleSaveTable = async () => {
    if (!businessId) return;
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
          businessId,
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
        const created = await createRestaurantTable(businessId, payload);
        setTables((prev) => [...prev, created]);
        Alert.alert("Succès", `Table "${created.name}" créée !`);
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sauvegarder la table");
    }
  };

  const openCreateMenuModal = async () => {
    if (!businessId) return;
    setEditingMenu(null);
    setMenuName("");
    setMenuDescription("");
    setMenuPrice("");
    setMenuVariantId("");
    setMenuActive(true);
    setMenuModalVisible(true);
    setLoadingVariants(true);
    try {
      const v = await getVariants(businessId);
      setVariants(v);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les variantes");
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleCreateMenu = async () => {
    if (!businessId) return;
    if (!menuName || !menuPrice || !menuVariantId) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }
    const price = Number(menuPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Erreur", "Le prix doit être un nombre positif");
      return;
    }
    try {
      const newMenu = await createMenu({
        name: menuName,
        description: menuDescription,
        price,
        variantId: menuVariantId,
        businessId,
      });
      setMenus((prev) => [
        ...prev,
        { ...newMenu, price: String(newMenu.price) },
      ]);
      Alert.alert("Succès", `Menu "${newMenu.name}" créé !`);
      setMenuModalVisible(false);
    } catch {
      Alert.alert("Erreur", "Impossible de créer le menu");
    }
  };

  const handleDeleteTable = (tableId: string, tableName: string) => {
    if (!businessId) return;
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
              await deleteRestaurantTable(businessId, tableId);
              setTables((prev) => prev.filter((t) => t.id !== tableId));
              Alert.alert("Succès", `Table "${tableName}" supprimée !`);
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer la table");
            }
          },
        },
      ]
    );
  };

  const handleDeleteMenu = (menuId: string, menuName: string) => {
    if (!businessId) return;
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
              await deleteMenu(businessId, menuId);
              setMenus((prev) => prev.filter((m) => m.id !== menuId));
              Alert.alert("Succès", `Menu "${menuName}" supprimé !`);
            } catch {
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

  if (error || !businessId) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color="#6b7280" />
        <Text style={styles.errorText}>{error ?? "Aucun restaurant"}</Text>
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
                value: "Créez votre première table",
                icon: "alert-circle-outline",
              },
            ]
          : tables.map((table) => ({
              id: table.id,
              label: table.name,
              value: `Capacité: ${table.capacity} | ${
                table.isAvailable ? "✅ Disponible" : "❌ Occupée"
              }`,
              icon: table.isAvailable
                ? "checkmark-circle-outline"
                : "close-circle-outline",
              actions: [
                {
                  label: "Modifier",
                  onPress: () => openEditTableModal(table),
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
      action: openCreateMenuModal,
      actionIcon: "add-circle-outline",
      actionLabel: "Ajouter un menu",
      data:
        menus.length === 0
          ? [
              {
                id: "empty",
                label: "Aucun menu",
                value: "Créez votre premier menu",
                icon: "alert-circle-outline",
              },
            ]
          : menus.map((menu) => ({
              id: menu.id,
              label: menu.name,
              value: `${
                menu.description || "Pas de description"
              } | Prix: ${Number(menu.price).toFixed(2)} FCFA`,
              icon: "fast-food-outline",
              actions: [
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
        <Ionicons
          name="restaurant-outline"
          size={24}
          color="#3b82f6"
          style={styles.headerIcon}
        />
        <Text style={styles.header} numberOfLines={1}>
          Tables & Menus
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadData(businessId)}
        >
          <Ionicons name="refresh" size={22} color="#3b82f6" />
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
              <TouchableOpacity onPress={item.action} style={styles.addButton}>
                <Ionicons name={item.actionIcon} size={20} color="#3b82f6" />
                <Text style={styles.addButtonText}>{item.actionLabel}</Text>
              </TouchableOpacity>
            </View>
            {item.data.map((row) => (
              <View key={row.id} style={styles.dataRow}>
                <Ionicons
                  name={row.icon}
                  size={16}
                  color="#3b82f6"
                  style={styles.dataIcon}
                />
                <View style={styles.dataContent}>
                  <Text style={styles.dataLabel}>{row.label}</Text>
                  <Text style={styles.dataValue}>{row.value}</Text>
                  {row.actions && (
                    <View style={styles.actionsRow}>
                      {row.actions.map((a, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.actionButton,
                            { backgroundColor: a.color },
                          ]}
                          onPress={a.onPress}
                        >
                          <Text style={styles.actionButtonText}>{a.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal tables (idem avant, simplifié ici) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInUp.springify()}
            style={styles.modalContent}
          >
            {/* inputs + boutons comme dans ta version */}
          </Animated.View>
        </View>
      </Modal>

      {/* Modal menus idem */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, fontSize: 16, color: "#1f2937" },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginTop: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerIcon: { marginRight: 8 },
  header: { fontSize: 20, fontWeight: "700", color: "#1f2937", flex: 1 },
  refreshButton: { padding: 8 },
  listContent: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
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
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center" },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  addButton: { flexDirection: "row", alignItems: "center", padding: 8 },
  addButtonText: { fontSize: 14, color: "#3b82f6", marginLeft: 4 },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  dataIcon: { marginRight: 8 },
  dataContent: { flex: 1 },
  dataLabel: { fontSize: 14, fontWeight: "500", color: "#1f2937" },
  dataValue: { fontSize: 14, color: "#4b5563", marginBottom: 8 },
  actionsRow: { flexDirection: "row", gap: 8 },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
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
});

export default TablesMenusScreen;
