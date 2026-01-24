'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    city?: string;
    country?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        city: '',
        country: '',
    });

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phoneNumber: userData.phoneNumber || '',
                city: userData.city || '',
                country: userData.country || '',
            });
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('/api-proxy/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setIsEditing(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <Link href="/" style={{ color: 'var(--color-gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        ← Retour au dashboard
                    </Link>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                        👤 Mon Profil
                    </h1>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--color-error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    🚪 Déconnexion
                </button>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? 'var(--color-primary-50)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-error)',
                }}>
                    {message.text}
                </div>
            )}

            {/* Profile Card */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Informations personnelles</h3>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            ✏️ Modifier
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'var(--color-gray-100)',
                                    color: 'var(--color-gray-600)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                {isSaving ? 'Enregistrement...' : '💾 Enregistrer'}
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-gray-500)', marginBottom: '6px' }}>
                            Prénom
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        ) : (
                            <p style={{ fontSize: '16px', color: 'var(--color-gray-900)', fontWeight: '500' }}>
                                {user?.firstName || '-'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-gray-500)', marginBottom: '6px' }}>
                            Nom
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        ) : (
                            <p style={{ fontSize: '16px', color: 'var(--color-gray-900)', fontWeight: '500' }}>
                                {user?.lastName || '-'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-gray-500)', marginBottom: '6px' }}>
                            Email
                        </label>
                        <p style={{ fontSize: '16px', color: 'var(--color-gray-900)', fontWeight: '500' }}>
                            {user?.email || '-'}
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-gray-500)', marginBottom: '6px' }}>
                            Téléphone
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        ) : (
                            <p style={{ fontSize: '16px', color: 'var(--color-gray-900)', fontWeight: '500' }}>
                                {user?.phoneNumber || '-'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-gray-500)', marginBottom: '6px' }}>
                            Ville
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        ) : (
                            <p style={{ fontSize: '16px', color: 'var(--color-gray-900)', fontWeight: '500' }}>
                                {user?.city || '-'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-gray-500)', marginBottom: '6px' }}>
                            Pays
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        ) : (
                            <p style={{ fontSize: '16px', color: 'var(--color-gray-900)', fontWeight: '500' }}>
                                {user?.country || '-'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
