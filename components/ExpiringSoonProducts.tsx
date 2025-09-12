import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { format } from "date-fns";
import {
  getExpiringSoonProducts,
  Batch,
  recordExpiredLosses,
} from "@/api/Inventory";

// Interface pour les props du composant
interface ExpiringSoonProductsProps {
  businessId: string;
  days?: number; // Optionnel, par défaut 30 jours
  onLossesRecorded?: () => void; // Ajout de la prop optionnelle
}

const ExpiringSoonProducts: React.FC<ExpiringSoonProductsProps> = ({
  businessId,
  days = 30,
  onLossesRecorded,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingLosses, setSubmittingLosses] = useState<boolean>(false);

  // Charger les produits qui expirent bientôt
  useEffect(() => {
    const fetchExpiringProducts = async () => {
      try {
        setLoading(true);
        const data = await getExpiringSoonProducts(businessId, days);
        setBatches(data);
        setError(null);
        if (data.length > 0) {
          Toast.show({
            type: "info",
            text1: "Produits expirant bientôt",
            text2: `${data.length} produit(s) vont expirer dans les ${days} jours.`,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        Toast.show({
          type: "error",
          text1: "❌ Erreur",
          text2: "Impossible de charger les produits expirants.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringProducts();
  }, [businessId, days]);

  // Enregistrer les pertes de produits périmés
  const handleRecordLosses = async () => {
    setSubmittingLosses(true);
    try {
      const response = await recordExpiredLosses(businessId);
      Toast.show({
        type: "success",
        text1: "✅ Pertes enregistrées",
        text2: `${response.lossesRecorded} perte(s) enregistrée(s) avec succès.`,
      });
      // Recharger les produits expirants après enregistrement
      const data = await getExpiringSoonProducts(businessId, days);
      setBatches(data);
      // Appeler le callback pour recharger l'inventaire principal
      if (onLossesRecorded) {
        onLossesRecorded();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      Toast.show({
        type: "error",
        text1: "❌ Erreur",
        text2: "Impossible d’enregistrer les pertes.",
      });
    } finally {
      setSubmittingLosses(false);
    }
  };

  // Rendu d'un élément de la liste
  const renderItem = ({ item }: { item: Batch }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>
          {item.variant?.product.name || "Produit inconnu"}
        </Text>
        <Text style={styles.text}>Quantité : {item.quantity}</Text>
        <Text style={styles.text}>
          Expiration : {format(new Date(item.expirationDate), "dd/MM/yyyy")}
        </Text>
        <Text style={styles.text}>Variante ID : {item.variantId}</Text>
      </View>
    </View>
  );

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

  // Afficher une erreur si présente
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  // Afficher un message si aucun produit n'expire
  if (batches.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Produits expirant bientôt</Text>
        <Text style={styles.emptyText}>
          Aucun produit ne va expirer dans les {days} prochains jours.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Produits expirant bientôt</Text>
        <TouchableOpacity
          style={[
            styles.submitButton,
            submittingLosses && styles.disabledButton,
          ]}
          onPress={handleRecordLosses}
          disabled={submittingLosses}
        >
          <Text style={styles.submitText}>
            {submittingLosses ? "Enregistrement..." : "Enregistrer les pertes"}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={batches}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7f8c8d",
  },
  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  submitButton: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#7f8c8d",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ExpiringSoonProducts;
