import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { ChevronDown, Plus, X } from "lucide-react-native"
import type React from "react"
import { useEffect, useState } from "react"
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
} from "react-native"

// Import des services API
import {
  type Business,
  type Category,
  CategoryService,
  type CreateProductData,
  ProductService,
  SelectedBusinessManager,
} from "@/api"

interface CreateProductScreenProps {
  onProductCreated?: (product: any) => void
}

export const CreateProductScreen: React.FC<CreateProductScreenProps> = ({ onProductCreated }) => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  // États pour les catégories
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)

  // États pour l'unité de vente
  const [salesUnitModalVisible, setSalesUnitModalVisible] = useState(false)
  const [selectedSalesUnit, setSelectedSalesUnit] = useState<{ value: string; label: string } | null>(null)

  const salesUnitOptions = [
    { value: "UNIT", label: "Unité (pièce)" },
    { value: "LOT", label: "LOT" },
  ]

  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    categoryId: "",
    salesUnit: "UNIT",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    initializeScreen()
  }, [])

  useEffect(() => {
    const defaultUnit = salesUnitOptions.find((unit) => unit.value === formData.salesUnit)
    if (defaultUnit && !selectedSalesUnit) {
      setSelectedSalesUnit(defaultUnit)
    }
  }, [formData.salesUnit])

  const initializeScreen = async () => {
    await Promise.all([checkSelectedBusiness(), loadCategories()])
  }

  const checkSelectedBusiness = async () => {
    try {
      const business = await SelectedBusinessManager.getSelectedBusiness()
      if (!business) {
        Alert.alert(
          "Aucune entreprise sélectionnée",
          "Veuillez sélectionner une entreprise avant de créer un produit.",
          [{ text: "OK", onPress: () => router.back() }],
        )
        return
      }
      setSelectedBusiness(business)
    } catch (error) {
      console.error("Erreur lors de la vérification de l'entreprise:", error)
      Alert.alert("Erreur", "Impossible de vérifier l'entreprise sélectionnée")
      router.back()
    }
  }

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const categoriesData = await CategoryService.getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
      Alert.alert("Erreur", "Impossible de charger les catégories")
    } finally {
      setLoadingCategories(false)
    }
  }

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limite atteinte", "Vous pouvez ajouter maximum 5 images")
      return
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à la bibliothèque de photos.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri])
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setFormData((prev) => ({ ...prev, categoryId: category.id }))
    setCategoryModalVisible(false)

    if (formErrors.categoryId) {
      setFormErrors((prev) => ({ ...prev, categoryId: "" }))
    }
  }

  const handleSalesUnitSelect = (unit: { value: string; label: string }) => {
    setSelectedSalesUnit(unit)
    setFormData((prev) => ({ ...prev, salesUnit: unit.value }))
    setSalesUnitModalVisible(false)

    if (formErrors.salesUnit) {
      setFormErrors((prev) => ({ ...prev, salesUnit: "" }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Le nom du produit est obligatoire"
    } else if (formData.name.trim().length < 3) {
      errors.name = "Le nom doit contenir au moins 3 caractères"
    }

    if (!formData.description.trim()) {
      errors.description = "La description est obligatoire"
    } else if (formData.description.trim().length < 10) {
      errors.description = "La description doit contenir au moins 10 caractères"
    }

    if (!formData.categoryId || !selectedCategory) {
      errors.categoryId = "Veuillez sélectionner une catégorie"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !selectedBusiness) return

    try {
      setLoading(true)

      const newProduct = await ProductService.createProduct(selectedBusiness.id, formData)

      // Upload des images
      if (images.length > 0) {
        try {
          await ProductService.uploadProductImage(newProduct.id, {
            uri: images[0],
            type: "image/jpeg",
            name: "product.jpg",
          } as any)
        } catch (uploadError) {
          console.warn("⚠️ Erreur lors de l'upload de l'image:", uploadError)
        }
      }

      if (onProductCreated) {
        onProductCreated(newProduct)
      }

      Alert.alert("Succès", `Produit "${newProduct.name}" créé avec succès !`, [
        { text: "OK", onPress: () => router.back() },
      ])
    } catch (error) {
      console.error("❌ Erreur lors de la création du produit:", error)
      Alert.alert("Erreur", "Impossible de créer le produit. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof CreateProductData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#555" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Ajouter un Produit</Text>

      <View style={styles.headerPlaceholder} />
    </View>
  )

  const renderImageSection = () => (
    <View style={styles.section}>
      <Text style={styles.label}>
        Images du Produit<Text style={styles.required}>*</Text>
      </Text>

      <TouchableOpacity style={styles.imageUploadArea} onPress={pickImage} activeOpacity={0.7}>
        <Ionicons name="image-outline" size={32} color="#C5CAD3" />
        <Text style={styles.imageUploadText}>Touchez pour ajouter (Max 5 images)</Text>
        <Text style={styles.imageUploadSubtext}>Format: jpg, png, webp. Taille max: 5Mb par image</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <View style={styles.imagesPreview}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreviewItem}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  )

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
            <Ionicons name="close" size={28} color="#555" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item: category }) => (
            <TouchableOpacity
              style={[styles.modalItem, selectedCategory?.id === category.id && styles.modalItemSelected]}
              onPress={() => handleCategorySelect(category)}
            >
              <Text
                style={[styles.modalItemText, selectedCategory?.id === category.id && styles.modalItemTextSelected]}
              >
                {category.name}
              </Text>
              {selectedCategory?.id === category.id && <Ionicons name="checkmark" size={24} color="#10B981" />}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  )

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
            <Ionicons name="close" size={28} color="#555" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Unité de vente</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <FlatList
          data={salesUnitOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item: unit }) => (
            <TouchableOpacity
              style={[styles.modalItem, selectedSalesUnit?.value === unit.value && styles.modalItemSelected]}
              onPress={() => handleSalesUnitSelect(unit)}
            >
              <Text
                style={[styles.modalItemText, selectedSalesUnit?.value === unit.value && styles.modalItemTextSelected]}
              >
                {unit.label}
              </Text>
              {selectedSalesUnit?.value === unit.value && <Ionicons name="checkmark" size={24} color="#10B981" />}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  )

  const renderFormSection = () => (
    <View style={styles.section}>
      {/* Libellé */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Libellé<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, formErrors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(text) => updateFormData("name", text)}
          placeholder="iPhone 17 Pro Max 2To - 32Go - 12MP/12MP - Noir..."
          placeholderTextColor="#C5CAD3"
        />
        {formData.name && (
          <Text style={styles.helperText}>
            Recommandations: Nom_du_produit - caracteristique_1 --- xtics_2 --- [xtics_X]
          </Text>
        )}
        {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Description<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea, formErrors.description && styles.inputError]}
          value={formData.description}
          onChangeText={(text) => updateFormData("description", text)}
          placeholder="Le tout nouveau iPhone 17 Pro Max enfin disponible avec une capacité incroyable de 2To. Ne manquez pas cette offre exclusive!"
          placeholderTextColor="#C5CAD3"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
      </View>

      {/* Catégorie */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Catégorie<Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.dropdown, formErrors.categoryId && styles.inputError]}
          onPress={() => setCategoryModalVisible(true)}
          disabled={loadingCategories}
        >
          <Text style={[styles.dropdownText, !selectedCategory && styles.dropdownPlaceholder]}>
            {loadingCategories ? "Chargement..." : selectedCategory?.name || "Électronique & High-Tech"}
          </Text>
          <ChevronDown size={20} color="#A0A8B3" />
        </TouchableOpacity>
        {selectedCategory && <Text style={styles.helperText}>Veuillez remplir ce champ !</Text>}
        {formErrors.categoryId && <Text style={styles.errorText}>{formErrors.categoryId}</Text>}
      </View>

      {/* Unité de vente */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Unité de vente<Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.dropdown, formErrors.salesUnit && styles.inputError]}
          onPress={() => setSalesUnitModalVisible(true)}
        >
          <Text style={[styles.dropdownText, !selectedSalesUnit && styles.dropdownPlaceholder]}>
            {selectedSalesUnit?.label || "Sélectionner une unité"}
          </Text>
          <ChevronDown size={20} color="#A0A8B3" />
        </TouchableOpacity>
        {formErrors.salesUnit && <Text style={styles.errorText}>{formErrors.salesUnit}</Text>}
      </View>
    </View>
  )

  const renderSubmitButton = () => (
    <TouchableOpacity
      style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      onPress={handleSubmit}
      disabled={loading}
    >
      {loading ? (
        <View style={styles.submitButtonContent}>
          <ActivityIndicator size="small" color="white" />
          <Text style={styles.submitButtonText}>Création en cours...</Text>
        </View>
      ) : (
        <View style={styles.submitButtonContent}>
          <Plus size={20} color="white" />
          <Text style={styles.submitButtonText}>Créer le produit</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderImageSection()}
          {renderFormSection()}
          {renderSubmitButton()}
        </ScrollView>
      </KeyboardAvoidingView>

      {renderCategoryModal()}
      {renderSalesUnitModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2C2C2C",
    flex: 1,
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginTop: 28,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#FAFBFC",
    borderRadius: 18,
    padding: 16,
    fontSize: 14,
    fontWeight: "400",
    color: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "#FAFBFC",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#2C2C2C",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#A0A8B3",
  },
  helperText: {
    fontSize: 12,
    color: "#8B92A1",
    marginTop: 6,
    lineHeight: 16,
    fontWeight: "400",
  },
  errorText: {
    fontSize: 12,
    color: "#F87171",
    marginTop: 6,
    fontWeight: "400",
  },
  imageUploadArea: {
    backgroundColor: "#FAFBFC",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#F0F1F3",
    borderStyle: "dashed",
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageUploadText: {
    fontSize: 14,
    color: "#7C8493",
    marginTop: 10,
    fontWeight: "400",
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: "#A0A8B3",
    marginTop: 6,
    fontWeight: "400",
  },
  imagesPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  imagePreviewItem: {
    width: 80,
    height: 80,
    borderRadius: 18,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2C2C2C",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  modalItemSelected: {
    backgroundColor: "#F0FDF4",
  },
  modalItemText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "400",
  },
  modalItemTextSelected: {
    color: "#10B981",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#10B981",
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 36,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default CreateProductScreen
