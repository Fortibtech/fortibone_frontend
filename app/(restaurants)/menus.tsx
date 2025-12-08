// app/(restaurants)/menu/index.tsx
import React, { useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// FAKE DATA (ultra réaliste)
const FAKE_CATEGORIES = [
  {
    id: "1",
    name: "Entrées",
    dishCount: 8,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1547574405-45f4d2d34f54?w=800",
  },
  {
    id: "2",
    name: "Plats Principaux",
    dishCount: 14,
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  },
  {
    id: "3",
    name: "Desserts",
    dishCount: 6,
    isActive: true,
    imageUrl:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800",
  },
  {
    id: "4",
    name: "Boissons",
    dishCount: 12,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1544145945-f1739711e14a?w=800",
  },
  {
    id: "5",
    name: "Menu Enfant",
    dishCount: 4,
    isActive: false,
    imageUrl: "https://images.unsplash.com/photo-1563379929-5729b5c2b2e8?w=800",
  },
];

const MenuScreen = () => {
  const [categories] = useState(FAKE_CATEGORIES);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const renderCategory = ({ item }: { item: (typeof FAKE_CATEGORIES)[0] }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/(restaurants)/menu/category/${item.id}`)}
      activeOpacity={0.8}
    >
      {/* Image ou placeholder */}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="restaurant-outline" size={48} color="#ccc" />
        </View>
      )}

      {/* Contenu */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.dishCount}>
              {item.dishCount} plat{item.dishCount > 1 ? "s" : ""}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </View>

        <View style={styles.footer}>
          <View
            style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[styles.statusText, !item.isActive && { color: "#666" }]}
            >
              {item.isActive ? "Visible" : "Masqué"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: "/(restaurants)/menu/category/edit" as any,
                params: { categoryId: item.id },
              });
            }}
          >
            <Ionicons name="create-outline" size={24} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header fixe */}
      <View style={styles.header}>
        <Text style={styles.title}>Mon Menu</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(restaurants)/menu/category/create")}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7C3AED"]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },

  list: {
    padding: 16,
  },

  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  categoryImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 16,
  },

  categoryName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#000",
  },
  dishCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: "#ECFDF5",
  },
  inactiveBadge: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
});

export default MenuScreen;
