'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './WebNavbar.module.css';

export default function WebNavbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.includes(path);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <nav className={styles.navbar}>
                    {/* Logo Section */}
                    <Link href="/" className={styles.logoContainer}>
                        <span className={styles.logoIcon}>K</span>
                        <span className={styles.brandName}>KomoraLink</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className={styles.navLinks}>
                        <NavLink
                            title="Accueil"
                            href="/dashboard/particulier"
                            active={isActive('/dashboard/particulier') || pathname === '/'}
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            }
                        />
                        <NavLink
                            title="Achats"
                            href="/dashboard/particulier/orders"
                            active={isActive('/orders')}
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                            }
                        />
                        <NavLink
                            title="Entreprises"
                            href="/dashboard/commercant"
                            active={isActive('/commercant') || isActive('/restaurateur')}
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            }
                        />
                        <NavLink
                            title="Mon Compte"
                            href="/dashboard/particulier/profile"
                            active={isActive('/profile')}
                            icon={
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            }
                        />
                    </div>
                </nav>
            </div>
        </header>
    );
}

interface NavLinkProps {
    title: string;
    href: string;
    active: boolean;
    icon: React.ReactNode;
}

function NavLink({ title, href, active, icon }: NavLinkProps) {
    return (
        <Link href={href} className={`${styles.link} ${active ? styles.linkActive : ''}`}>
            <span className={styles.linkIcon}>{icon}</span>
            <span className={styles.linkText}>{title}</span>
        </Link>
    );
}
