import { Business, BusinessesService } from "@/api";
import BackButtonAdmin from "@/components/Admin/BackButton";
import List from "@/components/Admin/List";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
// TODO: À l'avenir, remplace ce fallback par <Ionicons /> réel si tu importes le pack complet
const IconFallback = ({ name, size = 20, color = "#666" }: any) => {
  const map: any = {
    mail: "✉",
    call: "☎",
    location: "📍",
    link: "🔗",
    facebook: "f",
    shield: "✓",
    star: "★",
  };
  return <Text style={{ fontSize: size, color }}>{map[name] || "•"}</Text>;
};

const StoreProfileScreen: React.FC = () => {
  const { bussinessId } = useLocalSearchParams<{ bussinessId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBusiness = useCallback(async () => {
    if (!bussinessId) return;
    try {
      setLoading(true);
      const data = await BusinessesService.getBusinessById(bussinessId);
      setBusiness(data);
    } catch (error: any) {
      console.error("Erreur chargement business:", error);
      alert("Impossible de charger les infos de l'entreprise");
    } finally {
      setLoading(false);
    }
  }, [bussinessId]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  // ─── CHARGEMENT ───
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButtonAdmin />
          <List />
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── ERREUR / PAS DE DONNÉES ───
  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", padding: 40, color: "#999" }}>
          Entreprise non trouvée
        </Text>
      </SafeAreaView>
    );
  }

  // ─── FONCTIONS D'ACTION ───
  const openMail = () =>
    Linking.openURL(
      `mailto:${
        business.owner.email ||
        "contact@" + business.name.replace(/\s/g, "").toLowerCase() + ".com"
      }`
    );
  const openPhone = () =>
    business.phoneNumber && Linking.openURL(`tel:${business.phoneNumber}`);
  const openWebsite = () =>
    business.websiteUrl && Linking.openURL(business.websiteUrl);
  const openFacebook = () => Linking.openURL("https://facebook.com"); // TODO: ajouter champ facebook dans le futur

  // ─── RENDER PRINCIPAL ───
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER FIXE */}
      <View style={styles.header}>
        <BackButtonAdmin />
        <List />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* === COVER + LOGO === */}
        {business.coverImageUrl && (
          <Image
            source={{ uri: business.coverImageUrl }}
            style={styles.cover}
          />
        )}

        <View style={styles.profileHeader}>
          <View style={styles.logoContainer}>
            {business.logoUrl ? (
              <Image
                source={{ uri: business.logoUrl }}
                style={styles.logo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>{business.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{business.name}</Text>

            <View style={styles.badges}>
              {business.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#4A90E2" />
                  <Text style={styles.badgeText}>Vérifiée</Text>
                </View>
              )}
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.badgeText}>
                  {business.averageRating > 0
                    ? business.averageRating.toFixed(1)
                    : "N/A"}{" "}
                  ({business.reviewCount})
                </Text>
              </View>
            </View>

            {business.description && (
              <Text style={styles.description}>{business.description}</Text>
            )}

            <Text style={styles.owner}>
              Gérant : {business.owner.firstName} {business.owner.lastName}
            </Text>
          </View>
        </View>

        {/* === CONTACT RAPIDE === */}
        <View style={styles.contactSection}>
          {/* EMAIL (on utilise un fallback si pas d'email propriétaire) */}
          <TouchableOpacity style={styles.contactRow} onPress={openMail}>
            <IconFallback name="mail" size={18} />
            <Text style={styles.contactText}>Contacter par email</Text>
          </TouchableOpacity>

          {/* TÉLÉPHONE */}
          {business.phoneNumber ? (
            <TouchableOpacity style={styles.contactRow} onPress={openPhone}>
              <IconFallback name="call" size={18} />
              <Text style={styles.contactText}>{business.phoneNumber}</Text>
            </TouchableOpacity>
          ) : null}

          {/* ADRESSE */}
          {business.address && (
            <View style={styles.contactRow}>
              <IconFallback name="location" size={18} />
              <Text style={styles.contactText}>{business.address}</Text>
            </View>
          )}
        </View>

        {/* === SITE WEB === */}
        {business.websiteUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Site web</Text>
            <TouchableOpacity style={styles.linkRow} onPress={openWebsite}>
              <IconFallback name="link" size={18} color="#4A90E2" />
              <Text style={styles.linkText}>{business.websiteUrl}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === RÉSEAUX SOCIAUX (exemple Facebook) === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
          <TouchableOpacity style={styles.socialRow} onPress={openFacebook}>
            <View style={styles.fbIcon}>
              <IconFallback name="facebook" size={16} color="#fff" />
            </View>
            <Text style={styles.socialText}>Suivre sur Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* === DÉTAILS COMPLÉMENTAIRES (statiques pour l'instant) === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations légales</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{business.type || "Fournisseur"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Commerce</Text>
            <Text style={styles.value}>
              {business.commerceType === "PHYSICAL" ? "Physique" : "En ligne"}
            </Text>
          </View>
          {business.siret && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>SIRET</Text>
              <Text style={styles.value}>{business.siret}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Créée le</Text>
            <Text style={styles.value}>
              {new Date(business.createdAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        </View>

        {/* === ESPACE FINAL === */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cover: { width: "100%", height: 180 },
  profileHeader: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    marginTop: -50, // superposition sur la cover
  },
  logoContainer: { marginRight: 16 },
  logo: { width: 80, height: 80, borderRadius: 16 },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 8 },
  badges: { flexDirection: "row", gap: 10, marginBottom: 8 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 12, marginLeft: 4, fontWeight: "600" },
  description: { fontSize: 14, color: "#555", lineHeight: 20, marginBottom: 8 },
  owner: { fontSize: 13, color: "#888" },

  contactSection: {
    backgroundColor: "#fff",
    padding: 20,
    gap: 16,
    marginTop: 12,
  },
  contactRow: { flexDirection: "row", alignItems: "center" },
  contactText: { marginLeft: 12, fontSize: 15, color: "#333" },

  section: { backgroundColor: "#fff", padding: 20, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  linkRow: { flexDirection: "row", alignItems: "center" },
  linkText: { marginLeft: 10, color: "#4A90E2", fontSize: 15 },

  socialRow: { flexDirection: "row", alignItems: "center" },
  fbIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1877F2",
    justifyContent: "center",
    alignItems: "center",
  },
  socialText: { marginLeft: 12, fontSize: 15, fontWeight: "500" },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, color: "#000", fontWeight: "500" },
});

export default StoreProfileScreen;
