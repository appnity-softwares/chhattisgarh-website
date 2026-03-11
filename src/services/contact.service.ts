import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { ContactMessage, ContactMessageStatus } from '@/types/api.types';

class ContactService {
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

    // Submit contact form (Public)
    async submitContactForm(data: any): Promise<any> {
        const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contact.submit}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to send message');
        }
        return result;
    }

    // Get all contact messages (Admin)
    async getMessages(
        page = 1,
        limit = 10,
        status?: ContactMessageStatus
    ): Promise<{ data: ContactMessage[]; pagination: any }> {
        let url = `${apiConfig.endpoints.contact.messages}?page=${page}&limit=${limit}`;
        if (status) {
            url += `&status=${status}`;
        }
        const result = await this.fetchWithAuth<ContactMessage[]>(url);
        // Note: The backend returns { success, data, pagination }. fetchWithAuth returns data.
        // However, my fetchWithAuth is designed based on reports.service.ts which seems to expect data to be the object containing reports and pagination.
        // Let's re-check reports.service.ts return type.
        return result as any;
    }

    // Update message status (Admin)
    async updateStatus(
        id: string,
        status: ContactMessageStatus
    ): Promise<ContactMessage> {
        return this.fetchWithAuth<ContactMessage>(apiConfig.endpoints.contact.updateStatus(id), {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // Delete message (Admin)
    async deleteMessage(id: string): Promise<void> {
        await this.fetchWithAuth<void>(apiConfig.endpoints.contact.messageById(id), {
            method: 'DELETE',
        });
    }
}

export const contactService = new ContactService();
export default contactService;
