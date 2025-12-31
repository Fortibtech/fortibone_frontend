'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useBusinessStore } from '@/stores/businessStore';

export default function Home() {
    const router = useRouter();
    const { token, userProfile, isHydrated } = useUserStore();
    const { selectedBusiness } = useBusinessStore();

    useEffect(() => {
        if (!isHydrated) return;

        if (!token || !userProfile) {
            router.replace('/auth/login');
            return;
        }

        // Redirect based on profile type
        if (userProfile.profileType === 'PARTICULIER') {
            router.replace('/dashboard/particulier');
        } else {
            // PRO user - redirect based on selected business type
            if (selectedBusiness) {
                const type = selectedBusiness.type.toLowerCase();
                router.replace(`/dashboard/${type}`);
            } else {
                // No business selected, go to business selection
                router.replace('/dashboard/commercant');
            }
        }
    }, [isHydrated, token, userProfile, selectedBusiness, router]);

    return (
        <div className="loading-container">
            <div className="loading-spinner" />
            <p>Redirection...</p>
            <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 1rem;
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
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
