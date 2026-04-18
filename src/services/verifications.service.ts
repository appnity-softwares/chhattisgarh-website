import apiConfig from '@/lib/api.config';
import apiService from '@/lib/api.service';
import { withMock, mockData } from './mock.data';
import type { AxiosResponse } from 'axios';

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

    /**
     * Get pending verifications queue
     */
    async getPendingVerifications(page: number = 1, limit: number = 10): Promise<{
        verifications: PendingVerification[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }> {
        return withMock({
            verifications: mockData.verifications,
            pagination: { page, limit, total: mockData.verifications.length, totalPages: 1 }
        }, () =>
            this.handleResponse(
                apiService.get(apiConfig.endpoints.admin.verificationsPending, { params: { page, limit } })
            )
        );
    }

    /**
     * Get verification statistics
     */
    async getStats(): Promise<VerificationStats> {
        return withMock(mockData.verifStats, () =>
            this.handleResponse(apiService.get(apiConfig.endpoints.admin.verificationsStats))
        );
    }

    /**
     * Approve a verification
     */
    async approve(mediaId: string): Promise<void> {
        await this.handleResponse(apiService.post(apiConfig.endpoints.admin.verificationApprove(mediaId)));
    }

    /**
     * Reject a verification
     */
    async reject(mediaId: string, reason: string): Promise<void> {
        await this.handleResponse(apiService.post(apiConfig.endpoints.admin.verificationReject(mediaId), { reason }));
    }

    /**
     * Request resubmission
     */
    async requestResubmission(mediaId: string, reason: string): Promise<void> {
        await this.handleResponse(apiService.post(apiConfig.endpoints.admin.verificationResubmit(mediaId), { reason }));
    }

    /**
     * Submit a document for verification (User side)
     */
    async submitVerification(formData: FormData): Promise<void> {
        await this.handleResponse(apiService.post(apiConfig.endpoints.profiles.verify, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }));
    }
}

export const verificationsService = new VerificationsService();
export default verificationsService;
