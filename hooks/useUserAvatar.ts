// src/hooks/useUserAvatar.ts
import { useUserStore } from "@/store/userStore";

// hooks/useUserAvatar.ts
export const useUserAvatar = () => {
  const user = useUserStore((s) => s.userProfile);
  const version = useUserStore((s) => s._avatarVersion);

  if (!user?.profileImageUrl) {
    return { uri: null };
  }

  // Ajoute un timestamp pour forcer le refresh même si l'URL est la même
  return {
    uri: `${user.profileImageUrl}?v=${version}`,
  };
};
