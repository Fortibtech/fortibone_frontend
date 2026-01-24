'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import WebStatisticsView from '@/components/business/WebStatisticsView';

export default function AnalyticsPage() {
    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="RESTAURATEUR" title="Statistiques">
                <WebStatisticsView businessType="RESTAURATEUR" />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
