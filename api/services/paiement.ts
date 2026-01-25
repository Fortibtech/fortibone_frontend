// src/services/payment.service.ts
import { OrderResponse } from "@/types/orders";
import axiosInstance from "../axiosInstance";
import type {
  ApiError,
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  RefundRequest,
} from "../types/payment";

/**
 * Service de gestion des paiements
 */
class PaymentService {
  /**
   * Crée une intention de paiement avec le fournisseur spécifié
   * 
   * @param orderId - ID de la commande
   * @param paymentData - Données de paiement (méthode, paymentMethodId, metadata)
   * @returns Promise<PaymentIntentResponse> - Intention de paiement créée
   * @throws ApiError si la commande n'est pas trouvée ou non éligible
   */
  async createPaymentIntent(
    orderId: string,
    paymentData: CreatePaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    try {
      const response = await axiosInstance.post<PaymentIntentResponse>(
        `/orders/${orderId}/pay`,
        paymentData
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur lors de la création de l'intention de paiement:", error);

      if (error.response) {
        // Erreurs du serveur (400, 403, 500, etc.)
        const apiError: ApiError = {
          message: error.response.data?.message || "Erreur lors du paiement",
          statusCode: error.response.status,
          details: error.response.data,
        };

        switch (error.response.status) {
          case 400:
            throw new Error(
              "Commande non trouvée, non éligible au paiement, ou méthode de paiement non configurée"
            );
          case 403:
            throw new Error("Accès interdit. Vous n'avez pas les permissions nécessaires");
          default:
            throw new Error(apiError.message);
        }
      } else if (error.request) {
        // Erreur réseau
        throw new Error("Erreur de connexion. Vérifiez votre connexion internet");
      } else {
        // Autre erreur
        throw new Error(error.message || "Une erreur inattendue s'est produite");
      }
    }
  }

  /**
   * Initie un remboursement pour une commande
   * Nécessite des privilèges Admin ou Propriétaire
   * 
   * @param orderId - ID de la commande
   * @param refundData - Données du remboursement (montant)
   * @returns Promise<OrderResponse> - Commande mise à jour après remboursement
   * @throws ApiError si la commande n'est pas éligible ou accès interdit
   */
  async refundOrder(
    orderId: string,
    refundData: RefundRequest
  ): Promise<OrderResponse> {
    try {
      const response = await axiosInstance.post<OrderResponse>(
        `/orders/${orderId}/refund`,
        refundData
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur lors du remboursement:", error);

      if (error.response) {
        const apiError: ApiError = {
          message: error.response.data?.message || "Erreur lors du remboursement",
          statusCode: error.response.status,
          details: error.response.data,
        };

        switch (error.response.status) {
          case 400:
            throw new Error(
              "Commande non éligible au remboursement. Vérifiez le statut de la commande"
            );
          case 403:
            throw new Error(
              "Accès interdit. Seuls les administrateurs et propriétaires peuvent effectuer des remboursements"
            );
          default:
            throw new Error(apiError.message);
        }
      } else if (error.request) {
        throw new Error("Erreur de connexion. Vérifiez votre connexion internet");
      } else {
        throw new Error(error.message || "Une erreur inattendue s'est produite");
      }
    }
  }

}

const paymentService = new PaymentService();
export default paymentService;