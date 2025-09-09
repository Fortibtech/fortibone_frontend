import { deleteFavoris } from "@/api/Products";
import { getFavoris, UserFavorite } from "@/api/Users";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Responsive dimensions
const { width } = Dimensions.get("window");
const isTablet = width >= 600;

const Favorites = () => {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation pour fade-in
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getFavoris();
        setFavorites(data.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err: any) {
        setError(err.message || "Impossible de récupérer les favoris");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleDeleteFavorite = async (id: string) => {
    try {
      const response = await deleteFavoris(id);
      if (response.status === 200) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
        Toast.show({
          type: "success",
          text1: "Produit retiré des favoris",
          position: "bottom",
          visibilityTime: 2000,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la suppression",
        text2: err.message || "Veuillez réessayer",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  const openDetails = (id: string) => {
    router.push(`/product-details/${id}`);
  };

  const renderFavoriteItem = ({
    item,
    index,
  }: {
    item: UserFavorite;
    index: number;
  }) => {
    const cardAnim = new Animated.Value(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100, // Effet cascade
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={[styles.itemContainer, { opacity: cardAnim }]}>
        <TouchableOpacity
          style={styles.itemContent}
          onPress={() => openDetails(item.id)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={`Voir détails de ${item.name}`}
        >
          <Image
            source={
              item.imageUrl
                ? { uri: item.imageUrl }
                : require("@/assets/images/bg.png")
            }
            style={styles.itemImage}
            defaultSource={require("@/assets/images/bg.png")} // Fallback pendant chargement
          />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.itemDesc} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFavorite(item.id)}
          accessible={true}
          accessibilityLabel={`Supprimer ${item.name} des favoris`}
        >
          <Ionicons
            name="trash-outline"
            size={isTablet ? 24 : 22}
            color="#FF4444"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator
          size={isTablet ? "large" : "small"}
          color="#059669"
        />
        <Text style={styles.loadingText}>Chargement des favoris...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons
          name="alert-circle-outline"
          size={isTablet ? 80 : 60}
          color="#FF4444"
        />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton size={isTablet ? 50 : 45} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Mes favoris ({favorites.length})
        </Text>
        <View style={styles.headerRight} />
      </View>
      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
        {/* Liste ou message vide */}
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="heart-outline"
              size={isTablet ? 100 : 80}
              color="#ccc"
            />
            <Text style={styles.emptyText}>Aucun favori pour le moment</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={renderFavoriteItem}
            showsVerticalScrollIndicator={false}
            numColumns={isTablet ? 2 : 1} // Deux colonnes sur tablette
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentWrapper: {
    paddingHorizontal: width * 0.04,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 0,
    justifyContent: "center",
  },
  headerRight: {
    flex: 1,
  },
  headerTitle: {
    flex: 2,
    fontSize: isTablet ? 22 : 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: isTablet ? 18 : 16,
    color: "#666",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    fontSize: isTablet ? 18 : 16,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: isTablet ? 18 : 16,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  itemContainer: {
    flex: isTablet ? 0.48 : 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: isTablet ? width * 0.01 : 0,
    padding: isTablet ? 16 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 80 : 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: isTablet ? 15 : 14,
    color: "#666",
    lineHeight: isTablet ? 22 : 20,
  },
  deleteButton: {
    padding: 8,
    justifyContent: "center",
  },
});

export default Favorites;
