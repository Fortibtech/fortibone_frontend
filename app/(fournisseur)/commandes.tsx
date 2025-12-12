// app/(professionnel)/orders/index.tsx   (ou où tu l’as placé)
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Business, BusinessesService } from "@/api";
import { useBusinessStore } from "@/store/businessStore";

export default function OrdersScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // On met à jour le store quand on choisit une entreprise
  const setBusiness = useBusinessStore((state) => state.setBusiness);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const data = await BusinessesService.getBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error("Erreur fetch entreprises :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleSelectBusiness = async (business: Business) => {
    try {
      // On sauvegarde la sélection + on met à jour le store global
      await BusinessesService.selectBusiness(business);
      setBusiness(business);

      // Navigation propre (replace pour ne pas empiler)
      router.replace(`/(orders)/details/${business.id}`);
    } catch (error) {
      console.error("Erreur sélection entreprise :", error);
    }
  };

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectBusiness(item)}>
      <Ionicons name="business-outline" size={28} color="#2c3e50" style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>
          {item.address || "Aucune adresse fournie"}
        </Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="receipt-outline" size={32} color="#2c3e50" />
        <Text style={styles.headerTitle}>Commandes des entreprises</Text>
        <Text style={styles.headerDescription}>
          Sélectionnez une entreprise pour consulter ses commandes
        </Text>
      </View>

      {/* Liste des entreprises */}
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune entreprise disponible</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 20,
    backgroundColor: "#ecf0f1",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
    color: "#2c3e50",
  },
  headerDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
    textAlign: "center",
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    marginBottom: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  icon: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#888",
  },
});