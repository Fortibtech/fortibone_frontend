// ----------------------
// API Function
import {
  CreateOrderPayload,
  CreateOrderResponse,
  GetBusinessOrdersParams,
  MyOrdersResponse,
  OrderResponse,
  UpdateOrderStatusPayload,
} from "@/types/orders";
import axiosInstance from "./axiosInstance";

// ----------------------
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  try {
    const response = await axiosInstance.post<CreateOrderResponse>(
      "/orders",
      payload
    );
    console.log("✅ Order created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error creating order:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getMyOrders = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
  type?: "SALE" | "PURCHASE" | "RESERVATION";
}): Promise<MyOrdersResponse> => {
  try {
    const response = await axiosInstance.get<MyOrdersResponse>(
      "/orders/orders/my-orders",
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching my orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// ----------------------
// API: Get order by ID
// ----------------------
export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
  try {
    const { data } = await axiosInstance.get<OrderResponse>(
      `/orders/${orderId}`
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getOrderById:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// ----------------------
// API: Lister commandes d'une entreprise
// ----------------------
export const getBusinessOrders = async (
  businessId: string,
  params: GetBusinessOrdersParams = {}
): Promise<OrderResponse> => {
  try {
    const { data } = await axiosInstance.get<OrderResponse>(
      `/orders/businesses/${businessId}/orders`,
      { params }
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getBusinessOrders:",
      error.response?.data || error.message
    );
    throw error;
  }
};
// ----------------------
// API: Update order status
// ----------------------
export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<OrderResponse> => {
  try {
    const { data } = await axiosInstance.patch<OrderResponse>(
      `/orders/orders/${orderId}/status`,
      payload
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur updateOrderStatus:",
      error.response?.data || error.message
    );
    throw error;
  }
};
