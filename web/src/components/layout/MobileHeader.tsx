'use client';

import { useUserStore } from '@/stores/userStore';
import { useBusinessStore } from '@/stores/businessStore';
import BusinessSelector from '@/components/business/BusinessSelector';
import styles from './MobileHeader.module.css';

interface MobileHeaderProps {
    showBusinessSelector?: boolean;
}

export default function MobileHeader({ showBusinessSelector = true }: MobileHeaderProps) {
    const { userProfile } = useUserStore();
    const { selectedBusiness } = useBusinessStore();

    const isPro = userProfile?.profileType === 'PRO';

    return (
        <header className={styles.mobileHeader}>
            <div className={styles.headerContent}>
                {/* Logo */}
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>K</div>
                    <span className={styles.logoText}>KomoraLink</span>
                </div>

                {/* User Avatar / Notifications */}
                <div className={styles.headerRight}>
                    <button className={styles.notifBtn}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </button>
                    <div className={styles.userAvatar}>
                        {userProfile?.profileImageUrl ? (
                            <img src={userProfile.profileImageUrl} alt="" />
                        ) : (
                            <span>{userProfile?.firstName?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Business Selector for PRO users */}
            {isPro && showBusinessSelector && (
                <div className={styles.selectorWrapper}>
                    <BusinessSelector compact />
                </div>
            )}
        </header>
    );
}
