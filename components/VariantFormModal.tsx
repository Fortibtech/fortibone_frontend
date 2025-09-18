// components/VariantFormModal.tsx - Modal pour créer/modifier les variantes
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Package, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Import des services et types
import {
    CategoryAttribute,
    CategoryService,
    CreateVariantData,
    Product,
    ProductService,
    ProductVariant,
    UpdateVariantData
} from '@/api';

interface VariantFormModalProps {
  visible: boolean;
  product: Product;
  variant?: ProductVariant | null;
  onClose: () => void;
  onSaved: () => void;
}

export const VariantFormModal: React.FC<VariantFormModalProps> = ({
  visible,
  product,
  variant,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [imageUri, setImageUri] = useState<string>('');
  
  // États du formulaire
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    price: '',
    purchasePrice: '',
    quantityInStock: '',
    itemsPerLot: '',
    lotPrice: '',
  });

  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && product) {
      loadCategoryAttributes();
      initializeForm();
    }
  }, [visible, product, variant]);

  const loadCategoryAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const attributes = await CategoryService.getCategoryAttributes(product.categoryId);
      setCategoryAttributes(attributes);
    } catch (error) {
      console.error('Erreur lors du chargement des attributs:', error);
      Alert.alert('Erreur', 'Impossible de charger les attributs de la catégorie');
    } finally {
      setLoadingAttributes(false);
    }
  };

  const initializeForm = () => {
    if (variant) {
      // Mode édition
      setFormData({
        sku: variant.sku,
        barcode: variant.barcode || '',
        price: variant.price,
        purchasePrice: variant.purchasePrice,
        quantityInStock: variant.quantityInStock.toString(),
        itemsPerLot: variant.itemsPerLot?.toString() || '',
        lotPrice: variant.lotPrice || '',
      });

      // Initialiser les valeurs d'attributs
      const attrs: Record<string, string> = {};
      variant.attributeValues.forEach(attr => {
        attrs[attr.attributeId] = attr.value;
      });
      setAttributeValues(attrs);
      
      setImageUri(variant.imageUrl || '');
    } else {
      // Mode création - réinitialiser le formulaire
      setFormData({
        sku: '',
        barcode: '',
        price: '',
        purchasePrice: '',
        quantityInStock: '',
        itemsPerLot: '',
        lotPrice: '',
      });
      setAttributeValues({});
      setImageUri('');
    }
    setFormErrors({});
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateAttributeValue = (attributeId: string, value: string) => {
    setAttributeValues(prev => ({ ...prev, [attributeId]: value }));
    
    // Effacer l'erreur de l'attribut modifié
    if (formErrors[`attr_${attributeId}`]) {
      setFormErrors(prev => ({ ...prev, [`attr_${attributeId}`]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation des champs requis
    if (!formData.sku.trim()) {
      errors.sku = 'Le SKU est obligatoire';
    }

    if (!formData.price.trim()) {
      errors.price = 'Le prix est obligatoire';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.price = 'Le prix doit être un nombre positif';
    }

    if (!formData.purchasePrice.trim()) {
      errors.purchasePrice = 'Le prix d\'achat est obligatoire';
    } else if (isNaN(parseFloat(formData.purchasePrice)) || parseFloat(formData.purchasePrice) <= 0) {
      errors.purchasePrice = 'Le prix d\'achat doit être un nombre positif';
    }

    if (!formData.quantityInStock.trim()) {
      errors.quantityInStock = 'La quantité en stock est obligatoire';
    } else if (isNaN(parseInt(formData.quantityInStock)) || parseInt(formData.quantityInStock) < 0) {
      errors.quantityInStock = 'La quantité doit être un nombre entier positif';
    }

    // Validation des attributs requis
    categoryAttributes.forEach(attr => {
      if (attr.required && !attributeValues[attr.id]?.trim()) {
        errors[`attr_${attr.id}`] = `${attr.name} est obligatoire`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Préparer les données d'attributs
      const attributes = Object.entries(attributeValues)
        .filter(([_, value]) => value.trim())
        .map(([attributeId, value]) => ({
          attributeId,
          value: value.trim()
        }));

      const variantData = {
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || undefined,
        price: parseFloat(formData.price),
        purchasePrice: parseFloat(formData.purchasePrice),
        quantityInStock: parseInt(formData.quantityInStock),
        itemsPerLot: formData.itemsPerLot ? parseInt(formData.itemsPerLot) : undefined,
        lotPrice: formData.lotPrice ? parseFloat(formData.lotPrice) : undefined,
        attributes,
      };

      let savedVariant: ProductVariant;

      if (variant) {
        // Mode édition
        savedVariant = await ProductService.updateVariant(variant.id, variantData as UpdateVariantData);
        console.log('✅ Variante mise à jour:', savedVariant.sku);
      } else {
        // Mode création
        savedVariant = await ProductService.createVariant(product.id, variantData as CreateVariantData);
        console.log('✅ Variante créée:', savedVariant.sku);
      }

      // Upload de l'image si elle a été changée
      if (imageUri && imageUri !== variant?.imageUrl) {
        try {
          await ProductService.uploadVariantImage(savedVariant.id, {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'variant.jpg',
          } as any);
        } catch (uploadError) {
          console.warn('⚠️ Erreur lors de l\'upload de l\'image:', uploadError);
        }
      }

      Alert.alert(
        'Succès',
        variant ? 'Variante mise à jour avec succès' : 'Variante créée avec succès'
      );
      
      onSaved();

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      Alert.alert(
        'Erreur',
        variant ? 'Impossible de modifier la variante' : 'Impossible de créer la variante'
      );
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission refusée', 
        'Vous devez autoriser l\'accès à la bibliothèque de photos pour ajouter une image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission refusée', 
        'Vous devez autoriser l\'accès à la caméra pour prendre une photo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Ajouter une image',
      'Choisissez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Galerie', onPress: pickImage },
        { text: 'Caméra', onPress: takePhoto },
      ]
    );
  };

  const renderAttributeField = (attribute: CategoryAttribute) => {
    const error = formErrors[`attr_${attribute.id}`];
    const value = attributeValues[attribute.id] || '';

    switch (attribute.type) {
      case 'select':
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
              {attribute.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {attribute.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    value === option && styles.selectOptionSelected
                  ]}
                  onPress={() => updateAttributeValue(attribute.id, option)}
                >
                  <Text style={[
                    styles.selectOptionText,
                    value === option && styles.selectOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {value === option && (
                    <Ionicons name="checkmark" size={16} color="#059669" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
      
      case 'number':
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
              {attribute.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value}
              onChangeText={(text) => updateAttributeValue(attribute.id, text)}
              placeholder={`Entrez ${attribute.name.toLowerCase()}`}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
      
      case 'color':
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
              {attribute.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.colorInputContainer}>
              <TextInput
                style={[styles.input, styles.colorInput, error && styles.inputError]}
                value={value}
                onChangeText={(text) => updateAttributeValue(attribute.id, text)}
                placeholder="#000000"
                placeholderTextColor="#999"
              />
              {value && (
                <View style={[styles.colorPreview, { backgroundColor: value }]} />
              )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
      
      default:
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
              {attribute.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value}
              onChangeText={(text) => updateAttributeValue(attribute.id, text)}
              placeholder={`Entrez ${attribute.name.toLowerCase()}`}
              placeholderTextColor="#999"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
    }
  };

  const renderImageSection = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Image de la variante</Text>
      
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={showImageOptions}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.variantImage} />
            <View style={styles.imageOverlay}>
              <Camera size={24} color="white" />
              <Text style={styles.changeImageText}>Changer</Text>
            </View>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Package size={48} color="#ccc" />
            <Text style={styles.imagePlaceholderText}>
              Ajouter une image
            </Text>
            <Text style={styles.imagePlaceholderSubtext}>
              Touchez pour sélectionner
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>
              {variant ? 'Modifier la variante' : 'Nouvelle variante'}
            </Text>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {variant ? 'Modifier' : 'Créer'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Informations de base */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Informations de base</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  SKU <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, formErrors.sku && styles.inputError]}
                  value={formData.sku}
                  onChangeText={(text) => updateFormData('sku', text)}
                  placeholder="Ex: TSHIRT-M-BLUE"
                  placeholderTextColor="#999"
                />
                {formErrors.sku && (
                  <Text style={styles.errorText}>{formErrors.sku}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Code-barres</Text>
                <TextInput
                  style={[styles.input, formErrors.barcode && styles.inputError]}
                  value={formData.barcode}
                  onChangeText={(text) => updateFormData('barcode', text)}
                  placeholder="Code-barres optionnel"
                  placeholderTextColor="#999"
                />
                {formErrors.barcode && (
                  <Text style={styles.errorText}>{formErrors.barcode}</Text>
                )}
              </View>
            </View>

            {/* Prix et stock */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Prix et stock</Text>
              
              <View style={styles.rowContainer}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>
                    Prix de vente <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, formErrors.price && styles.inputError]}
                    value={formData.price}
                    onChangeText={(text) => updateFormData('price', text)}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  {formErrors.price && (
                    <Text style={styles.errorText}>{formErrors.price}</Text>
                  )}
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>
                    Prix d'achat <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, formErrors.purchasePrice && styles.inputError]}
                    value={formData.purchasePrice}
                    onChangeText={(text) => updateFormData('purchasePrice', text)}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  {formErrors.purchasePrice && (
                    <Text style={styles.errorText}>{formErrors.purchasePrice}</Text>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Quantité en stock <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, formErrors.quantityInStock && styles.inputError]}
                  value={formData.quantityInStock}
                  onChangeText={(text) => updateFormData('quantityInStock', text)}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                {formErrors.quantityInStock && (
                  <Text style={styles.errorText}>{formErrors.quantityInStock}</Text>
                )}
              </View>

              {product.salesUnit === 'LOT' && (
                <View style={styles.rowContainer}>
                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Articles par lot</Text>
                    <TextInput
                      style={[styles.input, formErrors.itemsPerLot && styles.inputError]}
                      value={formData.itemsPerLot}
                      onChangeText={(text) => updateFormData('itemsPerLot', text)}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Prix du lot</Text>
                    <TextInput
                      style={[styles.input, formErrors.lotPrice && styles.inputError]}
                      value={formData.lotPrice}
                      onChangeText={(text) => updateFormData('lotPrice', text)}
                      placeholder="0"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Attributs de la catégorie */}
            {!loadingAttributes && categoryAttributes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏷️ Attributs</Text>
                {categoryAttributes.map(renderAttributeField)}
              </View>
            )}

            {/* Image */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📷 Image</Text>
              {renderImageSection()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafb',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  
  // Styles pour les attributs select
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectOptionSelected: {
    borderColor: '#059669',
    backgroundColor: '#f0f9ff',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectOptionTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },

  // Styles pour les couleurs
  colorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorInput: {
    flex: 1,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Styles pour l'image
  imageContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  variantImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  changeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

