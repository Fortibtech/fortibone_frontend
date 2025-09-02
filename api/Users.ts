// src/api/Users.ts
import axiosInstance from "./axiosInstance";
export interface UserBusiness {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

// ✅ Définition du type du payload qu’on envoie
export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string;
  dateOfBirth: string; // format "YYYY-MM-DD"
  country: string;
  city: string;
  gender: "MALE" | "FEMALE";
}

// ✅ Définition du type de la réponse
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  profileType: string;
  isEmailVerified: boolean;
  lastOtpSentAt: string | null;
  passwordResetToken: string | null;
  passwordResetTokenExpiresAt: string | null;
  dateOfBirth: string;
  country: string;
  city: string;
  gender: "MALE" | "FEMALE";
}
// ✅ Mettre à jour le profil
// ✅ Fonction d’update
export const updateUserProfile = async (
  payload: UpdateUserPayload
): Promise<{ data: UserResponse; status: number }> => {
  try {
    const response = await axiosInstance.put<UserResponse>(
      "/users/me",
      payload
    );
    console.log("✅ User mis à jour :", response.data);

    return { data: response.data, status: response.status };
  } catch (error: any) {
    console.error(
      "❌ Erreur updateUserProfile :",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Erreur lors de la mise à jour du profil"
    );
  }
};
// ✅ Supprimer le compte
export const deleteUserAccount = async () => {
  try {
    const response = await axiosInstance.delete("/users/me");
    return response.data; // { message: "Le compte a été supprimé avec succès." }
  } catch (error: any) {
    console.error(
      "Erreur deleteUserAccount:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Impossible de supprimer le compte"
    );
  }
};
// src/api/Users.ts

/**
 * Upload ou met à jour la photo de profil de l'utilisateur connecté.
 * @param fileUri - URI locale de l'image (ex: venant de ImagePicker)
 * @returns URL de l'image uploadée côté serveur ou backend
 */
export const uploadUserAvatar = async (fileUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: "avatar.jpg", // tu peux adapter le nom
      type: "image/jpeg", // tu peux détecter le type si besoin
    } as any);

    const response = await axiosInstance.post("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Avatar uploadé :", response.data);
    // retourne l'URL finale de l'image depuis la réponse du serveur
    return response.data.profileImageUrl || "";
  } catch (error: any) {
    console.error(
      "❌ Erreur uploadUserAvatar :",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Impossible de téléverser l'image"
    );
  }
};
export const getUserBusinesses = async (): Promise<UserBusiness[]> => {
  try {
    const response = await axiosInstance.get<UserBusiness[]>(
      "/users/me/businesses"
    );
    console.log("✅ Entreprises de l'utilisateur :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getUserBusinesses :",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Impossible de récupérer les entreprises"
    );
  }
};
// Définir le type d'un favori (adapter selon ton backend)
export interface UserFavorite {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  // ajouter d'autres champs si nécessaire
}

// Réponse de l'API pour les favoris
export interface GetFavoritesResponse {
  data: UserFavorite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paramètres optionnels pour la récupération des favoris
export interface GetFavoritesParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

// Fonction pour récupérer les favoris avec filtres et pagination
export const getFavoris = async (
  params: GetFavoritesParams = {}
): Promise<GetFavoritesResponse> => {
  try {
    const { page = 1, limit = 10, search, categoryId } = params;

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) query.append("search", search);
    if (categoryId) query.append("categoryId", categoryId);

    const response = await axiosInstance.get<GetFavoritesResponse>(
      `/users/me/favorites?${query.toString()}`
    );

    console.log("✅ Favoris récupérés :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getFavoris :",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Impossible de récupérer les favoris"
    );
  }
};
