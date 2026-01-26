'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true); // Toggle state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = `${apiUrl}/auth/${isLogin ? 'login' : 'register'}`;

        const payload = isLogin
            ? { email, password }
            : { email, password, firstName, lastName, profileType: 'PRO' };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = 'Erreur inconnue';
                try {
                    const data = await response.json();
                    errorMessage = data.message || (isLogin ? 'Identifiants incorrects' : 'Erreur inscription');
                } catch (e) {
                    errorMessage = `Erreur serveur (${response.statusText || response.status})`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Store token
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Required for layout auth check

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.logo}>K</div>
                <h1 className={styles.title}>KomoraLink Admin</h1>
                <p className={styles.subtitle}>
                    {isLogin ? 'Connectez-vous pour accéder au dashboard' : 'Créer un compte Administrateur'}
                </p>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Prénom</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Admin"
                                    required={!isLogin}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nom</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Komora"
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="admin@komoralink.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                        style={{
                            background: isLogin ? '#0f172a' : '#00c9a7' // Different color for register
                        }}
                    >
                        {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer le compte')}
                    </button>
                </form>

                {/* 
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {isLogin ? 'Pas de compte ? Créer un accès Admin' : 'Déjà un compte ? Se connecter'}
                    </button>
                </div>
                */}

                <p className={styles.footer}>
                    © 2026 KomoraLink - FORTIBTECH
                </p>
            </div>
        </div>
    );
}
