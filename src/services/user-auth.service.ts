import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { AuthResponse } from '@/types/api.types';

class UserAuthService {
    /**
     * Authenticate with Firebase ID Token (Phone Login)
     */
    async authenticateWithPhone(firebaseIdToken: string): Promise<AuthResponse & { isNewUser: boolean }> {
        try {
            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.auth.phoneLogin}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    firebaseIdToken,
                    deviceInfo: {
                        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Web',
                        deviceType: 'WEB'
                    }
                }),
            });

            const data: ApiResponse<AuthResponse & { isNewUser: boolean }> = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Phone authentication failed');
            }

            return data.data;
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error('Phone Auth Error:', err);
            throw new Error(err.message || 'Failed to authenticate with phone');
        }
    }

    async authenticateWithBackend(): Promise<AuthResponse> {
        throw new Error('Google authorization-code login is not supported by the current backend contract.');
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
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error('Token Refresh Error:', err);
            throw new Error(err.message || 'Failed to refresh token');
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
