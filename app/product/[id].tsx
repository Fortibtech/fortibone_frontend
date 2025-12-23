// screens/ProductDetailScreen.tsx - Version ultra-raffinée avec design moderne
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Edit,
  Heart,
  MapPin,
  Package,
  Plus,
  Share,
  Tag,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import des services API
import {
  Business,
  BusinessesService,
  Product,
  ProductService,
  ProductVariant,
} from "@/api";

// Import des composants
import { VariantFormModal } from "@/components/VariantFormModal";
import { EditProductScreen } from "./edit";

Dimensions.get("window");

interface ProductDetailScreenProps {
  productId?: string;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId: propProductId,
  onDelete,
}) => {
  const params = useLocalSearchParams();
  const productId = propProductId || (params.id as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // États pour les variantes
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  const loadProductDetails = async () => {
    if (!productId) {
      Alert.alert("Erreur", "ID du produit manquant");
      router.back();
      return;
    }

    try {
      setLoading(true);

      // Charger les détails du produit avec variantes
      const productData = await ProductService.getProductById(productId);
      setProduct(productData);

      // Charger les détails de l'entreprise
      try {
        const businessData = await BusinessesService.getBusinessById(
          productData.businessId
        );
        setBusiness(businessData);
      } catch (businessError) {
        console.warn(
          "Impossible de charger les détails de l'entreprise:",
          businessError
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error);
      Alert.alert("Erreur", "Impossible de charger les détails du produit", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = () => {
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = () => {
    if (!product) return;

    Alert.alert(
      "Supprimer le produit",
      `Êtes-vous sûr de vouloir supprimer "${product.name}" et toutes ses variantes ? Cette action est irréversible.`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: confirmDeleteProduct,
        },
      ]
    );
  };

  const confirmDeleteProduct = async () => {
    if (!product) return;

    try {
      setIsDeleting(true);

      await ProductService.deleteProduct(product.id);

      if (onDelete) {
        onDelete(product.id);
      }

      Alert.alert("Succès", "Produit et ses variantes supprimés avec succès", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      Alert.alert("Erreur", "Impossible de supprimer le produit");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddVariant = () => {
    setEditingVariant(null);
    setShowVariantModal(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setShowVariantModal(true);
  };

  const handleDeleteVariant = (variant: ProductVariant) => {
    Alert.alert(
      "Supprimer la variante",
      `Êtes-vous sûr de vouloir supprimer la variante "${variant.sku}" ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => confirmDeleteVariant(variant),
        },
      ]
    );
  };

  const confirmDeleteVariant = async (variant: ProductVariant) => {
    try {
      await ProductService.deleteVariant(variant.id);

      // Recharger les détails du produit
      await loadProductDetails();

      Alert.alert("Succès", "Variante supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de la variante:", error);
      Alert.alert("Erreur", "Impossible de supprimer la variante");
    }
  };

  const onVariantSaved = () => {
    setShowVariantModal(false);
    setEditingVariant(null);
    loadProductDetails();
  };

  const onProductSaved = () => {
    setShowEditProductModal(false);
    loadProductDetails();
  };

  const handleShare = () => {
    if (product) {
      Alert.alert(
        "Partager",
        `Partage du produit "${product.name}" (fonctionnalité à implémenter)`
      );
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const renderFloatingHeader = () => (
    <View style={styles.floatingHeader}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.floatingButton}
      >
        <Ionicons name="arrow-back" size={22} color="#1f2937" />
      </TouchableOpacity>

      <View style={styles.floatingActions}>
        <TouchableOpacity onPress={handleShare} style={styles.floatingButton}>
          <Share size={18} color="#1f2937" />
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={toggleLike} style={styles.floatingButton}>
          <Heart 
            size={18} 
            color={isLiked ? "#ef4444" : "#1f2937"} 
            fill={isLiked ? "#ef4444" : "none"} 
          />
        </TouchableOpacity> */}
      </View>
    </View>
  );

  const renderImageSection = () => (
    <View style={styles.imageContainer}>
      {product?.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <View style={styles.placeholderIconCircle}>
            <Package size={40} color="#d1d5db" />
          </View>
          <Text style={styles.imagePlaceholderText}>Aucune image</Text>
        </View>
      )}
      {renderFloatingHeader()}
    </View>
  );

  const renderVariantCard = ({ item: variant }: { item: ProductVariant }) => (
    <View style={styles.variantCard}>
      <View style={styles.variantHeader}>
        <View style={styles.variantMainInfo}>
          <Text style={styles.variantSku}>{variant.sku}</Text>
          <Text style={styles.variantPrice}>
            {variant.price.toLocaleString()} FCFA
          </Text>
        </View>

        <View style={styles.variantActions}>
          <TouchableOpacity
            style={styles.variantIconButton}
            onPress={() => handleEditVariant(variant)}
          >
            <Edit size={16} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.variantIconButton}
            onPress={() => handleDeleteVariant(variant)}
          >
            <Trash2 size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {variant.attributeValues.length > 0 && (
        <View style={styles.attributesContainer}>
          {variant.attributeValues.map((attr) => (
            <View key={attr.id} style={styles.attributeTag}>
              <Text style={styles.attributeTagText}>
                {attr.attribute.name}: {attr.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.variantDetailsGrid}>
        <View style={styles.variantDetailRow}>
          <Text style={styles.variantDetailLabel}>Stock</Text>
          <Text
            style={[
              styles.variantDetailValue,
              variant.quantityInStock < 10 && styles.lowStockText,
            ]}
          >
            {variant.quantityInStock}
          </Text>
        </View>

        <View style={styles.variantDetailDivider} />

        <View style={styles.variantDetailRow}>
          <Text style={styles.variantDetailLabel}>Prix d&apos;achat</Text>
          <Text style={styles.variantDetailValue}>
            {variant.purchasePrice.toLocaleString()} FCFA
          </Text>
        </View>

        {variant.barcode && (
          <>
            <View style={styles.variantDetailDivider} />
            <View style={styles.variantDetailRow}>
              <Text style={styles.variantDetailLabel}>Code-barres</Text>
              <Text style={styles.variantDetailValue}>{variant.barcode}</Text>
            </View>
          </>
        )}
      </View>

      {variant.imageUrl && (
        <View style={styles.variantImageWrapper}>
          <Image
            source={{ uri: variant.imageUrl }}
            style={styles.variantImage}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );

  const renderVariantsSection = () => {
    if (!product?.variants || product.variants.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Variantes</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddVariant}
            >
              <Plus size={16} color="#059669" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Package size={32} color="#d1d5db" />
            </View>
            <Text style={styles.emptyStateTitle}>Aucune variante</Text>
            <Text style={styles.emptyStateSubtitle}>
              Créez des variantes pour ce produit
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Variantes ({product.variants.length})
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddVariant}>
            <Plus size={16} color="#059669" />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.variantsList}>
          {product.variants.map((variant) => (
            <View key={variant.id}>{renderVariantCard({ item: variant })}</View>
          ))}
        </View>
      </View>
    );
  };

  const renderProductInfo = () => (
    <View style={styles.contentContainer}>
      <View style={styles.productTitleSection}>
        <Text style={styles.productName}>{product?.name}</Text>

        <View style={styles.productMetaRow}>
          {product?.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {product.category.name}
              </Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <Tag size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{product?.salesUnit}</Text>
          </View>
        </View>

        {product?.averageRating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={15} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {product.averageRating.toFixed(1)}
            </Text>
            <Text style={styles.ratingCount}>
              ({product.reviewCount || 0} avis)
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          {product?.description || "Aucune description disponible"}
        </Text>
      </View>

      <View style={styles.divider} />

      {renderVariantsSection()}

      {business && (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vendu par</Text>
            <View style={styles.businessCard}>
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>{business.name}</Text>
                <Text style={styles.businessType}>{business.type}</Text>
                {business.address && (
                  <View style={styles.addressRow}>
                    <MapPin size={13} color="#9ca3af" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {business.address}
                    </Text>
                  </View>
                )}
              </View>
              {business.logoUrl && (
                <Image
                  source={{ uri: business.logoUrl }}
                  style={styles.businessLogo}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </>
      )}

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stock total</Text>
            <Text style={styles.infoValue}>
              {product ? ProductService.getTotalStock(product) : 0}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Créé le</Text>
            <Text style={styles.infoValue}>
              {product?.createdAt
                ? new Date(product.createdAt).toLocaleDateString("fr-FR")
                : "-"}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Produit</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {product?.id.slice(0, 8)}...
            </Text>
          </View>

          {product?.updatedAt && product.updatedAt !== product.createdAt && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Modifié le</Text>
                <Text style={styles.infoValue}>
                  {new Date(product.updatedAt).toLocaleDateString("fr-FR")}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditProduct}
        activeOpacity={0.7}
      >
        <Edit size={18} color="white" />
        <Text style={styles.editButtonText}>Modifier</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
        onPress={handleDeleteProduct}
        disabled={isDeleting}
        activeOpacity={0.7}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Trash2 size={18} color="white" />
        )}
        <Text style={styles.deleteButtonText}>
          {isDeleting ? "Suppression..." : "Supprimer"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Package size={48} color="#d1d5db" />
          </View>
          <Text style={styles.errorTitle}>Produit introuvable</Text>
          <Text style={styles.errorSubtitle}>
            Ce produit n&apos;existe plus ou a été supprimé
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderImageSection()}
        {renderProductInfo()}
      </ScrollView>

      {renderActions()}

      {/* Modal pour créer/modifier une variante */}
      <VariantFormModal
        visible={showVariantModal}
        product={product}
        variant={editingVariant}
        onClose={() => setShowVariantModal(false)}
        onSaved={onVariantSaved}
      />

      {/* Modal pour modifier le produit */}
      <Modal
        visible={showEditProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <EditProductScreen
          product={product}
          onClose={() => setShowEditProductModal(false)}
          onSaved={onProductSaved}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Floating Header (par dessus l'image)
  floatingHeader: {
    position: "absolute",
    top: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 10,
  },
  floatingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  floatingActions: {
    flexDirection: "row",
    gap: 8,
  },

  // Image Section
  imageContainer: {
    height: 320,
    backgroundColor: "#fafafa",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeholderIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
  },

  // Content Container
  contentContainer: {
    backgroundColor: "#ffffff",
    paddingBottom: 24,
  },

  // Product Title Section
  productTitleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  productName: {
    fontSize: 26,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 14,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  productMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(5, 150, 105, 0.1)",
  },
  categoryBadgeText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  ratingCount: {
    fontSize: 13,
    color: "#9ca3af",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    marginVertical: 4,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  addButtonText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "600",
  },

  // Description
  descriptionText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    letterSpacing: 0.1,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#fafafa",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  emptyStateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },

  // Variants List
  variantsList: {
    gap: 10,
  },
  variantCard: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  variantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  variantMainInfo: {
    flex: 1,
  },
  variantSku: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  variantPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: -0.2,
  },
  variantActions: {
    flexDirection: "row",
    gap: 6,
  },
  variantIconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Attributes
  attributesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  attributeTag: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  attributeTagText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },

  // Variant Details Grid
  variantDetailsGrid: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  variantDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  variantDetailDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  variantDetailLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  variantDetailValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  lowStockText: {
    color: "#ef4444",
  },

  // Variant Image
  variantImageWrapper: {
    alignItems: "flex-start",
    marginTop: 12,
  },
  variantImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  // Business Card
  businessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  businessType: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
    fontWeight: "500",
  },
  businessLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },

  // Info Grid
  infoGrid: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },

  // Actions Container
  actionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",
    padding: 16,

    paddingVertical: 35,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 4,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.2,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  backButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

export default ProductDetailScreen;
