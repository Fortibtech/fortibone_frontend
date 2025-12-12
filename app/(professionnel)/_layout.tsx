import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CircleDollarSign,
  CreditCard,
  Cuboid,
  Home,
  Send,
  ShoppingCart,
} from "lucide-react-native";
import { Platform } from "react-native";

// Zustand → on prend le business directement depuis le store
import { useBusinessStore } from "@/store/businessStore";
import { router, Tabs } from "expo-router";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  // Hauteur de la tab bar proprement calculée
  const baseTabBarHeight = Platform.OS === "ios" ? 68 : 60;
  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 16)
      : Math.max(insets.bottom, 8);
  const totalTabBarHeight = baseTabBarHeight + bottomPadding;

  // On récupère le business actuel depuis le store (toujours à jour)
  const business = useBusinessStore((state) => state.business);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#00C851",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          height: totalTabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          paddingHorizontal: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: { marginBottom: 2 },
        tabBarItemStyle: { paddingVertical: 4 },
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
        name="produits"
        options={{
          title: "Produits",
          tabBarIcon: ({ color }) => <Cuboid size={24} color={color} />,
        }}
      />

      {/* ACHATS */}
      <Tabs.Screen
        name="achats"
        options={{
          title: "Achats",
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            if (business) {
              router.replace(`/(achats)/${business.id}`);
            } else {
              router.replace("/(professionnel)");
            }
          },
        }}
      />

      {/* COMMANDES / VENTES */}
      <Tabs.Screen
        name="commande"
        options={{
          title: "Ventes",
          tabBarIcon: ({ color }) => (
            <CircleDollarSign size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            if (business) {
              router.replace(`/(orders)/details/${business.id}`);
            } else {
              router.replace("/(professionnel)");
            }
          },
        }}
      />

      {/* INVENTAIRE */}
      <Tabs.Screen
        name="inventaire"
        options={{
          title: "Inventaire",
          tabBarIcon: ({ color }) => <Send size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            if (business) {
              router.replace(`/(inventory)/details/${business.id}`);
            } else {
              router.replace("/(professionnel)");
            }
          },
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color }) => <CreditCard size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
