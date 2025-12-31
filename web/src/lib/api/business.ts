import axiosInstance from './axiosInstance';
import { Business, BusinessType } from '../../stores/businessStore';

// Types
export type CommerceType = 'PHYSICAL' | 'ONLINE' | 'HYBRID';
export type PriceRange = 'ENTRY_LEVEL' | 'MID_RANGE' | 'PREMIUM' | 'LUXURY';

export interface CreateBusinessData {
    name: string;
    description: string;
    type: BusinessType;
    address: string;
    latitude: number;
    longitude: number;
    currencyId: string;
    activitySector?: string; // Optional - not required for Livreur
    commerceType?: CommerceType; // Optional - only for Commerçant
    postalCode?: string;
    siret?: string;
    websiteUrl?: string;
    businessEmail?: string;
    phoneNumber?: string;
    contactFirstName?: string;
    contactLastName?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    priceRange?: PriceRange;
    productCategories?: string[];
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        tiktok?: string;
        twitter?: string;
    };
}

export interface BusinessFilters {
    search?: string;
    type?: BusinessType;
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
}

export interface BusinessMember {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: string;
    userId?: string;
}

export interface OpeningHour {
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    openTime: string;
    closeTime: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// API Functions
export const getMyBusinesses = async (): Promise<Business[]> => {
    try {
        // Endpoint aligné sur l'app mobile: /users/me/businesses
        const response = await axiosInstance.get('/users/me/businesses');
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération businesses:', error.response?.data || error.message);
        throw error;
    }
};

export const getBusinessById = async (businessId: string): Promise<Business> => {
    const response = await axiosInstance.get(`/businesses/${businessId}`);
    return response.data;
};

export const createBusiness = async (data: CreateBusinessData): Promise<Business> => {
    try {
        const response = await axiosInstance.post('/businesses', data);
        return response.data;
    } catch (error: any) {
        console.error('Erreur création business:', error.response?.data || error.message);
        throw error;
    }
};

// Search businesses (public)
export const getBusinesses = async (filters: BusinessFilters): Promise<PaginatedResponse<Business>> => {
    try {
        const response = await axiosInstance.get('/businesses', { params: filters });
        return response.data;
    } catch (error: any) {
        console.error('Erreur recherche businesses:', error.response?.data || error.message);
        throw error;
    }
};

export const updateBusiness = async (
    businessId: string,
    data: Partial<CreateBusinessData>
): Promise<Business> => {
    try {
        const response = await axiosInstance.patch(`/businesses/${businessId}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Erreur màj business:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteBusiness = async (businessId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/businesses/${businessId}`);
    } catch (error: any) {
        console.error('Erreur suppression business:', error.response?.data || error.message);
        throw error;
    }
};

export const searchBusinesses = async (
    filters: BusinessFilters
): Promise<PaginatedResponse<Business>> => {
    try {
        const response = await axiosInstance.get('/businesses', { params: filters });
        return response.data;
    } catch (error: any) {
        console.error('Erreur recherche business:', error.response?.data || error.message);
        throw error;
    }
};

// Members
export const getBusinessMembers = async (businessId: string): Promise<BusinessMember[]> => {
    try {
        const response = await axiosInstance.get(`/businesses/${businessId}/members`);
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération membres:', error.response?.data || error.message);
        throw error;
    }
};

export const addBusinessMember = async (
    businessId: string,
    email: string,
    role: 'MEMBER' | 'ADMIN'
): Promise<BusinessMember> => {
    try {
        const response = await axiosInstance.post(`/businesses/${businessId}/members`, { email, role });
        return response.data;
    } catch (error: any) {
        console.error('Erreur ajout membre:', error.response?.data || error.message);
        throw error;
    }
};

export const removeBusinessMember = async (
    businessId: string,
    memberId: string
): Promise<void> => {
    try {
        await axiosInstance.delete(`/businesses/${businessId}/members/${memberId}`);
    } catch (error: any) {
        console.error('Erreur suppression membre:', error.response?.data || error.message);
        throw error;
    }
};

// Opening Hours
export const getOpeningHours = async (businessId: string): Promise<OpeningHour[]> => {
    try {
        const response = await axiosInstance.get(`/businesses/${businessId}/opening-hours`);
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération horaires:', error.response?.data || error.message);
        throw error;
    }
};

export const updateOpeningHours = async (
    businessId: string,
    hours: OpeningHour[]
): Promise<OpeningHour[]> => {
    try {
        const response = await axiosInstance.put(`/businesses/${businessId}/opening-hours`, { hours });
        return response.data;
    } catch (error: any) {
        console.error('Erreur màj horaires:', error.response?.data || error.message);
        throw error;
    }
};
