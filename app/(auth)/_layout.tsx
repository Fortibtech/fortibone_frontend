// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="LoginType" options={{ headerShown: false }} />
      <Stack.Screen name="NewPassword" options={{ headerShown: false }} />
      <Stack.Screen
        name="OtpVerifyResetPassword"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" options={{ headerShown: false }} />
      <Stack.Screen name="success-screen" options={{ headerShown: false }} />
      <Stack.Screen name="OtpScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
