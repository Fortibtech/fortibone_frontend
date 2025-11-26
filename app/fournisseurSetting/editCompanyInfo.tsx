"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native"
import { router } from "expo-router"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { Business, BusinessesService, SelectedBusinessManager } from "@/api"


interface EditCompanyInfoScreenProps {
  onClose?: () => void
}

type StepType = 1 | 2 | 3

const EditCompanyInfo: React.FC<EditCompanyInfoScreenProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [business, setBusiness] = useState<Business | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phoneNumber: "",
  })

  useEffect(() => {
    loadBusinessData()
  }, [])

  const loadBusinessData = async () => {
    try {
      setLoading(true)
      const selected = await SelectedBusinessManager.getSelectedBusiness()
      
      if (!selected) {
        Alert.alert("Erreur", "Aucune entreprise sélectionnée")
        router.back()
        return
      }

      if (selected.type !== "FOURNISSEUR") {
        Alert.alert("Erreur", "Cette page est réservée aux fournisseurs")
        router.back()
        return
      }

      setBusiness(selected)
      setFormData({
        name: selected.name || "",
        description: selected.description || "",
        address: selected.address || "",
        phoneNumber: selected.phoneNumber || "",
      })
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      Alert.alert("Erreur", "Impossible de charger les données de l'entreprise")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    // Validation de l'étape actuelle
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        Alert.alert("Erreur", "Le nom de l'entreprise est requis")
        return
      }
    }

    if (currentStep === 2) {
      if (!formData.address.trim() || !formData.phoneNumber.trim()) {
        Alert.alert("Erreur", "L'adresse et le téléphone sont requis")
        return
      }
    }

    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as StepType)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as StepType)
    }
  }

  const handleSave = async () => {
    if (!business) return

    // Validation finale
    if (!formData.name.trim()) {
      Alert.alert("Erreur", "Le nom de l'entreprise est requis")
      setCurrentStep(1)
      return
    }

    if (!formData.address.trim() || !formData.phoneNumber.trim()) {
      Alert.alert("Erreur", "L'adresse et le téléphone sont requis")
      setCurrentStep(2)
      return
    }

    try {
      setSaving(true)

      // Préparer les données pour l'API
      const updateData: any = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      }

      // Ajouter la description seulement si elle n'est pas vide
      if (formData.description.trim()) {
        updateData.description = formData.description.trim()
      }

      console.log("📤 Envoi des données:", updateData)

      // Mettre à jour l'entreprise
      const updatedBusiness = await BusinessesService.updateBusiness(
        business.id,
        updateData
      )

      console.log("✅ Entreprise mise à jour:", updatedBusiness)

      Alert.alert(
        "Succès",
        "Les informations de l'entreprise ont été mises à jour",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error: any) {
      console.error("❌ Erreur lors de la sauvegarde:", error)
      
      let errorMessage = "Impossible de sauvegarder les modifications"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert("Erreur", errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Nom de l'entreprise <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange("name", value)}
          placeholder="Nom de l'entreprise"
          editable={!saving}
        />
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={20} color="#666" />
        <Text style={styles.infoText}>
          Les informations marquées d'un astérisque (*) sont obligatoires
        </Text>
      </View>
    </ScrollView>
  )

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Adresse Principale <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => handleInputChange("address", value)}
          placeholder="Adresse complète"
          editable={!saving}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Téléphone Entreprise <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={formData.phoneNumber}
          onChangeText={(value) => handleInputChange("phoneNumber", value)}
          placeholder="+237 6XX XXX XXX"
          keyboardType="phone-pad"
          editable={!saving}
        />
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={20} color="#666" />
        <Text style={styles.infoText}>
          Assurez-vous que vos coordonnées sont correctes pour que vos clients puissent vous contacter
        </Text>
      </View>
    </ScrollView>
  )

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Présentation de l'entreprise</Text>
        <Text style={styles.helperText}>
          Décrivez votre entreprise, vos services et ce qui vous distingue
        </Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={formData.description}
          onChangeText={(value) => handleInputChange("description", value)}
          placeholder="Présentez votre entreprise..."
          multiline
          numberOfLines={6}
          editable={!saving}
        />
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="lightbulb-outline" size={20} color="#1BB874" />
        <Text style={styles.infoText}>
          Une bonne présentation aide vos clients à mieux comprendre vos services
        </Text>
      </View>
    </ScrollView>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1BB874" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!business) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Aucune entreprise trouvée</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBusinessData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => {
            if (saving) return
            Alert.alert(
              "Annuler les modifications",
              "Êtes-vous sûr de vouloir annuler ? Les modifications non sauvegardées seront perdues.",
              [
                { text: "Non", style: "cancel" },
                { text: "Oui", onPress: () => router.back() },
              ]
            )
          }}
          disabled={saving}
        >
          <MaterialIcons name="arrow-back" size={24} color={saving ? "#ccc" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier Infos Entreprise</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepIndicator}>
        <TouchableOpacity 
          onPress={handleBack} 
          disabled={currentStep === 1 || saving}
          style={styles.stepBackButton}
        >
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            color={currentStep === 1 || saving ? "#ccc" : "#000000"} 
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.stepText}>Étape {currentStep} sur 3</Text>
          <View style={styles.stepTitle}>
            <Text style={styles.stepTitleBold}>
              {currentStep === 1 && "Informations de base"}
              {currentStep === 2 && "Coordonnées"}
              {currentStep === 3 && "Présentation"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
      </View>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button, 
            styles.cancelButton,
            (currentStep === 1 || saving) && styles.buttonDisabled
          ]}
          onPress={currentStep === 3 ? handleBack : handleBack}
          disabled={currentStep === 1 || saving}
        >
          <Text style={[
            styles.cancelButtonText,
            (currentStep === 1 || saving) && styles.buttonTextDisabled
          ]}>
            {currentStep === 1 ? "Annuler" : "Retour"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.nextButton, saving && styles.buttonDisabled]}
          onPress={currentStep === 3 ? handleSave : handleNext}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.nextButtonText}>Sauvegarde...</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === 3 ? "Sauvegarder" : "Suivant"}
              </Text>
              <View style={styles.buttonIcon}>
                <MaterialIcons 
                  name={currentStep === 3 ? "check" : "arrow-forward"} 
                  size={20} 
                  color="#FFF" 
                />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#E91E63",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1BB874",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerButton: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: "#F8F1F1",
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  stepBackButton: {
    padding: 4,
  },
  stepText: {
    fontSize: 13,
    color: "#58617B",
    fontWeight: "500",
  },
  stepTitle: {
    paddingVertical: 8,
  },
  stepTitleBold: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1BB874",
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  required: {
    color: "#E91E63",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
    backgroundColor: "#FAFAFA",
  },
  textarea: {
    paddingVertical: 12,
    textAlignVertical: "top",
    minHeight: 120,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 35,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",

  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: "#E8F5E9",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1BB874",
  },
  buttonTextDisabled: {
    color: "#999",
  },
  nextButton: {
    backgroundColor: "#1BB874",
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonIcon: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: "#F8F1F1",
    padding: 5,
  },
})

export default EditCompanyInfo