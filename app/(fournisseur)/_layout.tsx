// app/(fournisseur)/_layout.tsx

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CircleDollarSign,
  CreditCard,
  Home,
  ShoppingBasket,
} from "lucide-react-native";
import { Platform } from "react-native";

// Zustand → on lit le business actuel directement
import { useBusinessStore } from "@/store/businessStore";
import { router, Tabs } from "expo-router";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 62;
  const ICON_SIZE = 26;

  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 20)
      : Math.max(insets.bottom + 8, 16);

  const totalHeight = TAB_BAR_HEIGHT + bottomPadding;

  // Business actuel depuis le store (toujours à jour)
  const business = useBusinessStore((state) => state.business);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00C851",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: totalHeight,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          paddingHorizontal: 20,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} />,
        }}
      />

      <Tabs.Screen
        name="catalogue"
        options={{
          title: "Produits",
          tabBarIcon: ({ color }) => (
            <ShoppingBasket size={ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* COMMANDES */}
      <Tabs.Screen
        name="commandes"
        options={{
          title: "Commandes",
          tabBarIcon: ({ color }) => (
            <CircleDollarSign size={ICON_SIZE} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();

            if (business) {
              const userType = "fournisseur";
              router.replace(`/(orders)/details/${business.id}/(${userType})`);
            } else {
              // Pas d'entreprise sélectionnée → on redirige vers l'accueil général
              router.replace("/(tabs)");
            }
          },
        }}
      />

      <Tabs.Screen
        name="finances"
        options={{
          title: "Finances",
          tabBarIcon: ({ color }) => (
            <CreditCard size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
