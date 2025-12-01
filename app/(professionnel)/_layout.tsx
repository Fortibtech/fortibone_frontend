import { router, Tabs } from "expo-router";
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
import { SelectedBusinessManager } from "@/api/selectedBusinessManager";
import { BusinessesService } from "@/api/services/businessesService";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  // Hauteur de base de la tab bar
  const baseTabBarHeight = Platform.OS === "ios" ? 68 : 60;

  // Padding bottom dynamique selon la plateforme et les insets
  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 16)
      : Math.max(insets.bottom, 8); // Utilise insets.bottom sur Android aussi

  // Hauteur totale de la tab bar
  const totalTabBarHeight = baseTabBarHeight + bottomPadding;

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
          paddingBottom: bottomPadding, // S'adapte dynamiquement
          paddingTop: 8,
          paddingHorizontal: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
          // Force la position au-dessus de la navigation système
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
        name="produits"
        options={{
          title: "Produits",
          tabBarIcon: ({ color }) => <Cuboid size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achats"
        options={{
          title: "Achats",
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
        }}
        listeners={{
          tabPress: async (e) => {
            e.preventDefault();

            try {
              const selected =
                await SelectedBusinessManager.getSelectedBusiness();
              console.log("Selected business →", selected);

              if (selected) {
                await BusinessesService.selectBusiness(selected);

                console.log("Navigating to →", `/(achats)/${selected.id}`);
                router.push(`/(achats)/${selected.id}`);
              } else {
                console.log("Navigating to → /(professionnel)");
                router.push("/(professionnel)");
              }
            } catch (err) {
              console.error("Erreur tabPress →", err);
            }
          },
        }}
      />
      <Tabs.Screen
        name="commande"
        options={{
          title: "Ventes",
          tabBarIcon: ({ color }) => (
            <CircleDollarSign size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: async (e) => {
            e.preventDefault();

            try {
              const selected =
                await SelectedBusinessManager.getSelectedBusiness();
              console.log("Selected business →", selected);

              if (selected) {
                await BusinessesService.selectBusiness(selected);

                console.log(
                  "Navigating to →",
                  `/(orders)/details/${selected.id}`
                );
                router.push(`/(orders)/details/${selected.id}`);
              } else {
                console.log("Navigating to → /(professionnel)");
                router.push("/(professionnel)");
              }
            } catch (err) {
              console.error("Erreur tabPress →", err);
            }
          },
        }}
      />
      <Tabs.Screen
        name="inventaire"
        options={{
          title: "Inventaire",
          tabBarIcon: ({ color }) => <Send size={24} color={color} />,
        }}
        listeners={{
          tabPress: async (e) => {
            e.preventDefault();
            const selected =
              await SelectedBusinessManager.getSelectedBusiness();
            if (selected) {
              await BusinessesService.selectBusiness(selected);
              router.push(`/(inventory)/details/${selected.id}`);
            } else {
              router.push("/(professionnel)");
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
