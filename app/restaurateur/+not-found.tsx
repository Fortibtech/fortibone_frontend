import { Text, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NotFound() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f8f9fa",
      }}
    >
      <Ionicons name="restaurant-outline" size={64} color="#00af66" />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          marginVertical: 16,
          color: "#333",
        }}
      >
        Page Not Found
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#666",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        This restaurant screen does not exist.
      </Text>
      <Link
        href="/(restaurants)/restaurateur/dashboard"
        style={{
          padding: 16,
          backgroundColor: "#00af66",
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Go to Dashboard
        </Text>
      </Link>
    </View>
  );
}
