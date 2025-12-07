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

  // Hauteur de la tab bar sans le padding système
  const TAB_BAR_HEIGHT = 58; // Hauteur "naturelle" des icônes + label
  const EXTRA_PADDING_TOP = 8;

  // Sur Android avec navigation gestuelle, on veut que la tab bar soit AU-DESSUS
  const androidBottomOffset = Platform.OS === "android" ? insets.bottom : 0;
  const totalHeight = TAB_BAR_HEIGHT + EXTRA_PADDING_TOP + androidBottomOffset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#00C851",
        tabBarInactiveTintColor: "#999",

        // LA CLÉ : style de la tab bar
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          height: totalHeight,
          paddingTop: EXTRA_PADDING_TOP,
          paddingBottom: androidBottomOffset + 8, // +8 pour un peu d'air en bas
          paddingHorizontal: 12,

          // Très important sur Android
          position: "absolute",
          left: 0,
          right: 0,
          bottom: androidBottomOffset > 10 ? 0 : undefined, // seulement si gesture nav

          // Ombre propre
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 12,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
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
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "Catalogue",
          tabBarIcon: ({ color }) => <ShoppingBasket size={24} color={color} />,
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
          tabBarIcon: ({ color }) => <CreditCard size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
