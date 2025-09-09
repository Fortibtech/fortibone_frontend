export interface Business {
    id: string;
    name: string;
    description: string;
    type: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR';
    address: string;
    phoneNumber: string;
    logoUrl?: string;
    coverImageUrl?: string;
    latitude: number;
    longitude: number;
    currencyId: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface CreateBusinessData {
    name: string;
    description: string;
    type: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR';
    address: string;
    phoneNumber: string;
    logoUrl?: string;
    coverImageUrl?: string;
    latitude: number;
    longitude: number;
    currencyId: string;
  }
  
  export interface BusinessFilters {
    search?: string;
    type?: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR';
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
  
  export interface Product {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    salesUnit: 'UNIT' | 'KG' | 'LITER';
    businessId: string;
    price?: number;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface CreateProductData {
    name: string;
    description: string;
    categoryId: string;
    salesUnit: 'UNIT' | 'KG' | 'LITER';
  }
  
  export interface ProductSearchFilters {
    search?: string;
    categoryId?: string;
    businessType?: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR';
    minPrice?: number;
    maxPrice?: number;
    currencyCode?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    sortBy?: 'PRICE_ASC' | 'PRICE_DESC' | 'DISTANCE' | 'RELEVANCE';
    page?: number;
    limit?: number;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  export interface CategoryAttribute {
    id: string;
    name: string;
    categoryId: string;
    required?: boolean;
    type?: 'text' | 'number' | 'date' | 'select' | 'color';
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