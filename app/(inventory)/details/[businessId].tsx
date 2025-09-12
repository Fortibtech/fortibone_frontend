import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getBusinessInventory,
  InventoryItem,
  adjustVariantStock,
  addVariantBatch,
} from "@/api/Inventory";
import BackButton from "@/components/BackButton";
import ExpiringSoonProducts from "@/components/ExpiringSoonProducts";

const BusinessId = () => {
  const { businessId } = useLocalSearchParams();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Modal states pour ajuster stock
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<InventoryItem | null>(
    null
  );
  const [quantityChange, setQuantityChange] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState<"LOSS" | "GAIN" | "ADJUSTMENT">("LOSS");
  const [submitting, setSubmitting] = useState(false);

  // Modal states pour ajout lot
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState("");
  const [batchDate, setBatchDate] = useState(new Date());
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Charger inventaire
  const fetchInventory = useCallback(
    async (pageToLoad: number) => {
      if (loading || pageToLoad > totalPages) return;
      setLoading(true);
      try {
        const res = await getBusinessInventory(
          businessId as string,
          pageToLoad,
          10
        );
        setInventory((prev) => [...prev, ...res.data]);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Erreur fetch inventory:", err);
        Toast.show({
          type: "error",
          text1: "❌ Erreur",
          text2:
            err instanceof Error
              ? err.message
              : "Impossible de charger l’inventaire",
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, totalPages, businessId]
  );

  useEffect(() => {
    fetchInventory(1);
  }, [fetchInventory]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchInventory(nextPage);
    }
  };

  // Réinitialiser et recharger l'inventaire après enregistrement des pertes
  const handleLossesRecorded = useCallback(() => {
    setInventory([]);
    setPage(1);
    fetchInventory(1);
  }, [fetchInventory]);

  // Ajuster stock
  const handleAdjust = async () => {
    if (!selectedVariant) return;
    setSubmitting(true);
    try {
      await adjustVariantStock(selectedVariant.id, {
        quantityChange: Number(quantityChange),
        type,
        reason,
      });
      Toast.show({
        type: "success",
        text1: "✅ Stock ajusté",
        text2: "L’ajustement a été appliqué.",
      });
      setModalVisible(false);
      setQuantityChange("");
      setReason("");
      setInventory([]);
      setPage(1);
      fetchInventory(1);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "❌ Erreur",
        text2:
          err instanceof Error ? err.message : "Impossible d’ajuster le stock",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Ajouter lot
  const handleAddBatch = async () => {
    if (!selectedVariant) return;
    setBatchSubmitting(true);
    try {
      await addVariantBatch(selectedVariant.id, {
        quantity: Number(batchQuantity),
        expirationDate: batchDate.toISOString().split("T")[0],
      });
      Toast.show({
        type: "success",
        text1: "✅ Lot ajouté",
        text2: "Le nouveau lot a été ajouté.",
      });
      setBatchModalVisible(false);
      setBatchQuantity("");
      setInventory([]);
      setPage(1);
      fetchInventory(1);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "❌ Erreur",
        text2:
          err instanceof Error ? err.message : "Impossible d’ajouter le lot",
      });
    } finally {
      setBatchSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const taille = item.attributeValues.find(
      (a) => a.attribute.name === "Taille"
    )?.value;
    const couleur = item.attributeValues.find(
      (a) => a.attribute.name === "Couleur"
    )?.value;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.product.name}</Text>
          <Text style={styles.text}>SKU: {item.sku}</Text>
          <Text style={styles.text}>Prix: {item.price} €</Text>
          <Text style={styles.text}>Stock: {item.quantityInStock}</Text>
          {taille && <Text style={styles.text}>Taille: {taille}</Text>}
          {couleur && <Text style={styles.text}>Couleur: {couleur}</Text>}
        </View>

        {/* Boutons */}
        <View style={{ flexDirection: "column" }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedVariant(item);
              setModalVisible(true);
            }}
          >
            <Icon name="add-circle-outline" size={28} color="#2ecc71" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedVariant(item);
              setBatchModalVisible(true);
            }}
          >
            <Icon name="cube-outline" size={28} color="#3498db" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerText}>
          <Text style={styles.screenTitle}>Inventaire de l’entreprise</Text>
          <Text style={styles.screenDescription}>
            Consultez, ajustez et ajoutez des lots de stock pour vos produits.
          </Text>
        </View>
      </View>
      <ExpiringSoonProducts
        businessId={businessId as string}
        days={30}
        onLossesRecorded={handleLossesRecorded}
      />
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#3498db" /> : null
        }
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 16 }}
      />

      {/* Modal Ajuster stock */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="analytics-outline" size={40} color="#3498db" />
            <Text style={styles.modalTitle}>Ajuster le stock</Text>
            <Text style={styles.modalDescription}>
              Modifiez la quantité de ce produit pour refléter une perte, un
              achat ou une vente.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Quantité (+ ou -)"
              keyboardType="numeric"
              value={quantityChange}
              onChangeText={setQuantityChange}
            />
            <TextInput
              style={styles.input}
              placeholder="Raison"
              value={reason}
              onChangeText={setReason}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAdjust}
              disabled={submitting}
            >
              <Text style={styles.submitText}>
                {submitting ? "Enregistrement..." : "Valider"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: "#e74c3c" }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Ajouter lot */}
      <Modal
        visible={batchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBatchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="cube-outline" size={40} color="#3498db" />
            <Text style={styles.modalTitle}>Ajouter un nouveau lot</Text>
            <Text style={styles.modalDescription}>
              Entrez la quantité et la date d’expiration du lot.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Quantité"
              keyboardType="numeric"
              value={batchQuantity}
              onChangeText={setBatchQuantity}
            />

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {batchDate.toISOString().split("T")[0]}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={batchDate}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setShowDatePicker(false);
                  if (d) setBatchDate(d);
                }}
              />
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddBatch}
              disabled={batchSubmitting}
            >
              <Text style={styles.submitText}>
                {batchSubmitting ? "Enregistrement..." : "Valider"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setBatchModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={styles.submitText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerText: { marginLeft: 10, flex: 1 },
  screenTitle: { fontSize: 20, fontWeight: "bold", color: "#2c3e50" },
  screenDescription: { fontSize: 14, color: "#7f8c8d", marginTop: 4 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 6, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  text: { fontSize: 14, color: "#333" },
  addButton: { padding: 6, marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  modalDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginVertical: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  datePickerButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  datePickerText: { fontSize: 14, color: "#333" },
});

export default BusinessId;
