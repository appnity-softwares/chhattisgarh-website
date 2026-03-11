import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import { useAuthStore } from '@/stores/auth-store';

export interface PendingVerification {
    id: number;
    userId: number;
    mediaType: string;
    mediaUrl: string;
    status: string;
    createdAt: string;
    user: {
        id: number;
        email: string;
        profile?: {
            firstName: string;
            lastName: string;
        };
    };
}

export interface VerificationStats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

class VerificationsService {
    private async fetchWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const { accessToken } = useAuthStore.getState();

        const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(accessToken || undefined),
                ...options?.headers,
            },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data.data;
    }

    /**
     * Get pending verifications queue
     */
    async getPendingVerifications(page: number = 1, limit: number = 10): Promise<{
        verifications: PendingVerification[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }> {
        return this.fetchWithAuth(
            `${apiConfig.endpoints.admin.verificationsPending}?page=${page}&limit=${limit}`
        );
    }

    /**
     * Get verification statistics
     */
    async getStats(): Promise<VerificationStats> {
        return this.fetchWithAuth(apiConfig.endpoints.admin.verificationsStats);
    }

    /**
     * Approve a verification
     */
    async approve(mediaId: string): Promise<void> {
        await this.fetchWithAuth(apiConfig.endpoints.admin.verificationApprove(mediaId), {
            method: 'POST',
        });
    }

    /**
     * Reject a verification
     */
    async reject(mediaId: string, reason: string): Promise<void> {
        await this.fetchWithAuth(apiConfig.endpoints.admin.verificationReject(mediaId), {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }

    /**
     * Request resubmission
     */
    async requestResubmission(mediaId: string, reason: string): Promise<void> {
        await this.fetchWithAuth(apiConfig.endpoints.admin.verificationResubmit(mediaId), {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }
}

export const verificationsService = new VerificationsService();
export default verificationsService;
