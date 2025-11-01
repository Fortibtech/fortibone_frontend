// src/types/customer.ts
export interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  clientSince: string; // ISO string
}

export interface RecentOrder {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  products: string[]; // noms ou SKUs
}

export interface CustomerStats {
  totalSalesAmount: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export interface CustomerDetailResponse {
  customerInfo: CustomerInfo;
  stats: CustomerStats;
  recentOrders: RecentOrder[];
}
