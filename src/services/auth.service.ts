import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { AdminLoginResponse } from '@/types/api.types';

class AuthService {
    /**
     * Admin Login with Username/Password
     */
    async adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
        const response = await fetch(`${apiConfig.baseUrl}/admin/login`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ username, password }),
        });

        const data: ApiResponse<AdminLoginResponse> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
        }

        return data.data;
    }

    /**
     * Refresh access token using refresh token with retry logic
     */
    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const MAX_RETRIES = 2;
        const RETRY_DELAY = 1000;
        let attempt = 0;

        while (attempt < MAX_RETRIES) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(`${apiConfig.baseUrl}/auth/refresh`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ refreshToken }),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                const data = await response.json();

                if (!response.ok) {
                    // If refresh token is invalid/expired, don't retry
                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Session expired. Please login again.');
                    }
                    throw new Error(data.message || 'Token refresh failed');
                }

                return {
                    accessToken: data.data.accessToken,
                    refreshToken: data.data.refreshToken || refreshToken, // Use old refresh token if new one not provided
                };
            } catch (error: unknown) {
                attempt++;
                
                // Don't retry on abort or invalid refresh token
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error('Request timed out');
                }
                
                if (error instanceof Error && error.message.includes('Session expired')) {
                    throw error;
                }

                if (attempt >= MAX_RETRIES) {
                    const err = error as { message?: string };
                    throw new Error(err.message || 'Failed to refresh token');
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            }
        }

        throw new Error('Failed to refresh token after multiple attempts');
    }

    /**
     * Logout from backend with proper cleanup
     */
    async logout(accessToken: string, refreshToken: string): Promise<void> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${apiConfig.baseUrl}/auth/logout`, {
                method: 'POST',
                headers: getAuthHeaders(accessToken),
                body: JSON.stringify({ refreshToken }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Don't throw error for logout failures - cleanup is more important
            if (!response.ok) {
                // Log error but don't throw to ensure local cleanup happens
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Backend logout failed:', response.status);
                }
            }
        } catch (error: unknown) {
            // Always ensure cleanup happens even if backend logout fails
            if (process.env.NODE_ENV === 'development') {
                console.warn('Backend logout error:', error);
            }
        }
    }
}

export const authService = new AuthService();
export default authService;
