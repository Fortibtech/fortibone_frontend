// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CircleDollarSign,
  CreditCard,
  Cuboid,
  Home,
} from "lucide-react-native";
import { Platform } from "react-native";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  // Hauteur de base de la tab bar
  const baseTabBarHeight = Platform.OS === "ios" ? 72 : 58;

  // Padding bottom dynamique - utilise les insets sur toutes les plateformes
  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 12)
      : Math.max(insets.bottom, 8); // Prend en compte la navigation Android

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
          paddingBottom: bottomPadding, // S'adapte à la navigation système
          paddingTop: 12,
          paddingHorizontal: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 10, // Augmenté pour Android
          // Force le positionnement au-dessus de la navigation système
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: "#00C851",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
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
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "Catalogue",
          tabBarIcon: ({ color }) => <Cuboid size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="commandes"
        options={{
          title: "Commandes",
          tabBarIcon: ({ color }) => (
            <CircleDollarSign size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: "Finances",
          tabBarIcon: ({ color }) => <CreditCard size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
