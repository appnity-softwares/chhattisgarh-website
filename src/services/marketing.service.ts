import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import { withMock, mockData } from './mock.data';

export interface PushNotification {
    id: number;
    title: string;
    body: string;
    imageUrl?: string;
    target: string;
    status: string;
    sentAt: string;
    reach: number;
}

export interface PromoCode {
    id: number;
    code: string;
    discount: number;
    type: 'PERCENTAGE' | 'FLAT';
    usageCount: number;
    isActive: boolean;
    expiresAt: string;
}

class MarketingService {
    private async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const storage = localStorage.getItem('admin-auth-storage');
        const token = storage ? JSON.parse(storage).state?.accessToken : null;

        const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(token || undefined),
                ...options.headers,
            },
        });

        const data: ApiResponse<T> = await response.json();
        if (!response.ok) throw new Error(data.message || 'Request failed');
        return data.data;
    }

    // Notifications
    async getNotificationHistory(): Promise<PushNotification[]> {
        return withMock(mockData.notifications, () => 
            this.fetchWithAuth<PushNotification[]>(apiConfig.endpoints.admin.notificationsHistory)
        );
    }

    async sendNotification(data: any): Promise<any> {
        return withMock({ success: true, message: 'Notification scheduled' }, () =>
            this.fetchWithAuth(apiConfig.endpoints.admin.notificationsSend, {
                method: 'POST',
                body: JSON.stringify(data)
            })
        );
    }

    // Promo Codes
    async getPromoCodes(): Promise<PromoCode[]> {
        return withMock(mockData.promoCodes as PromoCode[], () =>
            this.fetchWithAuth<PromoCode[]>(apiConfig.endpoints.admin.promoCodes)
        );
    }

    async createPromoCode(data: any): Promise<PromoCode> {
        return withMock({ id: Math.random(), usageCount: 0, ...data }, () =>
            this.fetchWithAuth<PromoCode>(apiConfig.endpoints.admin.promoCodes, {
                method: 'POST',
                body: JSON.stringify(data)
            })
        );
    }

    async deletePromoCode(id: number): Promise<void> {
        return withMock(undefined, () =>
            this.fetchWithAuth<void>(apiConfig.endpoints.admin.promoCodeById(String(id)), {
                method: 'DELETE'
            })
        );
    }
}

export const marketingService = new MarketingService();
