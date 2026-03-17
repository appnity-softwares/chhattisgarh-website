import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { AuthResponse, AdminLoginResponse } from '@/types/api.types';
import { withMock } from './mock.data';

class AuthService {
    /**
     * Admin Login with Username/Password
     */
    async adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
        return withMock({
            token: 'mock-admin-jwt-token',
            user: { email: username, role: 'ADMIN' }
        }, async () => {
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
        });
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const response = await fetch(`${apiConfig.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed');
            }

            return {
                accessToken: data.data.accessToken,
                refreshToken: data.data.refreshToken,
            };
        } catch (error: any) {
            console.error('Token Refresh Error:', error);
            throw new Error(error.message || 'Failed to refresh token');
        }
    }

    /**
     * Logout from backend
     */
    async logout(accessToken: string, refreshToken: string): Promise<void> {
        try {
            await fetch(`${apiConfig.baseUrl}/auth/logout`, {
                method: 'POST',
                headers: getAuthHeaders(accessToken),
                body: JSON.stringify({ refreshToken }),
            });
        } catch (error) {
            console.error('Backend logout error:', error);
        }
    }
}

export const authService = new AuthService();
export default authService;
