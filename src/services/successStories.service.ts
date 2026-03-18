import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import { SuccessStory, SuccessStoryStatus } from "@/types/api.types";

class SuccessStoriesService {
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

    /**
     * Get all success stories for admin
     */
    async getAll(params?: { page?: number; limit?: number; status?: SuccessStoryStatus }) {
        let url = apiConfig.endpoints.admin.successStories;
        if (params) {
            const query = new URLSearchParams();
            if (params.page) query.append('page', params.page.toString());
            if (params.limit) query.append('limit', params.limit.toString());
            if (params.status) query.append('status', params.status);
            url += `?${query.toString()}`;
        }
        return this.fetchWithAuth<{ stories: SuccessStory[]; pagination: any }>(url);
    }

    /**
     * Update a success story (status, featured, etc.)
     */
    async update(id: number, data: Partial<SuccessStory>): Promise<SuccessStory> {
        return this.fetchWithAuth<SuccessStory>(
            apiConfig.endpoints.admin.successStoryById(id.toString()),
            {
                method: 'PATCH',
                body: JSON.stringify(data),
            }
        );
    }

    /**
     * Create a new success story by admin
     */
    async create(data: any): Promise<SuccessStory> {
        return this.fetchWithAuth<SuccessStory>(
            apiConfig.endpoints.admin.successStories,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    /**
     * Delete a success story
     */
    async delete(id: number): Promise<void> {
        return this.fetchWithAuth<void>(
            apiConfig.endpoints.admin.successStoryById(id.toString()),
            {
                method: 'DELETE',
            }
        );
    }
}

export const successStoriesService = new SuccessStoriesService();
export default successStoriesService;
