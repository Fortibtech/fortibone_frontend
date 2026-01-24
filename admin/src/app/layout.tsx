import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KomoraLink - L\'Écosystème Digital des Comores',
  description: 'Connectez-vous à la première plateforme tout-en-un pour commerçants, livreurs et fournisseurs aux Comores. Simplifiez, vendez, encaissez.',
  icons: {
    icon: '/logo-icon.png',
  },
  openGraph: {
    title: 'KomoraLink - L\'Avenir du Commerce aux Comores',
    description: 'Une plateforme unique pour Grossistes, Commerçants et Livreurs. Rejoignez la révolution digitale.',
    images: [{ url: '/logo-full.png', width: 1200, height: 630 }],
    type: 'website',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
