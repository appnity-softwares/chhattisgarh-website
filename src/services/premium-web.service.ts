import apiConfig, { getAuthHeaders } from '@/lib/api.config';

export class PremiumWebService {
    // --- Web Payments ---
    async getPlans() {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.plans.list}`);
        return res.json();
    }

    async createWebPaymentLink(planId: number, token: string) {
        // From authenticating user
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.webPayments.initiateSession}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ planId }),
        });
        return res.json();
    }

    async getPaymentDetails(paymentToken: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.webPayments.details}?token=${paymentToken}`);
        return res.json();
    }

    async verifyPaymentSuccess(data: Record<string, unknown>) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.webPayments.success}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    }

    // --- Boosts ---
    async getBoostPackages() {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.boosts.packages}`);
        return res.json();
    }

    async getActiveBoosts(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.boosts.active}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async createBoostOrder(boostType: string, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.boosts.createOrder}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ boostType }),
        });
        return res.json();
    }

    async verifyBoostPayment(data: Record<string, unknown>, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.boosts.verify}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        return res.json();
    }

    // --- Astrology ---
    async matchHoroscope(partnerId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.astrology.match(partnerId)}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }
}

export const premiumWebService = new PremiumWebService();
export default premiumWebService;
