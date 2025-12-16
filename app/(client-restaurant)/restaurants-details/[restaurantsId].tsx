// app/(app)/restaurants/[restaurantsId]/index.tsx
import BackButtonAdmin from "@/components/Admin/BackButton";
import Menus from "@/components/Menu-Table/Menus";
import Table from "@/components/Menu-Table/Table";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const RestaurantsId: React.FC = () => {
  const { restaurantsId } = useLocalSearchParams<{ restaurantsId: string }>();
  const [activeTab, setActiveTab] = useState<"menu" | "table">("menu");
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.container}>
        {/* === HEADER === */}
        <View style={styles.headerRow}>
          <BackButtonAdmin />

          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab("menu")}
              style={[styles.tab, activeTab === "menu" && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "menu" && styles.activeTabText,
                ]}
              >
                Menus
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("table")}
              style={[styles.tab, activeTab === "table" && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "table" && styles.activeTabText,
                ]}
              >
                Réserve une table
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {activeTab === "menu" ? (
          <Menus restaurantsId={restaurantsId} />
        ) : (
          <Table restaurantsId={restaurantsId} />
        )}
      </SafeAreaView>
    </>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  tabText: { fontWeight: "600", color: "#555", fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#333" },
  backBtn: { padding: 8 },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F5F7",
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 12,
    height: 40,
    justifyContent: "center",
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 0,
  },
  activeTab: { backgroundColor: "#E8FFF1" },
  activeTabText: { color: "#00A36C", fontWeight: "600" },
});

export default RestaurantsId;
