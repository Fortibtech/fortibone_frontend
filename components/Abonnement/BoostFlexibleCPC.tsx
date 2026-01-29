import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { AlertCircle, CheckCircle2 } from "lucide-react-native";

export default function BoostFlexibleCPC() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Carte Boost Flexible */}
        <View style={styles.card}>
          {/* Header avec icône info */}
          <View style={styles.header}>
            <Text style={styles.title}>Boost Flexible</Text>
            <TouchableOpacity style={styles.infoButton}>
              <AlertCircle size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Contrôle total de votre budget et de votre campagne
          </Text>

          {/* CPC Section */}
          <View style={styles.cpcSection}>
            <Text style={styles.cpcLabel}>
              <Text style={styles.cpcHighlight}>CPC</Text>
              <Text style={styles.cpcText}> / Clic</Text>
            </Text>
          </View>

          {/* Budgetisation */}
          <View style={styles.feature}>
            <CheckCircle2 size={20} color="#FDB022" fill="#FDB022" />
            <Text style={styles.featureTitle}>Budgetisation au Clic</Text>
          </View>

          <View style={styles.subFeatures}>
            <Text style={styles.subFeature}>
              • Produit Sponsorisé : 0.15 € /Clic
            </Text>
            <Text style={styles.subFeature}>
              • Bannière d&apos;Entreprise : 0.10 € /Clic
            </Text>
            <Text style={styles.subFeature}>
              • Menu Sponsorisé : 0.12 € /Clic
            </Text>
          </View>

          {/* Ciblage */}
          <View style={styles.feature}>
            <CheckCircle2 size={20} color="#FDB022" fill="#FDB022" />
            <Text style={styles.featureTitle}>
              Ciblage précis (Géo, Intérêt, Profil) - selon le budget
            </Text>
          </View>

          {/* Statistiques */}
          <View style={styles.feature}>
            <CheckCircle2 size={20} color="#FDB022" fill="#FDB022" />
            <Text style={styles.featureTitle}>Statistiques en temps réel</Text>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.ctaButtonText}>Démarrer une Campagne CPC</Text>
          </TouchableOpacity>

          <Text style={styles.paymentNote}>
            Paiement au clic, sans engagement fixe.
          </Text>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Barre en haut */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Modèle de Tarification CPC</Text>

            <Text style={styles.modalDescription}>
              Le modèle Coût Par Clic (CPC) est facturé uniquement
              lorsqu&apos;un Particulier clique sur votre annonce. C&apos;est
              une option flexible, gérée directement depuis votre tableau de
              bord publicitaire.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>J&apos;ai Compris !</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#9CA3AF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },
  infoButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  cpcSection: {
    marginBottom: 24,
  },
  cpcLabel: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  cpcHighlight: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FDB022",
  },
  cpcText: {
    fontSize: 18,
    color: "#6B7280",
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  featureTitle: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 20,
  },
  subFeatures: {
    marginLeft: 30,
    marginBottom: 16,
  },
  subFeature: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: "#FDB022",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  paymentNote: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 16,
    minHeight: 300,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: "#E8F5F0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00C896",
  },
});
