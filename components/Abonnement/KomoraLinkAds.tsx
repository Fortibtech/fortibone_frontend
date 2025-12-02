import { View, Text, StyleSheet, StatusBar } from "react-native";
import { Star } from "lucide-react-native";

export default function KomoraLinkAds() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Icône étoile */}
        <View style={styles.iconContainer}>
          <Star size={60} color="#00C896" strokeWidth={2} />
        </View>
        {/* Titre */}
        <Text style={styles.title}>
          KomoraLink Ads : Boostez votre Visibilité
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Augmentez votre portée auprès des clients avec nos forfaits mensuels
          simples.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#00C896",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
