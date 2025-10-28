import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const commandes = [
  {
    id: "1",
    code: "#CMD-2025-001",
    client: "Bruno Nomac",
    date: "15/10/2025",
    articles: 8,
    color: "#00A36C",
  },
  {
    id: "2",
    code: "#CMD-2025-002",
    client: "Jean-Marc",
    date: "28/06/2025",
    articles: 5,
    color: "#00A36C",
  },
  {
    id: "3",
    code: "#CMD-2025-003",
    client: "Anne Françoise",
    date: "02/11/2025",
    articles: 11,
    color: "#FF4B4B",
  },
];

const clients = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@gmail.com",
    ca: "2 658 €",
    commandes: 8,
    panierMoyen: "332,25 €",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
];

export default function VentesScreen() {
  const [activeTab, setActiveTab] = useState<"commandes" | "clients">(
    "commandes"
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("commandes")}
          style={[styles.tab, activeTab === "commandes" && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "commandes" && styles.activeTabText,
            ]}
          >
            Commandes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("clients")}
          style={[styles.tab, activeTab === "clients" && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "clients" && styles.activeTabText,
            ]}
          >
            Clients
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "commandes" ? <CommandesList /> : <ClientsList />}
    </View>
  );
}

function CommandesList() {
  return (
    <View style={{ flex: 1 }}>
      {/* Search + New */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#777" />
          <TextInput
            placeholder="Rechercher un client..."
            style={{ flex: 1, marginLeft: 6 }}
          />
          <Ionicons name="filter-outline" size={18} color="#777" />
        </View>
        <TouchableOpacity style={styles.newBtn}>
          <Ionicons name="add" size={18} color="#00A36C" />
          <Text style={styles.newBtnText}>Nouvelle Commande</Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>#</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Client</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Date</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Articles</Text>
      </View>

      <FlatList
        data={commandes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <Text style={[styles.cell, { flex: 1 }]}>{item.code}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.client}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.date}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.articles}</Text>
          </View>
        )}
      />
    </View>
  );
}

function ClientsList() {
  return (
    <View style={{ flex: 1 }}>
      {/* Search + New */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#777" />
          <TextInput
            placeholder="Rechercher un client..."
            style={{ flex: 1, marginLeft: 6 }}
          />
          <Ionicons name="filter-outline" size={18} color="#777" />
        </View>
        <TouchableOpacity style={styles.newBtn}>
          <Ionicons name="person-add-outline" size={18} color="#00A36C" />
          <Text style={styles.newBtnText}>Nouveau Client</Text>
        </TouchableOpacity>
      </View>

      {/* Liste Clients */}
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.clientCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientEmail}>{item.email}</Text>
              <View style={styles.clientStats}>
                <Text style={styles.stat}>
                  💰 CA total : <Text style={styles.bold}>{item.ca}</Text>
                </Text>
                <Text style={styles.stat}>
                  📦 Commandes :{" "}
                  <Text style={styles.bold}>{item.commandes}</Text>
                </Text>
                <Text style={styles.stat}>
                  📊 Panier moyen :{" "}
                  <Text style={styles.bold}>{item.panierMoyen}</Text>
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.detailsLink}>Voir détails</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  // --- Tabs ---
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F4F5F7",
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
  },
  tabText: { fontWeight: "600", color: "#555" },
  activeTab: { backgroundColor: "#E8FFF1" },
  activeTabText: { color: "#00A36C" },

  // --- Search & button ---
  searchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F6F6F6",
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    alignItems: "center",
  },
  newBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#00A36C",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  newBtnText: {
    color: "#00A36C",
    fontWeight: "600",
    marginLeft: 4,
  },

  // --- Table Commandes ---
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
    paddingBottom: 6,
  },
  headerCell: { fontWeight: "600", color: "#555" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F2F2F2",
  },
  colorBar: { width: 3, height: 25, marginRight: 8, borderRadius: 2 },
  cell: { color: "#333", fontSize: 14 },

  // --- Clients ---
  clientCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  clientName: { fontWeight: "600", fontSize: 16, color: "#111" },
  clientEmail: { color: "#777", fontSize: 13, marginBottom: 4 },
  clientStats: { marginTop: 4 },
  stat: { color: "#444", fontSize: 13 },
  bold: { fontWeight: "600", color: "#000" },
  detailsLink: {
    marginTop: 6,
    color: "#00A36C",
    fontWeight: "600",
    fontSize: 13,
  },
});
