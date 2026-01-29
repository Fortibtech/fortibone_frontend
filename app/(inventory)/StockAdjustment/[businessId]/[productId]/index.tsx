import { useCallback, useEffect, useState, useMemo } from "react";
import StockReceptionModal from "@/components/StockReceptionModal";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { ChevronLeft, ChevronDown, Plus, Minus } from "lucide-react-native";
import { Product } from "@/app/(inventory)/details/[businessId]";
import { router, useLocalSearchParams } from "expo-router";
import {
  getBusinessInventory,
  InventoryItem,
  adjustVariantStock,
  AdjustPayload,
  BatchPayload,
  addVariantBatch,
} from "@/api/Inventory";

import Toast from "react-native-toast-message";
import { useBusinessStore } from "@/store/businessStore";
import { getCurrencySymbolById } from "@/api/currency/currencyApi";
import { Batch, getVariantBatches } from "@/api/inventory/batchesApi";

// === Types ===
type OperationType = "Entrée" | "Sortie" | "Ajustement";
type Motif =
  | "Reception de stock"
  | "Retour client"
  | "Inventaire"
  | "Défectueux"
  | "Produit périmé"
  | "Autre";

type LotOption = {
  label: string;
  batchId: string;
  available: number;
  exp: string; // Format JJ/MM/AAAA
};

const operationTypes: readonly OperationType[] = [
  "Entrée",
  "Sortie",
  "Ajustement",
] as const;

const motifs: readonly Motif[] = [
  "Reception de stock",
  "Retour client",
  "Inventaire",
  "Défectueux",
  "Produit périmé",
  "Autre",
] as const;

