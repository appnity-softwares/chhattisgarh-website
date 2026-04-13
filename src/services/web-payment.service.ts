import apiConfig, { ApiResponse } from '@/lib/api.config';
import type { SubscriptionPlan } from '@/types/api.types';

class WebPaymentService {
    private async fetchPublic<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data.data;
    }

    // Get public subscription plans for landing page
    async getPublicPlans(): Promise<SubscriptionPlan[]> {
        return this.fetchPublic<SubscriptionPlan[]>(apiConfig.endpoints.webPayments.plans);
    }

    // Get payment details from token
    async getPaymentDetails(token: string): Promise<unknown> {
        return this.fetchPublic<unknown>(`${apiConfig.endpoints.webPayments.details}?token=${token}`);
    }

    // Get boost payment details from token
    async getBoostDetails(token: string): Promise<unknown> {
        return this.fetchPublic<unknown>(`${apiConfig.endpoints.webPayments.boostDetails}?token=${token}`);
    }

    // Handle payment success
    async handlePaymentSuccess(data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        boostType?: string;
        userId?: string;
    }): Promise<{ success: boolean; redirectUrl: string }> {
        const endpoint = data.boostType 
            ? apiConfig.endpoints.webPayments.boostSuccess 
            : apiConfig.endpoints.webPayments.success;
            
        return this.fetchPublic<{ success: boolean; redirectUrl: string }>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Handle payment failure
    async handlePaymentFailure(data: {
        orderId: string;
        reason: string;
    }): Promise<{ success: boolean; redirectUrl: string }> {
        return this.fetchPublic<{ success: boolean; redirectUrl: string }>(apiConfig.endpoints.webPayments.failed, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const webPaymentService = new WebPaymentService();
export default webPaymentService;
