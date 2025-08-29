import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserBusinesses, UserBusiness } from "@/api/Users";
import BackButton from "@/components/BackButton";

const UserBusinesses = () => {
  const [businesses, setBusinesses] = useState<UserBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const data = await getUserBusinesses();
        setBusinesses(data);
      } catch (err: any) {
        setError(err.message || "Impossible de récupérer les entreprises");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const renderItem = ({ item }: { item: UserBusiness }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.businessName}>{item.name}</Text>
      <Text style={styles.businessRole}>Rôle : {item.role}</Text>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#00C851" />
    );

  if (error)
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <Text style={[styles.centerText, { marginTop: 20 }]}>{error}</Text>
      </SafeAreaView>
    );

  if (businesses.length === 0)
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.centerContainer}>
          <Text style={styles.centerText}>Aucune entreprise associée.</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listContainer: { paddingBottom: 20 },
  itemContainer: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  businessName: { fontSize: 16, fontWeight: "600" },
  businessRole: { fontSize: 14, color: "#666", marginTop: 4 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerText: { fontSize: 16, color: "#666" },
});

export default UserBusinesses;
