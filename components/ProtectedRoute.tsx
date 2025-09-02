// components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { token, userProfile, hydrateTokenAndProfile } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🔑 Hydrate token + profil si nécessaire
        if (!token || !userProfile) {
          await hydrateTokenAndProfile();
        }

        const store = useUserStore.getState();

        // ⚠️ Redirection si non authentifié
        if (!store.token) {
          console.log("❌ Pas de token trouvé, redirection vers login");
          router.replace("/(auth)/login");
          return;
        }

        // ✅ Token + profil présents, log les infos
        console.log("🔑 Token actuel :", store.token);
        console.log("👤 Profil utilisateur :", store.userProfile);
      } catch (e) {
        console.error("Erreur ProtectedRoute:", e);
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  // ✅ Page protégée
  return <>{children}</>;
};

export default ProtectedRoute;
