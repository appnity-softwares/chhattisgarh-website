import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { PromoCode } from '@/types/api.types';

export interface Broadcast {
    id: number;
    title: string;
    body: string;
    imageUrl?: string;
    target: string;
    sentCount: number;
    failedCount: number;
    status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';
    sentAt?: string;
    createdAt: string;
}

class MarketingService {
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

    /**
     * Send a bulk notification
     */
    async sendBroadcast(data: {
        title: string;
        body: string;
        imageUrl?: string;
        target: 'EVERYONE' | 'PREMIUM' | 'FREE' | 'INACTIVE';
    }): Promise<{ sentCount: number }> {
        return this.fetchWithAuth<{ sentCount: number }>(
            apiConfig.endpoints.admin.notificationsSend,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    /**
     * Get broadcast history
     */
    async getHistory(): Promise<Broadcast[]> {
        return this.fetchWithAuth<Broadcast[]>(
            apiConfig.endpoints.admin.notificationsHistory
        );
    }

    /**
     * Get all promo codes
     */
    async getPromoCodes(): Promise<PromoCode[]> {
        return this.fetchWithAuth<PromoCode[]>(apiConfig.endpoints.admin.promoCodes);
    }

    /**
     * Create a new promo code
     */
    async createPromoCode(data: any): Promise<PromoCode> {
        return this.fetchWithAuth<PromoCode>(apiConfig.endpoints.admin.promoCodes, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete a promo code
     */
    async deletePromoCode(id: number): Promise<void> {
        return this.fetchWithAuth<void>(apiConfig.endpoints.admin.promoCodeById(id.toString()), {
            method: 'DELETE',
        });
    }
}

export const marketingService = new MarketingService();
export default marketingService;
