// app/_layout.tsx ou app/(profile)/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="about" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="pay/[orderId]" />
      <Stack.Screen name="help" />
      <Stack.Screen name="category" />
      <Stack.Screen name="custumer-order-details/[id]" />
      <Stack.Screen name="category/[id]" />
      <Stack.Screen name="order-details/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="security" />
      <Stack.Screen name="user-businesses" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="my-transactions" />
      <Stack.Screen name="your-orders" />
    </Stack>
  );
}
