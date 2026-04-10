import apiConfig, { ApiResponse } from '@/lib/api.config';
import apiService from '@/lib/api.service';
import { withMock, mockData } from './mock.data';

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
    // Helper to extract response data
    private async handleResponse<T>(promise: Promise<any>): Promise<T> {
        try {
            const res = await promise;
            return res.data?.data || res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }

    async getRevenueAnalytics(months: number = 6): Promise<RevenueAnalytics> {
        return withMock(mockData.revenue, () =>
            this.handleResponse<RevenueAnalytics>(
                apiService.get(apiConfig.endpoints.admin.analyticsRevenue, { params: { months } })
            )
        );
    }

    async getSignupAnalytics(limit: number = 10): Promise<SignupAnalytics> {
        return withMock(mockData.signups, () =>
            this.handleResponse<SignupAnalytics>(
                apiService.get(apiConfig.endpoints.admin.analyticsSignups, { params: { limit } })
            )
        );
    }

    async getSubscriptionAnalytics(): Promise<SubscriptionAnalytics> {
        return withMock(mockData.subscriptions, () =>
            this.handleResponse<SubscriptionAnalytics>(
                apiService.get(apiConfig.endpoints.admin.analyticsSubscriptions)
            )
        );
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
