'use client';

import { Toaster } from 'sonner';

/**
 * Global Toast Provider - Aligné avec react-native-toast-message du mobile
 * Utilise sonner pour une intégration élégante et performante sur web
 */
export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-center"
            richColors
            closeButton
            toastOptions={{
                duration: 3000,
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
                classNames: {
                    success: 'sonner-success',
                    error: 'sonner-error',
                    info: 'sonner-info',
                    warning: 'sonner-warning',
                },
            }}
        />
    );
}
