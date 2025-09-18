// screens/ProductDetailScreen.tsx - Version complète avec gestion des variantes
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Edit, Heart, MapPin, Package, Plus, Share, Tag, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import des services API
import {
  Business,
  BusinessesService,
  Product,
  ProductService,
  ProductVariant
} from '@/api';

// Import des composants
import { VariantFormModal } from '@/components/VariantFormModal';
import { EditProductScreen } from './edit';

const { width: screenWidth } = Dimensions.get('window');

interface ProductDetailScreenProps {
  productId?: string;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId: propProductId,
  onEdit,
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
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  const loadProductDetails = async () => {
    if (!productId) {
      Alert.alert('Erreur', 'ID du produit manquant');
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
        const businessData = await BusinessesService.getBusinessById(productData.businessId);
        setBusiness(businessData);
      } catch (businessError) {
        console.warn('Impossible de charger les détails de l\'entreprise:', businessError);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      Alert.alert(
        'Erreur', 
        'Impossible de charger les détails du produit',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
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
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${product.name}" et toutes ses variantes ? Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
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
      
      Alert.alert(
        'Succès',
        'Produit et ses variantes supprimés avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le produit');
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
      'Supprimer la variante',
      `Êtes-vous sûr de vouloir supprimer la variante "${variant.sku}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
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
      
      Alert.alert('Succès', 'Variante supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la variante:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la variante');
    }
  };

  const onVariantSaved = () => {
    setShowVariantModal(false);
    setEditingVariant(null);
    loadProductDetails(); // Recharger les données
  };

  const onProductSaved = () => {
    setShowEditProductModal(false);
    loadProductDetails(); // Recharger les données
  };

  const handleShare = () => {
    if (product) {
      Alert.alert('Partager', `Partage du produit "${product.name}" (fonctionnalité à implémenter)`);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => router.back()}
        style={styles.headerButton}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          onPress={handleShare}
          style={styles.headerButton}
        >
          <Share size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={toggleLike}
          style={styles.headerButton}
        >
          <Heart 
            size={24} 
            color="white" 
            fill={isLiked ? "white" : "none"} 
          />
        </TouchableOpacity>
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
          <Package size={64} color="#ccc" />
          <Text style={styles.imagePlaceholderText}>Aucune image</Text>
        </View>
      )}
      
      {renderHeader()}
    </View>
  );

  const renderVariantCard = ({ item: variant }: { item: ProductVariant }) => (
    <View style={styles.variantCard}>
      <View style={styles.variantHeader}>
        <View style={styles.variantInfo}>
          <Text style={styles.variantSku}>{variant.sku}</Text>
          <Text style={styles.variantPrice}>{variant.price} FCFA</Text>
        </View>
        
        <View style={styles.variantActions}>
          <TouchableOpacity
            style={styles.variantActionButton}
            onPress={() => handleEditVariant(variant)}
          >
            <Edit size={16} color="#059669" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.variantActionButton, styles.deleteVariantButton]}
            onPress={() => handleDeleteVariant(variant)}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.variantDetails}>
        <View style={styles.variantDetailRow}>
          <Text style={styles.variantDetailLabel}>Stock:</Text>
          <Text style={[
            styles.variantDetailValue,
            variant.quantityInStock < 10 && styles.lowStock
          ]}>
            {variant.quantityInStock} unités
          </Text>
        </View>
        
        <View style={styles.variantDetailRow}>
          <Text style={styles.variantDetailLabel}>Prix d'achat:</Text>
          <Text style={styles.variantDetailValue}>{variant.purchasePrice} FCFA</Text>
        </View>

        {variant.barcode && (
          <View style={styles.variantDetailRow}>
            <Text style={styles.variantDetailLabel}>Code-barres:</Text>
            <Text style={styles.variantDetailValue}>{variant.barcode}</Text>
          </View>
        )}
      </View>

      {variant.attributeValues.length > 0 && (
        <View style={styles.attributesContainer}>
          {variant.attributeValues.map((attr) => (
            <View key={attr.id} style={styles.attributeChip}>
              <Text style={styles.attributeChipText}>
                {attr.attribute.name}: {attr.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {variant.imageUrl && (
        <View style={styles.variantImageContainer}>
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
        <View style={styles.variantsSection}>
          <View style={styles.variantsSectionHeader}>
            <Text style={styles.sectionTitle}>Variantes</Text>
            <TouchableOpacity
              style={styles.addVariantButton}
              onPress={handleAddVariant}
            >
              <Plus size={16} color="white" />
              <Text style={styles.addVariantButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.noVariantsContainer}>
            <Package size={48} color="#ccc" />
            <Text style={styles.noVariantsText}>Aucune variante</Text>
            <Text style={styles.noVariantsSubtext}>
              Ajoutez des variantes pour spécifier les tailles, couleurs, etc.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.variantsSection}>
        <View style={styles.variantsSectionHeader}>
          <Text style={styles.sectionTitle}>
            Variantes ({product.variants.length})
          </Text>
          <TouchableOpacity
            style={styles.addVariantButton}
            onPress={handleAddVariant}
          >
            <Plus size={16} color="white" />
            <Text style={styles.addVariantButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={product.variants}
          renderItem={renderVariantCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderProductInfo = () => (
    <View style={styles.contentContainer}>
      <View style={styles.productHeader}>
        <View style={styles.productTitleContainer}>
          <Text style={styles.productName}>{product?.name}</Text>
          <View style={styles.productMeta}>
            <View style={styles.metaItem}>
              <Tag size={16} color="#6b7280" />
              <Text style={styles.metaText}>
                {product?.salesUnit}
              </Text>
            </View>
            
            {product?.category && (
              <View style={styles.metaItem}>
                <Text style={styles.categoryBadge}>
                  {product.category.name}
                </Text>
              </View>
            )}
          </View>

          {product?.averageRating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>
                {product.averageRating.toFixed(1)} ({product.reviewCount || 0} avis)
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {product?.description || 'Aucune description disponible'}
        </Text>
      </View>

      {renderVariantsSection()}

      {business && (
        <View style={styles.businessSection}>
          <Text style={styles.sectionTitle}>Vendu par</Text>
          <View style={styles.businessCard}>
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessType}>{business.type}</Text>
              
              {business.address && (
                <View style={styles.businessAddress}>
                  <MapPin size={14} color="#6b7280" />
                  <Text style={styles.businessAddressText} numberOfLines={1}>
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
      )}

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Stock total</Text>
            <Text style={styles.detailValue}>
              {product ? ProductService.getTotalStock(product) : 0} unités
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ID Produit</Text>
            <Text style={styles.detailValue}>{product?.id}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Créé le</Text>
            <Text style={styles.detailValue}>
              {product?.createdAt 
                ? new Date(product.createdAt).toLocaleDateString('fr-FR')
                : 'Non disponible'
              }
            </Text>
          </View>
          
          {product?.updatedAt && product.updatedAt !== product.createdAt && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Modifié le</Text>
              <Text style={styles.detailValue}>
                {new Date(product.updatedAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
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
        activeOpacity={0.8}
      >
        <Edit size={20} color="white" />
        <Text style={styles.editButtonText}>Modifier</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
        onPress={handleDeleteProduct}
        disabled={isDeleting}
        activeOpacity={0.8}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Trash2 size={20} color="white" />
        )}
        <Text style={styles.deleteButtonText}>
          {isDeleting ? 'Suppression...' : 'Supprimer'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#059669" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement du produit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#059669" />
        <View style={styles.errorContainer}>
          <Package size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Produit introuvable</Text>
          <Text style={styles.errorSubtitle}>
            Ce produit n'existe plus ou a été supprimé
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
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
    backgroundColor: '#fafafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  contentContainer: {
    backgroundColor: 'white',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  productHeader: {
    marginBottom: 24,
  },
  productTitleContainer: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 34,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryBadge: {
    backgroundColor: '#059669',
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  
  // Styles pour les variantes
  variantsSection: {
    marginBottom: 24,
  },
  variantsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addVariantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addVariantButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noVariantsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noVariantsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
  },
  noVariantsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  variantCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  variantInfo: {
    flex: 1,
  },
  variantSku: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  variantActions: {
    flexDirection: 'row',
    gap: 8,
  },
  variantActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deleteVariantButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  variantDetails: {
    marginBottom: 12,
  },
  variantDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  variantDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  variantDetailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  lowStock: {
    color: '#ef4444',
    fontWeight: '600',
  },
  attributesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  attributeChip: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  attributeChipText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  variantImageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  variantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },

  // Styles existants...
  businessSection: {
    marginBottom: 24,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 8,
  },
  businessAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessAddressText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  businessLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;