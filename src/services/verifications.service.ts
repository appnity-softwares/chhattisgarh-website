import apiConfig, { ApiResponse } from '@/lib/api.config';
import apiService from '@/lib/api.service';
import { withMock, mockData } from './mock.data';

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
    private async handleResponse<T>(promise: Promise<any>): Promise<T> {
        try {
            const res = await promise;
            return res.data?.data || res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
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
}

export const verificationsService = new VerificationsService();
export default verificationsService;
