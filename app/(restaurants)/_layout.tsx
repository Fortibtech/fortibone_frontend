import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { Home, UtensilsCrossed, Coffee } from "lucide-react-native";

export default function RestaurantsLayout() {
  const insets = useSafeAreaInsets();
  const baseTabBarHeight = Platform.OS === "ios" ? 68 : 60;
  const bottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, 16)
      : Math.max(insets.bottom, 8);
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
        name="tables"
        options={{
          title: "Tables",
          tabBarIcon: ({ color }) => <Coffee size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="menus"
        options={{
          title: "Menus",
          tabBarIcon: ({ color }) => (
            <UtensilsCrossed size={24} color={color} />
          ),
        }}
      />
      {/* 
      <Tabs.Screen
        name="tables-menus"
        options={{
          title: "Tables & Menus",
          tabBarIcon: ({ color }) => (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Coffee size={18} color={color} />
              <UtensilsCrossed
                size={18}
                color={color}
                style={{ marginLeft: 2 }}
              />
            </View>
          ),
        }}
      />
      */}
    </Tabs>
  );
}
