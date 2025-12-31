import axiosInstance from './axiosInstance';

// Types
export interface ProductVariant {
    id: string;
    sku: string;
    barcode?: string | null;
    price: string;
    purchasePrice: string;
    quantityInStock: number;
    alertThreshold?: number | null;
    itemsPerLot?: number | null;
    lotPrice?: string | null;
    imageUrl?: string | null;
    productId: string;
    attributeValues: {
        id: string;
        value: string;
        variantId: string;
        attributeId: string;
        attribute: {
            id: string;
            name: string;
            categoryId: string;
        };
    }[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    salesUnit: 'UNIT' | 'LOT';
    businessId: string;
    imageUrl?: string | null;
    averageRating?: number;
    reviewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    variants: ProductVariant[];
    category: {
        id: string;
        name: string;
    };
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
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateProductData {
    name: string;
    description: string;
    categoryId: string;
    salesUnit: 'UNIT' | 'LOT';
}

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

// API Functions
export const getProducts = async (
    businessId: string,
    params?: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: string;
    }
): Promise<PaginatedResponse<Product>> => {
    try {
        const response = await axiosInstance.get(`/businesses/${businessId}/products`, { params });
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération produits:', error.response?.data || error.message);
        throw error;
    }
};

export const getProductById = async (businessId: string, productId: string): Promise<Product> => {
    const response = await axiosInstance.get(`/businesses/${businessId}/products/${productId}`);
    return response.data;
};

export const createProduct = async (
    businessId: string,
    data: CreateProductData
): Promise<Product> => {
    try {
        const response = await axiosInstance.post(`/businesses/${businessId}/products`, data);
        return response.data;
    } catch (error: any) {
        console.error('Erreur création produit:', error.response?.data || error.message);
        throw error;
    }
};

export const updateProduct = async (
    businessId: string,
    productId: string,
    data: Partial<CreateProductData>
): Promise<Product> => {
    try {
        const response = await axiosInstance.patch(
            `/businesses/${businessId}/products/${productId}`,
            data
        );
        return response.data;
    } catch (error: any) {
        console.error('Erreur màj produit:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteProduct = async (businessId: string, productId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/businesses/${businessId}/products/${productId}`);
    } catch (error: any) {
        console.error('Erreur suppression produit:', error.response?.data || error.message);
        throw error;
    }
};

export const createVariant = async (
    businessId: string,
    productId: string,
    data: CreateVariantData
): Promise<ProductVariant> => {
    try {
        const response = await axiosInstance.post(
            `/businesses/${businessId}/products/${productId}/variants`,
            data
        );
        return response.data;
    } catch (error: any) {
        console.error('Erreur création variante:', error.response?.data || error.message);
        throw error;
    }
};

export const updateVariant = async (
    businessId: string,
    productId: string,
    variantId: string,
    data: Partial<CreateVariantData>
): Promise<ProductVariant> => {
    try {
        const response = await axiosInstance.patch(
            `/businesses/${businessId}/products/${productId}/variants/${variantId}`,
            data
        );
        return response.data;
    } catch (error: any) {
        console.error('Erreur màj variante:', error.response?.data || error.message);
        throw error;
    }
};

export const searchProducts = async (
    filters: ProductSearchFilters
): Promise<PaginatedResponse<Product>> => {
    try {
        const response = await axiosInstance.get('/products/search', { params: filters });
        return response.data;
    } catch (error: any) {
        console.error('Erreur recherche produits:', error.response?.data || error.message);
        throw error;
    }
};
