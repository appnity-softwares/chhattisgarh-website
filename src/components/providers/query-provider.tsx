'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient with optimized defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Keep cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Retry failed requests 2 times
            retry: 2,
            // Refetch on window focus for web (good UX)
            refetchOnWindowFocus: true,
        },
        mutations: {
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export { queryClient };
