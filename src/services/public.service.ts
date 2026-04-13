import apiConfig, { ApiResponse } from '@/lib/api.config';
import type { SuccessStory } from '@/types/api.types';

export interface FAQ {
    id: number;
    key: string;
    question: string;
    answer: string;
    faqCategory: string;
    order: number;
}

export interface VerificationStats {
    totalUsers: number;
    verifiedUsers: number;
    pendingVerifications: number;
    successStoriesCount: number;
}

class PublicService {
    private async fetchPublic<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data.data;
    }

    // Get public success stories for landing page
    async getSuccessStories(): Promise<SuccessStory[]> {
        const response = await this.fetchPublic<{ stories: SuccessStory[], pagination: Record<string, unknown> }>(apiConfig.endpoints.public.successStories);
        return response.stories || [];
    }

    // Get public verification and community stats
    async getPublicStats(): Promise<VerificationStats> {
        return this.fetchPublic<VerificationStats>(apiConfig.endpoints.public.stats);
    }

    // Get public FAQs
    async getFaqs(): Promise<{ faqs: FAQ[], grouped: Record<string, FAQ[]> }> {
        return this.fetchPublic<{ faqs: FAQ[], grouped: Record<string, FAQ[]> }>(apiConfig.endpoints.public.faq);
    }
}

export const publicService = new PublicService();
export default publicService;
