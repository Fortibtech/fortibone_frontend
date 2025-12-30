// app/menu/index.tsx
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
import { ProductListScreen } from "@/components/produits/ProductListScreens";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
import { getProductsByBusiness, ProductVariant, Produit } from "@/api/Products";
import InventoryApp from "@/components/produits/InventoryApp";

type TabType = "MENUS" | "PLATS" | "INVENTAIRE";

export default function MenuScreen() {
  const business = useBusinessStore((state) => state.business);
  const version = useBusinessStore((state) => state.version);
  const businessId: any = business?.id;
  const [activeTab, setActiveTab] = useState<TabType>("MENUS");

  // États pour les menus
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [symbol, setSymbol] = useState<string | null>(null);

  // États du modal
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

  // États pour la composition du menu (SEULEMENT en CREATE)
  const [selectedItems, setSelectedItems] = useState<
    { variant: ProductVariant; quantity: number }[]
  >([]);
  const [products, setProducts] = useState<Produit[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  const fetchMenus = async () => {
    if (!businessId) {
      setMenus([]);
      return;
    }
    try {
      const data = await getMenus(businessId);
      setMenus(data || []);
      if (!business) return;
      const currSymbol = await getCurrencySymbolById(business.currencyId);
      setSymbol(currSymbol);
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de charger les menus");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!businessId) return;
    setLoadingProducts(true);
    try {
      const response = await getProductsByBusiness(businessId, { limit: 100 });
      setProducts(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les plats");
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateSuggestedPrice = () => {
    const total = selectedItems.reduce((sum, item) => {
      const variantPrice = parseFloat(item.variant.price || "0");
      return sum + variantPrice * item.quantity;
    }, 0);
    setSuggestedPrice(total > 0 ? Math.round(total) : null);
  };

  useEffect(() => {
    calculateSuggestedPrice();
  }, [selectedItems]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === "MENUS") {
        setLoading(true);
        fetchMenus();
      }
    }, [businessId, version, activeTab])
  );

  useEffect(() => {
    if (activeTab === "MENUS") {
      fetchMenus();
    }
  }, [businessId, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "MENUS") await fetchMenus();
    setRefreshing(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setIsActive(true);
    setImageUri(null);
    setCurrentMenuId(null);
    setIsEditMode(false);
    setSelectedItems([]);
    setSearchQuery("");
    setSuggestedPrice(null);
  };

  const openCreateModal = () => {
    resetForm();
    fetchProducts(); // Charge les produits pour la sélection (CREATE uniquement)
    setModalVisible(true);
  };

  const openEditModal = async (menu: Menu) => {
    setIsEditMode(true);
    setCurrentMenuId(menu.id);
    setName(menu.name);
    setDescription(menu.description || "");
    setPrice(menu.price.toString());
    setIsActive(menu.isActive);
    setImageUri(menu.imageUrl || null);
    setSelectedItems([]); // Pas de sélection en mode EDIT (items non modifiables via PATCH)
    setSuggestedPrice(null);
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

  const addOrUpdateItem = (variant: ProductVariant) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.variant.id === variant.id);
      if (existing) {
        return prev.map((i) =>
          i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { variant, quantity: 1 }];
    });
  };

  const removeItem = (variantId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((i) => (i.variant.id === variantId ? { ...i, quantity } : i))
    );
  };

  // ✅ FONCTION handleSave CORRIGÉE : CREATE vs UPDATE séparés
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom du menu est obligatoire");
      return;
    }

    if (!isEditMode && selectedItems.length === 0) {
      Alert.alert("Erreur", "Ajoutez au moins un plat à la formule (création)");
      return;
    }

    if (!price.trim()) {
      Alert.alert("Erreur", "Le prix est obligatoire");
      return;
    }

    const priceNum = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Erreur", "Le prix doit être un nombre valide supérieur à 0");
      return;
    }

    if (!businessId) {
      Alert.alert("Erreur", "Business non chargé");
      return;
    }

    setSaving(true);

    try {
      let menuId: string;

      if (isEditMode && currentMenuId) {
        // ✅ UPDATE (PATCH) : SANS items (selon doc API)
        const updatePayload = {
          name: name.trim(),
          description: description.trim() || "",
          price: priceNum,
          isActive,
        };

        console.log(
          "📤 UPDATE Payload (PATCH) :",
          JSON.stringify(updatePayload, null, 2)
        );

        await updateMenu(businessId, currentMenuId, updatePayload);
        menuId = currentMenuId;
        Alert.alert("Succès", "Menu modifié avec succès !");
      } else {
        // ✅ CREATE (POST) : AVEC items
        const itemsPayload = selectedItems.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        }));

        const createPayload = {
          name: name.trim(),
          description: description.trim() || "",
          price: priceNum,
          isActive,
          items: itemsPayload,
        };

        console.log(
          "📤 CREATE Payload (POST) :",
          JSON.stringify(createPayload, null, 2)
        );

        const created = await createMenu(businessId, createPayload);
        menuId = created.id;
        Alert.alert("Succès", "Menu créé avec succès !");
      }

      // Upload image si nouvelle photo
      if (imageUri) {
        const currentImageUrl = menus.find(
          (m) => m.id === currentMenuId
        )?.imageUrl;
        if (imageUri !== currentImageUrl) {
          setUploadingImage(true);
          await uploadImageMenu(businessId, menuId, imageUri);
          setUploadingImage(false);
        }
      }

      await fetchMenus();
      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      console.error("❌ Erreur sauvegarde :", err.response?.data || err);

      const errorMessage =
        err.response?.data?.message || err.message || "Échec de la sauvegarde";
      Alert.alert("Erreur API", errorMessage);
    } finally {
      setSaving(false);
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
            await fetchMenus();
            Alert.alert("Supprimé", `"${menu.name}" supprimé`);
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
          {Number(item.price).toLocaleString("fr-FR")} {symbol}
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

  const showAddButton = activeTab === "MENUS";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion du menu</Text>
        {showAddButton && (
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "MENUS" && styles.tabActive]}
          onPress={() => setActiveTab("MENUS")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "MENUS" && styles.tabTextActive,
            ]}
          >
            Menus & Formules
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "PLATS" && styles.tabActive]}
          onPress={() => setActiveTab("PLATS")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "PLATS" && styles.tabTextActive,
            ]}
          >
            Plats individuels
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "INVENTAIRE" && styles.tabActive]}
          onPress={() => setActiveTab("INVENTAIRE")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "INVENTAIRE" && styles.tabTextActive,
            ]}
          >
            Inventaire
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "MENUS" ? (
        <>
          {loading && menus.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : menus.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={120} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>Aucun menu</Text>
              <Text style={styles.emptySubtitle}>
                Créez votre première formule
              </Text>
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
        </>
      ) : activeTab === "PLATS" ? (
        <ProductListScreen />
      ) : (
        <InventoryApp id={businessId} />
      )}

      {/* Modal adapté : sélection items MASQUÉE en mode EDIT */}
      {activeTab === "MENUS" && (
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

                  <Text style={styles.label}>Prix ({symbol}) *</Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="1490"
                    keyboardType="number-pad"
                  />

                  {/* Prix suggéré SEULEMENT en CREATE */}
                  {!isEditMode && suggestedPrice !== null && (
                    <View style={styles.suggestedPriceContainer}>
                      <Text style={styles.suggestedPriceText}>
                        Prix suggéré :{" "}
                        <Text style={{ fontWeight: "800", color: "#6366F1" }}>
                          {suggestedPrice.toLocaleString("fr-FR")} {symbol}
                        </Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => setPrice(suggestedPrice.toString())}
                      >
                        <Text style={styles.applySuggestedText}>Appliquer</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Sélection items SEULEMENT en CREATE */}
                  {!isEditMode && (
                    <>
                      <Text style={[styles.label, { marginTop: 24 }]}>
                        Composition du menu *
                      </Text>

                      {loadingProducts ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} />
                      ) : (
                        <>
                          <TextInput
                            style={[styles.input, { marginBottom: 12 }]}
                            placeholder="Rechercher un plat..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                          />

                          <FlatList
                            data={products.filter((p) =>
                              p.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            )}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            renderItem={({ item: produit }) => (
                              <View>
                                {produit.variants.map((variant) => {
                                  const isSelected = selectedItems.some(
                                    (i) => i.variant.id === variant.id
                                  );
                                  return (
                                    <TouchableOpacity
                                      key={variant.id}
                                      style={[
                                        styles.variantItem,
                                        isSelected &&
                                          styles.variantItemSelected,
                                      ]}
                                      onPress={() => addOrUpdateItem(variant)}
                                    >
                                      {variant.imageUrl ? (
                                        <Image
                                          source={{ uri: variant.imageUrl }}
                                          style={styles.variantImage}
                                        />
                                      ) : (
                                        <View
                                          style={styles.variantPlaceholderImage}
                                        >
                                          <Ionicons
                                            name="restaurant"
                                            size={32}
                                            color="#CCC"
                                          />
                                        </View>
                                      )}
                                      <View style={styles.variantInfo}>
                                        <Text style={styles.variantName}>
                                          {produit.name}
                                        </Text>
                                        {variant.attributeValues.length > 0 && (
                                          <Text
                                            style={styles.variantAttributes}
                                          >
                                            {variant.attributeValues
                                              .map((av) => av.value)
                                              .join(", ")}
                                          </Text>
                                        )}
                                        <Text style={styles.variantPrice}>
                                          {parseFloat(
                                            variant.price
                                          ).toLocaleString("fr-FR")}{" "}
                                          {symbol}
                                        </Text>
                                      </View>
                                      {isSelected && (
                                        <Ionicons
                                          name="checkmark-circle"
                                          size={28}
                                          color="#10B981"
                                        />
                                      )}
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            )}
                            style={{ maxHeight: 300 }}
                          />
                        </>
                      )}

                      {selectedItems.length > 0 && (
                        <View style={styles.selectedItemsSection}>
                          <Text style={styles.label}>
                            Éléments inclus ({selectedItems.length})
                          </Text>
                          {selectedItems.map((item) => (
                            <View
                              key={item.variant.id}
                              style={styles.selectedItemRow}
                            >
                              <Text
                                style={styles.selectedItemText}
                                numberOfLines={1}
                              >
                                {item.quantity}x{" "}
                                {item.variant.productName || produit.name}{" "}
                                {item.variant.attributeValues.length > 0 &&
                                  `(${item.variant.attributeValues
                                    .map((av) => av.value)
                                    .join(", ")})`}
                              </Text>
                              <View style={styles.quantityControls}>
                                <Pressable
                                  onPress={() =>
                                    updateQuantity(
                                      item.variant.id,
                                      item.quantity - 1
                                    )
                                  }
                                  hitSlop={10}
                                >
                                  <Ionicons
                                    name="remove-circle"
                                    size={28}
                                    color="#EF4444"
                                  />
                                </Pressable>
                                <Text style={styles.quantityText}>
                                  {item.quantity}
                                </Text>
                                <Pressable
                                  onPress={() =>
                                    updateQuantity(
                                      item.variant.id,
                                      item.quantity + 1
                                    )
                                  }
                                  hitSlop={10}
                                >
                                  <Ionicons
                                    name="add-circle"
                                    size={32}
                                    color="#6366F1"
                                  />
                                </Pressable>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}

                  {/* Info en mode EDIT : composition non modifiable */}
                  {isEditMode && (
                    <View style={styles.editInfoBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color="#6366F1"
                      />
                      <Text style={styles.editInfoText}>
                        La composition des plats est modifiable uniquement lors
                        de la création
                      </Text>
                    </View>
                  )}

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
                      (!name ||
                        !price ||
                        (!isEditMode && selectedItems.length === 0) ||
                        saving) &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={
                      !name ||
                      !price ||
                      (!isEditMode && selectedItems.length === 0) ||
                      saving
                    }
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFB" },
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
  title: { fontSize: 24, fontWeight: "800", color: "#111827" },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#7C3AED" },
  tabText: { fontSize: 16, color: "#666" },
  tabTextActive: { fontWeight: "700", color: "#7C3AED" },
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
  statusText: { fontSize: 13, fontWeight: "700", color: "#059669" },
  actions: { flexDirection: "row", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  emptyButtonText: { color: "#FFF", fontWeight: "800", fontSize: 18 },
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
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
  placeholderImagePicker: { justifyContent: "center", alignItems: "center" },
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
  },
  suggestedPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  suggestedPriceText: { fontSize: 15, color: "#166534" },
  applySuggestedText: { color: "#6366F1", fontWeight: "700" },
  variantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  variantItemSelected: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  variantImage: { width: 60, height: 60, borderRadius: 12 },
  variantPlaceholderImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  variantInfo: { flex: 1, marginLeft: 12 },
  variantName: { fontSize: 16, fontWeight: "600" },
  variantAttributes: { fontSize: 14, color: "#6B7280" },
  variantPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6366F1",
    marginTop: 4,
  },
  selectedItemsSection: { marginTop: 24 },
  selectedItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedItemText: { flex: 1, fontSize: 15, fontWeight: "600" },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  quantityText: {
    fontSize: 18,
    fontWeight: "800",
    minWidth: 30,
    textAlign: "center",
  },
  editInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginTop: 20,
    marginBottom: 20,
  },
  editInfoText: {
    fontSize: 15,
    color: "#1E40AF",
    marginLeft: 12,
    fontWeight: "500",
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
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#FFF", fontWeight: "800", fontSize: 18 },
  cancelButton: { marginTop: 16, paddingVertical: 18, alignItems: "center" },
  cancelButtonText: { color: "#6B7280", fontSize: 17, fontWeight: "600" },
});
