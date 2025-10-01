// src/types/payment.types.ts

/**
 * Méthodes de paiement disponibles
 */
export enum PaymentMethod {
    STRIPE = "STRIPE",
    PAYPAL = "PAYPAL",
    CASH = "CASH",
  }
  
  /**
   * Statuts de paiement
   */
  export enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
  }
  
  /**
   * Types de commande
   */
  export enum OrderType {
    SALE = "SALE",
    RESERVATION = "RESERVATION",
  }
  
  /**
   * Statuts de commande
   */
  export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
  }
  
  /**
   * Request: Créer une intention de paiement
   */
  export interface CreatePaymentIntentRequest {
    method: PaymentMethod;
    paymentMethodId: string;
    metadata?: Record<string, any>;
  }
  
  /**
   * Response: Intention de paiement créée
   */
  export interface PaymentIntentResponse {
    clientSecret: string;
    redirectUrl?: string;
    transactionId: string;
    status: PaymentStatus;
  }
  
  /**
   * Request: Initier un remboursement
   */
  export interface RefundRequest {
    amount: number;
  }
  
  /**
   * Détails d'une entreprise
   */
  export interface Business {
    id: string;
    name: string;
  }
  
  /**
   * Détails d'un client
   */
  export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  }
  
  /**
   * Ligne de commande
   */
  export interface OrderLine {
    id: string;
    quantity: number;
    price: number;
    variantId: string;
    variant: Record<string, any>;
  }
  
  /**
   * Response: Détails de la commande
   */
  export interface OrderResponse {
    id: string;
    orderNumber: string;
    type: OrderType;
    status: OrderStatus;
    totalAmount: number;
    notes?: string;
    paymentMethod?: PaymentMethod;
    paymentIntentId?: string;
    transactionId?: string;
    tableId?: string;
    reservationDate?: string;
    createdAt: string;
    business: Business;
    customer: Customer;
    lines: OrderLine[];
  }
  
  /**
   * Erreur API personnalisée
   */
  export interface ApiError {
    message: string;
    statusCode: number;
    details?: any;
  }