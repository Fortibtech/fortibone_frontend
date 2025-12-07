import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={["#00af66", "#10b981"]}
        className="p-8 items-center"
      >
        <Ionicons name="restaurant" size={80} color="white" />
        <Text className="text-white text-2xl font-bold mt-4">
          Mon Restaurant
        </Text>
        <Text className="text-green-100 text-lg">ID: {businessId}</Text>
      </LinearGradient>

      <View className="p-6 space-y-4">
        <View className="bg-white p-6 rounded-3xl shadow-lg">
          <Text className="text-xl font-bold mb-4">Infos Restaurant</Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons
                name="business"
                size={20}
                color="#00af66"
                className="mr-3"
              />
              <Text className="text-gray-700">Le Gourmet Parisien</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name="location"
                size={20}
                color="#00af66"
                className="mr-3"
              />
              <Text className="text-gray-700">Paris, France</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-red-500 p-4 rounded-3xl items-center"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-white font-bold text-lg">Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
