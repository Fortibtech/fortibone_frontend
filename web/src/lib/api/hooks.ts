// web/src/lib/api/hooks.ts
// Adapté du mobile (api/hooks.ts) pour le web
// Utilise window.confirm au lieu de Alert de React Native

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    getMyBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessMembers,
    addBusinessMember,
    removeBusinessMember,
    updateOpeningHours,
    type CreateBusinessData,
    type BusinessFilters,
    type BusinessMember,
} from './business';

// Types
export interface Business {
    id: string;
    name: string;
    description?: string;
    type: string;
    logoUrl?: string;
    coverUrl?: string;
    address?: string;
    phoneNumber?: string;
    isVerified: boolean;
}

export interface AddMemberData {
    email: string;
    role: 'MEMBER' | 'ADMIN';
}

export interface UpdateMemberRoleData {
    role: 'MEMBER' | 'ADMIN';
}

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface OpeningHourData {
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
}

export interface UpdateOpeningHoursData {
    hours: OpeningHourData[];
}

// ==================== HOOKS ====================

// Hook pour gérer une entreprise spécifique
export const useBusiness = (businessId?: string) => {
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBusiness = useCallback(async () => {
        if (!businessId) return;

        try {
            setLoading(true);
            setError(null);
            const businessData = await getBusinessById(businessId);
            setBusiness(businessData as Business);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
            setError(errorMessage);
            console.error("Erreur lors du chargement de l'entreprise:", err);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    const handleUpdateBusiness = useCallback(async (data: Partial<CreateBusinessData>) => {
        if (!businessId) return null;

        try {
            setLoading(true);
            setError(null);
            const updatedBusiness = await updateBusiness(businessId, data);
            setBusiness(updatedBusiness as Business);
            return updatedBusiness;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    const handleDeleteBusiness = useCallback(async () => {
        if (!businessId) return;

        try {
            setLoading(true);
            setError(null);
            await deleteBusiness(businessId);
            setBusiness(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        loadBusiness();
    }, [loadBusiness]);

    return {
        business,
        loading,
        error,
        refetch: loadBusiness,
        updateBusiness: handleUpdateBusiness,
        deleteBusiness: handleDeleteBusiness,
    };
};

// Hook pour gérer les membres d'une entreprise
export const useBusinessMembers = (businessId?: string) => {
    const [members, setMembers] = useState<BusinessMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMembers = useCallback(async () => {
        if (!businessId) return;

        try {
            setLoading(true);
            setError(null);
            const membersData = await getBusinessMembers(businessId);
            setMembers(membersData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
            setError(errorMessage);
            console.error('Erreur lors du chargement des membres:', err);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    const addMember = useCallback(async (data: AddMemberData) => {
        if (!businessId) return null;

        try {
            setLoading(true);
            setError(null);
            const newMember = await addBusinessMember(businessId, data.email, data.role);
            await loadMembers();
            return newMember;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [businessId, loadMembers]);

    const removeMember = useCallback(async (memberId: string) => {
        if (!businessId) return;

        try {
            setLoading(true);
            setError(null);
            await removeBusinessMember(businessId, memberId);
            await loadMembers();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [businessId, loadMembers]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    return {
        members,
        loading,
        error,
        refetch: loadMembers,
        addMember,
        removeMember
    };
};

// Hook pour gérer la liste des entreprises
export const useBusinesses = (filters?: BusinessFilters) => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBusinesses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMyBusinesses();
            // response peut être un tableau direct ou un objet avec data
            const businessList = Array.isArray(response) ? response : (response as any).data || [];
            setBusinesses(businessList as Business[]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
            setError(errorMessage);
            console.error('Erreur lors du chargement des entreprises:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreateBusiness = useCallback(async (data: CreateBusinessData) => {
        try {
            setLoading(true);
            setError(null);
            const newBusiness = await createBusiness(data);
            await loadBusinesses();
            return newBusiness;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadBusinesses]);

    useEffect(() => {
        loadBusinesses();
    }, [loadBusinesses]);

    return {
        businesses,
        loading,
        error,
        refetch: loadBusinesses,
        createBusiness: handleCreateBusiness
    };
};

// Hook pour gérer l'entreprise sélectionnée (via localStorage sur web)
export const useSelectedBusiness = () => {
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(false);

    const loadSelectedBusiness = useCallback(() => {
        if (typeof window === 'undefined') return;

        try {
            setLoading(true);
            const stored = localStorage.getItem('selectedBusiness');
            if (stored) {
                setSelectedBusiness(JSON.parse(stored));
            }
        } catch (err) {
            console.error("Erreur lors du chargement de l'entreprise sélectionnée:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const selectBusiness = useCallback((business: Business) => {
        if (typeof window === 'undefined') return;

        try {
            setLoading(true);
            localStorage.setItem('selectedBusiness', JSON.stringify(business));
            setSelectedBusiness(business);
        } catch (err) {
            console.error('Erreur lors de la sélection:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSelectedBusiness = useCallback(() => {
        if (typeof window === 'undefined') return;

        try {
            setLoading(true);
            localStorage.removeItem('selectedBusiness');
            setSelectedBusiness(null);
        } catch (err) {
            console.error('Erreur lors de la désélection:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSelectedBusiness();
    }, [loadSelectedBusiness]);

    return {
        selectedBusiness,
        loading,
        selectBusiness,
        clearSelectedBusiness,
        refetch: loadSelectedBusiness
    };
};

// Hook pour les actions communes sur les entreprises (adapté pour web)
export const useBusinessActions = () => {
    const [loading, setLoading] = useState(false);

    const handleUpdateOpeningHours = useCallback(async (businessId: string, data: UpdateOpeningHoursData) => {
        try {
            setLoading(true);
            await updateOpeningHours(businessId, data.hours);
            // Web: utilise alert au lieu de Alert.alert
            if (typeof window !== 'undefined') {
                alert("Horaires d'ouverture mis à jour");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
            if (typeof window !== 'undefined') {
                alert(`Erreur: ${errorMessage}`);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const confirmDeleteBusiness = useCallback((business: Business, onConfirm: () => void) => {
        if (typeof window !== 'undefined') {
            const confirmed = window.confirm(
                `Êtes-vous sûr de vouloir supprimer "${business.name}" ? Cette action est irréversible.`
            );
            if (confirmed) {
                onConfirm();
            }
        }
    }, []);

    const confirmRemoveMember = useCallback((member: BusinessMember, onConfirm: () => void) => {
        if (typeof window !== 'undefined') {
            // Accès sécurisé aux propriétés du membre (structure peut varier)
            const memberData = member as any;
            const firstName = memberData.user?.firstName || memberData.firstName || '';
            const lastName = memberData.user?.lastName || memberData.lastName || '';
            const confirmed = window.confirm(
                `Êtes-vous sûr de vouloir supprimer ${firstName} ${lastName} ?`
            );
            if (confirmed) {
                onConfirm();
            }
        }
    }, []);

    return {
        loading,
        updateOpeningHours: handleUpdateOpeningHours,
        confirmDeleteBusiness,
        confirmRemoveMember
    };
};
