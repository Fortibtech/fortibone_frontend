// app/_layout.tsx ou app/(profile)/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="details/[businessId].tsx" />
    </Stack>
  );
}
