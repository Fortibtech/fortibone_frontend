// app/(delivery)/earnings.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { SelectedBusinessManager } from "@/api";

interface EarningsStats {
  today: number;
  week: number;
  month: number;
  completedDeliveries: number;
}

const DeliveryEarningsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [stats, setStats] = useState<EarningsStats | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      if (!selected) {
        Alert.alert(
          "Aucun profil livreur",
          "Sélectionne un profil de livraison pour voir les revenus."
        );
        setLoading(false);
        return;
      }
      setBusinessId(selected.id);
      await loadStats(selected.id);
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les revenus.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (id: string) => {
    try {
      // TODO: brancher un vrai endpoint /delivery/driver/earnings
      setStats({
        today: 12500,
        week: 56000,
        month: 230000,
        completedDeliveries: 48,
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de récupérer les statistiques.");
    }
  };

  const onRefresh = async () => {
    if (!businessId) return;
    setRefreshing(true);
    await loadStats(businessId);
    setRefreshing(false);
  };

  const format = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.loadingText}>Chargement des revenus...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color="#9ca3af" />
          <Text style={styles.loadingText}>
            Aucune donnée de revenus disponible.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Revenus</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C851"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>

          <View style={styles.row}>
            <View style={[styles.card, styles.cardGreen]}>
              <Text style={styles.cardLabel}>Aujourd&apos;hui</Text>
              <Text style={styles.cardValue}>
                {format(stats.today)} <Text style={styles.unit}>KMF</Text>
              </Text>
            </View>

            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardLabel}>Cette semaine</Text>
              <Text style={styles.cardValue}>
                {format(stats.week)} <Text style={styles.unit}>KMF</Text>
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.cardPurple]}>
              <Text style={styles.cardLabel}>Ce mois-ci</Text>
              <Text style={styles.cardValue}>
                {format(stats.month)} <Text style={styles.unit}>KMF</Text>
              </Text>
            </View>

            <View style={[styles.card, styles.cardGray]}>
              <Text style={styles.cardLabel}>Livraisons terminées</Text>
              <Text style={styles.cardValue}>{stats.completedDeliveries}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À venir</Text>
          <View style={styles.infoCard}>
            <Ionicons
              name="analytics-outline"
              size={24}
              color="#4b5563"
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Graphiques détaillés</Text>
              <Text style={styles.infoText}>
                Plus tard, tu pourras voir l&apos;évolution de tes revenus par
                jour, semaine et mois avec des courbes et des filtres avancés.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="card-outline"
              size={24}
              color="#4b5563"
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Moyens de paiement</Text>
              <Text style={styles.infoText}>
                Intègre les différents modes de paiement (cash, mobile money,
                virement) et vois clairement ce qui reste à encaisser.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6b7280" },

  headerBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  content: { padding: 16, paddingBottom: 40 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  row: { flexDirection: "row", gap: 12, marginBottom: 12 },

  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
  },
  cardGreen: {
    borderColor: "#86EFAC",
    backgroundColor: "#ECFDF3",
  },
  cardBlue: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  cardPurple: {
    borderColor: "#C4B5FD",
    backgroundColor: "#F5F3FF",
  },
  cardGray: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },

  cardLabel: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  cardValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  unit: { fontSize: 14, color: "#6b7280", fontWeight: "500" },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  infoTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  infoText: { fontSize: 13, color: "#6b7280", marginTop: 4 },
});

export default DeliveryEarningsScreen;
