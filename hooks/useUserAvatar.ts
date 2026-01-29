// hooks/useUserAvatar.ts
import { useUserStore } from "@/store/userStore";

export const useUserAvatar = (): { uri: string | null } => {
  const user = useUserStore((s) => s.userProfile);
  const version = useUserStore((s) => s._avatarVersion);

  if (!user?.profileImageUrl || user.profileImageUrl.trim() === "") {
    return { uri: null };
  }

  const url = user.profileImageUrl.trim();
  const separator = url.includes("?") ? "&" : "?";
  return {
    uri: `${url}${separator}t=${version}`,
  };
};
