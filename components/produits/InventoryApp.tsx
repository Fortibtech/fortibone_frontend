import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router"; // ← useFocusEffect ajouté
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { format } from "date-fns";
import {
  getBusinessInventory,
  InventoryItem,
  getExpiringSoonProducts,
  Batch,
  recordExpiredLosses,
} from "@/api/Inventory";
import { SafeAreaView } from "react-native-safe-area-context";
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  quantityInStock: number;
  lots: number;
  sold: number;
  imageUrl: string;
}

type InventoryAppProps = {
  id: string;
};

const InventoryApp: React.FC<InventoryAppProps> = ({ id }) => {
  const [searchText, setSearchText] = useState("");
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Chargement global
  const [expiringCount, setExpiringCount] = useState(0);
  const [expiringModal, setExpiringModal] = useState(false);
  const [expiringBatches, setExpiringBatches] = useState<Batch[]>([]);
  const [loadingExpiring, setLoadingExpiring] = useState(false);
  const [submittingLosses, setSubmittingLosses] = useState(false);

  // === Chargement complet de l'inventaire (toutes les pages) ===
  const loadFullInventory = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      let allProducts: Product[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await getBusinessInventory(id, page, 20); // 20 par page pour aller plus vite
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
        allProducts = [...allProducts, ...mapped];
        totalPages = res.totalPages;
        page++;
      } while (page <= totalPages);

      setInventory(allProducts);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger l’inventaire",
      });
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // === Badge expirations (30 jours pour cohérence avec modal) ===
  const fetchExpiringCount = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getExpiringSoonProducts(id, 30);
      setExpiringCount(data.length);
    } catch (err) {
      console.error("Erreur badge expirés", err);
      setExpiringCount(0);
    }
  }, [id]);

  // === Chargement au montage ===
  useEffect(() => {
    loadFullInventory();
    fetchExpiringCount();
  }, [loadFullInventory, fetchExpiringCount]);

  // === Rechargement à chaque retour sur l'écran (focus) ===
  useFocusEffect(
    useCallback(() => {
      loadFullInventory();
      fetchExpiringCount();
    }, [loadFullInventory, fetchExpiringCount])
  );

  // === Chargement des produits expirants pour le modal ===
  const fetchExpiringProducts = async () => {
    setLoadingExpiring(true);
    try {
      const data = await getExpiringSoonProducts(id, 30);
      setExpiringBatches(data);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les produits expirants",
      });
    } finally {
      setLoadingExpiring(false);
    }
  };

  const openExpiringModal = async () => {
    await fetchExpiringProducts();
    setExpiringModal(true);
  };

  // === Après enregistrement des pertes ===
  const handleLossesRecorded = () => {
    loadFullInventory();
    fetchExpiringCount();
  };

  // === Filtrage local ===
  const filteredProducts = inventory.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // === Enregistrer les pertes ===
  const handleRecordLosses = async () => {
    setSubmittingLosses(true);
    try {
      const response = await recordExpiredLosses(id);
      Toast.show({
        type: "success",
        text1: "Pertes enregistrées",
        text2: `${response.lossesRecorded} perte(s) enregistrée(s).`,
      });
      handleLossesRecorded();
      setExpiringModal(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible d’enregistrer les pertes",
      });
    } finally {
      setSubmittingLosses(false);
    }
  };

  // === Export PDF (inchangé) ===
  const exportToPDF = async () => {
    // ... (ton code existant, identique)
    try {
      const html = `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
          <style>
            body { font-family: Arial; margin: 40px; color: #111827; }
            h1 { text-align: center; color: #10B981; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
            th { background-color: #F9FAFB; color: #6B7280; }
            tr:nth-child(even) { background-color: #F9FAFB; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; }
          </style>
        </head><body>
          <h1>Inventaire - ${new Date().toLocaleDateString("fr-FR")}</h1>
          <table><thead><tr>
            <th>#</th><th>Produit</th><th>SKU</th><th>Qté</th><th>Prix</th>
          </tr></thead><tbody>
            ${filteredProducts
              .map(
                (p, i) => `<tr>
                  <td>${i + 1}</td><td>${p.name}</td><td>${p.sku}</td><td>${
                  p.quantityInStock
                }</td>
                  <td>${p.price} €</td>
                </tr>`
              )
              .join("")}
          </tbody></table>
          <div class="footer">Généré le ${new Date().toLocaleString(
            "fr-FR"
          )}</div>
        </body></html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      } else {
        Alert.alert("PDF généré", `Fichier : ${uri}`);
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Erreur", text2: "Échec export PDF" });
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCellText, styles.colId]}>
        {item.id.slice(-3)}
      </Text>
      <Text style={[styles.tableCellText, styles.colProduct]}>{item.name}</Text>
      <Text style={[styles.tableCellText, styles.colSku]}>{item.sku}</Text>
      <Text style={[styles.tableCellText, styles.colQty]}>
        {item.quantityInStock}
      </Text>
      <Text style={[styles.tableCellText, styles.colLots]}>{item.lots}</Text>
      <Text style={[styles.tableCellText, styles.colSold]}>{item.sold}</Text>
      <View style={styles.colActions}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: `/(inventory)/StockAdjustment/${id}/${item.id}`,
            });
          }}
          style={styles.actionBtn}
        >
          <Feather name="eye" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerNav}>
          <TouchableOpacity
            onPress={openExpiringModal}
            style={styles.alertIcon}
          >
            <Feather
              name="alert-triangle"
              size={24}
              color={expiringCount > 0 ? "#DC2626" : "#10B981"}
            />
            {expiringCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{expiringCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search & Export */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
          <Feather name="file-text" size={18} color="#374151" />
          <Text style={styles.exportText}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Tableau */}
      <View style={styles.tableContainer}>
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colId]}>#</Text>
                <Text style={[styles.tableHeaderText, styles.colProduct]}>
                  Produit
                </Text>
                <Text style={[styles.tableHeaderText, styles.colSku]}>SKU</Text>
                <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
                <Text style={[styles.tableHeaderText, styles.colLots]}>
                  Lots
                </Text>
                <Text style={[styles.tableHeaderText, styles.colSold]}>
                  Vendu
                </Text>
                <Text style={[styles.tableHeaderText, styles.colActions]}>
                  Détails
                </Text>
              </View>

              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <Text style={{ color: "#9CA3AF" }}>
                      {searchText
                        ? "Aucun produit correspondant"
                        : "Aucun produit en stock"}
                    </Text>
                  </View>
                }
              />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Modal expirés */}
      <Modal
        animationType="slide"
        transparent
        visible={expiringModal}
        onRequestClose={() => setExpiringModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Produits expirant bientôt ({expiringBatches.length})
            </Text>

            {loadingExpiring ? (
              <ActivityIndicator size="large" color="#10B981" />
            ) : expiringBatches.length === 0 ? (
              <Text style={styles.emptyText}>
                Aucun produit à expirer bientôt.
              </Text>
            ) : (
              <>
                <ScrollView style={{ maxHeight: 300, marginBottom: 16 }}>
                  {expiringBatches.map((batch) => (
                    <View key={batch.id} style={styles.expiringItem}>
                      <Text style={styles.expiringName}>
                        {batch.variant?.product.name || "Produit inconnu"}
                      </Text>
                      <Text style={styles.expiringDate}>
                        Quantité : {batch.quantity} | Expire le{" "}
                        {format(new Date(batch.expirationDate), "dd/MM/yyyy")}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    submittingLosses && styles.disabledButton,
                  ]}
                  onPress={handleRecordLosses}
                  disabled={submittingLosses}
                >
                  <Text style={styles.submitText}>
                    {submittingLosses
                      ? "Enregistrement..."
                      : "Enregistrer les pertes"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.modalBtn, styles.closeBtn]}
              onPress={() => setExpiringModal(false)}
            >
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", marginTop: 20 },
  header: { backgroundColor: "#FFFFFF", paddingVertical: 12 },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  alertIcon: { position: "relative" },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 4,
  },
  tab: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 16 },
  activeTabStyle: { backgroundColor: "#10B981" },
  activeTabText: { color: "#FFFFFF" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#111827" },

  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  exportText: { fontSize: 14, color: "#374151", fontWeight: "500" },

  tableContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  table: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  tableBody: { flex: 1 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tableCellText: { fontSize: 14, color: "#111827" },

  colId: { width: 50 },
  colProduct: { width: 140 },
  colSku: { width: 110 },
  colQty: { width: 60 },
  colLots: { width: 60 },
  colSold: { width: 60 },
  colActions: {
    width: 100,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: { padding: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },

  detailLabel: {
    fontSize: 14,
    color: "#374151",
    marginTop: 12,
    fontWeight: "500",
  },
  detailValue: { fontSize: 16, color: "#111827", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  datePickerButton: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  datePickerText: { fontSize: 16, color: "#111827" },
  submitButton: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  disabledButton: { backgroundColor: "#9CA3AF" },

  expiringItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  expiringName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  expiringDate: { fontSize: 14, color: "#DC2626", marginTop: 4 },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontStyle: "italic",
    marginVertical: 20,
  },

  modalBtn: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeBtn: { backgroundColor: "#10B981" },
  closeText: { color: "#FFFFFF", fontWeight: "600" },
});

export default InventoryApp;
