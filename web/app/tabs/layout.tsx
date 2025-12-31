'use client';
import React from 'react';
import WebNavbar from '../../components/navigation/WebNavbar';
import ResponsiveContainer from '../../components/ResponsiveContainer';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
            <WebNavbar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <ResponsiveContainer maxWidth={1200} style={{ backgroundColor: 'transparent' }}>
                    <div style={{ width: '100%', paddingTop: 24, paddingBottom: 40 }}>
                        {children}
                    </div>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
