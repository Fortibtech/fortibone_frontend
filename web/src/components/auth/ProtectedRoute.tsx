'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredProfileType?: 'PARTICULIER' | 'PRO';
}

export default function ProtectedRoute({ children, requiredProfileType }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { token, userProfile, isHydrated } = useUserStore();

    useEffect(() => {
        if (!isHydrated) return;

        // Not logged in -> redirect to login
        if (!token || !userProfile) {
            router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // Check profile type if required
        if (requiredProfileType && userProfile.profileType !== requiredProfileType) {
            // Redirect to appropriate dashboard
            if (userProfile.profileType === 'PRO') {
                router.replace('/dashboard/commercant');
            } else {
                router.replace('/dashboard/particulier');
            }
        }
    }, [isHydrated, token, userProfile, requiredProfileType, router, pathname]);

    // Still hydrating or not authenticated
    if (!isHydrated || !token || !userProfile) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <style jsx>{`
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e5e7eb;
            border-top-color: #059669;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    return <>{children}</>;
}
