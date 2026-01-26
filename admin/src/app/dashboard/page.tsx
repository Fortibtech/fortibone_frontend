'use client';

import Link from 'next/link';
import styles from '../page.module.css';

export default function AdminDashboardPage() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.chartHeader}>
        <h1 className={styles.chartTitle} style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
          Bienvenue sur KomoraLink Admin
        </h1>
        <p style={{ color: '#64748b' }}>
          Version Carrières - Gestion du Recrutement
        </p>
      </div>

      <div className={styles.chartsGrid} style={{ marginTop: '20px' }}>
        {/* Recruitment Management Card - Main Focus */}
        <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>💼 Gestion des Carrières</h3>
          </div>
          <div className={styles.chartContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤝</div>
            <h2 style={{ marginBottom: '10px' }}>Offres d'emploi & Recrutement</h2>
            <p style={{ marginBottom: '24px', color: '#64748b', maxWidth: '500px' }}>
              Gérez les postes ouverts, suivez les candidatures et mettez à jour le portail de recrutement public.
            </p>
            <Link href="/dashboard/careers" style={{
              background: '#0f172a',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Accéder au module Carrières →
            </Link>
          </div>
        </div>

        {/* System Status - Static for now */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>🔔 État du système</h3>
          </div>
          <div className={styles.alertsList}>
            <div className={styles.alertItem}>
              <div className={styles.alertIcon}>✅</div>
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>Module Carrières Actif</div>
                <div className={styles.alertDescription}>API connectée et opérationnelle</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
