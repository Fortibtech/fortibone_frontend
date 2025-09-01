// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
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
        options={{
          title: 'Détails de l\'entreprise',
          // presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
