// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  // Hauteur de base de la tab bar
  const baseTabBarHeight = Platform.OS === "ios" ? 70 : 60;

  // Padding bottom dynamique - s'adapte à la navigation système
  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 16)
      : Math.max(insets.bottom, 10); // Prend en compte la navigation Android

  // Hauteur totale calculée dynamiquement
  const totalTabBarHeight = baseTabBarHeight + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          height: totalTabBarHeight,
          paddingBottom: bottomPadding, // S'adapte dynamiquement
          paddingTop: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 10, // Augmenté pour meilleure visibilité sur Android
          // Force le positionnement au-dessus de la navigation système
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: "#00C851",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="entreprise"
        options={{
          title: "Entreprise",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Restaurants",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" color={color} size={size} />
            // ou <Ionicons name="card-outline" color={color} size={size} />
            // ou <Ionicons name="cash-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
