'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import styles from './about.module.css';

export default function AboutPage() {
    const router = useRouter();

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>À propos</h1>
                    <div style={{ width: 45 }} />
                </div>

                <div className={styles.content}>
                    {/* App Info */}
                    <div className={styles.section}>
                        <div className={styles.appIcon}>📦</div>
                        <h2 className={styles.appName}>KomoraLink</h2>
                        <p className={styles.version}>Version 1.0.0</p>
                        <p className={styles.description}>
                            La plateforme qui connecte commerçants, restaurants, fournisseurs,
                            livreurs et particuliers pour faciliter le commerce local.
                        </p>
                    </div>

                    {/* Links */}
                    <div className={styles.links}>
                        <a href="/terms" target="_blank" className={styles.link}>
                            <span className={styles.linkIcon}>📄</span>
                            <span className={styles.linkText}>Conditions d'utilisation</span>
                            <span className={styles.linkArrow}>→</span>
                        </a>
                        <a href="/privacy" target="_blank" className={styles.link}>
                            <span className={styles.linkIcon}>🔒</span>
                            <span className={styles.linkText}>Politique de confidentialité</span>
                            <span className={styles.linkArrow}>→</span>
                        </a>
                        <a href="/licenses" target="_blank" className={styles.link}>
                            <span className={styles.linkIcon}>⚖️</span>
                            <span className={styles.linkText}>Licences open source</span>
                            <span className={styles.linkArrow}>→</span>
                        </a>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <p className={styles.copyright}>
                            © 2025 KomoraLink. Tous droits réservés.
                        </p>
                        <p className={styles.footerText}>
                            Fait avec ❤️ pour faciliter le commerce local
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
