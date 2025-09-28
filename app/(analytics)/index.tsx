import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

export default function AnalyticsIndex() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const analyticsLinks = [
    {
      title: "Vue d'ensemble",
      description: "Statistiques générales",
      href: `/(analytics)/overview/${id}`, // ✅ segment dynamique
      icon: (color: string, size: number) => (
        <Ionicons name="stats-chart" size={size} color={color} />
      ),
    },
    {
      title: "Ventes",
      description: "Statistiques de ventes",
      href: `/(analytics)/sales/${id}`,
      icon: (color: string, size: number) => (
        <MaterialCommunityIcons name="cart-outline" size={size} color={color} />
      ),
    },
    {
      title: "Inventaire",
      description: "Suivi des stocks",
      href: `/(analytics)/inventory/${id}`,
      icon: (color: string, size: number) => (
        <Ionicons name="cube-outline" size={size} color={color} />
      ),
    },
    {
      title: "Clients",
      description: "Top clients",
      href: `/(analytics)/customers/${id}`,
      icon: (color: string, size: number) => (
        <Ionicons name="people-outline" size={size} color={color} />
      ),
    },
    {
      title: "Restaurant",
      description: "Stats spécifiques resto",
      href: `/(analytics)/restaurant/${id}`,
      icon: (color: string, size: number) => (
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={size}
          color={color}
        />
      ),
    },
    {
      title: "Membres",
      description: "Suivi des employés",
      href: `/(analytics)/members/${id}`,
      icon: (color: string, size: number) => (
        <Ionicons name="person-circle-outline" size={size} color={color} />
      ),
    },
  ];

  const renderItem = ({ item, index }: any) => (
    <Link href={item.href} asChild>
      <TouchableOpacity activeOpacity={0.8}>
        <Animated.View
          entering={FadeInUp.delay(index * 100).springify()}
          layout={Layout.springify()}
          style={styles.card}
        >
          <View style={styles.iconContainer}>{item.icon("#3b82f6", 32)}</View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.header}>Tableau de bord Analytics</Text>
      </View>

      <FlatList
        data={analyticsLinks}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    margin: 8,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    maxWidth: 160, // Fixed width for uniform card size
    minWidth: 160,
    minHeight: 140, // Ensure uniform height
    transform: [{ scale: 1 }],
  },
  iconContainer: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
