'use client';

import React from 'react';
import styles from './ResponsiveContainer.module.css';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    maxWidth?: number;
}

export default function ResponsiveContainer({
    children,
    style,
    maxWidth = 1200
}: ResponsiveContainerProps) {
    return (
        <div className={styles.container} style={style}>
            <div className={styles.content} style={{ maxWidth }}>
                {children}
            </div>
        </div>
    );
}
