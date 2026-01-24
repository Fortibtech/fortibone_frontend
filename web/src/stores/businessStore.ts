import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BusinessType = 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR' | 'LIVREUR';

export interface Business {
    id: string;
    name: string;
    description?: string;
    type: BusinessType;
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
    userRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface BusinessStore {
    selectedBusiness: Business | null;
    businesses: Business[];
    isLoading: boolean;
    version: number; // Pour forcer le refresh des composants (aligné mobile)

    // Actions
    setSelectedBusiness: (business: Business | null) => void;
    setBusinesses: (businesses: Business[]) => void;
    setLoading: (loading: boolean) => void;
    clearBusiness: () => void;
    bumpVersion: () => void; // Force un re-render des composants (aligné mobile)
}

export const useBusinessStore = create<BusinessStore>()(
    persist(
        (set) => ({
            selectedBusiness: null,
            businesses: [],
            isLoading: false,
            version: 0,

            setSelectedBusiness: (business) => set({
                selectedBusiness: business,
                version: 0, // Reset version à chaque changement manuel (aligné mobile)
            }),
            setBusinesses: (businesses) => set({ businesses }),
            setLoading: (loading) => set({ isLoading: loading }),
            clearBusiness: () => set({ selectedBusiness: null, businesses: [], version: 0 }),
            bumpVersion: () => set((state) => ({ version: state.version + 1 })),
        }),
        {
            name: 'business-storage',
            partialize: (state) => ({
                selectedBusiness: state.selectedBusiness,
            }),
        }
    )
);

