/* eslint-disable import/export */
// ----------------------
// Types
// ----------------------
export interface OrderLinePayload {
  variantId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  type:
  | "SALE"
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";
  businessId: string;
  supplierBusinessId?: string;
  notes?: string;
  tableNumber?: string;
  reservationDate?: string; // ISO (ex: "2025-12-24T19:00:00.000Z")
  lines: OrderLinePayload[];
}

// ----------------------
// Response types
// ----------------------
export interface Product {
  images: any;
  id: string;
  name: string;
  description: string;
  salesUnit: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  businessId: string;
  categoryId: string;
}

// eslint-disable-next-line import/export
export interface Variant {
  name: string;
  id: string;
  sku: string;
  barcode: string | null;
  price: string;
  purchasePrice: string;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number;
  lotPrice: string;
  imageUrl: string;
  productId: string;
  product: Product;
}

// eslint-disable-next-line import/export
export interface OrderLine {
  id: string;
  quantity: number;
  price: string;
  orderId: string;
  variantId: string;
  variant: Variant;
}

export interface Customer {
  lastName: any;
  profileImageUrl: any;
  id: string;
  firstName: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  type: string;
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  currencyId: string;
  averageRating: number;
  reviewCount: number;
  ownerId: string;
}

export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  totalAmount: string;
  notes: string;
  createdAt: string;
  businessId: string;
  customerId: string;
  purchasingBusinessId: string | null;
  employeeId: string | null;
  tableNumber: string | null;
  reservationDate: string | null;
  lines: OrderLine[];
  customer: Customer;
  business: Business;
}
export interface MyOrder {
  business: any;
  id: string;
  orderNumber: string;
  type: "SALE" | "PURCHASE" | "RESERVATION";
  status:
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "PAID"
  | "PENDING_PAYMENT";
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  businessId: string;
  customerId: string;
  purchasingBusinessId: string | null;
  employeeId: string | null;
  tableNumber: string | null;
  reservationDate: string | null;
}

export interface MyOrdersResponse {
  data: MyOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ----------------------
// Types
// ----------------------
export interface Product {
  id: string;
  name: string;
  description: string;
  salesUnit: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  businessId: string;
  categoryId: string;
}

export interface Variant {
  id: string;
  sku: string;
  barcode: string | null;
  price: string;
  purchasePrice: string;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number;
  lotPrice: string;
  imageUrl: string;
  productId: string;
  product: Product;
}

export interface OrderLine {
  id: string;
  quantity: number;
  price: string;
  orderId: string;
  variantId: string;
  variant: Variant;
}

export interface Customer {
  id: string;
  firstName: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  type: string;
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  currencyId: string;
  averageRating: number;
  reviewCount: number;
  ownerId: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  type: "SALE" | "PURCHASE" | "RESERVATION";
  status:
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "PAID"
  | "PENDING_PAYMENT";
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
  business: Business;
  deliveryRequest?: {
    id: string;
    status: "PENDING" | "ACCEPTED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
    deliveryCode: string;
    carrier: {
      id: string;
      name: string;
    };
  } | null;
}
// ----------------------
// Params disponibles
// ----------------------
export interface GetBusinessOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
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
}
// ----------------------
// Payload pour update status
// ----------------------
export interface UpdateOrderStatusPayload {
  status:
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";
}
