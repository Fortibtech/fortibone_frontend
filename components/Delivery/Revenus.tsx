// app/(delivery)/earnings.tsx
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";

import RevenueDistributionChart from "@/components/Chart/RevenueDistributionChart";
import ExpenseDistributionChart from "@/components/Chart/ExpenseDistributionChart";
import { SalesByCategoryChart } from "@/components/Chart/SalesBarChart";

interface Props {
  businessId: string | null;
}
const Revenus = ({ businessId }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    if (!businessId) return;
    setRefreshing(true);

    setRefreshing(false);
  };

  return (
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
              0 <Text style={styles.unit}>KMF</Text>
            </Text>
          </View>

          <View style={[styles.card, styles.cardBlue]}>
            <Text style={styles.cardLabel}>Cette semaine</Text>
            <Text style={styles.cardValue}>
              0 <Text style={styles.unit}>KMF</Text>
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.cardPurple]}>
            <Text style={styles.cardLabel}>Ce mois-ci</Text>
            <Text style={styles.cardValue}>
              0 <Text style={styles.unit}>KMF</Text>
            </Text>
          </View>
          <View style={[styles.card, styles.cardGray]}>
            <Text style={styles.cardLabel}>Livraisons terminées</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistique</Text>
        <RevenueDistributionChart businessId={businessId!} />
        <ExpenseDistributionChart businessId={businessId!} />
        <SalesByCategoryChart businessId={businessId!} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  headerBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6b7280" },
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

export default Revenus;
