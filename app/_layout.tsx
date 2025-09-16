// app/_layout.tsx
import { useUserStore } from "@/store/userStore";
import { STRIPE_PUBLISHABLE_KEY } from "@env";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const { hydrateTokenAndProfile } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      await hydrateTokenAndProfile();
      setLoading(false);
    };
    hydrate();
  }, []);

  if (loading) {
    return null; // 🔹 tu peux mettre un loader ici si tu veux
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="pro" />
          <Stack.Screen name="product" />
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
          <Stack.Screen
            name="(professionnel)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(inventory)" />
          <Stack.Screen name="(orders)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast />
      </>
    </StripeProvider>
  );
}
