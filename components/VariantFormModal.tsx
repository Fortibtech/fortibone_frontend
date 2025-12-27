"use client"

// components/VariantFormModal.tsx - Modal pour créer/modifier les variantes
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Calendar, Camera, Package, X } from "lucide-react-native"
import type React from "react"
import { useEffect, useState } from "react"
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
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

import {
  type CategoryAttribute,
  CategoryService,
  type CreateVariantData,
  type Product,
  ProductService,
  type ProductVariant,
  type UpdateVariantData,
} from "@/api"
import { useBusinessStore } from "@/store/businessStore"

interface VariantFormModalProps {
  visible: boolean
  product: Product
  variant?: ProductVariant | null
  onClose: () => void
  onSaved: () => void
}

export const VariantFormModal: React.FC<VariantFormModalProps> = ({ visible, product, variant, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false)
  const [loadingAttributes, setLoadingAttributes] = useState(true)
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([])
  const [imageUri, setImageUri] = useState<string>("")
  const business = useBusinessStore((state) => state.business);
  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    price: "",
    purchasePrice: "",
    quantityInStock: "",
    itemsPerLot: "",
    lotPrice: "",
  })

  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null)

  useEffect(() => {
    if (visible && product) {
      loadCategoryAttributes()
      initializeForm()
    }
  }, [visible, product, variant])

  const loadCategoryAttributes = async () => {
    try {
      setLoadingAttributes(true)
      const attributes = await CategoryService.getCategoryAttributes(product.categoryId)
      setCategoryAttributes(attributes)
    } catch (error) {
      console.error("Erreur lors du chargemeknt des attributs:", error)
      Alert.alert("Erreur", "Impossible de charger les attributs de la catégorie")
    } finally {
      setLoadingAttributes(false)
    }
  }

  const initializeForm = () => {
    if (variant) {
      setFormData({
        sku: variant.sku,
        barcode: variant.barcode || "",
        price: variant.price,
        purchasePrice: variant.purchasePrice,
        quantityInStock: variant.quantityInStock.toString(),
        itemsPerLot: variant.itemsPerLot?.toString() || "",
        lotPrice: variant.lotPrice || "",
      })

      const attrs: Record<string, string> = {}
      variant.attributeValues.forEach((attr) => {
        attrs[attr.attributeId] = attr.value
      })
      setAttributeValues(attrs)

      setImageUri(variant.imageUrl || "")
    } else {
      setFormData({
        sku: "",
        barcode: "",
        price: "",
        purchasePrice: "",
        quantityInStock: "",
        itemsPerLot: "",
        lotPrice: "",
      })
      setAttributeValues({})
      setImageUri("")
    }
    setFormErrors({})
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const updateAttributeValue = (attributeId: string, value: string) => {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }))
    if (formErrors[`attr_${attributeId}`]) {
      setFormErrors((prev) => ({ ...prev, [`attr_${attributeId}`]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.sku.trim()) {
      errors.sku = "Le SKU est obligatoire"
    }

    if (!formData.price.trim() ) {
      errors.price = "Le prix est obligatoire"
    } else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0) {
      errors.price = "Le prix doit être un nombre positif"
    }

    if (!formData.purchasePrice.trim() && business?.type !=="FOURNISSEUR" || !formData.price.trim() && business?.type !=="COMMERCANT") {
      errors.purchasePrice = "Le prix d'achat est obligatoire"
    } else if (isNaN(Number.parseFloat(formData.purchasePrice)) || Number.parseFloat(formData.purchasePrice) <= 0) {
      errors.purchasePrice = "Le prix d'achat doit être un nombre positif"
    }

    if (!formData.quantityInStock.trim()) {
      errors.quantityInStock = "La quantité en stock est obligatoire"
    } else if (isNaN(Number.parseInt(formData.quantityInStock)) || Number.parseInt(formData.quantityInStock) < 0) {
      errors.quantityInStock = "La quantité doit être un nombre entier positif"
    }

    categoryAttributes.forEach((attr) => {
      if (attr.required && !attributeValues[attr.id]?.trim()) {
        errors[`attr_${attr.id}`] = `${attr.name} est obligatoire`
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      const attributes = Object.entries(attributeValues)
        .filter(([_, value]) => value.trim())
        .map(([attributeId, value]) => ({
          attributeId,
          value: value.trim(),
        }))

      const variantData = {
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || undefined,
        price: Number.parseFloat(formData.price),
        purchasePrice: Number.parseFloat(formData.purchasePrice),
        quantityInStock: Number.parseInt(formData.quantityInStock),
        itemsPerLot: formData.itemsPerLot ? Number.parseInt(formData.itemsPerLot) : undefined,
        lotPrice: formData.lotPrice ? Number.parseFloat(formData.lotPrice) : undefined,
        attributes,
      }

      let savedVariant: ProductVariant

      if (variant) {
        savedVariant = await ProductService.updateVariant(variant.id, variantData as UpdateVariantData)
        console.log("✅ Variante mise à jour:", savedVariant.sku)
      } else {
        savedVariant = await ProductService.createVariant(product.id, variantData as CreateVariantData)
        console.log("✅ Variante créée:", savedVariant.sku)
      }

      if (imageUri && imageUri !== variant?.imageUrl) {
        try {
          await ProductService.uploadVariantImage(savedVariant.id, {
            uri: imageUri,
            type: "image/jpeg",
            name: "variant.jpg",
          } as any)
        } catch (uploadError) {
          console.warn("⚠️ Erreur lors de l'upload de l'image:", uploadError)
        }
      }

      Alert.alert("Succès", variant ? "Variante mise à jour avec succès" : "Variante créée avec succès")

      onSaved()
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error)
      Alert.alert("Erreur", variant ? "Impossible de modifier la variante" : "Impossible de créer la variante")
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission refusée",
        "Vous devez autoriser l'accès à la bibliothèque de photos pour ajouter une image.",
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à la caméra pour prendre une photo.")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri)
    }
  }

  const showImageOptions = () => {
    Alert.alert("Ajouter une image", "Choisissez une option", [
      { text: "Annuler", style: "cancel" },
      { text: "Galerie", onPress: pickImage },
      { text: "Caméra", onPress: takePhoto },
    ])
  }

  const renderAttributeField = (attribute: CategoryAttribute) => {
    const error = formErrors[`attr_${attribute.id}`]
    const value = attributeValues[attribute.id] || ""

    const isDateField = attribute.name.toLowerCase().includes('date') || 
                        attribute.name.toLowerCase().includes('péremption') ||
                        attribute.name.toLowerCase().includes('expiration')

    // Si c'est un champ texte mais détecté comme date, afficher un DatePicker
    if (isDateField) {
          return (
        <View key={attribute.id} style={styles.formGroup}>
          <Text style={styles.label}>
            {attribute.name}
             <Text style={styles.required}> *</Text>
          </Text>
          
          <TouchableOpacity
            style={[styles.dateButton, error && styles.inputError]}
            onPress={() => setShowDatePicker(attribute.id)}
          >
            <Calendar size={20} color="#6b7280" />
            <Text style={[styles.dateText, !value && styles.datePlaceholder]}>
              {value 
                ? new Date(value).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                : `Sélectionner ${attribute.name.toLowerCase()}`
              }
            </Text>
          </TouchableOpacity>

          {/* Modal pour iOS */}
          {Platform.OS === 'ios' && showDatePicker === attribute.id && (
            <Modal
              transparent
              animationType="slide"
              visible={true}
              onRequestClose={() => setShowDatePicker(null)}
            >
              <TouchableOpacity 
                style={styles.datePickerModal} 
                activeOpacity={1}
                onPress={() => setShowDatePicker(null)}
              >
                <TouchableOpacity 
                  activeOpacity={1} 
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                        <Text style={styles.datePickerCancel}>Annuler</Text>
                      </TouchableOpacity>
                      <Text style={styles.datePickerTitle}>{attribute.name}</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                        <Text style={styles.datePickerDone}>OK</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display="spinner"
                      textColor="#000000" 
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          const dateString = selectedDate.toISOString().split('T')[0]
                          updateAttributeValue(attribute.id, dateString)
                        }
                      }}
                      style={styles.datePickerIOS}
                    />
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>
          )}

          {/* DatePicker pour Android */}
          {Platform.OS === 'android' && showDatePicker === attribute.id && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(null)
                if (event.type === 'set' && selectedDate) {
                  const dateString = selectedDate.toISOString().split('T')[0]
                  updateAttributeValue(attribute.id, dateString)
                }
              }}
            />
          )}
          
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      )
    }
    switch (attribute.type) {
      case "select":
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
               <Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.selectContainer}>
              {attribute.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.selectOption, value === option && styles.selectOptionSelected]}
                  onPress={() => updateAttributeValue(attribute.id, option)}
                >
                  <Text style={[styles.selectOptionText, value === option && styles.selectOptionTextSelected]}>
                    {option}
                  </Text>
                  {value === option && <Ionicons name="checkmark" size={16} color="#059669" />}
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )

      case "number":
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
               <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value}
              onChangeText={(text) => updateAttributeValue(attribute.id, text)}
              placeholder={`Entrez ${attribute.name.toLowerCase()}`}
              placeholderTextColor="#b0b8c0"
              keyboardType="numeric"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )

      case "color":
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
               <Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.colorInputContainer}>
              <TextInput
                style={[styles.input, styles.colorInput, error && styles.inputError]}
                value={value}
                onChangeText={(text) => updateAttributeValue(attribute.id, text)}
                placeholder="#000000"
                placeholderTextColor="#b0b8c0"
              />
              {value && <View style={[styles.colorPreview, { backgroundColor: value }]} />}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )

      default:
        return (
          <View key={attribute.id} style={styles.formGroup}>
            <Text style={styles.label}>
              {attribute.name}
               <Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value}
              onChangeText={(text) => updateAttributeValue(attribute.id, text)}
              placeholder={`Entrez ${attribute.name.toLowerCase()}`}
              placeholderTextColor="#b0b8c0"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )
    }
  }

  const renderImageSection = () => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Image de la variante</Text>

      <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions} activeOpacity={0.7}>
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
            <Package size={48} color="#d1d5db" />
            <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
            <Text style={styles.imagePlaceholderSubtext}>Touchez pour sélectionner</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )

  if (!visible) return null

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{variant ? "Modifier la variante" : "Nouvelle variante"}</Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>{variant ? "Modifier" : "Créer"}</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations de base</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  SKU <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, formErrors.sku && styles.inputError]}
                  value={formData.sku}
                  onChangeText={(text) => updateFormData("sku", text)}
                  placeholder="Ex: TSHIRT-M-BLUE"
                  placeholderTextColor="#b0b8c0"
                />
                {formErrors.sku && <Text style={styles.errorText}>{formErrors.sku}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Code-barres</Text>
                <TextInput
                  style={[styles.input, formErrors.barcode && styles.inputError]}
                  value={formData.barcode}
                  onChangeText={(text) => updateFormData("barcode", text)}
                  placeholder="Code-barres optionnel"
                  placeholderTextColor="#b0b8c0"
                />
                {formErrors.barcode && <Text style={styles.errorText}>{formErrors.barcode}</Text>}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prix et stock</Text>

              <View style={styles.rowContainer}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>
                    Prix de vente <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, formErrors.price && styles.inputError]}
                    value={formData.price}
                    onChangeText={(text) => updateFormData("price", text)}
                    placeholder="0"
                    placeholderTextColor="#b0b8c0"
                    keyboardType="numeric"
                  />
                  {formErrors.price && <Text style={styles.errorText}>{formErrors.price}</Text>}
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>
                    Prix d'achat {business && business?.type !== "FOURNISSEUR" || business && business?.type !== "COMMERCANT" ? <Text style={styles.required}>*</Text> : null}
                  </Text>
                  <TextInput
                    style={[styles.input, formErrors.purchasePrice && styles.inputError]}
                    value={formData.purchasePrice}
                    onChangeText={(text) => updateFormData("purchasePrice", text)}
                    placeholder="0"
                    placeholderTextColor="#b0b8c0"
                    keyboardType="numeric"
                  />
                  {formErrors.purchasePrice && <Text style={styles.errorText}>{formErrors.purchasePrice}</Text>}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Quantité en stock <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, formErrors.quantityInStock && styles.inputError]}
                  value={formData.quantityInStock}
                  onChangeText={(text) => updateFormData("quantityInStock", text)}
                  placeholder="0"
                  placeholderTextColor="#b0b8c0"
                  keyboardType="numeric"
                />
                {formErrors.quantityInStock && <Text style={styles.errorText}>{formErrors.quantityInStock}</Text>}
              </View>

              {product.salesUnit === "LOT" && (
                <View style={styles.rowContainer}>
                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Articles par lot</Text>
                    <TextInput
                      style={[styles.input, formErrors.itemsPerLot && styles.inputError]}
                      value={formData.itemsPerLot}
                      onChangeText={(text) => updateFormData("itemsPerLot", text)}
                      placeholder="0"
                      placeholderTextColor="#b0b8c0"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Prix du lot</Text>
                    <TextInput
                      style={[styles.input, formErrors.lotPrice && styles.inputError]}
                      value={formData.lotPrice}
                      onChangeText={(text) => updateFormData("lotPrice", text)}
                      placeholder="0"
                      placeholderTextColor="#b0b8c0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}
            </View>

            {!loadingAttributes && categoryAttributes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Attributs</Text>
                {categoryAttributes.map(renderAttributeField)}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Image</Text>
              {renderImageSection()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafb",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f1f3",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2d3748",
    letterSpacing: 0.3,
  },
  saveButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  saveButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  section: {
    backgroundColor: "#ffffff",
    // borderRadius: 18,
    paddingBottom: 24,
    // marginTop: 20,
    // borderWidth: 1,
    // borderColor: "#f0f1f3",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.08,
    // shadowRadius: 6,
    // elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#2d3748",
    marginBottom: 20,
    letterSpacing: 0.2,
    alignContent: 'center',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  required: {
    color: "#ef4444",
    fontWeight: "400",
  },
  input: {
    backgroundColor: "#fafafb",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#2d3748",
    borderWidth: 1,
    borderColor: "#f0f1f3",
    fontWeight: "400",
  },
  inputError: {
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    marginTop: 6,
    fontWeight: "400",
    letterSpacing: 0.1,
  },

  selectContainer: {
    gap: 10,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fafafb",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f0f1f3",
  },
  selectOptionSelected: {
    borderColor: "#059669",
    backgroundColor: "#f0fdf4",
  },
  selectOptionText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "400",
  },
  selectOptionTextSelected: {
    color: "#059669",
    fontWeight: "500",
  },

  colorInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorInput: {
    flex: 1,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  imageContainer: {
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f1f3",
  },
  variantImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  changeImageText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
  },
  imagePlaceholderSubtext: {
    fontSize: 13,
    color: "#a0a8b3",
    fontWeight: "400",
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fafafb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f1f3',
  },
  dateText: {
    fontSize: 15,
    color: '#2d3748',
    fontWeight: '400',
    flex: 1,
  },
  datePlaceholder: {
    color: '#b0b8c0',
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f1f3',
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3748',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  datePickerIOS: {
    height: 200,
    backgroundColor: '#ffffff',
  },
})
