// app/(restaurants)/menu/index.tsx
import React, { useEffect, useState } from "react";
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

import { useSelectedBusiness } from "@/api/hooks";
import {
  getMenus,
  Menu,
  createMenu,
  updateMenu,
  deleteMenu,
  uploadImageMenu,
} from "@/api/menu/menuApi";

export default function MenuScreen() {
  const { selectedBusiness } = useSelectedBusiness();
  const businessId = selectedBusiness?.id;

  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // en KMF (ex: "1490")
  const [isActive, setIsActive] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Chargement
  const loadMenus = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const data = await getMenus(businessId);
      setMenus(data || []);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les menus");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [businessId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMenus();
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
    setPrice((Number(menu.price) / 100).toString());
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

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Erreur", "Prix invalide");
      return;
    }

    setSaving(true);

    try {
      let finalMenu: Menu;

      if (isEditMode && currentMenuId) {
        // MISE À JOUR
        await updateMenu(businessId!, currentMenuId, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: Math.round(priceNum * 100),
          isActive,
        });

        if (
          imageUri &&
          imageUri !== menus.find((m) => m.id === currentMenuId)?.imageUrl
        ) {
          setUploadingImage(true);
          finalMenu = await uploadImageMenu(
            businessId!,
            currentMenuId,
            imageUri
          );
        } else {
          finalMenu = menus.find((m) => m.id === currentMenuId)!;
          finalMenu.name = name;
          finalMenu.description = description || null;
          finalMenu.price = String(Math.round(priceNum * 100));
          finalMenu.isActive = isActive;
        }

        Alert.alert("Succès", "Menu modifié !");
      } else {
        // CRÉATION
        const created = await createMenu(businessId!, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: Math.round(priceNum * 100),
          isActive,
          items: [],
        });

        if (imageUri) {
          setUploadingImage(true);
          finalMenu = await uploadImageMenu(businessId!, created.id, imageUri);
        } else {
          finalMenu = created;
        }

        Alert.alert("Succès", "Menu créé !");
      }

      // Mise à jour liste
      setMenus((prev) =>
        prev
          .map((m) => (m.id === finalMenu.id ? finalMenu : m))
          .concat(isEditMode ? [] : [finalMenu])
      );

      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Échec de la sauvegarde");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = (menu: Menu) => {
    Alert.alert("Supprimer", `Supprimer "${menu.name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenu(businessId!, menu.id);
            Alert.alert("Supprimé", `"${menu.name}" supprimé`);
            loadMenus();
          } catch (err: any) {
            Alert.alert("Erreur", err.message);
          }
        },
      },
    ]);
  };

  // NOUVELLE CARTE – IMAGE EN HAUT
  const renderMenu = ({ item }: { item: Menu }) => (
    <View style={styles.menuCard}>
      {/* Image en haut */}
      <View style={styles.imageWrapper}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderCardImage}>
            <Ionicons name="restaurant" size={60} color="#CCC" />
          </View>
        )}
      </View>

      {/* Contenu */}
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

        {/* Footer : statut + actions */}
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[styles.statusText, !item.isActive && { color: "#666" }]}
            >
              {item.isActive ? "Visible" : "Masqué"}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => openEditModal(item)} hitSlop={12}>
              <Ionicons name="create-outline" size={26} color="#7C3AED" />
            </Pressable>
            <Pressable
              onPress={() => handleDelete(item)}
              hitSlop={12}
              style={{ marginLeft: 20 }}
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Menus</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : menus.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="restaurant-outline" size={100} color="#E0E0E0" />
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
              colors={["#7C3AED"]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListFooterComponent={() => <View style={{ height: 100 }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

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
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image */}
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
                      <Ionicons name="camera-outline" size={40} color="#999" />
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
                    { height: 80, textAlignVertical: "top" },
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
                  keyboardType="numeric"
                />

                <View style={styles.switchRow}>
                  <Text style={styles.label}>Visible aux clients</Text>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{ true: "#7C3AED" }}
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

// STYLES MODERNES – Image en haut, tout propre
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

  list: { padding: 16 },
  menuCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  imageWrapper: { height: 180 },
  cardImage: { width: "100%", height: "100%" },
  placeholderCardImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    lineHeight: 20,
  },
  noDescription: {
    fontSize: 14,
    color: "#AAA",
    fontStyle: "italic",
    marginTop: 6,
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#7C3AED",
    marginTop: 12,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  activeBadge: { backgroundColor: "#ECFDF5" },
  inactiveBadge: { backgroundColor: "#F3F4F6" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#10B981" },

  actions: { flexDirection: "row", alignItems: "center" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: { fontSize: 22, fontWeight: "600", marginTop: 24, color: "#333" },
  emptySubtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "#7C3AED",
    borderRadius: 30,
  },
  emptyButtonText: { color: "#FFF", fontWeight: "700", fontSize: 17 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 24, fontWeight: "700", color: "#000" },

  imagePicker: {
    alignSelf: "center",
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%" },
  placeholderImagePicker: { justifyContent: "center", alignItems: "center" },
  imageHint: { marginTop: 8, color: "#999", fontSize: 14 },
  uploadText: {
    textAlign: "center",
    marginTop: 8,
    color: "#7C3AED",
    fontWeight: "600",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: "#7C3AED",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
  },
  saveButtonDisabled: { backgroundColor: "#A78BFA" },
  saveButtonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  cancelButton: { marginTop: 12, paddingVertical: 16, alignItems: "center" },
  cancelButtonText: { color: "#666", fontSize: 16 },
});
