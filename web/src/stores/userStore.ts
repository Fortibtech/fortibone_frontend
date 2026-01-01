import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProfile } from '../lib/api/auth';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profileImageUrl: string | null;
    profileType: 'PARTICULIER' | 'PRO';
    country: string;
    city: string;
    gender: string;
    dateOfBirth: string;
    address?: string;
}

interface UserStore {
    email: string | null;
    token: string | null;
    otp: string | null;
    userProfile: UserProfile | null;
    isHydrated: boolean;

    // Actions
    setEmail: (email: string) => void;
    setToken: (token: string) => void;
    setOtp: (otp: string) => void;
    setUserProfile: (profile: UserProfile) => void;
    hydrateTokenAndProfile: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    logout: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            email: null,
            token: null,
            otp: null,
            userProfile: null,
            isHydrated: false,

            setEmail: (email: string) => set({ email }),

            setToken: (token: string) => {
                set({ token });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', token);
                }
            },

            setOtp: (otp: string) => set({ otp }),

            setUserProfile: (profile: UserProfile) => set({ userProfile: profile }),

            hydrateTokenAndProfile: async () => {
                try {
                    if (typeof window === 'undefined') return;

                    const savedToken = localStorage.getItem('access_token');
                    if (!savedToken) {
                        set({ isHydrated: true });
                        return;
                    }

                    set({ token: savedToken });

                    const response = await getProfile();
                    const profile = response?.data || response;

                    if (profile) {
                        set({ userProfile: profile, isHydrated: true });
                    } else {
                        set({ isHydrated: true });
                    }
                } catch (error) {
                    console.error('Erreur lors de l\'hydratation:', error);
                    // Clear invalid token
                    localStorage.removeItem('access_token');
                    set({ token: null, userProfile: null, isHydrated: true });
                }
            },

            refreshProfile: async () => {
                const token = get().token;
                if (!token) return;

                try {
                    const response = await getProfile();
                    const profile = response?.data || response;
                    if (profile) {
                        set({ userProfile: profile });
                    }
                } catch (error) {
                    console.error('Erreur refreshProfile:', error);
                }
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    // Nettoyer tous les tokens et storage liés à la session
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('business-storage'); // CRITIQUE: évite le mélange de contextes entre comptes
                    localStorage.removeItem('user-storage');
                }

                // Reset complet du state utilisateur
                set({
                    email: null,
                    token: null,
                    otp: null,
                    userProfile: null,
                    isHydrated: false, // Force re-hydratation au prochain login
                });

                // Reset aussi le businessStore pour éviter tout mélange
                // Import dynamique pour éviter les dépendances circulaires
                import('./businessStore').then(({ useBusinessStore }) => {
                    useBusinessStore.getState().clearBusiness();
                }).catch(() => {
                    // Fallback si import échoue
                    console.warn('Could not clear businessStore');
                });
            },
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({
                token: state.token,
                email: state.email,
            }),
        }
    )
);
