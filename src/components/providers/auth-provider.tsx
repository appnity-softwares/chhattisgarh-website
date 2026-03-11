'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';
import { QueryProvider } from './query-provider';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, refreshToken, logout } = useAuthStore();

    // Protect admin routes
    useEffect(() => {
        const isAdminRoute = pathname?.startsWith('/admin');
        const isLoginRoute = pathname === '/admin-secure-login';

        if (isAdminRoute && !isAuthenticated) {
            router.push('/admin-secure-login');
        }

        if (isLoginRoute && isAuthenticated) {
            router.push('/admin');
        }
    }, [pathname, isAuthenticated, router]);

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryProvider>
                {children}
            </QueryProvider>
        </GoogleOAuthProvider>
    );
}

