import { useUserLocationStore } from "@/stores/useUserLocationStore";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BackButtonAdmin from "@/components/Admin/BackButton";

const Map = () => {
  const { latitude, longitude, loading } = useUserLocationStore();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!latitude || !longitude) {
    return (
      <View style={styles.loader}>
        <Ionicons name="location-off-outline" size={40} color="#9ca3af" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* La carte en plein écran */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.marker}>
            <Ionicons name="person" size={26} color="#801d1dff" />
          </View>
        </Marker>
      </MapView>

      {/* Bouton de retour personnalisé avec image */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <BackButtonAdmin />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  marker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 6,
  },
  backButton: {
    position: "absolute",
    top: 50, // Ajuste si tu utilises SafeAreaView ou selon ta status bar
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10, // Au-dessus de la map
  },
  backIcon: {
    width: 28,
    height: 28,
  },
});

export default Map;
