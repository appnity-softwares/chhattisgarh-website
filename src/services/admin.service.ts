import apiConfig, { ApiResponse } from '@/lib/api.config';
import apiService from '@/lib/api.service';
import { withMock, mockData } from './mock.data';

import type {
    DashboardStats,
    User,
    Profile,
    MatchRequest
} from '@/types/api.types';

class AdminService {
    // Helper to extract response data
    private async handleResponse<T>(promise: Promise<any>): Promise<T> {
        try {
            const res = await promise;
            return res.data?.data || res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }

    // Dashboard Stats
    async getDashboardStats(): Promise<DashboardStats> {
        return this.handleResponse<DashboardStats>(apiService.get(apiConfig.endpoints.admin.stats));
    }

    // Users
    async getUsers(page = 1, limit = 10): Promise<{ users: User[]; pagination: any }> {
        return this.handleResponse<{ users: User[]; pagination: any }>(
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
    async bulkUploadUsers(file: File): Promise<{ success: number, failed: number, errors: any[] }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.handleResponse<{ success: number, failed: number, errors: any[] }>(
            apiService.post(apiConfig.endpoints.admin.userBulkUpload, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        );
    }


    // Profiles
    async getProfiles(page = 1, limit = 10): Promise<{ profiles: Profile[]; pagination: any }> {
        return this.handleResponse<{ profiles: Profile[]; pagination: any }>(
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

    // Token Cleanup
    async cleanupExpiredTokens(): Promise<{ count: number }> {
        return this.handleResponse<{ count: number }>(apiService.post(apiConfig.endpoints.admin.cleanupTokens));
    }

    // Audit Logs
    async getAuditLogs(): Promise<any[]> {
        return withMock(mockData.auditLogs, () =>
            this.handleResponse<any[]>(apiService.get(apiConfig.endpoints.admin.activityLogs))
        );
    }

    async getAuditLogsStats(): Promise<any> {
        return withMock({ total: 156, uniqueAdmins: 3, todayActions: 12 }, () =>
            this.handleResponse<any>(apiService.get(apiConfig.endpoints.admin.activityLogsStats))
        );
    }

    // NEW: Grant Subscription
    async grantSubscription(userId: string, planId: number, customDays?: number): Promise<any> {
        return this.handleResponse<any>(
            apiService.post(apiConfig.endpoints.admin.grantSubscription(userId), { planId, customDays })
        );
    }

    // NEW: Admin Profile Management
    async createProfile(userId: string, data: any): Promise<Profile> {
        return this.handleResponse<Profile>(
            apiService.post(apiConfig.endpoints.admin.userProfile(userId), data)
        );
    }

    async updateProfile(userId: string, data: any): Promise<Profile> {
        return this.handleResponse<Profile>(
            apiService.put(apiConfig.endpoints.admin.userProfile(userId), data)
        );
    }

    async deleteProfile(userId: string): Promise<void> {
        return this.handleResponse<void>(
            apiService.delete(apiConfig.endpoints.admin.userProfile(userId))
        );
    }

    async getPlans(): Promise<any[]> {
        return this.handleResponse<any[]>(apiService.get(apiConfig.endpoints.admin.plans));
    }
}

export const adminService = new AdminService();
export default adminService;
