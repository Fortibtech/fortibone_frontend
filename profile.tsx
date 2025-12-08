// app/(restaurants)/profile.tsx  ou  app/profile/[businessId].tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#00af66" />

      <ScrollView style={styles.container}>
        {/* Header Gradient */}
        <LinearGradient colors={["#00af66", "#10b981"]} style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="restaurant" size={80} color="white" />
          </View>
          <Text style={styles.title}>Mon Restaurant</Text>
          <Text style={styles.subtitle}>ID: {businessId || "N/A"}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Infos Restaurant */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Infos Restaurant</Text>

            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="business" size={24} color="#00af66" />
              </View>
              <View>
                <Text style={styles.label}>Nom</Text>
                <Text style={styles.value}>Le Gourmet Parisien</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="location" size={24} color="#00af66" />
              </View>
              <View>
                <Text style={styles.label}>Adresse</Text>
                <Text style={styles.value}>123 Rue de Rivoli, 75001 Paris</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="call" size={24} color="#00af66" />
              </View>
              <Text style={styles.value}>+33 1 23 45 67 89</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name="mail" size={24} color="#00af66" />
              </View>
              <Text style={styles.value}>contact@gourmetparisien.fr</Text>
            </View>
          </View>

          {/* Statistiques */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Statistiques</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>120</Text>
                <Text style={styles.statLabel}>Commandes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>35</Text>
                <Text style={styles.statLabel}>Avis clients</Text>
              </View>
            </View>
          </View>

          {/* Réseaux sociaux */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Réseaux sociaux</Text>

            <TouchableOpacity
              style={styles.socialRow}
              onPress={() => Linking.openURL("https://facebook.com")}
            >
              <Ionicons name="logo-facebook" size={32} color="#1877F2" />
              <Text style={styles.socialText}>@gourmetparisien</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialRow}
              onPress={() => Linking.openURL("https://instagram.com")}
            >
              <Ionicons name="logo-instagram" size={32} color="#E1306C" />
              <Text style={styles.socialText}>@gourmet.paris</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton Déconnexion */}
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 24,
    borderRadius: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#d1fae5",
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconWrapper: {
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 50,
    marginRight: 16,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#00af66",
  },
  statLabel: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 4,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  socialText: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  logoutText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
