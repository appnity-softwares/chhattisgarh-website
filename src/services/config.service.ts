import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import { withMock, mockData } from './mock.data';

export interface SystemConfig {
    id: number;
    key: string;
    value: string;
    dataType: string;
    category: string;
    description: string | null;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

class ConfigService {
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

    private async fetchPublic<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(), // No token
                ...options.headers,
            },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data.data;
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

    async getAllConfigs(): Promise<SystemConfig[]> {
        return withMock(mockData.configs, () =>
            this.fetchWithAuth<SystemConfig[]>('/config')
        );
    }

    async getPublicConfigs(): Promise<SystemConfig[]> {
        return withMock(mockData.configs.filter(c => c.isPublic), () =>
            this.fetchPublic<SystemConfig[]>('/config/public')
        );
    }

    async upsertConfig(data: Partial<SystemConfig>): Promise<SystemConfig> {
        // In mock mode, we just return the data passed in
        return withMock({ id: Math.random(), ...data } as unknown as SystemConfig, () =>
            this.fetchWithAuth<SystemConfig>('/config', {
                method: 'POST',
                body: JSON.stringify(data),
            })
        );
    }

    // Static helper for getting theme colors from value string
    static parseTheme(value: string) {
        try {
            return JSON.parse(value);
        } catch {
            return {
                primary: '#7c3aed',
                secondary: '#ec4899',
                accent: '#8b5cf6'
            };
        }
    }
}

export const configService = new ConfigService();
export default configService;
