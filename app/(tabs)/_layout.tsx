// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Hauteur de base recommandée Material Design (icônes + label)
  const TAB_BAR_BASE_HEIGHT = 56;

  // Détection fiable de la barre de navigation Android classique (3 boutons)
  // Sur les appareils gestuels : insets.bottom ≈ 0–15
  // Sur les appareils avec barre de navigation visible : insets.bottom ≥ 34 (souvent 48)
  const hasLegacyNavBar = Platform.OS === "android" && insets.bottom >= 34;

  // Padding bottom intelligent
  const bottomPadding = hasLegacyNavBar
    ? insets.bottom // On laisse exactement l'espace de la barre système
    : Math.max(insets.bottom, 12); // Petite marge propre sur gestuel ou iOS

  const totalTabBarHeight = TAB_BAR_BASE_HEIGHT + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00C851",
        tabBarInactiveTintColor: "#999999",
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: totalTabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          paddingHorizontal: 10,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="entreprise"
        options={{
          title: "Entreprise",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="favorites"
        options={{
          title: "Restaurants",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
