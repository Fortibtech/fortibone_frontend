'use client';

import { useState, useEffect } from 'react';
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
    // PREMIUM UX: Sidebar collapsed by default on desktop
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [sidebarHovered, setSidebarHovered] = useState(false);

    // Toggle collapse state (for button click)
    const toggleCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Hover handlers for sidebar auto-expand
    const handleSidebarMouseEnter = () => setSidebarHovered(true);
    const handleSidebarMouseLeave = () => setSidebarHovered(false);

    // Sidebar is visually expanded if: not collapsed OR hovered
    const isSidebarExpanded = !sidebarCollapsed || sidebarHovered;

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Command/Ctrl + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                // Dispatch event so Header can pick it up
                const event = new CustomEvent('focus-search');
                window.dispatchEvent(event);
            }

            // Escape to close sidebar if open
            if (e.key === 'Escape') {
                if (sidebarOpen) setSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sidebarOpen]);

    // Afficher le BusinessSelector seulement pour les PRO (pas PARTICULIER)
    const showBusinessSelector = businessType !== 'PARTICULIER';

    return (
        <div className={styles.layout}>
            {/* Desktop Sidebar with Hover Expand */}
            <div
                className={`${styles.sidebarContainer} ${!isSidebarExpanded ? styles.collapsed : ''} ${sidebarOpen ? styles.open : ''}`}
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
            >
                <Sidebar
                    businessType={businessType}
                    collapsed={!isSidebarExpanded}
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
            <main className={`${styles.main} ${!isSidebarExpanded ? styles.collapsed : ''}`}>
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

