"use client"

import { Business } from "@/api"
import { SelectedBusinessManager } from "@/api/selectedBusinessManager"
import { router } from "expo-router"
import { useState, useEffect,  } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, Image} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const CompanyProfile = () => {
  const [menuVisible, setMenuVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)

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
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      Alert.alert("Erreur", "Impossible de charger les données de l'entreprise")
    } finally {
      setLoading(false)
    }
  }

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Entreprise</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Company Info Card */}
      <View style={styles.companyCard}>
        {/* Logo and Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {business.logoUrl ? (
              <Image source={{ uri: business.logoUrl }} style={styles.logoImage} />
            ) : (
              <Icon name="business" size={40} color="#1BB874" />
            )}
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.companyName}>{business.name}</Text>
            <View style={styles.verifiedRow}>
              {business.isVerified && (
                <>
                  <Icon name="verified" size={16} color="#3086F3" />
                  <Text style={styles.verifiedText}>Entreprise Vérifiée</Text>
                </>
              )}
              {business.averageRating > 0 && (
                <>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {business.averageRating.toFixed(1)}/5 ({business.reviewCount})
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          
          {business.phoneNumber && (
            <View style={styles.contactItem}>
              <Icon name="phone" size={25} color="#58617B" />
              <Text style={styles.contactText}>{business.phoneNumber}</Text>
            </View>
          )}
          
          {business.address && (
            <View style={styles.contactItem}>
              <Icon name="location-on" size={25} color="#58617B" />
              <Text style={styles.contactText}>{business.address}</Text>
            </View>
          )}
        </View>

        {/* Presentation Section */}
        {business.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Présentation</Text>
            <Text style={styles.presentationText}>{business.description}</Text>
          </View>
        )}
      </View>

      {/* Company Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Détails sur l'entreprise</Text>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Nom de l'entreprise</Text>
              <Text style={styles.detailValue}>{business.name}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Type d'entreprise</Text>
              <Text style={styles.detailValue}>{business.type}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Statut</Text>
              <Text style={styles.detailValue}>
                {business.isVerified ? "Vérifiée" : "Non vérifiée"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Date de création</Text>
              <Text style={styles.detailValue}>
                {new Date(business.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {business.address && (
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Adresse principale</Text>
                <Text style={styles.detailValue}>{business.address}</Text>
              </View>
            </View>
          )}

          {business.phoneNumber && (
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Téléphone Principal</Text>
                <Text style={styles.detailValue}>{business.phoneNumber}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Propriétaire</Text>
              <Text style={styles.detailValue}>
                {business.owner.firstName} {business.owner.lastName}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Votre rôle</Text>
              <Text style={styles.detailValue}>{business.userRole}</Text>
            </View>
          </View>

          {business.averageRating > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Note moyenne</Text>
                <Text style={styles.detailValue}>
                  {business.averageRating.toFixed(1)}/5 ({business.reviewCount} avis)
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => router.push("/fournisseurSetting/editCompanyInfo")}
      >
        <Text style={styles.editButtonText}>Modifier les informations</Text>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal 
        visible={menuVisible} 
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false)
                router.push("/fournisseurSetting/editCompanyInfo")
              }}
            >
              <Icon name="edit" size={20} color="#333" />
              <Text style={styles.menuItemText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false)
                Alert.alert(
                  "Supprimer l'entreprise",
                  "Êtes-vous sûr de vouloir supprimer cette entreprise ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    { 
                      text: "Supprimer", 
                      style: "destructive",
                      onPress: () => {
                        // TODO: Implémenter la suppression
                        Alert.alert("Info", "Fonctionnalité en cours de développement")
                      }
                    },
                  ]
                )
              }}
            >
              <Icon name="delete" size={20} color="#E91E63" />
              <Text style={[styles.menuItemText, { color: "#E91E63" }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  companyCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nameSection: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: "#58617B",
    fontWeight: "500",
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFF",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  contactText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  contactLink: {
    fontSize: 13,
    color: "#1BB874",
    textDecorationLine: "underline",
  },
  presentationText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  detailsSection: {
    backgroundColor: "#FAFAFA",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  detailLeft: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#1BB874",
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuDropdown: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
})

export default CompanyProfile