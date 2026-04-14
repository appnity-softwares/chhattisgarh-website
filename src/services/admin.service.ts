import apiConfig from '@/lib/api.config';
import apiService from '@/lib/api.service';
import { withMock, mockData } from './mock.data';

import type {
    DashboardStats,
    User,
    Profile,
    MatchRequest,
    AdminPaymentsResponse,
    PaymentStatus
} from '@/types/api.types';

class AdminService {
    // Helper to extract response data
    private async handleResponse<T>(promise: Promise<{ data: { data?: T } | T }>): Promise<T> {
        try {
            const res = await promise;
            const data = (res.data as { data?: T }).data;
            return (data !== undefined ? data : res.data) as T;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            throw new Error(err.response?.data?.message || err.message || 'Request failed');
        }
    }

    // Dashboard Stats
    async getDashboardStats(): Promise<DashboardStats> {
        return this.handleResponse<DashboardStats>(apiService.get(apiConfig.endpoints.admin.stats));
    }

    // Users
    async getUsers(page = 1, limit = 10): Promise<{ users: User[]; pagination: Record<string, unknown> }> {
        return this.handleResponse<{ users: User[]; pagination: Record<string, unknown> }>(
            apiService.get(apiConfig.endpoints.admin.users, { params: { page, limit } })
        );
    }

    async getRecentUsers(limit = 10): Promise<User[]> {
        return this.handleResponse<User[]>(
            apiService.get(apiConfig.endpoints.admin.recentUsers, { params: { limit } })
        );
    }

    async getUserById(userId: string): Promise<User> {
        return this.handleResponse<User>(apiService.get(apiConfig.endpoints.admin.userById(userId)));
    }

    async updateUserRole(userId: string, role: string): Promise<User> {
        return this.handleResponse<User>(apiService.put(apiConfig.endpoints.admin.userRole(userId), { role }));
    }

    async deleteUser(userId: string): Promise<void> {
        return this.handleResponse<void>(apiService.delete(apiConfig.endpoints.admin.userById(userId)));
    }

    async banUser(userId: string, reason: string): Promise<User> {
        return this.handleResponse<User>(apiService.post(apiConfig.endpoints.admin.userBan(userId), { reason }));
    }

    async unbanUser(userId: string): Promise<User> {
        return this.handleResponse<User>(apiService.post(apiConfig.endpoints.admin.userUnban(userId)));
    }

    // ADDED: Bulk User Upload
    async bulkUploadUsers(file: File): Promise<{ success: number, failed: number, errors: { row: number; email: string; error: string }[] }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.handleResponse<{ success: number, failed: number, errors: { row: number; email: string; error: string }[] }>(
            apiService.post(apiConfig.endpoints.admin.userBulkUpload, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        );
    }


    // Profiles
    async getProfiles(page = 1, limit = 10): Promise<{ profiles: Profile[]; pagination: Record<string, unknown> }> {
        return this.handleResponse<{ profiles: Profile[]; pagination: Record<string, unknown> }>(
            apiService.get(apiConfig.endpoints.admin.profiles, { params: { page, limit } })
        );
    }

    async verifyProfile(profileId: number, isVerified: boolean): Promise<Profile> {
        return this.handleResponse<Profile>(apiService.put(apiConfig.endpoints.admin.profileVerify(profileId), { isVerified }));
    }

    async updateProfileStatus(profileId: number, isPublished: boolean, statusReason?: string): Promise<Profile> {
        return this.handleResponse<Profile>(apiService.put(apiConfig.endpoints.admin.profileStatus(profileId), { isPublished, statusReason }));
    }

    // Matches
    async getRecentMatches(limit = 10): Promise<MatchRequest[]> {
        return withMock(mockData.matches.slice(0, limit), () =>
            this.handleResponse<MatchRequest[]>(
                apiService.get(apiConfig.endpoints.admin.recentMatches, { params: { limit } })
            )
        );
    }

