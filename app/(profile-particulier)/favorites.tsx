import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFavoris, UserFavorite } from "@/api/Users";
import BackButton from "@/components/BackButton";

const Favorites = () => {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getFavoris();
        setFavorites(data.data);
      } catch (err: any) {
        setError(err.message || "Impossible de récupérer les favoris");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading)
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#00C851" />
    );

  if (error)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.centerText}>{error}</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Bouton retour en haut à gauche */}
     <BackButton />
      {favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.centerText}>
            Vous n&apos;avez aucun favori pour le moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.itemDesc}>{item.description}</Text>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listContainer: { paddingBottom: 20 },
  itemContainer: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemDesc: { fontSize: 14, color: "#666", marginTop: 4 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerText: { fontSize: 16, color: "#666", textAlign: "center" },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10, // pour rester au-dessus de la liste
  },
});

export default Favorites;
