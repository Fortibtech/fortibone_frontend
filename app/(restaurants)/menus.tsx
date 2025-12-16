import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useBusinessStore } from "@/store/businessStore";

import {
  getMenus,
  Menu,
  createMenu,
  updateMenu,
  deleteMenu,
  uploadImageMenu,
} from "@/api/menu/menuApi";

export default function MenuScreen() {
  const business = useBusinessStore((state) => state.business);
  const version = useBusinessStore((state) => state.version);
  const businessId = business?.id;
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fonction pour recharger les menus depuis l'API (utilisée après chaque action)
  const fetchMenus = async () => {
    if (!businessId) {
      setMenus([]);
      return;
    }

    try {
      const data = await getMenus(businessId);
      // Tri inverse : le dernier créé en haut
      setMenus((data || []).reverse());
      setMenus(data || []);
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de charger les menus");
    }
  };

  // Chargement initial et quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      fetchMenus();
    }, [businessId, version])
  );

  useEffect(() => {
    fetchMenus();
  }, [businessId]);

  // Rafraîchissement manuel (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenus();
    setRefreshing(false);
  };

  const loadMenus = async () => {
    setLoading(true);
    await fetchMenus();
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setIsActive(true);
    setImageUri(null);
    setCurrentMenuId(null);
    setIsEditMode(false);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (menu: Menu) => {
    setIsEditMode(true);
    setCurrentMenuId(menu.id);
    setName(menu.name);
    setDescription(menu.description || "");
    setPrice(menu.price.toString());
    setIsActive(menu.isActive);
    setImageUri(menu.imageUrl || null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert("Erreur", "Nom et prix obligatoires");
      return;
    }

    const priceNum = parseInt(price.replace(/[^0-9]/g, ""), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Erreur", "Prix invalide");
      return;
    }

    if (!businessId) return;

    setSaving(true);

    try {
      let createdOrUpdatedMenu: Menu;

      if (isEditMode && currentMenuId) {
        // Mise à jour
        await updateMenu(businessId, currentMenuId, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          isActive,
        });

        // Upload image si changée
        if (
          imageUri &&
          imageUri !== menus.find((m) => m.id === currentMenuId)?.imageUrl
        ) {
          setUploadingImage(true);
          createdOrUpdatedMenu = await uploadImageMenu(
            businessId,
            currentMenuId,
            imageUri
          );
        } else {
          createdOrUpdatedMenu = {
            id: currentMenuId,
            name: name.trim(),
            description: description.trim() || null,
            price: priceNum.toString(),
            isActive,
            imageUrl:
              menus.find((m) => m.id === currentMenuId)?.imageUrl || null,
            items: [],
          } as unknown as Menu;
        }

        Alert.alert("Succès", "Menu modifié !");
      } else {
        // Création
        const created = await createMenu(businessId, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          isActive,
          items: [],
        });

        if (imageUri) {
          setUploadingImage(true);
          createdOrUpdatedMenu = await uploadImageMenu(
            businessId,
            created.id,
            imageUri
          );
        } else {
          createdOrUpdatedMenu = created;
        }

        Alert.alert("Succès", "Menu créé !");
      }

      // Recharger TOUTE la liste depuis le serveur → garantit affichage correct immédiat
      await fetchMenus();

      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Échec de la sauvegarde");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async (menu: Menu) => {
    if (!businessId) return;

    Alert.alert("Supprimer", `Supprimer "${menu.name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenu(businessId, menu.id);
            // Recharger la liste après suppression
            await fetchMenus();
            Alert.alert("Supprimé", `"${menu.name}" a été supprimé`);
          } catch (err: any) {
            Alert.alert("Erreur", err.message || "Impossible de supprimer");
          }
        },
      },
    ]);
  };

  const renderMenu = ({ item }: { item: Menu }) => (
    <View style={styles.menuCard}>
      <View style={styles.imageWrapper}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderCardImage}>
            <Ionicons name="restaurant" size={64} color="#D1D5DB" />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : (
          <Text style={styles.noDescription}>Aucune description</Text>
        )}

        <Text style={styles.cardPrice}>
          {Number(item.price).toLocaleString("fr-FR")} KMF
        </Text>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                !item.isActive && { color: "#6B7280" },
              ]}
            >
              {item.isActive ? "Visible" : "Masqué"}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => openEditModal(item)} hitSlop={12}>
              <Ionicons name="create-outline" size={28} color="#6366F1" />
            </Pressable>

            <Pressable
              onPress={() => handleDelete(item)}
              hitSlop={12}
              style={{ marginLeft: 24 }}
            >
              <Ionicons name="trash-outline" size={26} color="#EF4444" />
            </Pressable>
          </View>
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
      {loading && menus.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : menus.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="restaurant-outline" size={120} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Aucun menu</Text>
          <Text style={styles.emptySubtitle}>Créez votre première formule</Text>

          <TouchableOpacity
            style={styles.emptyButton}
            onPress={openCreateModal}
          >
            <Text style={styles.emptyButtonText}>+ Créer un menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={menus}
          renderItem={renderMenu}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6366F1"]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          ListFooterComponent={() => <View style={{ height: 120 }} />}
        />
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditMode ? "Modifier le menu" : "Nouveau menu"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.placeholderImagePicker}>
                      <Ionicons
                        name="camera-outline"
                        size={44}
                        color="#9CA3AF"
                      />
                      <Text style={styles.imageHint}>Ajouter une photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {uploadingImage && (
                  <Text style={styles.uploadText}>Upload en cours...</Text>
                )}

                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Menu Duo..."
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[
                    styles.input,
                    { height: 90, textAlignVertical: "top" },
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Inclus pizza + boisson..."
                  multiline
                />

                <Text style={styles.label}>Prix (KMF) *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="1490"
                  keyboardType="number-pad"
                />

                <View style={styles.switchRow}>
                  <Text style={styles.label}>Visible aux clients</Text>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{ true: "#6366F1" }}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!name || !price || saving) && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!name || !price || saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Les styles restent exactement les mêmes que précédemment
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  list: { padding: 24 },
  menuCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  imageWrapper: { height: 200 },
  cardImage: { width: "100%", height: "100%" },
  placeholderCardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { padding: 24 },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 12,
  },
  noDescription: {
    fontSize: 15,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginBottom: 12,
  },
  cardPrice: {
    fontSize: 28,
    fontWeight: "900",
    color: "#6366F1",
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 90,
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#10B98120",
  },
  inactiveBadge: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 32,
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyButton: {
    marginTop: 40,
    paddingHorizontal: 40,
    paddingVertical: 18,
    backgroundColor: "#6366F1",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 48,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  imagePicker: {
    width: "100%",
    height: 160,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  previewImage: { width: "100%", height: "100%" },
  placeholderImagePicker: {
    justifyContent: "center",
    alignItems: "center",
  },
  imageHint: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
  uploadText: {
    textAlign: "center",
    color: "#6366F1",
    marginBottom: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#111827",
  },
  input: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: "#6366F1",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 17,
    fontWeight: "600",
  },
});
