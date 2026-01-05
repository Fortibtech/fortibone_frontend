'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import WebStatisticsView from '@/components/business/WebStatisticsView';

export default function StatisticsPage() {
    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="FOURNISSEUR" title="Statistiques">
                <WebStatisticsView businessType="FOURNISSEUR" />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

