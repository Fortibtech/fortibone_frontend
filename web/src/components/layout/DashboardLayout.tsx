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
    showStandardHeaderOnDesktop?: boolean;
}

export default function DashboardLayout({
    children,
    businessType = 'PARTICULIER',
    title,
    customHeaderRender,
    showStandardHeaderOnDesktop = false
}: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Toggle collapse state
    const toggleCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Afficher le BusinessSelector seulement pour les PRO (pas PARTICULIER)
    const showBusinessSelector = businessType !== 'PARTICULIER';

    return (
        <div className={styles.layout}>
            {/* Desktop Sidebar */}
            <div className={`${styles.sidebarContainer} ${sidebarCollapsed ? styles.collapsed : ''} ${sidebarOpen ? styles.open : ''}`}>
                <Sidebar
                    businessType={businessType}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={toggleCollapse}
                />
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={`${styles.main} ${sidebarCollapsed ? styles.collapsed : ''}`}>
                {customHeaderRender ? (
                    <>
                        {/* Custom Header (Mobile Only if hybrid mode) */}
                        <div className={showStandardHeaderOnDesktop ? styles.mobileOnly : ''}>
                            {customHeaderRender({ onMenuClick: () => setSidebarOpen(!sidebarOpen) })}
                        </div>

                        {/* Standard Header (Desktop Only if hybrid mode) */}
                        {showStandardHeaderOnDesktop && (
                            <div className={styles.desktopOnly}>
                                <Header
                                    title={title}
                                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                                />
                            </div>
                        )}
                    </>
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

