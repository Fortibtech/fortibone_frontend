// app/(app)/restaurants/[restaurantsId]/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getMenus, Menu } from "@/api/menu/menuApi";
import Toast from "react-native-toast-message";

const Menus = ({ restaurantsId }: { restaurantsId: string }) => {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const isInCart = useCartStore((state) => state.isInCart);

  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchMenus = async () => {
    if (!restaurantsId) return;
    setLoading(true);
    try {
      const menuData = await getMenus(restaurantsId);
      setMenus(menuData.filter((menu) => menu.isActive));
    } catch (err) {
      console.error("Erreur chargement des menus :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [restaurantsId]);

  const openMenuDetails = (menu: Menu) => {
    setSelectedMenu(menu);
    setQuantity(1);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMenu(null);
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleToggleCart = () => {
    if (!selectedMenu) return;

    // Vérifie si le menu est déjà entièrement dans le panier
    let allItemsInCart = true;

    selectedMenu.menuItems.forEach((menuItem) => {
      const productId = menuItem.variant.productId || selectedMenu.id;
      const inCart = isInCart(productId, menuItem.variantId);

      if (!inCart) allItemsInCart = false;
    });

    if (allItemsInCart) {
      // Retirer tous les plats du menu
      selectedMenu.menuItems.forEach((menuItem) => {
        const productId = menuItem.variant.productId || selectedMenu.id;
        removeItem(productId, menuItem.variantId);
      });

      Toast.show({
        type: "info",
        text1: "Menu retiré",
        text2: selectedMenu.name,
      });
    } else {
      // AJOUTER CHAQUE PLAT AVEC SA VRAIE variantId
      selectedMenu.menuItems.forEach((menuItem) => {
        const productId = menuItem.variant.productId || selectedMenu.id;

        addItem(
          {
            productId,
            variantId: menuItem.variantId, // ← VRAIE variantId !
            name: menuItem.variant.product.name,
            price: Number(menuItem.variant.price),
            imageUrl: menuItem.variant.imageUrl || undefined,
            businessId: restaurantsId,
          },
          quantity * menuItem.quantity
        );
      });

      Toast.show({
        type: "success",
        text1: "Menu ajouté !",
        text2: `${quantity} × ${selectedMenu.name}`,
      });
    }

    closeModal();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00af66" />
        <Text style={styles.loadingText}>Chargement des menus...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInUp}>
          <Text style={styles.sectionTitle}>Nos Menus & Formules</Text>

          {menus.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="restaurant-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                Aucun menu disponible pour le moment
              </Text>
            </View>
          ) : (
            <View style={styles.menuList}>
              {menus.map((menu, i) => (
                <Animated.View key={menu.id} entering={FadeInUp.delay(80 * i)}>
                  <Pressable
                    onPress={() => openMenuDetails(menu)}
                    style={({ pressed }) => [
                      styles.menuCardClient,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.menuImageWrapper}>
                      {menu.imageUrl ? (
                        <Image
                          source={{ uri: menu.imageUrl }}
                          style={styles.menuImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.menuImagePlaceholder}>
                          <Ionicons
                            name="restaurant"
                            size={60}
                            color="#E0E0E0"
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.menuCardContent}>
                      <Text style={styles.menuCardTitle}>{menu.name}</Text>

                      {menu.description ? (
                        <Text
                          style={styles.menuCardDescription}
                          numberOfLines={2}
                        >
                          {menu.description}
                        </Text>
                      ) : (
                        <Text style={styles.menuCardNoDesc}>
                          Formule complète
                        </Text>
                      )}

                      <View style={styles.priceRow}>
                        <Text style={styles.menuCardPrice}>
                          {Number(menu.price).toLocaleString("fr-FR")} KMF
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#00af66"
                        />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedMenu && (
              <>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {selectedMenu.imageUrl ? (
                    <Image
                      source={{ uri: selectedMenu.imageUrl }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.modalImagePlaceholder}>
                      <Ionicons name="restaurant" size={80} color="#E0E0E0" />
                    </View>
                  )}

                  <View style={styles.modalBody}>
                    <Text style={styles.modalTitle}>{selectedMenu.name}</Text>

                    <View style={styles.modalPriceContainer}>
                      <Text style={styles.modalPrice}>
                        {Number(selectedMenu.price).toLocaleString("fr-FR")} KMF
                      </Text>
                    </View>

                    {selectedMenu.description && (
                      <Text style={styles.modalDescription}>
                        {selectedMenu.description}
                      </Text>
                    )}

                    <View style={styles.includedSection}>
                      <Text style={styles.includedTitle}>
                        Cette formule comprend :
                      </Text>

                      {selectedMenu.menuItems.length === 0 ? (
                        <Text style={styles.noItemsText}>
                          Aucune information sur la composition
                        </Text>
                      ) : (
                        <View style={styles.itemsList}>
                          {selectedMenu.menuItems.map((item) => (
                            <View key={item.id} style={styles.menuItemRow}>
                              <View style={styles.itemImageWrapper}>
                                {item.variant.imageUrl ? (
                                  <Image
                                    source={{ uri: item.variant.imageUrl }}
                                    style={styles.itemImage}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={styles.itemImagePlaceholder}>
                                    <Ionicons
                                      name="restaurant-outline"
                                      size={28}
                                      color="#BBB"
                                    />
                                  </View>
                                )}
                              </View>

                              <View style={styles.itemDetails}>
                                <Text style={styles.itemQuantity}>
                                  {item.quantity > 1
                                    ? `${item.quantity}×`
                                    : "1×"}
                                </Text>
                                <Text style={styles.itemName}>
                                  {item.variant.product.name}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <View style={styles.quantitySection}>
                      <Text style={styles.quantityLabel}>Quantité</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          onPress={decrementQuantity}
                          style={styles.quantityButton}
                          disabled={quantity === 1}
                        >
                          <Ionicons name="remove" size={24} color="#333" />
                        </TouchableOpacity>

                        <Text style={styles.quantityNumber}>{quantity}</Text>

                        <TouchableOpacity
                          onPress={incrementQuantity}
                          style={styles.quantityButton}
                        >
                          <Ionicons name="add" size={24} color="#333" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.totalSection}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalAmount}>
                        {(Number(selectedMenu.price) * quantity).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        KMF
                      </Text>
                    </View>

                    <View style={styles.marketingFooter}>
                      <Text style={styles.marketingText}>
                        Une formule pensée pour vous faire plaisir ❤️
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Bouton Ajouter au panier */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={handleToggleCart}
                    style={styles.cartButtonAdd}
                  >
                    <Ionicons name="cart-outline" size={24} color="#00af66" />
                    <Text style={styles.cartButtonText}>
                      Ajouter {quantity > 1 ? `${quantity} menus` : "au panier"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },

  menuList: { gap: 20 },
  menuCardClient: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  menuImageWrapper: { height: 180 },
  menuImage: { width: "100%", height: "100%" },
  menuImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  menuCardContent: { padding: 18 },
  menuCardTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  menuCardDescription: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },
  menuCardNoDesc: {
    fontSize: 14.5,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  menuCardPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#00af66",
  },

  emptyCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 16,
    alignItems: "flex-end",
  },
  modalImage: {
    width: "100%",
    height: 320,
  },
  modalImagePlaceholder: {
    width: "100%",
    height: 320,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: { padding: 24 },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },
  modalPriceContainer: {
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  modalPrice: {
    fontSize: 32,
    fontWeight: "900",
    color: "#059669",
  },
  modalDescription: {
    fontSize: 16.5,
    color: "#4B5563",
    lineHeight: 26,
    marginBottom: 24,
  },

  includedSection: { marginTop: 8 },
  includedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  itemsList: { gap: 16 },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FDFB",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0F2EE",
  },
  itemImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  itemImage: { width: "100%", height: "100%" },
  itemImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0F2EE",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: { flex: 1, flexDirection: "row", alignItems: "center" },
  itemQuantity: {
    fontSize: 18,
    fontWeight: "800",
    color: "#00af66",
    marginRight: 12,
    minWidth: 40,
  },
  itemName: { fontSize: 17, fontWeight: "600", color: "#1F2937", flex: 1 },
  noItemsText: {
    fontSize: 15,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },

  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 24,
  },
  quantityLabel: { fontSize: 18, fontWeight: "600", color: "#333" },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  quantityNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00af66",
    minWidth: 40,
    textAlign: "center",
  },

  totalSection: {
    backgroundColor: "#ecfdf5",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: { fontSize: 16, color: "#059669", fontWeight: "600" },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#059669",
    marginTop: 8,
  },

  marketingFooter: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    alignItems: "center",
  },
  marketingText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#059669",
    textAlign: "center",
  },

  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cartButtonAdd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    borderWidth: 2,
    backgroundColor: "#ECFDF5",
    borderColor: "#00af66",
  },
  cartButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00af66",
  },
});

export default Menus;
