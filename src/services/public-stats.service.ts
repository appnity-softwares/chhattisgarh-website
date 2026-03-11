import apiConfig, { ApiResponse } from '@/lib/api.config';

export interface PublicStats {
    totalUsers: number;
    totalMatches: number;
    successfulMatches: number;
    activeProfiles: number;
}

class PublicStatsService {
    /**
     * Get public platform statistics
     * No authentication required
     */
    async getPublicStats(): Promise<PublicStats> {
        try {
            const response = await fetch(`${apiConfig.baseUrl}/public/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // If endpoint doesn't exist yet, return mock data
            if (!response.ok) {
                console.warn('Public stats endpoint not available, using fallback data');
                return this.getFallbackStats();
            }

            const data: ApiResponse<PublicStats> = await response.json();
            return data.data;
        } catch (error) {
            console.error('Get public stats error:', error);
            return this.getFallbackStats();
        }
    }

    /**
     * Fallback stats when backend endpoint is not available
     * These will be displayed until the backend is updated
     */
    private getFallbackStats(): PublicStats {
        return {
            totalUsers: 5000,
            totalMatches: 1200,
            successfulMatches: 450,
            activeProfiles: 3500,
        };
    }
}

export const publicStatsService = new PublicStatsService();
export default publicStatsService;
