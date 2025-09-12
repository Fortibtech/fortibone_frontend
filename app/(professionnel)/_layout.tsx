// app/(tabs)/_layout.tsx
// import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BookOpen, Home, Send, ShoppingCart } from "lucide-react-native";



export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          paddingBottom: 28,
          paddingTop: 12,
          height: 90,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
        tabBarActiveTintColor: '#00C851',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: 'Catalogue',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="commande"
        options={{
          title: 'Commande',
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} fill={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventaire"
        options={{
          title: 'Inventaire',
          tabBarIcon: ({ color, size }) => (
            <Send size={size} color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
};

