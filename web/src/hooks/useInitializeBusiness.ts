'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessStore, Business, BusinessType } from '@/stores/businessStore';
import { getMyBusinesses } from '@/lib/api/business';

// Mapping des types vers les routes (identique mobile)
const BUSINESS_ROUTES: Record<BusinessType, string> = {
    COMMERCANT: '/dashboard/commercant',
    RESTAURATEUR: '/dashboard/restaurateur',
    FOURNISSEUR: '/dashboard/fournisseur',
    LIVREUR: '/dashboard/livreur',
};

interface UseInitializeBusinessOptions {
    expectedType?: BusinessType; // Type attendu pour ce dashboard
    autoRedirect?: boolean; // Rediriger si le business.type ne correspond pas
}

/**
 * Hook pour initialiser le business au chargement du dashboard (aligné mobile)
 * 
 * Comportement:
 * 1. Charge les businesses si non présents dans le store
 * 2. Applique un fallback si aucun business sélectionné
 * 3. Redirige vers le bon dashboard si le type ne correspond pas
 */
export function useInitializeBusiness(options: UseInitializeBusinessOptions = {}) {
    const { expectedType, autoRedirect = true } = options;
    const router = useRouter();
    const hasInitialized = useRef(false);

    const {
        selectedBusiness,
        businesses,
        setSelectedBusiness,
        setBusinesses,
        isLoading,
        setLoading
    } = useBusinessStore();

    useEffect(() => {
        if (hasInitialized.current) return;

        const initializeBusiness = async () => {
            try {
                setLoading(true);

                // Charger les businesses si pas encore dans le store
                let allBusinesses = businesses;
                if (allBusinesses.length === 0) {
                    allBusinesses = await getMyBusinesses() || [];
                    setBusinesses(allBusinesses);
                }

                // Fallback si aucun business sélectionné (comportement mobile exact)
                if (!selectedBusiness && allBusinesses.length > 0) {
                    // Mobile: premier COMMERCANT ou all[0]
                    const fallback = allBusinesses.find(b => b.type === 'COMMERCANT') || allBusinesses[0];
                    setSelectedBusiness(fallback);
                    console.log('[useInitializeBusiness] Fallback:', fallback.name, fallback.type);

                    // Rediriger vers le bon dashboard si nécessaire
                    if (autoRedirect && expectedType && fallback.type !== expectedType) {
                        router.replace(BUSINESS_ROUTES[fallback.type]);
                        return;
                    }
                }

                // Vérifier si on doit rediriger vers un autre dashboard
                if (selectedBusiness && autoRedirect && expectedType && selectedBusiness.type !== expectedType) {
                    router.replace(BUSINESS_ROUTES[selectedBusiness.type]);
                    return;
                }

                hasInitialized.current = true;
            } catch (error) {
                console.error('[useInitializeBusiness] Error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeBusiness();
    }, [selectedBusiness, businesses, expectedType, autoRedirect]);

    return {
        selectedBusiness,
        businesses,
        isLoading,
    };
}
