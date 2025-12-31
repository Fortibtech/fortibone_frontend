import { useRouter as useNextRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useCallback } from 'react';

// Mock useFocusEffect - uses useEffect on web
export const useFocusEffect = (callback: () => void | (() => void)) => {
    useEffect(() => {
        const unsubscribe = callback();
        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [callback]);
};

// Mock useRouter
export const useRouter = () => {
    const router = useNextRouter();

    const normalizePath = (path: string) => {
        // Replace /(tabs) with /tabs
        let newPath = path.replace(/\/\(tabs\)/g, '/tabs');

        // Remove other groups like /(auth), /(professionnel) -> become root relative or kept if folder exists
        // Actually Next.js route groups are transparent in URL.
        // So /(auth)/login means /login.
        // But /(professionnel) might be a group that contains pages.

        // Regex to remove other groups: replace '/(something)/' with '/'
        // But keep /tabs since we made it a real path.
        // If we processed /tabs first, we are good.

        // Global replace for any other (name) group
        newPath = newPath.replace(/\/\([^)]+\)/g, '');

        // Fix double slashes
        newPath = newPath.replace(/\/\//g, '/');

        if (newPath === '') newPath = '/';

        return newPath;
    };

    const resolvePath = (href: string | { pathname: string, params?: Record<string, any> }) => {
        if (typeof href === 'string') {
            return normalizePath(href);
        }
        let p = href.pathname;
        if (href.params) {
            Object.keys(href.params).forEach(key => {
                p = p.replace(`[${key}]`, href.params![key]);
            });
        }
        return normalizePath(p);
    };

    return {
        push: (href: string | { pathname: string, params?: Record<string, any> }) => router.push(resolvePath(href)),
        replace: (href: string | { pathname: string, params?: Record<string, any> }) => router.replace(resolvePath(href)),
        back: () => router.back(),
        canGoBack: () => true, // Mock
        setParams: () => { }, // Mock
    };
};

export const useLocalSearchParams = () => {
    const searchParams = useSearchParams();
    const params = useParams(); // Get path params

    const combined: Record<string, string | string[]> = { ...params };

    if (searchParams) {
        searchParams.forEach((value, key) => {
            combined[key] = value;
        });
    }
    return combined;
};

// Mock Stack
export const Stack = Object.assign(
    (props: any) => <>{props.children}</>,
    {
        Screen: () => null,
    }
);

export const Tabs = Object.assign(
    (props: any) => <>{props.children}</>,
    {
        Screen: () => null,
    }
);

// Mock Link if needed, though next/link is different
// Expo Link accepts `href` which is same as Next Link.
export { Link };

// Singleton router object
export const router = {
    push: (href: string | { pathname: string, params?: Record<string, any> }) => {
        // We can't use hooks here, but we can try to access the global logic if we had a way.
        // Or we can rely on a hack: accessing window.history if possible, or just warning.
        // Better yet: Since this is used in components, we can potentially rely on the hook if we change how it's used.
        // But the static `router` is often used outside components or in callbacks where hooks are invalid.
        // For a pure web mock without context, functionality is limited.
        console.warn('Router.push called outside of React context or via static method. Navigation might not work as expected in this mock.');
        if (typeof window !== 'undefined') {
            // Basic location change fallback
            const path = typeof href === 'string' ? href : href.pathname; // simplification
            window.location.href = path.replace(/\/\(tabs\)/g, '/tabs');
        }
    },
    replace: (href: string | { pathname: string, params?: Record<string, any> }) => {
        if (typeof window !== 'undefined') {
            const path = typeof href === 'string' ? href : href.pathname;
            window.location.replace(path.replace(/\/\(tabs\)/g, '/tabs'));
        }
    },
    back: () => {
        if (typeof window !== 'undefined') window.history.back();
    },
    canGoBack: () => true,
    setParams: () => { }
};

export default {
    useRouter,
    useLocalSearchParams,
    useFocusEffect,
    Stack,
    Tabs,
    Link,
    router // Export the singleton
};

