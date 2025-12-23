// app/livreurs/index.tsx
import { BusinessesService } from "@/api";
import { getTariffs } from "@/api/delivery/deliveryApi"; // ← Import correct
import { CarrierOption } from "@/api/services/businessesService";
import BackButtonAdmin from "@/components/Admin/BackButton";
import formatDistance from "@/utils/formatDistance";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface Tariff {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  basePrice: string; // L'API renvoie des strings
  pricePerKm: string; // L'API renvoie des strings
  minDistance: number;
  maxDistance: number;
  createdAt: string;
  updatedAt: string;
  vehicleType?: string | null;
}

export default function LivreursScreen() {
  const [livreurs, setLivreurs] = useState<CarrierOption[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour la modal
  const [selectedLivreur, setSelectedLivreur] = useState<CarrierOption | null>(
    null
  );
  const [tarifs, setTarifs] = useState<Tariff[]>([]);
  const [loadingTarifs, setLoadingTarifs] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Chargement des livreurs au montage
  useEffect(() => {
    const loadLivreurs = async () => {
      try {
        setLoading(true);
        const all = await BusinessesService.getCarriers();
        const filtered = all.filter((b) => b.type === "LIVREUR");
        setLivreurs(filtered);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de charger les livreurs",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLivreurs();
  }, []);

  // Ouverture de la modal + chargement des tarifs via getTariffs
  const openModal = async (livreur: CarrierOption) => {
    setSelectedLivreur(livreur);
    setModalVisible(true);
    setLoadingTarifs(true);
    setTarifs([]);

    try {
      const tarifsList = await getTariffs(livreur.id); // ← Utilisation de la vraie fonction
      setTarifs(tarifsList);
    } catch (error: any) {
      console.error("Erreur chargement tarifs :", error);
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les tarifs de ce livreur",
      });
      setTarifs([]);
    } finally {
      setLoadingTarifs(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedLivreur(null);
    setTarifs([]);
  };

  // Formatage des prix (car l'API renvoie des strings)
  const formatPrice = (price: string) => {
    const num = parseInt(price, 10);
    return isNaN(num) ? "— KMF" : `${num.toLocaleString("fr")} KMF`;
  };

  // Rendu d'un livreur dans la liste
  const renderLivreur = ({ item }: { item: CarrierOption }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="bicycle-outline" size={32} color="#00A36C" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>Livreur</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>
    </TouchableOpacity>
  );

  // Rendu d'un tarif dans la modal
  const renderTarif = (tarif: Tariff) => (
    <View key={tarif.id} style={styles.tarifCard}>
      <Text style={styles.tarifName}>{tarif.name}</Text>
      {tarif.description && (
        <Text style={styles.tarifDescription}>{tarif.description}</Text>
      )}

      <View style={styles.tarifDetails}>
        <Text style={styles.tarifLabel}>Prix de base :</Text>
        <Text style={styles.tarifValue}>{formatPrice(tarif.basePrice)}</Text>
      </View>

      <View style={styles.tarifDetails}>
        <Text style={styles.tarifLabel}>Prix par km :</Text>
        <Text style={styles.tarifValue}>
          {formatPrice(tarif.pricePerKm)}/km
        </Text>
      </View>

      <View style={styles.tarifDetails}>
        <Text style={styles.tarifLabel}>Distance :</Text>
        <Text style={styles.tarifValue}>
          {formatDistance(tarif.minDistance, tarif.maxDistance)}
        </Text>
      </View>

      {tarif.vehicleType && (
        <View style={styles.tarifDetails}>
          <Text style={styles.tarifLabel}>Véhicule :</Text>
          <Text style={styles.tarifValue}>{tarif.vehicleType}</Text>
        </View>
      )}
    </View>
  );

  // Écran de chargement principal
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A36C" />
          <Text style={styles.loadingText}>Chargement des livreurs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <Text style={styles.title}>Livreurs disponibles</Text>
      </View>

      {/* Liste ou message vide */}
      {livreurs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aucun livreur disponible pour le moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={livreurs}
          keyExtractor={(item) => item.id}
          renderItem={renderLivreur}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal des tarifs */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* En-tête modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Tarifs de {selectedLivreur?.name || "Livreur"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Corps modal */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {loadingTarifs ? (
                <View style={styles.loadingTarifs}>
                  <ActivityIndicator size="large" color="#00A36C" />
                  <Text style={styles.loadingText}>
                    Chargement des tarifs...
                  </Text>
                </View>
              ) : tarifs.length === 0 ? (
                <View style={styles.emptyTarifs}>
                  <Text style={styles.emptyText}>
                    Aucun tarif configuré pour ce livreur
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.tarifsTitle}>Tarifs disponibles</Text>
                  {tarifs.map(renderTarif)}
                </View>
              )}
            </ScrollView>

            {/* Pied modal */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 50,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111" },

  // Liste
  list: { paddingHorizontal: 16, paddingTop: 12 },

  // Carte livreur
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 12,
    padding: 16,
  },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "600", color: "#111" },
  type: { fontSize: 14, color: "#00A36C", marginTop: 4 },

  // États vides / loading
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    height: "90%",
    width: "90%",
    maxHeight: "95%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  modalBody: { flex: 1, padding: 20 },
  tarifsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },

  tarifCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  tarifName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },
  tarifDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  tarifDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  tarifLabel: { fontSize: 14, color: "#666" },
  tarifValue: { fontSize: 14, fontWeight: "600", color: "#00A36C" },

  loadingTarifs: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTarifs: { flex: 1, justifyContent: "center", alignItems: "center" },

  modalFooter: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: { fontSize: 16, fontWeight: "600", color: "#333" },
});
