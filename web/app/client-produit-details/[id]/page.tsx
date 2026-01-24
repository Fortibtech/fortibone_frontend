'use client';

import React from 'react';
import styles from './page.module.css';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Détails du produit</h1>
                <p>ID: {params.id}</p>
                <p>Cette page est en cours de développement.</p>
            </div>
        </div>
    );
}
