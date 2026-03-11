import apiConfig, { getAuthHeaders, ApiResponse, PaginatedResponse } from '@/lib/api.config';
import axios from 'axios'; // ADDED for file upload

import type {
    DashboardStats,
    User,
    Profile,
    MatchRequest
} from '@/types/api.types';

class AdminService {
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

    // Dashboard Stats
    async getDashboardStats(): Promise<DashboardStats> {
        return this.fetchWithAuth<DashboardStats>(apiConfig.endpoints.admin.stats);
    }

    // Users
    async getUsers(page = 1, limit = 10): Promise<{ users: User[]; pagination: any }> {
        return this.fetchWithAuth<{ users: User[]; pagination: any }>(
            `${apiConfig.endpoints.admin.users}?page=${page}&limit=${limit}`
        );
    }

    async getRecentUsers(limit = 10): Promise<User[]> {
        return this.fetchWithAuth<User[]>(
            `${apiConfig.endpoints.admin.recentUsers}?limit=${limit}`
        );
    }

    async getUserById(userId: string): Promise<User> {
        return this.fetchWithAuth<User>(apiConfig.endpoints.admin.userById(userId));
    }

    async updateUserRole(userId: string, role: string): Promise<User> {
        return this.fetchWithAuth<User>(apiConfig.endpoints.admin.userRole(userId), {
            method: 'PUT',
            body: JSON.stringify({ role }),
        });
    }

    async deleteUser(userId: string): Promise<void> {
        return this.fetchWithAuth<void>(apiConfig.endpoints.admin.userById(userId), {
            method: 'DELETE',
        });
    }

    // ADDED: Bulk User Upload
    async bulkUploadUsers(file: File): Promise<{ success: number, failed: number, errors: any[] }> {
        const formData = new FormData();
        formData.append('file', file);

        const token = this.getToken();
        // Use axios for multipart/form-data as it handles boundary automatically better than fetch in some envs
        const response = await axios.post(
            `${apiConfig.baseUrl}/admin/users/bulk-upload`,
            formData,
            {
                headers: {
                    ...getAuthHeaders(token || undefined),
                    'Content-Type': 'multipart/form-data',
                } as any
            }
        );
        return response.data.data;
    }


    // Profiles
    async getProfiles(page = 1, limit = 10): Promise<{ profiles: Profile[]; pagination: any }> {
        return this.fetchWithAuth<{ profiles: Profile[]; pagination: any }>(
            `${apiConfig.endpoints.admin.profiles}?page=${page}&limit=${limit}`
        );
    }

    // Matches
    async getRecentMatches(limit = 10): Promise<MatchRequest[]> {
        return this.fetchWithAuth<MatchRequest[]>(
            `${apiConfig.endpoints.admin.recentMatches}?limit=${limit}`
        );
    }

    // Token Cleanup
    async cleanupExpiredTokens(): Promise<{ count: number }> {
        return this.fetchWithAuth<{ count: number }>(
            `${apiConfig.baseUrl}/admin/cleanup/tokens`,
            { method: 'POST' }
        );
    }
}

export const adminService = new AdminService();
export default adminService;
