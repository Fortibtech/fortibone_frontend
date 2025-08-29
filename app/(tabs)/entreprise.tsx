// app/(tabs)/enterprise.tsx
import { Enterprise } from "@/types/app";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { JSX, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pro from "../pro";
import ProtectedRoute from "@/components/ProtectedRoute";

// Types
interface Category {
  id: string;
  name: string;
}



const categories: Category[] = [
  { id: "all", name: "Tout" },
  { id: "cosmetic", name: "Cosmétique" },
  { id: "shopping", name: "Shopping" },
  { id: "food", name: "Alimentation" },
];

const enterprises: Enterprise[] = [
  {
    id: 1,
    name: "Newbest",
    rating: 4.5,
    category: "Localisation",
    image: require("@/assets/images/entreprise3.png"),
    categoryId: "shopping",
  },
  {
    id: 2,
    name: "BlancheTech",
    rating: 4.8,
    category: "Localisation",
    image: require("@/assets/images/entreprise2.png"),
    categoryId: "shopping",
  },
  {
    id: 3,
    name: "Newbest",
    rating: 4.5,
    category: "Localisation",
    image: require("@/assets/images/entreprise3.png"),
    categoryId: "food",
  },
  {
    id: 4,
    name: "BlancheTech",
    rating: 4.8,
    category: "Localisation",
    image: require("@/assets/images/entreprise2.png"),
    categoryId: "cosmetic",
  },
  {
    id: 5,
    name: "Newbest",
    rating: 4.5,
    category: "Localisation",
    image: require("@/assets/images/entreprise3.png"),
    categoryId: "food",
  },
  {
    id: 6,
    name: "BlancheTech",
    rating: 4.8,
    category: "Localisation",
    image: require("@/assets/images/entreprise2.png"),
    categoryId: "shopping",
  },
];

const EnterprisePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const navigateToEnterpriseDetails = (enterpriseId: number): void => {
    router.push(`/enterprise-details?id=${enterpriseId}`);
  };

  const filteredEnterprises: Enterprise[] =
    activeCategory === "all"
      ? enterprises
      : enterprises.filter(
          (enterprise) => enterprise.categoryId === activeCategory
        );

  const renderHeader = (): JSX.Element => (
    <View style={styles.header}>
      <View style={styles.placeholder} />
      <Text style={styles.headerTitle}>Rechercher une entreprise</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderCategoryTabs = (): JSX.Element => (
    <ProtectedRoute>
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {categories.map((category: Category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                activeCategory === category.id && styles.activeTab,
              ]}
              onPress={() => setActiveCategory(category.id)}
              activeOpacity={0.8}
            >
              {activeCategory === category.id && (
                <Ionicons name="flame-outline" size={20} color={"red"} />
              )}
              <Text
                style={[
                  styles.tabText,
                  activeCategory === category.id && styles.activeTabText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ProtectedRoute>
  );

  const renderEnterpriseCard = (enterprise: Enterprise): JSX.Element => (
    <TouchableOpacity
      key={enterprise.id}
      style={styles.enterpriseCard}
      onPress={() => navigateToEnterpriseDetails(enterprise.id)}
      activeOpacity={0.8}
    >
      <Image source={enterprise.image} style={styles.enterpriseImage} />
      <View style={styles.enterpriseContent}>
        <View>
          <Text style={styles.enterpriseTitle} numberOfLines={1}>
            {enterprise.name}
          </Text>
          <Text style={styles.enterpriseCategory}>{enterprise.category}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{enterprise.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEnterpriseGrid = (): JSX.Element => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.grid}>
        {filteredEnterprises.map(renderEnterpriseCard)}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar backgroundColor="#fff" barStyle="dark-content" /> */}

      {renderHeader()}
      {renderCategoryTabs()}
      {renderEnterpriseGrid()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    // justifyContent: 'space-between',
    // alignItems: 'center',
    padding: 15,
    // paddingVertical: 16,
    margin: 20,
    borderRadius: 16,
    // backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: "gray",
    // borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "gray",
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    // backgroundColor: '#fff',
    paddingVertical: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F0F0F0',
  },
  tabScrollContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#E8E9ED",
  },
  activeTab: {
    backgroundColor: "#00C851",
    borderColor: "#00C851",
    alignItems: "center",
    justifyContent: "space-around",
    alignContent: "space-around",
    flexDirection: "row",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Space for tab bar
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  enterpriseCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  enterpriseImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5F6FA",
  },
  enterpriseContent: {
    padding: 14,
    flexDirection: "row",
    alignContent: "space-between",
    justifyContent: "space-between",
  },
  enterpriseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  enterpriseCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontWeight: "400",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 13,
    color: "#333",
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default EnterprisePage;
