'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import MobileHeader from './MobileHeader';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
    businessType?: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR' | 'LIVREUR' | 'PARTICULIER';
    title?: string;
    customHeaderRender?: (props: { onMenuClick: () => void }) => React.ReactNode;
}

export default function DashboardLayout({
    children,
    businessType = 'PARTICULIER',
    title,
    customHeaderRender
}: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Afficher le BusinessSelector seulement pour les PRO (pas PARTICULIER)
    const showBusinessSelector = businessType !== 'PARTICULIER';

    return (
        <div className={styles.layout}>
            {/* Desktop Sidebar */}
            <div className={`${styles.sidebarContainer} ${sidebarOpen ? styles.open : ''}`}>
                <Sidebar businessType={businessType} />
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={styles.main}>
                {customHeaderRender ? (
                    customHeaderRender({ onMenuClick: () => setSidebarOpen(!sidebarOpen) })
                ) : (
                    <>
                        {/* Mobile Header with BusinessSelector (hidden on desktop) */}
                        <MobileHeader showBusinessSelector={showBusinessSelector} />

                        <Header
                            title={title}
                            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                        />
                    </>
                )}
                <div className={styles.content}>
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav businessType={businessType} />
        </div>
    );
}

