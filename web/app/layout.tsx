import '@/styles/globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import ToastProvider from '@/components/ui/ToastProvider';

export const metadata = {
    title: 'KomoraLink',
    description: 'Plateforme de commerce et services',
    keywords: ['commerce', 'marketplace', 'restaurant', 'livraison'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AuthProvider>
                    {children}
                    <ToastProvider />
                </AuthProvider>
            </body>
        </html>
    );
}
