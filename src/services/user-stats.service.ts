import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { PaginatedResponse } from '@/lib/api.config';

// User Stats Types
export interface ProfileViewStats {
    totalViews: number;
    recentViewers: ProfileViewer[];
}

export interface ProfileViewer {
    id: number;
    viewedAt: string;
    viewer: {
        id: number;
        profile?: {
            firstName: string;
            lastName: string;
            profilePicture?: string;
            city?: string;
            state?: string;
        };
    };
}

export interface MatchStats {
    sentCount: number;
    receivedCount: number;
    acceptedCount: number;
}

export interface UserDashboardStats {
    profileViews: number;
    matchesSent: number;
    matchesReceived: number;
    matchesAccepted: number;
    shortlistCount: number;
    isPremium: boolean;
    subscriptionStatus?: string;
    subscriptionExpiry?: string;
}

class UserStatsService {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        const storage = localStorage.getItem('user-auth-storage');
        if (!storage) return null;
        try {
            const parsed = JSON.parse(storage);
            return parsed.state?.accessToken || null;
        } catch {
            return null;
        }
    }

    private async fetchWithAuth<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getToken();

        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(token),
                ...options.headers,
            },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data.data;
    }

    /**
     * Get profile view stats - who viewed the user's profile
     */
    async getProfileViews(): Promise<{ data: unknown[]; total: number }> {
        try {
            const result = await this.fetchWithAuth<PaginatedResponse<unknown>>(
                `${apiConfig.endpoints.views.visitors}?page=1&limit=10`
            );
            return {
                data: result.data || [],
                total: result.pagination?.total || 0,
            };
        } catch (error) {
            console.error('Get profile views error:', error);
            return { data: [], total: 0 };
        }
    }

    /**
     * Get match requests sent by the user
     */
    async getSentMatchesCount(): Promise<number> {
        try {
            const result = await this.fetchWithAuth<PaginatedResponse<unknown>>(
                '/matches/sent?page=1&limit=1'
            );
            return result.pagination?.total || 0;
        } catch (error) {
            console.error('Get sent matches error:', error);
            return 0;
        }
    }

    /**
     * Get match requests received by the user
     */
    async getReceivedMatchesCount(): Promise<number> {
        try {
            const result = await this.fetchWithAuth<PaginatedResponse<unknown>>(
                '/matches/received?page=1&limit=1'
            );
            return result.pagination?.total || 0;
        } catch (error) {
            console.error('Get received matches error:', error);
            return 0;
        }
    }

    /**
     * Get accepted matches count
     */
    async getAcceptedMatchesCount(): Promise<number> {
        try {
            const result = await this.fetchWithAuth<PaginatedResponse<unknown>>(
                '/matches/accepted?page=1&limit=1'
            );
            return result.pagination?.total || 0;
        } catch (error) {
            console.error('Get accepted matches error:', error);
            return 0;
        }
    }

    /**
     * Get shortlist count
     */
    async getShortlistCount(): Promise<number> {
        try {
            const result = await this.fetchWithAuth<PaginatedResponse<unknown>>(
                `${apiConfig.endpoints.shortlists.list}?page=1&limit=1`
            );
            return result.pagination?.total || 0;
        } catch (error) {
            console.error('Get shortlist error:', error);
            return 0;
        }
    }

    /**
     * Get user's subscription status
     */
    async getSubscriptionStatus(): Promise<{
        isPremium: boolean;
        status?: string;
        expiry?: string;
    }> {
        try {
            const [access, user] = await Promise.all([
                this.fetchWithAuth<{ isPremium: boolean }>(apiConfig.endpoints.users.access),
                this.fetchWithAuth<{ subscriptions: Array<{ status: string; endDate?: string }> }>(apiConfig.endpoints.users.me),
            ]);

            const activeSubscription = user?.subscriptions?.find(
                (subscription: { status: string; endDate?: string }) =>
                    subscription.status === 'ACTIVE' &&
                    (!subscription.endDate || new Date(subscription.endDate) > new Date())
            );

            return {
                isPremium: access?.isPremium || false,
                status: activeSubscription?.status,
                expiry: activeSubscription?.endDate,
            };
        } catch (error) {
            console.error('Get subscription error:', error);
            return { isPremium: false };
        }
    }

    /**
     * Get all dashboard stats combined
     */
    async getDashboardStats(): Promise<UserDashboardStats> {
        try {
            const [
                profileViews,
                matchesSent,
                matchesReceived,
                matchesAccepted,
                shortlistCount,
                subscription,
            ] = await Promise.all([
                this.getProfileViews(),
                this.getSentMatchesCount(),
                this.getReceivedMatchesCount(),
                this.getAcceptedMatchesCount(),
                this.getShortlistCount(),
                this.getSubscriptionStatus(),
            ]);

            return {
                profileViews: profileViews.total,
                matchesSent,
                matchesReceived,
                matchesAccepted,
                shortlistCount,
                isPremium: subscription.isPremium,
                subscriptionStatus: subscription.status,
                subscriptionExpiry: subscription.expiry,
            };
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            throw error;
        }
    }
}

export const userStatsService = new UserStatsService();
export default userStatsService;
