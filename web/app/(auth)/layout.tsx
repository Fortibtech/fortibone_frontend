'use client';

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)',
            padding: '40px 16px'
        }}>
            {children}
        </div>
    );
}
