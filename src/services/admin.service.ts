import apiConfig from '@/lib/api.config';
import apiService from '@/lib/api.service';
import { withMock, mockData } from './mock.data';

import type {
    DashboardStats,
    User,
    Profile,
    MatchRequest,
    AdminPaymentsResponse,
    PaymentStatus,
    ContactRequest,
    PhotoRequest
} from '@/types/api.types';

export interface AdminServiceInterface {
    // Dashboard Stats
    getDashboardStats(): Promise<DashboardStats>;
    
    // Users
    getUsers(page?: number, limit?: number): Promise<{ users: User[]; pagination: Record<string, unknown> }>;
    getRecentUsers(limit?: number): Promise<User[]>;
    getUserById(userId: string): Promise<User>;
    updateUserRole(userId: string, role: string): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    banUser(userId: string, reason: string): Promise<User>;
    unbanUser(userId: string): Promise<User>;
    bulkUploadUsers(file: File): Promise<{ success: number, failed: number, errors: { row: number; email: string; error: string }[] }>;
    
    // Profiles
    getProfiles(page?: number, limit?: number): Promise<{ profiles: Profile[]; pagination: Record<string, unknown> }>;
    verifyProfile(profileId: number, isVerified: boolean): Promise<Profile>;
    updateProfileStatus(profileId: number, isPublished: boolean, statusReason?: string): Promise<Profile>;
    
    // Matches
    getRecentMatches(limit?: number): Promise<MatchRequest[]>;
    
    // Payments
    getPayments(params?: {
        page?: number;
        limit?: number;
        status?: PaymentStatus | 'all';
        search?: string;
    }): Promise<AdminPaymentsResponse>;
    
    // Token Cleanup
    cleanupExpiredTokens(): Promise<{ count: number }>;
    
    // Audit Logs
    getAuditLogs(): Promise<Record<string, unknown>[]>;
    getAuditLogsStats(): Promise<Record<string, unknown>>;
    
    // Grant Subscription
    grantSubscription(userId: string, planId: number, customDays?: number): Promise<unknown>;
    
    // Admin Profile Management
    createProfile(userId: string, data: Record<string, unknown>): Promise<Profile>;
    updateProfile(userId: string, data: Record<string, unknown>): Promise<Profile>;
    deleteProfile(userId: string): Promise<void>;
    
    // Contact Requests Management
    getContactRequests(page?: number, limit?: number, status?: string, search?: string): Promise<{ requests: ContactRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
    updateContactRequest(requestId: number, status: string, reason: string): Promise<ContactRequest>;
    
    // Photo Requests Management
    getPhotoRequests(page?: number, limit?: number, status?: string, search?: string): Promise<{ requests: PhotoRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
    updatePhotoRequest(requestId: number, status: string, reason: string): Promise<PhotoRequest>;
    approvePhotoRequest(requestId: number): Promise<PhotoRequest>;
    rejectPhotoRequest(requestId: number, reason: string): Promise<PhotoRequest>;
    
    // Chat Moderation
    getAllConversations(page?: number, limit?: number, search?: string, flaggedOnly?: string): Promise<{ conversations: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>;
    getConversationById(conversationId: string): Promise<any>;
    deleteConversation(conversationId: string): Promise<void>;
    flagMessage(messageId: number, reason: string): Promise<any>;
    
    // Bulk Moderation
    bulkModeration(ids: number[], type: string, action: string): Promise<any>;
    
    // FAQs
    getFaqsAdmin(): Promise<any[]>;
    createFaq(data: any): Promise<any>;
    updateFaq(id: number | string, data: any): Promise<any>;
    deleteFaq(id: number | string): Promise<void>;
    
    // Success Stories
    getSuccessStories(): Promise<any[]>;
    createSuccessStory(data: any): Promise<any>;
    updateSuccessStory(id: number | string, data: any): Promise<any>;
    deleteSuccessStory(id: number | string): Promise<void>;
    
    // Plans
    getPlans(): Promise<Record<string, unknown>[]>;
}

export class AdminService implements AdminServiceInterface {
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

    // NEW: Contact Requests Management
    async getContactRequests(page = 1, limit = 10, status?: string, search?: string): Promise<{ requests: ContactRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
        const queryParams = {
            page, limit,
            ...(status && status !== 'ALL' ? { status } : {}),
            ...(search?.trim() ? { search: search.trim() } : {}),
        };
        return this.handleResponse<{ requests: ContactRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
            apiService.get(apiConfig.endpoints.admin.contactRequests, { params: queryParams })
        );
    }

    async updateContactRequest(requestId: number, status: string, reason: string): Promise<ContactRequest> {
        return this.handleResponse<ContactRequest>(
            apiService.put(apiConfig.endpoints.admin.contactRequest(requestId), { status, reason })
        );
    }

    // Photo Requests Management
    async getPhotoRequests(page = 1, limit = 10, status?: string, search?: string): Promise<{ requests: PhotoRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
        const queryParams = {
            page, limit,
            ...(status && status !== 'ALL' ? { status } : {}),
            ...(search?.trim() ? { search: search.trim() } : {}),
        };
        return this.handleResponse<{ requests: PhotoRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
            apiService.get(apiConfig.endpoints.admin.photoRequests, { params: queryParams })
        );
    }

    async updatePhotoRequest(requestId: number, status: string, reason: string): Promise<PhotoRequest> {
        return this.handleResponse<PhotoRequest>(
            apiService.put(apiConfig.endpoints.admin.photoRequest(requestId), { status, reason })
        );
    }

    async approvePhotoRequest(requestId: number): Promise<PhotoRequest> {
        return this.handleResponse<PhotoRequest>(
            apiService.put(apiConfig.endpoints.admin.photoRequest(requestId), { status: 'APPROVED', reason: 'Approved by admin' })
        );
    }

    async rejectPhotoRequest(requestId: number, reason: string): Promise<PhotoRequest> {
        return this.handleResponse<PhotoRequest>(
            apiService.put(apiConfig.endpoints.admin.photoRequest(requestId), { status: 'REJECTED', reason })
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

    // Chat Moderation
    async getAllConversations(page = 1, limit = 10, search?: string, flaggedOnly?: string): Promise<{ conversations: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
        const queryParams = {
            page, limit,
            ...(search?.trim() ? { search: search.trim() } : {}),
            ...(flaggedOnly ? { flaggedOnly } : {}),
        };
        return this.handleResponse<{ conversations: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
            apiService.get(apiConfig.endpoints.admin.chats, { params: queryParams })
        );
    }

    async getConversationById(conversationId: string): Promise<any> {
        return this.handleResponse<any>(
            apiService.get(apiConfig.endpoints.admin.chat(conversationId))
        );
    }

    async deleteConversation(conversationId: string): Promise<void> {
        return this.handleResponse<void>(
            apiService.delete(apiConfig.endpoints.admin.chat(conversationId))
        );
    }

    async flagMessage(messageId: number, reason: string): Promise<any> {
        return this.handleResponse<any>(
            apiService.put(apiConfig.endpoints.admin.chatMessage(messageId), { reason })
        );
    }

    // Bulk Moderation
    async bulkModeration(ids: number[], type: string, action: string): Promise<any> {
        return this.handleResponse<any>(
            apiService.post(apiConfig.endpoints.admin.bulkModeration, { ids, type, action })
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
