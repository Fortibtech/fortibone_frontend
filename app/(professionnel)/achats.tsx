// app/(tabs)/achats/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { UserPlus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AchatOrders from "@/components/Achat/AchatOrders";
import AchatSuppliers from "@/components/Achat/AchatSuppliers";
import BackButtonAdmin from "@/components/Admin/BackButton";
import List from "@/components/Admin/List";
import SearchHeader from "@/components/Admin/SearchHeader";
import CartIcon from "@/components/Achat/CartIcon ";

export default function AchatsScreen() {
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState<"commandes" | "fournisseurs">(
    "fournisseurs"
  );

  // État pour la recherche → partagé avec les deux composants enfants
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* === HEADER FIXE === */}
      <View style={styles.header}>
        <BackButtonAdmin />

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "commandes" && styles.tabActive]}
            onPress={() => setActiveTab("commandes")}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "commandes" }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "commandes" && styles.tabTextActive,
              ]}
            >
              Commandes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "fournisseurs" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("fournisseurs")}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "fournisseurs" }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "fournisseurs" && styles.tabTextActive,
              ]}
            >
              Fournisseurs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Icône à droite selon l'onglet */}
        {activeTab === "commandes" ? <CartIcon /> : <List />}
      </View>

      {/* === BARRE DE RECHERCHE + BOUTON AJOUT === */}
      <View style={styles.searchBarContainer}>
        {/* Recherche : on passe la fonction qui met à jour le state parent */}
        <SearchHeader
          placeholder="Rechercher un fournisseur..."
          showMenuButton={false}
          onSearch={setSearchQuery} // ← C'EST ÇA QUI MANQUAIT !
        />

        {/* Bouton Ajouter uniquement sur Fournisseurs */}
        {activeTab === "fournisseurs" && (
          <TouchableOpacity style={styles.addButton}>
            <UserPlus size={18} color="#00B87C" />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* === CONTENU DYNAMIQUE SCROLLABLE === */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {activeTab === "commandes" ? (
          <AchatOrders searchQuery={searchQuery} />
        ) : (
          <AchatSuppliers searchQuery={searchQuery} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// === STYLES (inchangés) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 50,
    marginHorizontal: 10,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 50 },
  tabActive: { backgroundColor: "#FFF" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#666" },
  tabTextActive: { color: "#00B87C" },

  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    gap: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    backgroundColor: "#E8F5F0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#00B87C",
  },
  addButtonText: {
    color: "#00B87C",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  scrollContent: { flex: 1 },
  scrollPadding: { padding: 16 },
});
