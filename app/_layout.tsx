import { useUserStore } from "@/store/userStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// import { StripeProvider } from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform } from "react-native";
import Toast from "react-native-toast-message";

// ⚡ Import Stripe uniquement si on est sur mobile
let StripeProvider: any;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  StripeProvider = require("@stripe/stripe-react-native").StripeProvider;
} else {
  // Mock pour le web (évite les erreurs)
  // eslint-disable-next-line react/display-name
  StripeProvider = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
}

export default function RootLayout() {
  const { hydrateTokenAndProfile } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      await hydrateTokenAndProfile();
      setLoading(false);
    };
    hydrate();
  }, [hydrateTokenAndProfile]);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }

  return (
    <StripeProvider
      publishableKey="pk_test_51PBf5wRqgxgrSOxzkT3CoAj3wnYQKPSKxZLmtaH9lt8XXO8NoIknakl1nMxj14Mj25f3VC56dchbm7E4ATNXco2200dXM6svtP"
      urlScheme="your-app-scheme"
      merchantIdentifier="merchant.com.your-app"
    >
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(analytics)" />
        <Stack.Screen name="(opening-hours)" />
        <Stack.Screen name="(business-details)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(inventory)" />
        <Stack.Screen name="(orders)" />
        <Stack.Screen name="(restaurants)" />
        <Stack.Screen name="(transactions)" />
        <Stack.Screen name="(professionnel)" options={{ headerShown: false }} />
        <Stack.Screen name="(fournisseur)" options={{ headerShown: false }} />
        <Stack.Screen name="product-details/[id]" />
        <Stack.Screen name="(profile-particulier)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="index" />
      </Stack>

        <StatusBar style="auto" />
        <Toast />
      </StripeProvider>
  
  );
}
