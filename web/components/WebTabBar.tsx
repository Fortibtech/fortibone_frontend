'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const icons = {
    home: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    briefcase: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    wallet: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    user: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
};

export default function WebTabBar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || (path !== '/tabs' && pathname.startsWith(path));

    const tabs = [
        { name: 'Accueil', path: '/tabs', icon: icons.home },
        { name: 'Entreprise', path: '/tabs/entreprise', icon: icons.briefcase },
        { name: 'Finance', path: '/tabs/finance', icon: icons.wallet },
        { name: 'Profil', path: '/tabs/profile', icon: icons.user },
    ];

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '60px',
            borderTop: '1px solid #e5e5e5',
            backgroundColor: '#ffffff',
            position: 'fixed',
            bottom: 0,
            width: '100%',
            zIndex: 100
        }}>
            {tabs.map((tab) => {
                const active = isActive(tab.path);
                return (
                    <Link
                        key={tab.path}
                        href={tab.path}
                        style={{
                            textDecoration: 'none',
                            color: active ? '#059669' : '#999999',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {tab.icon}
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            marginTop: '4px',
                            textTransform: 'uppercase'
                        }}>
                            {tab.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
