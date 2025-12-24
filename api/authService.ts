import { RegisterPayload, ResetPasswordPayload } from "@/types/auth";
import axiosInstance from "./axiosInstance";
import { cacheManager } from "./cache";

export const registerUser = async (data: RegisterPayload) => {
  try {
    const response = await axiosInstance.post("/auth/register", data);

    if (response.status === 201) {
      return {
        success: true,
        message: response.data?.message || "Inscription réussie.",
      };
    }

    throw new Error("Réponse inattendue du serveur.");
  } catch (error: any) {
    console.log("🔥 Erreur complète de l'API :", error.response || error);

    if (error.response?.status === 409) {
      throw new Error("Cet email est déjà utilisé.");
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Ici on log avant de renvoyer l'erreur
    throw new Error(
      `Une erreur est survenue lors de l'inscription. Status: ${
        error.response?.status || "unknown"
      }`
    );
  }
};

export const loginUser = async (email: string, password: string) => {
  try {

    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    console.log("🚀 ~ loginUser response status:", response);

    if (response.status === 201) {
      // ✅ NETTOYER LE CACHE APRÈS UNE CONNEXION RÉUSSIE
      await cacheManager.clearAll();
      console.log("✅ Cache vidé après connexion");
      
      return {
        success: true,
        token: response.data?.access_token,
      };
    }

    throw new Error("Réponse inattendue du serveur.");
  } catch (error: any) {
    // Cas email non vérifié
    if (
      error.response?.status === 401 &&
      error.response?.data?.message ===
        "Veuillez d'abord vérifier votre e-mail."
    ) {
      const err = new Error("EMAIL_NOT_VERIFIED");
      (err as any).originalMessage = error.response.data.message;
      throw err;
    }

    // Cas identifiants invalides
    if (error.response?.status === 401) {
      throw new Error("Identifiants invalides.");
    }

    // Autres messages d'erreur du backend
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Une erreur est survenue lors de la connexion.");
  }
};
export const resetPassword = async (data: ResetPasswordPayload) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", data);

    if (response.status === 201) {
      return {
        success: true,
        message:
          response.data?.message || "Mot de passe mis à jour avec succès.",
        status: response.status, // ex: 201
      };
    }

    throw new Error("Réponse inattendue du serveur.");
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error("Le code OTP est invalide ou expiré.");
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error(
      "Une erreur est survenue lors de la réinitialisation du mot de passe."
    );
  }
};
// ✅ Fonction pour envoyer un code OTP
export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });

    return {
      success: true,
      data: response.data, // ✅ contiendra le message de succès
      status: response.status, // ex: 201
    };
  } catch (error: any) {
    console.error(
      "❌ Erreur forgotPassword:",
      error.response?.data || error.message
    );

    return {
      success: false,
      error: error.response?.data || { message: "Une erreur est survenue." },
      status: error.response?.status || 500,
    };
  }
};
export const resendOtp = async (
  email: string,
  type: "PASSWORD_RESET" | "EMAIL_VERIFICATION"
) => {
  try {
    const response = await axiosInstance.post("/auth/resend-otp", {
      email,
      type,
    });

    return response.data; // { message: "..." }
  } catch (error: any) {
    console.error(
      "❌ Erreur lors du renvoi de l'OTP:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Erreur inconnue" };
  }
};
export const verifyEmail = async (email: string, otp: string) => {
  try {
    const response = await axiosInstance.post("/auth/verify-email", {
      email,
      otp,
    });

    return response.data; // { access_token: "..." }
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la vérification OTP:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Erreur inconnue" };
  }
};
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getProfile:",
      error.response?.data || error.message
    );
    throw error;
  }
};
