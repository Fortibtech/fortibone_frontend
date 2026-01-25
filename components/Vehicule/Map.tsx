import { StyleSheet, View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
interface Props {
  businessId: string | null;
}
const Map = ({ businessId }: Props) => {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={80} color="#E0E0E0" />
        <Text style={styles.mapTitle}>Carte des zones de livraison</Text>
        <Text style={styles.mapSubtitle}>
          Bientôt disponible : visualisation des zones actives et de ta position
          en temps réel.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    marginTop: 24,
  },
  mapSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
});

export default Map;