    async getPayments(params?: {
        page?: number;
        limit?: number;
        status?: PaymentStatus | 'all';
        search?: string;
    }): Promise<AdminPaymentsResponse> {
        const queryParams = {
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
            ...(params?.status && params.status !== 'all' ? { status: params.status } : {}),
            ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        };

        return this.handleResponse<AdminPaymentsResponse>(
            apiService.get(apiConfig.endpoints.admin.payments, { params: queryParams })
        );
    }

    // Token Cleanup
    async cleanupExpiredTokens(): Promise<{ count: number }> {
        return this.handleResponse<{ count: number }>(apiService.post(apiConfig.endpoints.admin.cleanupTokens));
    }

    // Audit Logs
    async getAuditLogs(): Promise<Record<string, unknown>[]> {
        return withMock(mockData.auditLogs, () =>
            this.handleResponse<Record<string, unknown>[]>(apiService.get(apiConfig.endpoints.admin.activityLogs))
        );
    }

    async getAuditLogsStats(): Promise<Record<string, unknown>> {
        return withMock({ total: 156, uniqueAdmins: 3, todayActions: 12 }, () =>
            this.handleResponse<Record<string, unknown>>(apiService.get(apiConfig.endpoints.admin.activityLogsStats))
        );
    }

    // NEW: Grant Subscription
    async grantSubscription(userId: string, planId: number, customDays?: number): Promise<unknown> {
        return this.handleResponse<unknown>(
            apiService.post(apiConfig.endpoints.admin.grantSubscription(userId), { planId, customDays })
        );
    }

    // NEW: Admin Profile Management
    async createProfile(userId: string, data: Record<string, unknown>): Promise<Profile> {
        return this.handleResponse<Profile>(
            apiService.post(apiConfig.endpoints.admin.userProfile(userId), data)
        );
    }

    async updateProfile(userId: string, data: Record<string, unknown>): Promise<Profile> {
        return this.handleResponse<Profile>(
            apiService.put(apiConfig.endpoints.admin.userProfile(userId), data)
        );
    }

    async deleteProfile(userId: string): Promise<void> {
        return this.handleResponse<void>(
            apiService.delete(apiConfig.endpoints.admin.userProfile(userId))
        );
    }

    async getPlans(): Promise<Record<string, unknown>[]> {
        return this.handleResponse<Record<string, unknown>[]>(apiService.get(apiConfig.endpoints.admin.plans));
    }

    // FAQs
    async getFaqsAdmin(): Promise<any[]> {
        return this.handleResponse<any[]>(apiService.get(apiConfig.endpoints.admin.faqAdmin));
    }

    async createFaq(data: any): Promise<any> {
        return this.handleResponse<any>(apiService.post(apiConfig.endpoints.admin.faq, data));
    }

    async updateFaq(id: number | string, data: any): Promise<any> {
        return this.handleResponse<any>(apiService.put(apiConfig.endpoints.admin.faqById(id), data));
    }

    async deleteFaq(id: number | string): Promise<void> {
        return this.handleResponse<void>(apiService.delete(apiConfig.endpoints.admin.faqById(id)));
    }

    // Success Stories
    async getSuccessStories(): Promise<any[]> {
        return this.handleResponse<any[]>(apiService.get(apiConfig.endpoints.admin.successStories));
    }

    async createSuccessStory(data: any): Promise<any> {
        return this.handleResponse<any>(apiService.post(apiConfig.endpoints.admin.successStories, data));
    }

    async updateSuccessStory(id: number | string, data: any): Promise<any> {
        return this.handleResponse<any>(apiService.patch(`${apiConfig.baseUrl}/admin/success-stories/${id}`, data));
    }

    async deleteSuccessStory(id: number | string): Promise<void> {
        return this.handleResponse<void>(apiService.delete(`${apiConfig.baseUrl}/admin/success-stories/${id}`));
    }
}

export const adminService = new AdminService();
export default adminService;
