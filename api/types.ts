export interface Business {
  id: string;
  name: string;
  description?: string;
  type: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  currencyId: string;
  averageRating: number;
  reviewCount: number;
  ownerId: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  userRole: "OWNER" | "ADMIN" | "MEMBER";
}

export interface CreateBusinessData {
  name: string;
  description: string;
  type: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
  address: string;
  phoneNumber: string;
  logoUrl?: string;
  coverImageUrl?: string;
  latitude: number;
  longitude: number;
  currencyId: string;
  siret?: string;
  websiteUrl?: string;
}

export interface BusinessFilters {
  search?: string;
  type?: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  variantId: string;
  attributeId: string;
  attribute: {
    id: string;
    name: string;
    categoryId: string;
  };
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string | null;
  price: string; // API retourne string
  purchasePrice: string; // API retourne string
  quantityInStock: number;
  alertThreshold?: number | null;
  itemsPerLot?: number | null;
  lotPrice?: string | null;
  imageUrl?: string | null;
  productId: string;
  attributeValues: AttributeValue[];
}

export interface ProductCategory {
  parent: any;
  id: string;
  name: string;
}

// Type Product mis à jour selon la structure API
export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  salesUnit: "UNIT" | "LOT";
  businessId: string;
  imageUrl?: string | null;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  variants: ProductVariant[];
  category: ProductCategory;
}

// Types pour créer/modifier les variantes
export interface CreateVariantData {
  price: number;
  purchasePrice: number;
  quantityInStock: number;
  sku: string;
  barcode?: string;
  itemsPerLot?: number;
  lotPrice?: number;
  imageUrl?: string;
  attributes: {
    attributeId: string;
    value: string;
  }[];
}

export interface UpdateVariantData {
  price?: number;
  purchasePrice?: number;
  quantityInStock?: number;
  sku?: string;
  barcode?: string;
  itemsPerLot?: number;
  lotPrice?: number;
  imageUrl?: string;
  attributes?: {
    attributeId: string;
    value: string;
  }[];
}

export interface CreateProductData {
  name: string;
  description: string;
  categoryId: string;
  salesUnit: "UNIT" | "LOT";
}

export interface ProductSearchFilters {
  search?: string;
  categoryId?: string;
  businessType?: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "PRICE_ASC" | "PRICE_DESC" | "DISTANCE" | "RELEVANCE";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  categoryId: string;
  required?: boolean;
  type?: "text" | "number" | "date" | "select" | "color";
  options?: string[]; // Pour les attributs de type select
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  attributes: CategoryAttribute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  userId?: string;
}
export interface AddMemberData {
  email: string;
  role: "MEMBER" | "ADMIN";
}

export interface UpdateMemberRoleData {
  role: "MEMBER" | "ADMIN" | "OWNER";
}

// Types pour les horaires d'ouverture
export interface OpeningHour {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  openTime: string; // Format "HH:mm"
  closeTime: string; // Format "HH:mm"
}

export interface UpdateOpeningHoursData {
  hours: OpeningHour[];
}

// Types pour les permissions
export type BusinessPermission =
  | "READ_BUSINESS"
  | "UPDATE_BUSINESS"
  | "DELETE_BUSINESS"
  | "MANAGE_MEMBERS"
  | "MANAGE_HOURS"
  | "VIEW_ANALYTICS";

export interface UserPermissions {
  businessId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  permissions: BusinessPermission[];
}

// Types pour les statistiques
export interface BusinessStats {
  totalMembers: number;
  totalOrders?: number;
  totalRevenue?: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  lastActivity?: string;
}

// Types pour les notifications
export interface BusinessNotification {
  id: string;
  type: "MEMBER_ADDED" | "MEMBER_REMOVED" | "ROLE_CHANGED" | "BUSINESS_UPDATED";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  businessId: string;
}

// Types pour les préférences
export interface BusinessPreferences {
  businessId: string;
  notifications: {
    email: boolean;
    push: boolean;
    memberChanges: boolean;
    businessUpdates: boolean;
  };
  privacy: {
    showInDirectory: boolean;
    allowReviews: boolean;
  };
}

// Types d'erreur spécifiques
export class BusinessNotFoundError extends Error {
  constructor(businessId: string) {
    super(`Business with ID ${businessId} not found`);
    this.name = "BusinessNotFoundError";
  }
}

export class MemberNotFoundError extends Error {
  constructor(memberId: string) {
    super(`Member with ID ${memberId} not found`);
    this.name = "MemberNotFoundError";
  }
}

export class InsufficientPermissionsError extends Error {
  constructor(action: string) {
    super(`Insufficient permissions to ${action}`);
    this.name = "InsufficientPermissionsError";
  }
}

// Types pour les validations
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Types pour les uploads
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Types pour les filtres avancés
export interface AdvancedBusinessFilters extends BusinessFilters {
  isVerified?: boolean;
  hasLogo?: boolean;
  hasCoverImage?: boolean;
  minRating?: number;
  maxRating?: number;
  createdAfter?: string;
  createdBefore?: string;
  sortBy?: "name" | "createdAt" | "updatedAt" | "rating";
  sortOrder?: "asc" | "desc";
}

// Types pour l'état de l'application
export interface AppState {
  selectedBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  error: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

// Types pour les actions Redux (si utilisé)
export type BusinessAction =
  | { type: "SET_BUSINESSES"; payload: Business[] }
  | { type: "SELECT_BUSINESS"; payload: Business }
  | { type: "UPDATE_BUSINESS"; payload: Business }
  | { type: "DELETE_BUSINESS"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

// Export par défaut des types principaux
export type {
  Business as DefaultBusiness,
  BusinessMember as DefaultBusinessMember,
  OpeningHour as DefaultOpeningHour,
};
