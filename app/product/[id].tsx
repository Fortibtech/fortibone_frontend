// screens/ProductDetailScreen.tsx - Version moderne avec design des images
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MapPin,
  Package,
  Share,
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
import { VariantManagementModal } from "@/components/VariantManagementModal";
import { EditProductScreen } from "./edit";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const [isDeleting, setIsDeleting] = useState(false);
  
  // États pour le carrousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // États pour les sections dépliables
  const [expandedSections, setExpandedSections] = useState({
    attributes: true,
    technicalDescription: false,
    variants: false,
  });
  
  // États pour les modals
  const [showVariantManagementModal, setShowVariantManagementModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  // Données de capacité, RAM, couleurs extraites des variantes
  const [storageOptions, setStorageOptions] = useState<string[]>([]);
  const [ramOptions, setRamOptions] = useState<string[]>([]);
  const [colorOptions, setColorOptions] = useState<Array<{ name: string; code: string }>>([]);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  useEffect(() => {
    if (product?.variants) {
      extractVariantOptions();
    }
  }, [product?.variants]);

  const loadProductDetails = async () => {
    if (!productId) {
      Alert.alert("Erreur", "ID du produit manquant");
      router.back();
      return;
    }

    try {
      setLoading(true);

      const productData = await ProductService.getProductById(productId);
      setProduct(productData);

      try {
        const businessData = await BusinessesService.getBusinessById(
          productData.businessId
        );
        setBusiness(businessData);
      } catch (businessError) {
        console.warn("Impossible de charger les détails de l'entreprise:", businessError);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error);
      Alert.alert("Erreur", "Impossible de charger les détails du produit", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const extractVariantOptions = () => {
    if (!product?.variants) return;

    const storages = new Set<string>();
    const rams = new Set<string>();
    const colors = new Map<string, string>();

    product.variants.forEach((variant) => {
      variant.attributeValues.forEach((attr) => {
        const attrName = attr.attribute.name.toLowerCase();
        
        if (attrName.includes("stockage") || attrName.includes("capacité")) {
          storages.add(attr.value);
        } else if (attrName.includes("ram") || attrName.includes("mémoire")) {
          rams.add(attr.value);
        } else if (attrName.includes("couleur") || attrName.includes("color")) {
          // Essayer de mapper les couleurs avec des codes hex
          colors.set(attr.value, getColorCode(attr.value));
        }
      });
    });

    setStorageOptions(Array.from(storages));
    setRamOptions(Array.from(rams));
    setColorOptions(
      Array.from(colors.entries()).map(([name, code]) => ({ name, code }))
    );
  };

  const getColorCode = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      noir: "#000000",
      black: "#000000",
      blanc: "#FFFFFF",
      white: "#FFFFFF",
      bleu: "#0000FF",
      blue: "#6200FF",
      rouge: "#FF0000",
      red: "#FF0000",
      vert: "#00FF00",
      green: "#00FF00",
      jaune: "#FFFF00",
      yellow: "#FFFF00",
      rose: "#FFC0CB",
      pink: "#FFC0CB",
      violet: "#8B00FF",
      purple: "#8B00FF",
    };

    const key = colorName.toLowerCase();
    return colorMap[key] || "#CCCCCC";
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEditProduct = () => {
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = () => {
    if (!product) return;

    Alert.alert(
      "Supprimer le produit",
      `Êtes-vous sûr de vouloir supprimer "${product.name}" et toutes ses variantes ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: confirmDeleteProduct },
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

      Alert.alert("Succès", "Produit supprimé avec succès", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      Alert.alert("Erreur", "Impossible de supprimer le produit");
    } finally {
      setIsDeleting(false);
    }
  };

  const onProductSaved = () => {
    setShowEditProductModal(false);
    loadProductDetails();
  };

  const onVariantsSaved = () => {
    setShowVariantManagementModal(false);
    loadProductDetails();
  };

  const handleShare = () => {
    if (product) {
      Alert.alert("Partager", `Partage du produit "${product.name}"`);
    }
  };

  // Carrousel d'images
  const images = product?.imageUrl ? [product.imageUrl] : [];
  
  const renderImageCarousel = () => (
    <View style={styles.carouselContainer}>
      {images.length > 0 ? (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.imagePlaceholder}>
          <View style={styles.placeholderIconCircle}>
            <Package size={48} color="#D1D5DB" />
          </View>
        </View>
      )}

      {/* Header flottant */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.floatingButton}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.floatingButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductInfo = () => {
    const totalStock = product?.variants?.reduce(
      (sum, v) => sum + (v.quantityInStock || 0),
      0
    ) || 0;

    const priceRange = product?.variants?.length
      ? (() => {
          const prices = product.variants.map((v) => parseFloat(v.price));
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max
            ? `${min.toLocaleString()} KMF`
            : `${min.toLocaleString()} - ${max.toLocaleString()} KMF`;
        })()
      : "-";

    return (
      <View style={styles.productInfoSection}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>
            {product?.category?.name || "Électroniques"}
          </Text>
          <Text style={styles.breadcrumbSeparator}> › </Text>
          <Text style={styles.breadcrumbText}>
            {product?.salesUnit || "Téléphones"}
          </Text>
        </View>

        {/* Nom du produit */}
        <Text style={styles.productName}>{product?.name}</Text>

        {/* SKU et Stock */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>SKU produit: </Text>
          <Text style={styles.metaValue}>{product?.id.slice(0, 12) || "-"}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Stock totale disponible: </Text>
          <Text style={styles.metaValue}>{totalStock}</Text>
        </View>

        {/* Prix */}
        <Text style={styles.priceLabel}>Prix</Text>
        <Text style={styles.priceValue}>{priceRange}</Text>

        {/* Pills des attributs rapides */}
        <View style={styles.pillsContainer}>
          {product?.category?.name && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{product.category.name}</Text>
            </View>
          )}
          <View style={styles.pill}>
            <Text style={styles.pillText}>{product?.name.split(" ")[0]}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Neuf scellé</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>iOS 17</Text>
          </View>
        </View>

        {/* Toggle Publié */}
        <View style={styles.publishRow}>
          <Text style={styles.publishLabel}>Publié</Text>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleActive}>
              <View style={styles.toggleThumb} />
            </View>
          </View>
        </View>

        <View style={styles.variantCountBadge}>
          <Text style={styles.variantCountText}>
            {product?.variants?.length || 0} variantes
          </Text>
        </View>
      </View>
    );
  };

  const renderStorageRAMColors = () => {
    if (
      storageOptions.length === 0 &&
      ramOptions.length === 0 &&
      colorOptions.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.optionsSection}>
        {/* Capacité Stockage */}
        {storageOptions.length > 0 && (
          <View style={styles.optionGroup}>
            <Text style={styles.optionGroupTitle}>Capacité Stockage</Text>
            <View style={styles.optionChips}>
              {storageOptions.map((storage, index) => (
                <View key={index} style={styles.optionChip}>
                  <Text style={styles.optionChipText}>{storage}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* RAM */}
        {ramOptions.length > 0 && (
          <View style={styles.optionGroup}>
            <Text style={styles.optionGroupTitle}>RAM</Text>
            <View style={styles.optionChips}>
              {ramOptions.map((ram, index) => (
                <View key={index} style={styles.optionChip}>
                  <Text style={styles.optionChipText}>{ram}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Couleurs */}
        {colorOptions.length > 0 && (
          <View style={styles.optionGroup}>
            <Text style={styles.optionGroupTitle}>Couleurs</Text>
            <View style={styles.colorOptions}>
              {colorOptions.map((color, index) => (
                <View key={index} style={styles.colorCircleWrapper}>
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.code },
                      color.code === "#FFFFFF" && styles.colorCircleWhite,
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderCollapsibleSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <View style={styles.collapsibleSection}>
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapsibleTitle}>{title}</Text>
          {isExpanded ? (
            <ChevronUp size={20} color="#6B7280" />
          ) : (
            <ChevronDown size={20} color="#6B7280" />
          )}
        </TouchableOpacity>

        {isExpanded && <View style={styles.collapsibleContent}>{content}</View>}
      </View>
    );
  };

  const renderAttributesSection = () => {
    return (
      <View style={styles.attributesContent}>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Système d'exploitation:</Text>
          <Text style={styles.attributeValue}>iOS 17</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Caméra:</Text>
          <Text style={styles.attributeValue}>12MP/64MP</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Stockage interne:</Text>
          <Text style={styles.attributeValue}>128Go/256Go/512Go</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>RAM:</Text>
          <Text style={styles.attributeValue}>4Go/8Go</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Couleurs:</Text>
          <Text style={styles.attributeValue}>Noir, Blanc, Bleu</Text>
        </View>
      </View>
    );
  };

  const renderTechnicalDescription = () => {
    return (
      <View style={styles.technicalContent}>
        <Text style={styles.technicalText}>
          {product?.description || "Aucune description technique disponible."}
        </Text>

        <View style={styles.technicalDetails}>
          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>Marque: </Text>
            <Text style={styles.technicalDetailValue}>
              {product?.category?.name || "Apple"}
            </Text>
          </Text>

          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>Modèle: </Text>
            <Text style={styles.technicalDetailValue}>
              {product?.name || "iPhone 14"}
            </Text>
          </Text>

          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>RAM: </Text>
            <Text style={styles.technicalDetailValue}>4Go/8Go</Text>
          </Text>

          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>Stockage interne: </Text>
            <Text style={styles.technicalDetailValue}>128Go/256Go/512Go</Text>
          </Text>

          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>Système d'exploitation: </Text>
            <Text style={styles.technicalDetailValue}>iOS 16</Text>
          </Text>

          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>Processeur: </Text>
            <Text style={styles.technicalDetailValue}>A15 Bionic chip</Text>
          </Text>

          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>Taille d'écran: </Text>
            <Text style={styles.technicalDetailValue}>6.1"</Text>
          </Text>

          <Text style={styles.technicalDetailItem}>
            <Text style={styles.technicalDetailLabel}>Carte sim: </Text>
            <Text style={styles.technicalDetailValue}>1 nano sim... </Text>
            <Text style={styles.viewMoreLink}>Voir Plus</Text>
          </Text>
        </View>
      </View>
    );
  };

  const renderVariantsSection = () => {
    return (
      <View style={styles.variantsContent}>
        <TouchableOpacity
          style={styles.manageVariantsButton}
          onPress={() => setShowVariantManagementModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.manageVariantsButtonText}>Gérer les variantes</Text>
        </TouchableOpacity>

        <View style={styles.variantsList}>
          {product?.variants?.slice(0, 3).map((variant, index) => (
            <View key={variant.id} style={styles.variantRow}>
              <View style={styles.variantIndicator} />
              <View style={styles.variantInfo}>
                <Text style={styles.variantNumber}>{index + 1}</Text>
                <Text style={styles.variantName}>{variant.sku}</Text>
                <Text style={styles.variantPrice}>
                  {parseFloat(variant.price).toLocaleString()} KMF
                </Text>
                <Text style={styles.variantSKU}>{variant.barcode || "-"}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteProduct}
        disabled={isDeleting}
        activeOpacity={0.7}
      >
        {isDeleting && (
          <ActivityIndicator size="small" color="white" />
        )}
        <Text style={styles.deleteButtonText}>
          {isDeleting ? "Suppression..." : "Supprimer"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditProduct}
        activeOpacity={0.7}
      >
        {/* <Edit size={18} color="white" /> */}
        <Text style={styles.editButtonText}>Modifier</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D991" />
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
          <Package size={48} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Produit introuvable</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        {renderImageCarousel()}
        {renderProductInfo()}
        {renderStorageRAMColors()}

        {/* Sections dépliables */}
        {renderCollapsibleSection(
          "Attributs Spécifiques",
          "attributes",
          renderAttributesSection()
        )}

        {renderCollapsibleSection(
          "Description Technique",
          "technicalDescription",
          renderTechnicalDescription()
        )}

        {renderCollapsibleSection(
          "Variantes",
          "variants",
          renderVariantsSection()
        )}
      </ScrollView>

      {renderActions()}

      {/* Modal Gestion des Variantes */}
      <Modal
        visible={showVariantManagementModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <VariantManagementModal
          product={product}
          onClose={() => setShowVariantManagementModal(false)}
          onSaved={onVariantsSaved}
        />
      </Modal>

      {/* Modal Modifier Produit */}
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
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Carrousel d'images
  carouselContainer: {
    height: 320,
    backgroundColor: "#F5F7FA",
    position: "relative",
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 320,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  paginationDots: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 24,
  },

  // Header flottant
  floatingHeader: {
    position: "absolute",
    top: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Section info produit
  productInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  breadcrumbText: {
    fontSize: 13,
    color: "#8B8B8B",
    fontWeight: "500",
  },
  breadcrumbSeparator: {
    fontSize: 13,
    color: "#8B8B8B",
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 14,
    color: "#8B8B8B",
    fontWeight: "400",
  },
  metaValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  priceLabel: {
    fontSize: 13,
    color: "#8B8B8B",
    marginTop: 16,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#00D991",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  pillText: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  publishRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  publishLabel: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  toggleContainer: {
    width: 51,
    height: 31,
  },
  toggleActive: {
    width: 51,
    height: 31,
    backgroundColor: "#00D991",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  variantCountBadge: {
    alignSelf: "flex-end",
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  variantCountText: {
    fontSize: 12,
    color: "#00D991",
    fontWeight: "600",
  },

  // Options (Capacité, RAM, Couleurs)
  optionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F7FA",
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionGroupTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  optionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  optionChipText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  colorOptions: {
    flexDirection: "row",
    gap: 12,
  },
  colorCircleWrapper: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E8ECF0",
  },
  colorCircleWhite: {
    borderColor: "#D1D5DB",
  },

  // Sections dépliables
  collapsibleSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F7FA",
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  collapsibleContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Attributs Spécifiques
  attributesContent: {
    gap: 12,
  },
  attributeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  attributeLabel: {
    fontSize: 14,
    color: "#8B8B8B",
    flex: 1,
  },
  attributeValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  // Description Technique
  technicalContent: {
    gap: 16,
  },
  technicalText: {
    fontSize: 14,
    color: "#1A1A1A",
    lineHeight: 22,
  },
  technicalDetails: {
    gap: 8,
  },
  technicalDetailItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  technicalDetailLabel: {
    color: "#8B8B8B",
  },
  technicalDetailValue: {
    color: "#1A1A1A",
    fontWeight: "500",
  },
  viewMoreLink: {
    color: "#00D991",
    fontWeight: "600",
  },

  // Variantes
  variantsContent: {
    gap: 16,
  },
  manageVariantsButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00D991",
    alignItems: "center",
  },
  manageVariantsButtonText: {
    fontSize: 15,
    color: "#00D991",
    fontWeight: "600",
  },
  variantsList: {
    gap: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    overflow: "hidden",
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  variantIndicator: {
    width: 3,
    height: 40,
    backgroundColor: "#00D991",
    borderRadius: 2,
    marginRight: 12,
  },
  variantInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  variantNumber: {
    fontSize: 14,
    color: "#8B8B8B",
    fontWeight: "600",
    width: 20,
  },
  variantName: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    flex: 1.5,
  },
  variantPrice: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    flex: 1,
  },
  variantSKU: {
    fontSize: 13,
    color: "#8B8B8B",
    flex: 1.5,
  },

  // Actions Container
  actionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F5F7FA",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEAE9FF",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontSize: 15,
    fontWeight: "600",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00D991",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#8B8B8B",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  backButton: {
    backgroundColor: "#00D991",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default ProductDetailScreen;