// === Composant principal ===
export default function StockAdjustment() {
  // === Paramètres ===
  const { businessId: rawBusinessId, productId: rawProductId } =
    useLocalSearchParams();
  const business = useBusinessStore((state) => state.business);
  const businessId = Array.isArray(rawBusinessId)
    ? rawBusinessId[0]?.trim()
    : rawBusinessId?.trim();

  const productId = Array.isArray(rawProductId)
    ? rawProductId[0]?.trim()
    : rawProductId?.trim();

  // === États ===
  const [inventory, setInventory] = useState<Product[]>([]);
  const [operationType, setOperationType] = useState<OperationType>("Entrée");
  const [lots, setLots] = useState<LotOption[]>([]);
  const [selectedLot, setSelectedLot] = useState<LotOption | null>(null);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [motif, setMotif] = useState<Motif>("Reception de stock");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOperationType, setShowOperationType] = useState(false);
  const [showLot, setShowLot] = useState(false);
  const [showMotif, setShowMotif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // === Charger l'inventaire ===
  const fetchInventory = useCallback(
    async (page: number) => {
      if (loading || page > totalPages || !businessId) return;
      setLoading(true);
      try {
        const res = await getBusinessInventory(businessId, page, 10);
        const mapped: Product[] = res.data.map((item: InventoryItem) => ({
          id: item.id,
          name: item.product.name,
          sku: item.sku,
          price: item.price,
          quantityInStock: item.quantityInStock,
          lots: item.itemsPerLot || 1,
          sold: 0,
          imageUrl: item.imageUrl,
        }));
        setInventory((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
        setTotalPages(res.totalPages);
        setCurrentPage(page);
        if (business) {
          const symbol = await getCurrencySymbolById(business.currencyId);
          setSymbol(symbol);
        }
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de charger l’inventaire",
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, totalPages, businessId, business]
  );

  useEffect(() => {
    if (businessId) fetchInventory(1);
  }, [businessId, fetchInventory]);

  // === Produit courant ===
  const currentProduct = useMemo(() => {
    if (!productId || inventory.length === 0) return null;
    return inventory.find((item) => item.id === productId) || null;
  }, [inventory, productId]);

  // === Charger les lots depuis l'API ===
  const fetchBatches = useCallback(async () => {
    if (!currentProduct?.id) return;

    setLotsLoading(true);
    try {
      const response = await getVariantBatches({
        variantId: currentProduct.id,
        limit: 50, // Suffisant pour la plupart des cas
      });

      const formattedLots: LotOption[] = response.data
        .filter((batch: Batch) => batch.quantity > 0) // Optionnel : cacher les lots à 0
        .map((batch: Batch) => {
          const expDate = new Date(batch.expirationDate);
          const formattedExp = expDate.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          return {
            label: `Lot #${batch.id.slice(-6)} (${batch.quantity} unité${
              batch.quantity > 1 ? "s" : ""
            }) Exp: ${formattedExp}`,
            batchId: batch.id,
            available: batch.quantity,
            exp: formattedExp,
          };
        })
        // Tri par date d'expiration décroissante (plus récent en haut)
        .sort((a, b) => {
          const dateA = a.exp.split("/").reverse().join("");
          const dateB = b.exp.split("/").reverse().join("");
          return dateB.localeCompare(dateA);
        });

      setLots(formattedLots);

      // Sélectionner automatiquement le premier lot si aucun n'est sélectionné
      if (formattedLots.length > 0 && !selectedLot) {
        setSelectedLot(formattedLots[0]);
      } else if (formattedLots.length === 0) {
        setSelectedLot(null);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les lots",
      });
      setLots([]);
      setSelectedLot(null);
    } finally {
      setLotsLoading(false);
    }
  }, [currentProduct?.id, selectedLot]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // === Alerte si produit non trouvé ===
  useEffect(() => {
    if (inventory.length > 0 && productId && !currentProduct) {
      Toast.show({
        type: "error",
        text1: "Produit non trouvé",
        text2: `ID: ${productId} n'existe pas dans cet inventaire.`,
      });
    }
  }, [currentProduct, inventory, productId]);

  // === Ajustement du stock ===
  const handleAdjust = async () => {
    if (!currentProduct || !quantity || !motif || !selectedLot) {
      Alert.alert("Champ manquant", "Veuillez remplir tous les champs.", [
        { text: "OK" },
      ]);
      return;
    }

    setSubmitting(true);

    try {
      let quantityChange: number;
      let type: "RETURN" | "LOSS" | "ADJUSTMENT" | "EXPIRATION";

      if (operationType === "Entrée") {
        quantityChange = +quantity;
        type = motif === "Retour client" ? "RETURN" : "ADJUSTMENT";
      } else if (operationType === "Sortie") {
        quantityChange = -quantity;
        type =
          motif === "Produit périmé"
            ? "EXPIRATION"
            : motif === "Défectueux"
            ? "LOSS"
            : "LOSS";
      } else {
        quantityChange = quantity;
        type = "ADJUSTMENT";
      }

      const payload: AdjustPayload = {
        quantityChange,
        type,
        reason: motif,
        batchId: selectedLot.batchId, // Important : on envoie le vrai batchId
      };

      await adjustVariantStock(currentProduct.id, payload);

      Alert.alert(
        "Succès",
        `Stock ajusté : ${quantityChange >= 0 ? "+" : ""}${Math.abs(
          quantityChange
        )} unité(s)`,
        [{ text: "OK", onPress: () => fetchInventory(1) }]
      );

      setQuantity(1);
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Échec de l’ajustement du stock", [
        { text: "OK" },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  // === Ajout de lot via modal ===
  const handleValidate = useCallback(
    async (data: {
      quantity: number;
      receptionDate: Date;
      expirationDate: Date;
      lotNumber: string;
    }) => {
      const formatDate = (date: Date) => date.toISOString().split("T")[0];

      const payload: BatchPayload = {
        quantity: data.quantity,
        expirationDate: formatDate(data.expirationDate),
      };

      try {
        await addVariantBatch(currentProduct!.id, payload);

        Alert.alert(
          "Succès",
          `${data.quantity} unité(s) ajoutée(s) au stock !`,
          [
            {
              text: "OK",
              onPress: () => {
                setModalVisible(false);
                fetchInventory(1);
                fetchBatches(); // Recharger les lots après ajout
              },
            },
          ]
        );
      } catch (error: any) {
        Alert.alert(
          "Erreur",
          error.message || "Impossible d’ajouter le lot. Réessayez.",
          [{ text: "OK" }]
        );
      }
    },
    [currentProduct, fetchInventory, fetchBatches]
  );

  // === Rendu ===
  if (loading && inventory.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B87C" />
        <Text style={styles.loadingText}>Chargement de l’inventaire...</Text>
      </View>
    );
  }

  if (!currentProduct) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Produit non trouvé</Text>
        <Text style={styles.errorText}>ID: {productId}</Text>
        <Text style={styles.errorHint}>
          Vérifiez l’URL ou rechargez la page.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustement de Stock</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productImage}>
            {currentProduct.imageUrl ? (
              <Image
                source={{ uri: currentProduct.imageUrl }}
                style={styles.productImageReal}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.phoneIcon} />
              </View>
            )}
          </View>

          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{currentProduct.name}</Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>
                  {currentProduct.quantityInStock <= 10 ? "Faible" : "OK"}
                </Text>
              </View>
            </View>
            <Text style={styles.sku}>SKU: {currentProduct.sku}</Text>

            <View style={styles.productDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prix Unitaire</Text>
                <Text style={styles.detailValue}>
                  {currentProduct.price} {symbol || ""}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stock Actuel</Text>
                <Text style={styles.detailValue}>
                  {currentProduct.quantityInStock}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.consultButton}
            >
              <Text style={styles.consultButtonText}>Consulter le produit</Text>
              <ChevronDown
                size={16}
                color="#00B87C"
                style={{ transform: [{ rotate: "-90deg" }] }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulaire */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Type d&apos;Opération <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setShowOperationType(!showOperationType)}
          >
            <Text style={styles.selectText}>{operationType}</Text>
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
          {showOperationType && (
            <View style={styles.dropdown}>
              {operationTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setOperationType(type);
                    setShowOperationType(false);
                    if (type !== "Ajustement") setQuantity(1);
                  }}
                >
                  <Text style={styles.dropdownText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Lot spécifique <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setShowLot(!showLot)}
            disabled={lotsLoading || lots.length === 0}
          >
            <Text style={styles.selectText}>
              {lotsLoading
                ? "Chargement des lots..."
                : selectedLot
                ? selectedLot.label
                : "Aucun lot disponible"}
            </Text>
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
          {showLot && lots.length > 0 && (
            <View style={styles.dropdown}>
              {lots.map((lot) => (
                <TouchableOpacity
                  key={lot.batchId}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedLot(lot);
                    setShowLot(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{lot.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Quantité <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={20} color="#00B87C" />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={Math.abs(quantity).toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!isNaN(num) && num >= 0) {
                  const signed = operationType === "Sortie" ? -num : num;
                  setQuantity(
                    operationType === "Ajustement"
                      ? quantity < 0
                        ? -num
                        : num
                      : signed
                  );
                }
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                setQuantity(quantity + (operationType === "Sortie" ? -1 : 1))
              }
            >
              <Plus size={20} color="#00B87C" />
            </TouchableOpacity>
            <Text style={styles.unitLabel}>Unité(s)</Text>
          </View>

          {operationType === "Ajustement" && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, quantity >= 0 && styles.toggleActive]}
                onPress={() => setQuantity(Math.abs(quantity))}
              >
                <Text
                  style={[
                    styles.toggleText,
                    quantity >= 0 && styles.toggleTextActive,
                  ]}
                >
                  + Ajout
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, quantity < 0 && styles.toggleActive]}
                onPress={() => setQuantity(-Math.abs(quantity))}
              >
                <Text
                  style={[
                    styles.toggleText,
                    quantity < 0 && styles.toggleTextActive,
                  ]}
                >
                  - Retrait
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Motif <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setShowMotif(!showMotif)}
          >
            <Text style={styles.selectText}>{motif}</Text>
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
          {showMotif && (
            <View style={styles.dropdown}>
              {motifs.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMotif(m);
                    setShowMotif(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal */}
      <StockReceptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        product={currentProduct}
        onValidate={handleValidate}
        symbol={symbol || ""}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.validateButton,
            submitting && styles.validateButtonDisabled,
          ]}
          onPress={handleAdjust}
          disabled={submitting || !selectedLot}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.validateButtonText}>Valider</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// === Styles (inchangés) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  content: { flex: 1, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF5252",
    marginBottom: 8,
  },
  errorText: { fontSize: 14, color: "#666", marginBottom: 4 },
  errorHint: { fontSize: 12, color: "#999" },
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: { marginRight: 16 },
  productImageReal: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 100,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneIcon: {
    width: 30,
    height: 50,
    backgroundColor: "#DDD",
    borderRadius: 4,
  },
  productInfo: { flex: 1 },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  stockBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeText: { color: "#FF9800", fontSize: 12, fontWeight: "500" },
  sku: { fontSize: 12, color: "#666", marginBottom: 12 },
  productDetails: { marginBottom: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: { fontSize: 13, color: "#666" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#000" },
  consultButton: { flexDirection: "row", alignItems: "center" },
  consultButtonText: {
    color: "#00B87C",
    fontSize: 13,
    fontWeight: "500",
    marginRight: 4,
  },
  field: { marginTop: 20 },
  label: { fontSize: 14, color: "#333", marginBottom: 8, fontWeight: "500" },
  required: { color: "#FF5252" },
  select: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectText: { fontSize: 14, color: "#000" },
  dropdown: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownText: { fontSize: 14, color: "#000" },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
  },
  quantityInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 8,
  },
  unitLabel: { fontSize: 14, color: "#666", marginLeft: 8 },
  toggleContainer: {
    flexDirection: "row",
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toggleBtn: { flex: 1, padding: 12, alignItems: "center" },
  toggleActive: { backgroundColor: "#00B87C" },
  toggleText: { fontSize: 14, color: "#666" },
  toggleTextActive: { color: "#FFF", fontWeight: "600" },
  bottomActions: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#666" },
  validateButton: {
    flex: 2,
    backgroundColor: "#00B87C",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  validateButtonDisabled: {
    backgroundColor: "#66C9A3",
    opacity: 0.7,
  },
  validateButtonText: { fontSize: 16, fontWeight: "600", color: "#FFF" },
});
