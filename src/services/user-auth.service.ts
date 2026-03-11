import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { AuthResponse } from '@/types/api.types';

class UserAuthService {
    /**
     * Exchange Google authorization code with backend for JWT tokens
     * Note: Unlike admin auth, this does NOT check for admin role
     */
    async authenticateWithBackend(authorizationCode: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.google}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    authorizationCode,
                    redirectUri: window.location.origin,
                }),
            });

            const data: ApiResponse<AuthResponse> = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            return data.data;
        } catch (error: any) {
            console.error('User Auth Error:', error);
            throw new Error(error.message || 'Failed to authenticate');
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.refresh}`, {
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
            await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.logout}`, {
                method: 'POST',
                headers: getAuthHeaders(accessToken),
                body: JSON.stringify({ refreshToken }),
            });
        } catch (error) {
            console.error('User logout error:', error);
        }
    }
}

export const userAuthService = new UserAuthService();
export default userAuthService;
