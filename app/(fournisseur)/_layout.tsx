import { router, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CircleDollarSign,
  CreditCard,
  Home,
  ShoppingBasket,
} from "lucide-react-native";
import { Platform } from "react-native";
import { SelectedBusinessManager } from "@/api/selectedBusinessManager";
import { BusinessesService } from "@/api/services/businessesService";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  // Hauteur fixe confortable sur les deux plateformes
  const TAB_BAR_HEIGHT = 62;
  const ICON_SIZE = 26;

  // Padding bottom dynamique (très important sur Android gestuel)
  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 20) // iPhone X+ → espace pour le home indicator
      : Math.max(insets.bottom + 8, 16); // Android → au-dessus de la barre gestuelle

  const totalHeight = TAB_BAR_HEIGHT + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00C851",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarShowLabel: true,

        // LA CLÉ : style parfait sur iOS + Android
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

        tabBarIconStyle: {
          marginBottom: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 6,
        },
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

      <Tabs.Screen
        name="commandes"
        options={{
          title: "Commandes",
          tabBarIcon: ({ color }) => (
            <CircleDollarSign size={ICON_SIZE} color={color} />
          ),
        }}
        listeners={{
          tabPress: async (e) => {
            e.preventDefault();
            const selected =
              await SelectedBusinessManager.getSelectedBusiness();
            if (selected) {
              await BusinessesService.selectBusiness(selected);
              router.push(`/(orders)/details/${selected.id}`);
            } else {
              router.push("/(professionnel)");
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
