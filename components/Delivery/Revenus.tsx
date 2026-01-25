// app/(delivery)/earnings.tsx
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  businessId: string | null;
}

const Revenus = ({ businessId }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <MaterialIcons name="construction" size={80} color="#F59E0B" />
        <Text style={styles.title}>Page en cours de conception</Text>
        <Text style={styles.subtitle}>
          Cette section des revenus est actuellement en développement.
          {"\n"}
          Elle sera bientôt disponible avec toutes les statistiques et
          graphiques détaillés.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default Revenus;
