import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';

export interface RevenueData {
    month: string;
    year: number;
    revenue: number;
}

export interface RevenueAnalytics {
    data: RevenueData[];
    totalRevenue: number;
    growth: number;
}

export interface DistrictData {
    district: string;
    users: number;
}

export interface SignupAnalytics {
    data: DistrictData[];
    newUsers30d: number;
    growth: number;
}

export interface SubscriptionData {
    plan: string;
    count: number;
}

export interface SubscriptionAnalytics {
    activeSubscriptions: number;
    mostPopularPlan: string;
    breakdown: SubscriptionData[];
}

class AnalyticsService {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        const storage = localStorage.getItem('admin-auth-storage');
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

        const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(token || undefined),
                ...options.headers,
            },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data.data;
    }

    async getRevenueAnalytics(months: number = 6): Promise<RevenueAnalytics> {
        return this.fetchWithAuth<RevenueAnalytics>(
            `${apiConfig.endpoints.admin.analyticsRevenue}?months=${months}`
        );
    }

    async getSignupAnalytics(limit: number = 10): Promise<SignupAnalytics> {
        return this.fetchWithAuth<SignupAnalytics>(
            `${apiConfig.endpoints.admin.analyticsSignups}?limit=${limit}`
        );
    }

    async getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
        return this.fetchWithAuth<SubscriptionAnalytics>(
            apiConfig.endpoints.admin.analyticsSubscriptions
        );
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
