'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './about.module.css';

interface AboutLayoutProps {
    children: React.ReactNode;
}

export default function AboutLayout({ children }: AboutLayoutProps) {
    const pathname = usePathname();

    return (
        <div className={styles.aboutLayout}>
            {/* Header */}
            <header className={styles.aboutHeader}>
                <div className={styles.headerContent}>
                    <Link href="/about" className={styles.brand}>
                        <div className={styles.logo}>K</div>
                        <span className={styles.brandName}>KomoraLink</span>
                    </Link>

                    <nav className={styles.headerNav}>
                        <Link
                            href="/about"
                            className={`${styles.navLink} ${pathname === '/about' ? styles.active : ''}`}
                        >
                            À Propos
                        </Link>
                        <Link
                            href="/about/vision"
                            className={`${styles.navLink} ${pathname === '/about/vision' ? styles.active : ''}`}
                        >
                            Vision
                        </Link>
                        <Link
                            href="/about/fortibtech"
                            className={`${styles.navLink} ${pathname === '/about/fortibtech' ? styles.active : ''}`}
                        >
                            FORTIBTECH
                        </Link>
                        <Link href="/docs" className={styles.navLink}>
                            Documentation
                        </Link>
                        <Link href="/" className={styles.navLink}>
                            Dashboard ↗
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            {children}

            {/* Footer */}
            <footer className={styles.aboutFooter}>
                <div className={styles.footerContent}>
                    <p className={styles.footerText}>
                        © 2024 KomoraLink by FORTIBTECH. Tous droits réservés.
                    </p>
                    <div className={styles.footerLinks}>
                        <Link href="/docs" className={styles.footerLink}>Documentation</Link>
                        <Link href="/about/vision" className={styles.footerLink}>Vision</Link>
                        <a href="mailto:contact@komoralink.com" className={styles.footerLink}>Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
