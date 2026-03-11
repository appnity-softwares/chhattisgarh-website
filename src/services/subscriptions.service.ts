import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { SubscriptionPlan } from '@/types/api.types';

class SubscriptionsService {
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

    // Get all subscription plans
    async getPlans(): Promise<SubscriptionPlan[]> {
        return this.fetchWithAuth<SubscriptionPlan[]>(apiConfig.endpoints.admin.plans);
    }

    // Update plan discount
    async updatePlanDiscount(
        planId: string,
        discountPercentage: number,
        discountValidUntil?: string
    ): Promise<SubscriptionPlan> {
        return this.fetchWithAuth<SubscriptionPlan>(
            apiConfig.endpoints.admin.planDiscount(planId),
            {
                method: 'PATCH',
                body: JSON.stringify({ discountPercentage, discountValidUntil }),
            }
        );
    }

    // Update plan details
    async updatePlan(
        planId: string,
        data: {
            name?: string;
            description?: string;
            price?: number;
            durationDays?: number;
            features?: string[];
            isActive?: boolean;
        }
    ): Promise<SubscriptionPlan> {
        return this.fetchWithAuth<SubscriptionPlan>(
            apiConfig.endpoints.admin.planById ?
                apiConfig.endpoints.admin.planById(planId) :
                `${apiConfig.endpoints.admin.plans}/${planId}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            }
        );
    }
}

export const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;
