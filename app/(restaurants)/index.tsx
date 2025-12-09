// app/(restaurants)/index.tsx
import React, { useCallback, useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { getStatRestaurant, RestaurantStats } from "@/api/restaurant";
import { useUserAvatar } from "@/hooks/useUserAvatar";
/***************************************************************
 * 📦 IMPORTS MÉTIER (API & MODELS)
 *
 * Business :
 *   - Type/Interface représentant une entreprise (id, type, nom…)
 *
 * BusinessesService :
 *   - Service qui permet de récupérer toutes les entreprises,
 *     sélectionner une entreprise, etc. (API/storage)
 *
 * SelectedBusinessManager :
 *   - Gestionnaire dédié à la “dernière entreprise sélectionnée”.
 *   - Sert à charger + stocker l’entreprise active (persistance locale).
 ***************************************************************/
import { Business, BusinessesService, SelectedBusinessManager } from "@/api";

/***************************************************************
 * 🎛️ COMPOSANT UI — SÉLECTEUR D’ENTREPRISE
 *
 * BusinessSelector :
 *   - Composant affiché dans le header dynamique.
 *   - Permet à l'utilisateur de choisir l'entreprise active.
 *   - Interagit directement avec handleBusinessSelect().
 ***************************************************************/
import BusinessSelector from "@/components/Business/BusinessSelector";

const RestaurantHome: React.FC = () => {
  /***************************************************************
   * 🏢 LISTE DES ENTREPRISES + ENTREPRISE SÉLECTIONNÉE
   *
   * businesses :
   *   - Contient toutes les entreprises liées au compte de l'utilisateur.
   *   - Récupérées via l’API / BusinessesService au montage de l’écran.
   *   - Sert à alimenter le composant <BusinessSelector />.
   *
   * selectedBusiness :
   *   - Représente l’entreprise actuellement active dans l’application.
   *   - Contrôle l’UI globale (header dynamique, navigation, permissions).
   *   - Peut être null au premier chargement si aucune sélection n’a été faite.
   *
   * ⚠️ Toute modification sur l’une de ces deux states impacte
   * le fonctionnement global du header et de la navigation.
   ***************************************************************/
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { uri } = useUserAvatar();

  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  /***************************************************************
   * 📌 CHARGEMENT INITIAL + RAFRAICHISSEMENT LORS DU FOCUS
   *
   * useEffect :
   *   - S’exécute au premier montage de l’écran.
   *   - Appelle loadInitialData() pour charger :
   *        → la liste complète des entreprises de l’utilisateur
   *        → l’entreprise sélectionnée précédemment (storage)
   *
   * useFocusEffect :
   *   - Se déclenche à chaque fois que l’écran redevient actif.
   *   - Si une entreprise est sélectionnée :
   *        → recharge les statistiques liées à cette entreprise.
   *   - Permet d’avoir des données toujours fraîches sans recharger
   *     toute la page (optimisation pour l’UX).
   *
   * loadInitialData :
   *   - Charge les données essentielles au démarrage :
   *        1) setLoading(true) → active un éventuel spinner UI
   *        2) Récupère toutes les entreprises via BusinessesService
   *        3) Récupère l’entreprise sélectionnée (storage)
   *        4) Met à jour l’état React (businesses + selectedBusiness)
   *
   *   - En cas d’erreur :
   *        → log console
   *        → alerte utilisateur claire
   *
   *   - finally :
   *        → désactive le loading quoi qu’il arrive
   *
   * ⚠️ Ces fonctions déterminent l’état global de l’app.
   *    Toute modification doit être faite avec prudence.
   ***************************************************************/

  useEffect(() => {
    // Chargement initial au montage de l’écran
    loadInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Rafraîchit uniquement les stats lorsque l’écran revient en focus
      if (selectedBusiness) {
        loadStats(selectedBusiness.id);
      }
    }, [selectedBusiness])
  );

  /****************************************************
   * 🔄 CHARGEMENT INITIAL DES ENTREPRISES & SELECTION
   ****************************************************/
  const loadInitialData = async () => {
    try {
      setLoading(true); // Active l'état de chargement global

      // 1) Charger toutes les entreprises de l'utilisateur
      const all = await BusinessesService.getBusinesses();
      setBusinesses(all);

      // 2) Charger l’entreprise sélectionnée précédemment (storage)
      const selected = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(selected ?? null);
    } catch (e) {
      console.error(e);
      // Erreur → informer l'utilisateur
      Alert.alert("Erreur", "Impossible de charger vos restaurants.");
    } finally {
      // Désactiver le loader dans tous les cas
      setLoading(false);
    }
  };
  const loadStats = async (businessId: string) => {
    if (statsLoading) return;
    try {
      setStatsLoading(true);
      const data = await getStatRestaurant(businessId);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (selectedBusiness) await loadStats(selectedBusiness.id);
    setRefreshing(false);
  };

  /***************************************************************
   * 📌 handleBusinessSelect(business: Business)
   *
   * INFO GÉNÉRALE :
   * Cette fonction gère la sélection d'une entreprise depuis le
   * sélecteur (header). Elle persiste la sélection via le service
   * `BusinessesService`, met à jour l'état local, notifie l'utilisateur,
   * puis redirige vers la section de l'app correspondant au type
   * d'entreprise sélectionné.
   *
   * USAGE :
   * - Appelée depuis <BusinessSelector /> quand l'utilisateur choisit
   *   une entreprise.
   * - Effets :
   *    1) Persistance (API / storage local)
   *    2) Mise à jour de l'état local (React state)
   *    3) Notification UI (Alert)
   *    4) Navigation / redirection conditionnelle selon `business.type`
   *
   * REMARQUES IMPORTANTES :
   * - Le `setTimeout` (100 ms) laisse le temps au state / storage
   *   d'être stabilisé avant la redirection (évite certains problèmes
   *   de race condition visuelle).
   * - Si la persistance échoue, on intercepte l'erreur et on affiche
   *   une alerte d'erreur sans changer l'état ni naviguer.
   ***************************************************************/
  const handleBusinessSelect = async (business: Business) => {
    try {
      // 1) Persister la sélection côté service
      //    - Appel asynchrone vers BusinessesService.selectBusiness
      //    - Peut écrire en storage local, cookie, ou appeler une API.
      //    - Si cette opération échoue, on saute directement au catch.
      await BusinessesService.selectBusiness(business);

      // 2) Mettre à jour l'état local
      //    - Permet à l'UI réactive (header, listes, etc.) d'afficher
      //      la nouvelle entreprise sélectionnée immédiatement.
      setSelectedBusiness(business);

      // 3) Notifier l'utilisateur (feedback immédiat)
      //    - Alerte simple confirmant la sélection.
      //    - Améliore l'UX : l'utilisateur voit que son action a été prise en compte.
      Alert.alert("Succès", `${business.name} sélectionné`);

      // 4) Redirection conditionnelle après un court délai
      //    - Le délai (100ms) réduit les risques que la navigation
      //      interfère avec la mise à jour de l'état ou les effets secondaires.
      //    - Selon business.type, on remplace la route courante par
      //      la route dédiée à ce type d'entreprise.
      setTimeout(() => {
        switch (business.type) {
          case "COMMERCANT":
            // Redirige vers l'espace professionnel général
            router.replace("/(professionnel)");
            break;
          case "RESTAURATEUR":
            // Redirige vers l'espace restaurants
            router.replace("/(restaurants)");
            break;
          case "FOURNISSEUR":
            // Redirige vers l'espace fournisseurs
            router.replace("/(fournisseur)");
            break;
          case "LIVREUR":
            // Redirige vers l'espace livreurs
            router.replace("/(livreur)");
            break;
          default:
            // Optionnel : gérer les types inconnus (sécurité)
            // console.warn(`Type d'entreprise inconnu: ${business.type}`);
            break;
        }
      }, 100);
    } catch (error) {
      // ERREUR => feedback utilisateur
      // - Si la persistance a échoué, on informe l'utilisateur.
      // - On n'effectue aucune navigation ni modification d'état supplémentaire.
      Alert.alert("Erreur", "Impossible de changer de restaurant");
      // Optionnel : logger l'erreur pour le debug
      // console.error("handleBusinessSelect error:", error);
    }
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("fr-FR").format(num);

  const pendingOrders = stats?.pendingOrders || 0;
  const inPreparation = stats?.inPreparationOrders || 0;
  const readyOrders = stats?.readyOrders || 0;

  const totalAlerts = pendingOrders + inPreparation;

  /****************************************************
   * 🚨 HEADER GLOBAL & DYNAMIQUE — PRÉSENT DANS CHAQUE index.ts 🚨
   *
   * ➜ Ce composant est rendu automatiquement sur toutes les pages principales.
   * ➜ Il adapte son contenu selon :
   *      - l’entreprise sélectionnée
   *      - le nombre d’alertes
   *      - le profil utilisateur (avatar)
   *
   * ⚠️ Toute modification ici impacte toute l’application.
   * ⚠️ À manipuler avec précaution : c’est un header partagé globalement.
   ****************************************************/

  const renderHeader = () => (
    <View style={styles.header}>
      {/* /************ SÉLECTEUR D’ENTREPRISE — DYNAMIQUE ************/}
      <BusinessSelector
        businesses={businesses}
        selectedBusiness={selectedBusiness}
        onBusinessSelect={handleBusinessSelect}
        loading={loading}
        onAddBusiness={() => router.push("/(create-business)/")}
        onManageBusiness={() => router.push("/pro/ManageBusinessesScreen")}
      />
      {/* /************************************************************/}
      {/* ZONE DE DROITE : Notifications + Avatar */}
      <View style={styles.headerRight}>
        {/*     /***************** BADGE NOTIFICATIONS *****************/}
        <TouchableOpacity style={styles.iconButton}>
          {totalAlerts > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {totalAlerts > 99 ? "99+" : totalAlerts}
              </Text>
            </View>
          )}
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        {/*  /*******************************************************/
        /********************** AVATAR USER **********************/}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => router.push("/restaurant/settings")}
        >
          {uri ? (
            <Image source={{ uri }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#999" />
            </View>
          )}
        </TouchableOpacity>
        {/*    /*********************************************************/}
      </View>
    </View>
  );
  const renderOverview = () => {
    if (!selectedBusiness) return null;

    if (statsLoading && !stats) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d&apos;ensemble</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>
              Chargement des statistiques...
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d&apos;ensemble</Text>

        <View style={styles.cardsRow}>
          {/* CA Mensuel */}
          <View style={[styles.card, styles.cardYellow]}>
            <View style={styles.cardIcon}>
              <Image
                source={require("@/assets/images/wallet-money.png")}
                style={styles.emoji}
              />
            </View>
            <View>
              <Text style={styles.cardLabel}>CA du mois</Text>
              <Text style={styles.cardValue}>
                {formatNumber(stats?.monthlyRevenue || 0)}{" "}
                <Text style={styles.unit}>KMF</Text>
              </Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            {/* Commandes en attente */}
            <View style={[styles.card, styles.cardPurple, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("../../assets/images/logo/bag-2.png")}
                  style={styles.emojiSmall}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>En attente</Text>
                <Text style={styles.cardValue}>{pendingOrders}</Text>
              </View>
            </View>

            {/* En préparation */}
            <View style={[styles.card, styles.cardOrange, styles.smallCard]}>
              <View style={styles.cardIcon}>
                <Image
                  source={require("../../assets/images/logo/cooking-pot.png")}
                  style={styles.emojiSmall}
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>En préparation</Text>
                <Text style={styles.cardValue}>{inPreparation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Prêtes à servir */}
        <View style={[styles.card, styles.cardGreen, { marginTop: 12 }]}>
          <View style={styles.cardIcon}>
            <Image
              source={require("../../assets/images/logo/food-tray.png.png")}
              style={styles.emoji}
            />
          </View>
          <View>
            <Text style={styles.cardLabel}>Prêtes à servir</Text>
            <Text style={styles.cardValue}>
              {readyOrders} commande{readyOrders > 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accès rapide</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/orders")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FFF4E5" }]}>
            <Ionicons name="receipt-outline" size={32} color="#FF9500" />
          </View>
          <Text style={styles.quickTitle}>Commandes</Text>
          <Text style={styles.quickSubtitle}>Voir toutes les commandes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/menu")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F9FF" }]}>
            <Ionicons name="restaurant-outline" size={32} color="#00A8E8" />
          </View>
          <Text style={styles.quickTitle}>Menu</Text>
          <Text style={styles.quickSubtitle}>Gérer les plats & catégories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/kitchen")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5FFE7" }]}>
            <Ionicons name="flame-outline" size={32} color="#00C851" />
          </View>
          <Text style={styles.quickTitle}>Cuisine</Text>
          <Text style={styles.quickSubtitle}>Écran de préparation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/tables")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#F0E5FF" }]}>
            <Ionicons name="grid-outline" size={32} color="#7C3AED" />
          </View>
          <Text style={styles.quickTitle}>Tables</Text>
          <Text style={styles.quickSubtitle}>Plan de salle & QR codes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/opening-hours")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#FFF0F4" }]}>
            <Ionicons name="time-outline" size={32} color="#EC4899" />
          </View>
          <Text style={styles.quickTitle}>Horaires</Text>
          <Text style={styles.quickSubtitle}>Ouverture & fermeture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(restaurants)/stats")}
        >
          <View style={[styles.quickIcon, { backgroundColor: "#E5F3FF" }]}>
            <Ionicons name="bar-chart-outline" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.quickTitle}>Statistiques</Text>
          <Text style={styles.quickSubtitle}>Plats populaires, CA, etc.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.fullLoading}>
          <ActivityIndicator size="large" color="#00C851" />
          <Text style={styles.fullLoadingText}>
            Chargement du restaurant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* 🚨 SECTION IMPORTANTE — HEADER DYNAMIQUE 🚨 */}
      {/* Ce bloc gère l’affichage du header selon l’état de l’application.
    👉 Si tu modifies une logique globale, vérifie impérativement ici.
    👉 Ce header peut changer en fonction de la page, de l'utilisateur ou du contexte.
*/}
      {renderHeader()}
      {/* 🚨 FIN DE LA SECTION HEADER DYNAMIQUE 🚨 */}

      <ScrollView
        showsVerticalScrollIndicator={false}
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
            {renderOverview()}
            {renderQuickActions()}
          </>
        ) : (
          <View style={styles.noBusiness}>
            <Ionicons name="restaurant-outline" size={90} color="#E0E0E0" />
            <Text style={styles.noBusinessTitle}>
              Aucun restaurant sélectionné
            </Text>
            <Text style={styles.noBusinessText}>
              Sélectionnez ou créez un restaurant pour commencer
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingBottom: 60 },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: { padding: 8, position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  avatarContainer: {
    borderRadius: 20,
    overflow: "hidden",
    width: 40,
    height: 40,
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  section: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },

  cardsRow: { flexDirection: "row", gap: 12 },
  rightColumn: { flex: 1, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
  },
  smallCard: { minHeight: 90 },
  cardYellow: { borderColor: "#FACC15", backgroundColor: "#FFFBEB" },
  cardPurple: { borderColor: "#8B5CF6", backgroundColor: "#F3E8FF" },
  cardOrange: { borderColor: "#FB923C", backgroundColor: "#FFF7ED" },
  cardGreen: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  cardIcon: { marginRight: 12 },
  emoji: { width: 44, height: 44 },
  emojiSmall: { width: 28, height: 28 },
  cardLabel: { fontSize: 13, color: "#666" },
  cardValue: { fontSize: 20, fontWeight: "700", color: "#000" },
  unit: { fontSize: 14, color: "#666", fontWeight: "500" },

  quickRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minHeight: 130,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  quickSubtitle: { fontSize: 12, color: "#888", textAlign: "center" },

  noBusiness: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noBusinessTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  noBusinessText: { fontSize: 14, color: "#888", textAlign: "center" },

  loadingContainer: { alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 12, color: "#888" },
  fullLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  fullLoadingText: { marginTop: 16, fontSize: 16, color: "#666" },
});

export default RestaurantHome;
