import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/api.types';

interface UserAuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface UserAuthActions {
    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateAccessToken: (accessToken: string) => void;
    clearError: () => void;
}

type UserAuthStore = UserAuthState & UserAuthActions;

const initialState: UserAuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const useUserAuthStore = create<UserAuthStore>()(
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
        }),
        {
            name: 'user-auth-storage', // Separate from admin storage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
