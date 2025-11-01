// app/(tabs)/index.tsx
import { Business, BusinessesService, SelectedBusinessManager } from "@/api";
import BusinessSelector from "@/components/Business/BusinessSelector";
import { Ionicons } from "@expo/vector-icons";
import { Route, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const HomePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const businessesResponse = await BusinessesService.getBusinesses();
      setBusinesses(businessesResponse);
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected);
      if (selected && !businessesResponse.find((b) => b.id === selected.id)) {
        await BusinessesService.clearSelectedBusiness();
        setSelectedBusiness(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleBusinessSelect = async (business: Business) => {
    try {
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
      Alert.alert("Succès", `Entreprise "${business.name}" sélectionnée`);
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'entreprise");
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#000" />
      </TouchableOpacity> */}

      <BusinessSelector
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/pro/createBusiness")}
        onManageBusiness={() => router.push("/pro/profile")}
      />

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatar}>
          <Ionicons name="person" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOverviewSection = () => {
    if (!selectedBusiness) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d&apos;Ensemble</Text>

        <View style={styles.cardsRow}>
          {/* CA Mensuel - Jaune */}
          <View style={[styles.overviewCard, styles.cardYellow]}>
            <View style={styles.cardIcon}>
              {/* <Text style={styles.cardEmoji}>🪙</Text> */}
              <Image
                source={require("@/assets/images/wallet-money.png")}
                style={styles.cardEmoji}
              />
            </View>
            <View>
              <Text style={styles.cardLabel}>CA Mensuel</Text>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <Text style={styles.cardValue}>90 000</Text>
                <Text style={styles.cardUnit}>KMF</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardFull}>
            {/* En attente - Violet */}
            <View style={[styles.overviewCard, styles.cardPurple]}>
              <View style={styles.cardIcon}>
                {/* <Text style={styles.cardEmoji}>🛍️</Text> */}
                <Image
                  source={require("@/assets/images/bag-2.png")}
                  style={styles.cardEmojiDouble}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>En attente</Text>
                <Text style={styles.cardValue}>20 commandes clients</Text>
              </View>
            </View>
            {/* Achats en cours - Vert (pleine largeur) */}
            <View style={[styles.overviewCard, styles.cardGreen]}>
              <View style={styles.cardIcon}>
                {/* <Text style={styles.cardEmoji}>🛒</Text> */}
                <Image
                  source={require("@/assets/images/money-recive.png")}
                  style={styles.cardEmojiDouble}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>Achats en cours</Text>
                <Text style={styles.cardValue}>50 articles command...</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickAccessSection = () => {
    if (!selectedBusiness) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accès Rapide</Text>

        <View style={styles.quickAccessRow}>
          {/* Ventes */}
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() =>
              router.push(`(analytics)?id=${selectedBusiness.id}` as Route)
            }
            activeOpacity={0.8}
          >
            <View style={styles.quickAccessIconContainer}>
              <Ionicons name="trending-up" size={40} color="#7C3AED" />
            </View>
            <Text style={styles.quickAccessTitle}>Ventes</Text>
            <Text style={styles.quickAccessSubtitle}>
              Statistiques des ventes
            </Text>
          </TouchableOpacity>

          {/* Achats */}
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() =>
              router.push(`(analytics)?id=${selectedBusiness.id}` as Route)
            }
            activeOpacity={0.8}
          >
            <View style={styles.quickAccessIconContainer}>
              <Ionicons name="cart" size={40} color="#7C3AED" />
            </View>
            <Text style={styles.quickAccessTitle}>Achats</Text>
            <Text style={styles.quickAccessSubtitle}>
              Taux de rotation, gestion d...
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickAccessRow}>
          {/* Ventes */}
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() =>
              router.push(`(analytics)?id=${selectedBusiness.id}` as Route)
            }
            activeOpacity={0.8}
          >
            <View style={styles.quickAccessIconContainer}>
              <Ionicons name="trending-up" size={40} color="#7C3AED" />
            </View>
            <Text style={styles.quickAccessTitle}>Ventes</Text>
            <Text style={styles.quickAccessSubtitle}>
              Statistiques des ventes
            </Text>
          </TouchableOpacity>

          {/* Achats */}
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() =>
              router.push(`(analytics)?id=${selectedBusiness.id}` as Route)
            }
            activeOpacity={0.8}
          >
            <View style={styles.quickAccessIconContainer}>
              <Ionicons name="cart" size={40} color="#7C3AED" />
            </View>
            <Text style={styles.quickAccessTitle}>Achats</Text>
            <Text style={styles.quickAccessSubtitle}>
              Taux de rotation, gestion d...
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNoBusinessSelected = () => (
    <View style={styles.noBusinessContainer}>
      <Ionicons name="business-outline" size={80} color="#E0E0E0" />
      <Text style={styles.noBusinessTitle}>Aucune entreprise sélectionnée</Text>
      <Text style={styles.noBusinessText}>
        Sélectionnez une entreprise pour voir vos statistiques
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00C851"]}
          />
        }
      >
        {selectedBusiness ? (
          <>
            {renderOverviewSection()}
            {renderQuickAccessSection()}
            {/* {renderChartsSection()} */}
          </>
        ) : (
          renderNoBusinessSelected()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    alignContent: "space-between",
    justifyContent: "space-between",
  },
  cardFull: {
    width: "50%",
  },
  cardFullH: {
    height: "100%",
  },
  cardYellow: {
    backgroundColor: "#F1E9C7FF",
    borderWidth: 2,
    borderColor: "#FACC15",
    alignContent: "space-between",
  },
  cardPurple: {
    backgroundColor: "#E5E9FFFF",
    borderWidth: 2,
    marginBottom: 10,
    borderColor: "#506EFF",
    padding: 10,
  },
  cardGreen: {
    backgroundColor: "#F2FCF1FF",
    borderWidth: 2,
    borderColor: "#68F755",
    padding: 10,
  },
  cardIcon: {
    // marginBottom: 12,
  },
  cardEmoji: {
    // fontSize: 28,
    width: 42,
    height: 42,
    position: "relative",
    // bottom: 5,
  },
  cardEmojiDouble: {
    // fontSize: 28,
    width: 24,
    height: 24,
    position: "relative",
    // bottom: 5,
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
    marginVertical: 12,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  cardUnit: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  quickAccessRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    minHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  chartsSection: {
    marginTop: 8,
    gap: 16,
  },
  noBusinessContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noBusinessTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  noBusinessText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HomePage;
