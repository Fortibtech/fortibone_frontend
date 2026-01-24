'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirectUrl') || '/docs'; // Default to docs for users

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // --- ADMIN BYPASS (Hidden) ---
        if (email === 'admin@komoralink.com') {
            setTimeout(() => {
                const mockUser = {
                    email: email,
                    firstName: 'Admin',
                    lastName: 'Komora',
                    id: 'mock_admin_id',
                    role: 'admin'
                };
                localStorage.setItem('access_token', 'mock_token_admin_123');
                localStorage.setItem('user', JSON.stringify(mockUser));
                router.push('/dashboard');
                setIsLoading(false);
            }, 800);
            return;
        }
        // -----------------------------

        try {
            // 1. LOGIN Request
            const loginRes = await fetch('/api-proxy/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!loginRes.ok) {
                const errData = await loginRes.json();
                throw new Error(errData.message || 'Identifiants incorrects');
            }

            const loginData = await loginRes.json();
            const token = loginData.access_token || loginData.token; // Handle variants admin vs user

            if (!token) {
                throw new Error('Erreur: Token non reçu.');
            }

            localStorage.setItem('access_token', token);

            // 2. GET PROFILE Request (Required because login doesn't usually return full user)
            // Try /auth/profile first, then /users/me as fallback
            let profileData;

            const profileRes = await fetch('/api-proxy/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (profileRes.ok) {
                profileData = await profileRes.json();
            } else {
                // Try fallback endpoint 
                const profileResFallback = await fetch('/api-proxy/users/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!profileResFallback.ok) {
                    throw new Error('Impossible de récupérer le profil utilisateur. Code: ' + profileResFallback.status);
                }
                profileData = await profileResFallback.json();
            }

            localStorage.setItem('user', JSON.stringify(profileData));

            // 3. REDIRECT
            // If they came from a specific page (e.g. docs), go back there.
            // Otherwise default to /docs.
            router.push(redirectUrl);

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Erreur de connexion');
            localStorage.removeItem('access_token'); // Clean up partial login
        } finally {
            if (email !== 'admin@komoralink.com') {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.logo}>K</div>
                <h1 className={styles.title}>Connexion</h1>
                <p className={styles.subtitle}>Accédez à votre espace KomoraLink</p>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="votre@email.com"
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
                    >
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Cette section utilise vos identifiants KomoraLink habituels (Mobile/Web).
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Chargement...</div>}>
            <LoginForm />
        </Suspense>
    );
}
