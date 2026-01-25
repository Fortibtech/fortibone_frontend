'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './docs.module.css';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';

interface DocsLayoutProps {
    children: React.ReactNode;
}

// Updated to use Anchors since all content is in /docs/page.tsx
const docsSections = [
    {
        title: 'Démarrage',
        items: [
            { href: '/docs#top', label: 'Vue d\'ensemble' },
            { href: '/docs#introduction', label: 'Introduction' },
            { href: '/docs#faq', label: 'FAQ' },
        ]
    },
    {
        title: 'Guides par profil',
        items: [
            { href: '/docs#particulier', label: 'Particulier' },
            { href: '/docs#commercant', label: 'Commerçant' },
            // { href: '/docs#fournisseur', label: 'Fournisseur' }, // Content for these might need to be added to page.tsx if missing
            // { href: '/docs#restaurateur', label: 'Restaurateur' },
            // { href: '/docs#livreur', label: 'Livreur' },
        ]
    },
    {
        title: 'Fonctionnalités',
        items: [
            { href: '/docs#wallet', label: 'Wallet & Paiements' },
            { href: '/docs#acces', label: 'Accès' },
            { href: '/docs#inscription', label: 'Inscription' },
        ]
    }
];

export default function DocsLayout({ children }: DocsLayoutProps) {
    const pathname = usePathname();

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Unified Public Header (Solid variant for docs) */}
            <PublicHeader variant="solid" />

            {/* Content Container */}
            <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', marginTop: '80px' }}>

                {/* Fixed Sidebar */}
                <aside className={styles.docsSidebar}>
                    {docsSections.map((section) => (
                        <div key={section.title} className={styles.sidebarSection}>
                            <h3 className={styles.sidebarTitle}>{section.title}</h3>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.sidebarLink}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className={styles.docsMain} style={{ paddingBottom: '60px' }}>
                    {children}
                </main>

                {/* Right TOC (Optional/Empty for now) */}
                <aside className={styles.toc}>
                    {/* Placeholder for TOC */}
                </aside>
            </div>

            {/* Unified Public Footer */}
            <PublicFooter />
        </div>
    );
}
