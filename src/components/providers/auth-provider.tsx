'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUserAuthStore } from '@/stores/user-auth-store';
import { useEffect, useMemo } from 'react';
import { QueryProvider } from './query-provider';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    
    // Admin Store
    const admin = useAuthStore();
    // User Store
    const user = useUserAuthStore();

    const isDashboardRoute = pathname?.startsWith('/dashboard');
    const isAdminRoute = pathname?.startsWith('/admin') && pathname !== '/admin-secure-login';

    const isAuthenticated = isDashboardRoute ? user.isAuthenticated : admin.isAuthenticated;
    const accessToken = isDashboardRoute ? user.accessToken : admin.accessToken;

    // Socket Connection Management
    useEffect(() => {
        let isCurrent = true;

        const syncSocket = async () => {
            const { socketService } = await import('@/lib/socket.service');
            if (!isCurrent) return;

            if (isAuthenticated && accessToken) {
                socketService.connect(accessToken);
            } else {
                socketService.disconnect();
            }
        };

        syncSocket();

        return () => {
            isCurrent = false;
        };
    }, [isAuthenticated, accessToken]);

    // Protect routes
    useEffect(() => {
        const isLoginRoute = pathname === '/admin-secure-login' || pathname === '/login';

        // 1. If trying to access dashboard but not authenticated as user
        if (isDashboardRoute && !user.isAuthenticated) {
            router.push('/login');
            return;
        }

        // 2. If trying to access admin but not authenticated as admin
        if (isAdminRoute && !admin.isAuthenticated) {
            router.push('/admin-secure-login');
            return;
        }

        // 3. If at login but already authenticated
        if (isLoginRoute) {
            if (pathname === '/admin-secure-login' && admin.isAuthenticated) {
                router.push('/admin');
            } else if (pathname === '/login' && user.isAuthenticated) {
                router.push('/dashboard');
            }
        }
    }, [pathname, user.isAuthenticated, admin.isAuthenticated, router, isDashboardRoute, isAdminRoute]);

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryProvider>
                {children}
            </QueryProvider>
        </GoogleOAuthProvider>
    );
}

