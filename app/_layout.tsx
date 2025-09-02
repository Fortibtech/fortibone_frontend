// app/_layout.tsx ou app/(tabs)/_layout.tsx
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useUserStore } from "@/store/userStore";

export default function RootLayout() {
  const { hydrateTokenAndProfile } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      await hydrateTokenAndProfile(); // Hydrate token + profil
      setLoading(false);
    };
    hydrate();
  }, []);

  if (loading) {
    return null; // 🔹 tu peux mettre un loader ici si tu veux
  }

  return (

    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(professionnel)" options={{ headerShown: false }} />
      <Stack.Screen name="pro/createBusiness" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
      <Stack.Screen 
        name="enterprise-details" 

    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pro" />
      <Stack.Screen
        name="enterprise-details"
        options={{
          title: "Détails de l'entreprise",
          headerShown: false,
        }}
      />
      <Stack.Screen name="product-details/[id]" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(profile-particulier)" />
      <Stack.Screen name="(details-products)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
