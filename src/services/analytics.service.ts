import apiConfig from '@/lib/api.config';
import apiService from '@/lib/api.service';
import { withMock, mockData } from './mock.data';
import type { AxiosResponse } from 'axios';

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
    private async handleResponse<T>(promise: Promise<AxiosResponse<unknown>>): Promise<T> {
        try {
            const res = await promise;
            const data = res.data as { data?: T };
            return (data?.data || res.data) as T;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            throw new Error(err.response?.data?.message || err.message || 'Request failed');
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
