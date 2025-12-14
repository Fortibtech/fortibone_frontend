// app/(app)/restaurants/[restaurantsId]/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { getMenus, Menu } from "@/api/menu/menuApi";
import Toast from "react-native-toast-message";
import { createOrder } from "@/api/Orders";

const RestaurantsId: React.FC = () => {
  const { restaurantsId } = useLocalSearchParams<{ restaurantsId: string }>();
  const router = useRouter();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1); // Quantité dans la modale
  const [isOrdering, setIsOrdering] = useState(false);

  const fetchMenus = async () => {
    if (!restaurantsId) return;
    setLoading(true);
    try {
      const menuData = await getMenus(restaurantsId);
      setMenus(menuData);
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
    setQuantity(1); // Réinitialiser à 1 à chaque ouverture
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMenu(null);
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  // Prix total selon quantité
  const totalPrice = selectedMenu ? Number(selectedMenu.price) * quantity : 0;

  const handleDirectOrder = async () => {
    if (!selectedMenu || isOrdering) return;

    setIsOrdering(true);

    const payload: any = {
      type: "SALE" as const,
      businessId: restaurantsId,
      supplierBusinessId: null,
      notes: `Commande directe depuis la carte - Menu: ${selectedMenu.name} × ${quantity}`,
      tableId: null,
      reservationDate: new Date().toISOString(),
      lines: [
        {
          variantId: selectedMenu.menuItems[0].variantId, // On utilise l'ID du menu comme variantId
          quantity: quantity,
        },
      ],
      useWallet: false,
      shippingFee: 0,
      discountAmount: 0,
    };

    try {
      const response = await createOrder(payload);

      Toast.show({
        type: "success",
        text1: "Commande passée avec succès !",
        text2: `${quantity} × ${selectedMenu.name} - N°${
          response.orderNumber || response.id
        }`,
      });

      closeModal();
    } catch (err: any) {
      console.error("Erreur commande directe :", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Impossible de passer la commande";

      Toast.show({
        type: "error",
        text1: "Échec de la commande",
        text2: Array.isArray(message) ? message[0] : message,
      });
    } finally {
      setIsOrdering(false);
    }
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>La Carte</Text>
          <TouchableOpacity onPress={fetchMenus}>
            <Ionicons name="refresh" size={26} color="#00af66" />
          </TouchableOpacity>
        </Animated.View>

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
                  <Animated.View
                    key={menu.id}
                    entering={FadeInUp.delay(80 * i)}
                  >
                    <Pressable
                      onPress={() => openMenuDetails(menu)}
                      style={({ pressed }) => [
                        styles.menuCardClient,
                        pressed && { opacity: 0.7 },
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

                        {menu.isActive === false && (
                          <View style={styles.inactiveBadge}>
                            <Text style={styles.inactiveBadgeText}>
                              Bientôt disponible
                            </Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Modale Détails du Menu avec Quantité */}
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

                    <Text style={styles.modalUnitPrice}>
                      Prix unitaire :{" "}
                      {Number(selectedMenu.price).toLocaleString("fr-FR")} KMF
                    </Text>

                    {selectedMenu.description ? (
                      <Text style={styles.modalDescription}>
                        {selectedMenu.description}
                      </Text>
                    ) : (
                      <Text style={styles.modalNoDesc}>
                        Formule complète sans description détaillée.
                      </Text>
                    )}

                    {/* Contrôles de quantité */}
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

                    {/* Total mis à jour */}
                    <View style={styles.totalSection}>
                      <Text style={styles.totalLabel}>Total à payer</Text>
                      <Text style={styles.totalAmount}>
                        {totalPrice.toLocaleString("fr-FR")} KMF
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Bouton Commande Directe */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={handleDirectOrder}
                    disabled={isOrdering || selectedMenu.isActive === false}
                    style={[
                      styles.directOrderButton,
                      (isOrdering || selectedMenu.isActive === false) &&
                        styles.directOrderButtonDisabled,
                    ]}
                  >
                    {isOrdering ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="send-outline" size={24} color="#fff" />
                        <Text style={styles.directOrderButtonText}>
                          Commander{" "}
                          {quantity > 1 ? `${quantity} menus` : "ce menu"} •{" "}
                          {totalPrice.toLocaleString("fr-FR")} KMF
                        </Text>
                      </>
                    )}
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
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  modalUnitPrice: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 24,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
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
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#059669",
    marginTop: 8,
  },

  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  directOrderButton: {
    backgroundColor: "#00af66",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  directOrderButtonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  directOrderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#333" },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginBottom: 20,
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
  menuCardTitle: { fontSize: 19, fontWeight: "700", color: "#1F2937" },
  menuCardDescription: {
    fontSize: 14.5,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
  },
  menuCardNoDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  menuCardPrice: {
    fontSize: 23,
    fontWeight: "800",
    color: "#00af66",
  },
  inactiveBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  inactiveBadgeText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },

  emptyCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },

  // Modale
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    alignItems: "flex-end",
  },
  modalImage: {
    width: "100%",
    height: 300,
  },
  modalImagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: { padding: 24 },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#00af66",
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  modalNoDesc: {
    fontSize: 15,
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  addToCartButton: {
    backgroundColor: "#00af66",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  addToCartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default RestaurantsId;
