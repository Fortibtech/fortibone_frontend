// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import {
  CircleDollarSign,
  CreditCard,
  Cuboid,
  Home,
  Send,
  ShoppingCart, // ← Icône pour les achats
} from "lucide-react-native";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          paddingBottom: 28,
          paddingTop: 12,
          height: 90,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
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
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "Catalogue",
          tabBarIcon: ({ color, size }) => <Cuboid size={size} color={color} />,
        }}
      />
      {/* Nouvel onglet Achats */}
      <Tabs.Screen
        name="achats"
        options={{
          title: "Achats",
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="commande"
        options={{
          title: "Ventes",
          tabBarIcon: ({ color, size }) => (
            <CircleDollarSign size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventaire"
        options={{
          title: "Inventaire",
          tabBarIcon: ({ color, size }) => <Send size={size} color={color} />,
        }}
      />

      {/* Onglet Finance (conservé) */}
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color, size }) => (
            <CreditCard size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
