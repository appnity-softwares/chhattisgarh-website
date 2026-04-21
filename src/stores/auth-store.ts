import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/api.types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateAccessToken: (accessToken: string) => void;
    clearError: () => void;
    setHasHydrated: (state: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    hasHydrated: false,
    isLoading: false,
    error: null,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            ...initialState,

            setUser: (user) =>
                set({ user, isAuthenticated: !!user }),

            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            setLoading: (isLoading) =>
                set({ isLoading }),

            setError: (error) =>
                set({ error, isLoading: false }),

            login: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                }),

            logout: () =>
                set({
                    ...initialState,
                }),

            updateAccessToken: (accessToken) =>
                set({ accessToken }),

            clearError: () =>
                set({ error: null }),

            setHasHydrated: (state) => 
                set({ hasHydrated: state }),
        }),
        {
            name: 'admin-auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
