'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { getAllBusinesses, getBusinessCountByType, getGlobalStats, type BusinessType } from '../../lib/api/adminApi';

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString('fr-FR');
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface KPIData {
  totalUsers: number;
  totalBusinesses: number;
  totalVolume: number;
  totalTransactions: number;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'success';
  title: string;
  description: string;
  time: string;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPIData>({
    totalUsers: 0,
    totalBusinesses: 0,
    totalVolume: 0,
    totalTransactions: 0,
  });
  const [businessCounts, setBusinessCounts] = useState<BusinessType>({
    COMMERCANT: 0,
    FOURNISSEUR: 0,
    RESTAURATEUR: 0,
    LIVREUR: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch real data from API
        const [globalStats, counts] = await Promise.all([
          getGlobalStats(),
          getBusinessCountByType(),
        ]);

        setKpis({
          totalUsers: globalStats.totalUsers,
          totalBusinesses: globalStats.totalBusinesses,
          totalVolume: globalStats.totalVolume,
          totalTransactions: globalStats.totalTransactions,
        });

        setBusinessCounts(counts);

        // Generate alerts based on real data
        const newAlerts: Alert[] = [];

        if (counts.COMMERCANT === 0 && counts.FOURNISSEUR === 0) {
          newAlerts.push({
            id: '1',
            type: 'warning',
            title: 'Aucun commerce actif',
            description: 'Aucun commerçant ou fournisseur enregistré sur la plateforme',
            time: 'Maintenant',
          });
        }

        if (globalStats.totalBusinesses > 0) {
          newAlerts.push({
            id: '2',
            type: 'success',
            title: 'Plateforme active',
            description: `${globalStats.totalBusinesses} entreprise(s) enregistrée(s)`,
            time: 'Maintenant',
          });
        }

        setAlerts(newAlerts);
      } catch (err: any) {
        console.error('Erreur chargement données:', err);
        setError(err.message || 'Erreur de connexion à l\'API');

        // Fallback to mock data if API fails
        setKpis({
          totalUsers: 0,
          totalBusinesses: 0,
          totalVolume: 0,
          totalTransactions: 0,
        });

        setAlerts([{
          id: 'error',
          type: 'critical',
          title: 'Erreur API',
          description: 'Impossible de charger les données. Vérifiez votre connexion.',
          time: 'Maintenant',
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Chargement du dashboard...</span>
      </div>
    );
  }

  const totalProfiles =
    businessCounts.COMMERCANT +
    businessCounts.FOURNISSEUR +
    businessCounts.RESTAURATEUR +
    businessCounts.LIVREUR;

  // Estimate particuliers
  const particuliersCount = totalProfiles * 3;

  return (
    <div className={styles.dashboard}>
      {/* Error Banner */}
      {error && (
        <div className={styles.alertItem} style={{ marginBottom: '20px', borderLeft: '3px solid var(--color-error)' }}>
          <div className={`${styles.alertIcon} ${styles.critical}`}>⚠️</div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitle}>Erreur de connexion API</div>
            <div className={styles.alertDescription}>{error}</div>
          </div>
        </div>
      )}

      <div className={styles.dashboardContent}>

        {/* TOP ACTIONS BAR */}
        <div className={styles.actionsBar}>
          <button className={styles.actionBtn}>
            <span>🗓️</span> {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </button>
          <button className={styles.actionBtn}>
            <span>📢</span> Nouvelle Notification
          </button>
          <button className={styles.actionBtn}>
            <span>📄</span> Exporter Rapport
          </button>
        </div>

        {/* 1. KPI CARDS */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIcon}>👥</div>
              <span className={`${styles.kpiTrend} ${styles.positive}`}>Live</span>
            </div>
            <div className={styles.kpiValue}>{formatNumber(kpis.totalUsers)}</div>
            <div className={styles.kpiLabel}>Utilisateurs actifs</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIcon}>🏢</div>
              <span className={`${styles.kpiTrend} ${styles.positive}`}>API</span>
            </div>
            <div className={styles.kpiValue}>{formatNumber(kpis.totalBusinesses)}</div>
            <div className={styles.kpiLabel}>Entreprises</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIcon}>💰</div>
              <span className={`${styles.kpiTrend} ${styles.positive}`}>--</span>
            </div>
            <div className={styles.kpiValue}>{formatCurrency(kpis.totalVolume)}</div>
            <div className={styles.kpiLabel}>Volume d'affaires</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIcon}>📊</div>
              <span className={`${styles.kpiTrend} ${styles.positive}`}>--</span>
            </div>
            <div className={styles.kpiValue}>{formatNumber(kpis.totalTransactions)}</div>
            <div className={styles.kpiLabel}>Transactions</div>
          </div>
        </div>

        {/* 2. CHARTS SECTION */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>📈 Croissance Utilisateurs</h3>
              <div className={styles.chartPeriod}>
                <button className={`${styles.periodBtn} ${styles.active}`}>30J</button>
                <button className={styles.periodBtn}>7J</button>
                <button className={styles.periodBtn}>24H</button>
              </div>
            </div>
            <div className={styles.chartContent}>
              <div className={styles.chartPlaceholder}>
                <span>📊</span>
                <p>Graphique d'acquisition</p>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>🥧 Répartition</h3>
            </div>
            <div className={styles.chartContent}>
              <div className={styles.chartPlaceholder}>
                <span>🎯</span>
                <p>Mix Professionnels</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ALERTS & ACTIVITY (Full Width Grid) */}
        <div className={styles.alertsGrid}>
          <div className={styles.alertsCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>🔔 Alertes Système</h3>
            </div>
            <div className={styles.alertsList}>
              {alerts.length === 0 ? (
                <div className={styles.alertItem}>
                  <div className={`${styles.alertIcon} ${styles.success}`}>✅</div>
                  <div className={styles.alertContent}>
                    <div className={styles.alertTitle}>Système opérationnel</div>
                    <div className={styles.alertDescription}>Aucune anomalie détectée</div>
                  </div>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className={styles.alertItem}>
                    <div className={`${styles.alertIcon} ${styles[alert.type]}`}>
                      {alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '⚠️' : '✅'}
                    </div>
                    <div className={styles.alertContent}>
                      <div className={styles.alertTitle}>{alert.title}</div>
                      <div className={styles.alertDescription}>{alert.description}</div>
                      <div className={styles.alertTime}>{alert.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.alertsCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>⚡ Activité Récente</h3>
            </div>
            <div className={styles.alertsList}>
              <div className={styles.alertItem}>
                <div className={`${styles.alertIcon} ${styles.success}`}>💰</div>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>Paiement Reçu</div>
                  <div className={styles.alertDescription}>Commande #8829 - 45.00€</div>
                  <div className={styles.alertTime}>Il y a 2 min</div>
                </div>
              </div>
              <div className={styles.alertItem}>
                <div className={`${styles.alertIcon} ${styles.warning}`}>👤</div>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>Nouveau Commerçant</div>
                  <div className={styles.alertDescription}>Validation Kbis requise</div>
                  <div className={styles.alertTime}>Il y a 15 min</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PROFILES STATS */}
        <div className={styles.profileStatsGrid}>
          <Link href="/profils/particuliers" className={styles.profileStatCard}>
            <div className={styles.profileIcon}>👤</div>
            <div className={styles.profileCount}>{formatNumber(particuliersCount)}</div>
            <div className={styles.profileName}>Particuliers</div>
          </Link>
          <Link href="/profils/commercants" className={styles.profileStatCard}>
            <div className={styles.profileIcon}>🏪</div>
            <div className={styles.profileCount}>{formatNumber(businessCounts.COMMERCANT)}</div>
            <div className={styles.profileName}>Commerçants</div>
          </Link>
          <Link href="/profils/fournisseurs" className={styles.profileStatCard}>
            <div className={styles.profileIcon}>📦</div>
            <div className={styles.profileCount}>{formatNumber(businessCounts.FOURNISSEUR)}</div>
            <div className={styles.profileName}>Fournisseurs</div>
          </Link>
          <Link href="/profils/restaurateurs" className={styles.profileStatCard}>
            <div className={styles.profileIcon}>🍽️</div>
            <div className={styles.profileCount}>{formatNumber(businessCounts.RESTAURATEUR)}</div>
            <div className={styles.profileName}>Restaurateurs</div>
          </Link>
          <Link href="/profils/livreurs" className={styles.profileStatCard}>
            <div className={styles.profileIcon}>🚴</div>
            <div className={styles.profileCount}>{formatNumber(businessCounts.LIVREUR)}</div>
            <div className={styles.profileName}>Livreurs</div>
          </Link>
        </div>

      </div>
    </div>
  );
}
