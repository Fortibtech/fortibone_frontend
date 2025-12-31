'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/userStore';

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const { hydrateTokenAndProfile, isHydrated } = useUserStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        hydrateTokenAndProfile();
    }, [hydrateTokenAndProfile]);

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Chargement...</p>
                <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: 1rem;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e5e7eb;
            border-top-color: #059669;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p {
            color: #6b7280;
            font-size: 0.875rem;
          }
        `}</style>
            </div>
        );
    }

    return <>{children}</>;
}
