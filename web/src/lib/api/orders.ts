import axiosInstance from './axiosInstance';

// Types
export type OrderStatus =
    | 'PENDING_PAYMENT'
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'PAID'
    | 'REFUNDED';

export type OrderType = 'SALE' | 'PURCHASE' | 'RESERVATION';

export interface OrderLine {
    id: string;
    quantity: number;
    price: number;
    variantId: string;
    variant: {
        id: string;
        name: string;
        sku?: string | null;
        product: {
            id: string;
            name: string;
            images?: string[];
        };
    };
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
}

export interface OrderBusiness {
    id: string;
    name: string;
    logoUrl?: string | null;
    description?: string | null;
}

export interface Order {
    id: string;
    orderNumber: string;
    type: OrderType;
    status: OrderStatus;
    totalAmount: string;
    notes: string | null;
    createdAt: string;
    businessId: string;
    customerId: string;
    purchasingBusinessId: string | null;
    employeeId: string | null;
    tableNumber: string | null;
    reservationDate: string | null;
    lines: OrderLine[];
    customer: Customer;
    business: OrderBusiness;
}

export interface OrdersPaginatedResponse {
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateOrderPayload {
    businessId: string;
    type: OrderType;
    lines: {
        variantId: string;
        quantity: number;
    }[];
    notes?: string;
    tableNumber?: string;
    reservationDate?: string;
}

// API Functions
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
    try {
        const response = await axiosInstance.post<Order>('/orders', payload);
        return response.data;
    } catch (error: any) {
        console.error('Erreur création commande:', error.response?.data || error.message);
        throw error;
    }
};

export interface MultiOrderPayload {
    items: {
        variantId: string;
        quantity: number;
    }[];
    notes?: string;
    useWallet?: boolean;
}

export const passMultipleOrders = async (payload: MultiOrderPayload): Promise<Order[]> => {
    try {
        // 🔥 FIXED: Mobile uses /orders/checkout, NOT /orders/multi
        // See: api/orers/createOrder.ts line 99
        const response = await axiosInstance.post<Order[]>('/orders/checkout', payload);
        return response.data;
    } catch (error: any) {
        console.error('Erreur passMultipleOrders:', error.response?.data || error.message);

        // Better error handling matching mobile
        const serverError = error.response?.data;
        if (serverError?.message) {
            throw new Error(
                Array.isArray(serverError.message)
                    ? serverError.message.join('\n')
                    : serverError.message
            );
        }
        throw new Error('Impossible de valider le panier. Veuillez réessayer.');
    }
};

export const getMyOrders = async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: OrderStatus;
    type?: OrderType;
}): Promise<OrdersPaginatedResponse> => {
    try {
        const response = await axiosInstance.get<OrdersPaginatedResponse>('/orders/my-orders', {
            params: { page: 1, limit: 10, ...params },
        });
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération commandes:', error.response?.data || error.message);
        throw error;
    }
};

export const getOrderById = async (orderId: string): Promise<Order> => {
    const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
    return response.data;
};

export const getBusinessOrders = async (
    businessId: string,
    params?: {
        page?: number;
        limit?: number;
        status?: OrderStatus;
        search?: string;
    }
): Promise<OrdersPaginatedResponse> => {
    try {
        const response = await axiosInstance.get<OrdersPaginatedResponse>(
            `/businesses/${businessId}/orders`,
            { params }
        );
        return response.data;
    } catch (error: any) {
        console.error('Erreur commandes business:', error.response?.data || error.message);
        throw error;
    }
};

export const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
): Promise<Order> => {
    try {
        const response = await axiosInstance.patch<Order>(`/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error: any) {
        console.error('Erreur màj statut:', error.response?.data || error.message);
        throw error;
    }
};

export const payOrder = async (payload: {
    orderId: string;
    method: 'STRIPE' | 'KARTAPAY' | 'WALLET';
    paymentMethodId?: string;
    phoneNumber?: string;
}): Promise<{ success: boolean; clientSecret?: string; message?: string }> => {
    try {
        const body: any = { method: payload.method };

        if (payload.method === 'STRIPE' && payload.paymentMethodId) {
            body.metadata = {
                paymentMethodId: payload.paymentMethodId,
                note: 'achat via carte bancaire',
            };
        } else if (payload.method === 'KARTAPAY' && payload.phoneNumber) {
            body.metadata = {
                phoneNumber: payload.phoneNumber,
                note: 'achat via mobile',
            };
        }

        const response = await axiosInstance.post(`/orders/${payload.orderId}/pay`, body);

        return {
            success: true,
            clientSecret: response.data?.clientSecret,
            message: response.data?.message || 'Paiement initié avec succès',
        };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || 'Erreur lors du paiement';
        throw new Error(msg);
    }
};
