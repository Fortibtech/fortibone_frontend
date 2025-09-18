import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown, Package, Search, Tag, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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
    Category,
    CategoryService,
    CreateProductData,
    Product,
    ProductService
} from '@/api';

interface EditProductScreenProps {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}

export const EditProductScreen: React.FC<EditProductScreenProps> = ({
  product,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string>(product.imageUrl || '');
  
  // États pour les catégories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState<CreateProductData>({
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    salesUnit: product.salesUnit,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Options d'unité de vente
  const salesUnitOptions = [
    {
      value: 'UNIT',
      label: 'Unité (pièce)',
      description: 'Vente à l\'unité ou à la pièce'
    },
    {
      value: 'LOT',
      label: 'LOT',
      description: 'Vente par lot ou pack groupé'
    }
  ];

  const [salesUnitModalVisible, setSalesUnitModalVisible] = useState(false);
  const [selectedSalesUnit, setSelectedSalesUnit] = useState<{value: string, label: string, description: string} | null>(null);

  useEffect(() => {
    loadCategories();
    initializeSalesUnit();
  }, []);

  useEffect(() => {
    // Filtrer les catégories en fonction du texte de recherche
    if (categorySearchText.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(categorySearchText.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(categorySearchText.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categorySearchText, categories]);

  const initializeSalesUnit = () => {
    const defaultUnit = salesUnitOptions.find(unit => unit.value === product.salesUnit);
    if (defaultUnit) {
      setSelectedSalesUnit(defaultUnit);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await CategoryService.getCategories();
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
      
      // Trouver la catégorie actuelle
      const currentCategory = categoriesData.find(cat => cat.id === product.categoryId);
      if (currentCategory) {
        setSelectedCategory(currentCategory);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const updateFormData = (field: keyof CreateProductData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, categoryId: category.id }));
    setCategoryModalVisible(false);
    setCategorySearchText('');
    
    // Effacer l'erreur de catégorie si elle existe
    if (formErrors.categoryId) {
      setFormErrors(prev => ({ ...prev, categoryId: '' }));
    }
  };

  const handleSalesUnitSelect = (unit: {value: string, label: string, description: string}) => {
    setSelectedSalesUnit(unit);
    setFormData(prev => ({ ...prev, salesUnit: unit.value as 'UNIT' | 'LOT' }));
    setSalesUnitModalVisible(false);
    
    // Effacer l'erreur d'unité de vente si elle existe
    if (formErrors.salesUnit) {
      setFormErrors(prev => ({ ...prev, salesUnit: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du produit est obligatoire';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est obligatoire';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }

    if (!formData.categoryId || !selectedCategory) {
      errors.categoryId = 'Veuillez sélectionner une catégorie';
    }

    if (!formData.salesUnit) {
      errors.salesUnit = 'L\'unité de vente est obligatoire';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Mettre à jour le produit
      const updatedProduct = await ProductService.updateProduct(product.id, formData);

      console.log('✅ Produit mis à jour:', updatedProduct.name);

      // Upload de l'image si elle a été changée
      if (imageUri && imageUri !== product.imageUrl) {
        try {
          await ProductService.uploadProductImage(updatedProduct.id, {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'product.jpg',
          } as any);
        } catch (uploadError) {
          console.warn('⚠️ Erreur lors de l\'upload de l\'image:', uploadError);
        }
      }

      Alert.alert(
        'Succès',
        `Produit "${updatedProduct.name}" mis à jour avec succès !`
      );
      
      onSaved();

    } catch (error) {
      console.error('❌ Erreur lors de la modification du produit:', error);
      Alert.alert('Erreur', 'Impossible de modifier le produit. Veuillez réessayer.');
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
      'Changer l\'image',
      'Choisissez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Galerie', onPress: pickImage },
        { text: 'Caméra', onPress: takePhoto },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose}>
        <X size={24} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Modifier le produit</Text>

      <TouchableOpacity 
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Sauver</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderImageSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📷 Image du produit</Text>
      
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={showImageOptions}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.productImage} />
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

  const renderCategorySelector = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Catégorie *</Text>
      <TouchableOpacity
        style={[styles.categorySelector, formErrors.categoryId && styles.inputError]}
        onPress={() => setCategoryModalVisible(true)}
        disabled={loadingCategories}
      >
        {loadingCategories ? (
          <View style={styles.categorySelectorContent}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.categorySelectorText}>Chargement des catégories...</Text>
          </View>
        ) : selectedCategory ? (
          <View style={styles.categorySelectorContent}>
            <View style={styles.selectedCategoryInfo}>
              <Tag size={16} color="#059669" />
              <Text style={styles.selectedCategoryName}>{selectedCategory.name}</Text>
              {selectedCategory.description && (
                <Text style={styles.selectedCategoryDesc} numberOfLines={1}>
                  {selectedCategory.description}
                </Text>
              )}
            </View>
            <ChevronDown size={20} color="#666" />
          </View>
        ) : (
          <View style={styles.categorySelectorContent}>
            <Text style={styles.categorySelectorPlaceholder}>
              Sélectionner une catégorie
            </Text>
            <ChevronDown size={20} color="#666" />
          </View>
        )}
      </TouchableOpacity>
      {formErrors.categoryId && (
        <Text style={styles.errorText}>{formErrors.categoryId}</Text>
      )}
    </View>
  );

  const renderSalesUnitSelector = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Unité de vente *</Text>
      <TouchableOpacity
        style={[styles.categorySelector, formErrors.salesUnit && styles.inputError]}
        onPress={() => setSalesUnitModalVisible(true)}
      >
        {selectedSalesUnit ? (
          <View style={styles.categorySelectorContent}>
            <View style={styles.selectedCategoryInfo}>
              <Package size={16} color="#059669" />
              <Text style={styles.selectedCategoryName}>{selectedSalesUnit.label}</Text>
              <Text style={styles.selectedCategoryDesc} numberOfLines={1}>
                {selectedSalesUnit.description}
              </Text>
            </View>
            <ChevronDown size={20} color="#666" />
          </View>
        ) : (
          <View style={styles.categorySelectorContent}>
            <Text style={styles.categorySelectorPlaceholder}>
              Sélectionner une unité de vente
            </Text>
            <ChevronDown size={20} color="#666" />
          </View>
        )}
      </TouchableOpacity>
      {formErrors.salesUnit && (
        <Text style={styles.errorText}>{formErrors.salesUnit}</Text>
      )}
    </View>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={categoryModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setCategoryModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Choisir une catégorie</Text>
          
          <TouchableOpacity onPress={loadCategories}>
            <Ionicons name="refresh" size={28} color="#059669" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une catégorie..."
            value={categorySearchText}
            onChangeText={setCategorySearchText}
            placeholderTextColor="#999"
          />
        </View>

        {loadingCategories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Chargement des catégories...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item.id}
            renderItem={({ item: category }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === category.id && styles.selectedCategoryItem
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <View style={styles.categoryItemContent}>
                  <Tag 
                    size={20} 
                    color={selectedCategory?.id === category.id ? "#059669" : "#666"} 
                  />
                  <View style={styles.categoryItemInfo}>
                    <Text style={[
                      styles.categoryItemName,
                      selectedCategory?.id === category.id && styles.selectedCategoryItemText
                    ]}>
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text style={[
                        styles.categoryItemDesc,
                        selectedCategory?.id === category.id && styles.selectedCategoryItemDesc
                      ]}>
                        {category.description}
                      </Text>
                    )}
                  </View>
                </View>
                
                {selectedCategory?.id === category.id && (
                  <Ionicons name="checkmark" size={24} color="#059669" />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Tag size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>
                  {categorySearchText ? 'Aucune catégorie trouvée' : 'Aucune catégorie disponible'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {categorySearchText 
                    ? `Aucun résultat pour "${categorySearchText}"`
                    : 'Les catégories n\'ont pas encore été configurées'
                  }
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderSalesUnitModal = () => (
    <Modal
      visible={salesUnitModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setSalesUnitModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setSalesUnitModalVisible(false)}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Choisir l'unité de vente</Text>
          
          <View style={styles.headerPlaceholder} />
        </View>

        <FlatList
          data={salesUnitOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item: unit }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedSalesUnit?.value === unit.value && styles.selectedCategoryItem
              ]}
              onPress={() => handleSalesUnitSelect(unit)}
            >
              <View style={styles.categoryItemContent}>
                {unit.value === 'UNIT' ? (
                  <Package 
                    size={20} 
                    color={selectedSalesUnit?.value === unit.value ? "#059669" : "#666"} 
                  />
                ) : (
                  <View style={styles.lotIcon}>
                    <Package size={16} color={selectedSalesUnit?.value === unit.value ? "#059669" : "#666"} />
                    <Package size={16} color={selectedSalesUnit?.value === unit.value ? "#059669" : "#666"} style={{ marginLeft: -4 }} />
                  </View>
                )}
                <View style={styles.categoryItemInfo}>
                  <Text style={[
                    styles.categoryItemName,
                    selectedSalesUnit?.value === unit.value && styles.selectedCategoryItemText
                  ]}>
                    {unit.label}
                  </Text>
                  <Text style={[
                    styles.categoryItemDesc,
                    selectedSalesUnit?.value === unit.value && styles.selectedCategoryItemDesc
                  ]}>
                    {unit.description}
                  </Text>
                </View>
              </View>
              
              {selectedSalesUnit?.value === unit.value && (
                <Ionicons name="checkmark" size={24} color="#059669" />
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderImageSection()}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Informations du produit</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du produit *</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Ex: T-shirt Logo FortiBone"
                placeholderTextColor="#999"
              />
              {formErrors.name && (
                <Text style={styles.errorText}>{formErrors.name}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  formErrors.description && styles.inputError
                ]}
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Décrivez votre produit en détail..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {formErrors.description && (
                <Text style={styles.errorText}>{formErrors.description}</Text>
              )}
            </View>

            {renderCategorySelector()}
            {renderSalesUnitSelector()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderCategoryModal()}
      {renderSalesUnitModal()}
    </SafeAreaView>
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
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 56,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  categorySelectorPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  selectedCategoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedCategoryDesc: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  
  // Styles pour l'icône LOT
  lotIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fafafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 12,
  },
  categoryItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedCategoryItem: {
    backgroundColor: '#f0f9ff',
    borderColor: '#e0f2fe',
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryItemInfo: {
    flex: 1,
  },
  categoryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  selectedCategoryItemText: {
    color: '#059669',
  },
  categoryItemDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  selectedCategoryItemDesc: {
    color: '#047857',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
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
});

