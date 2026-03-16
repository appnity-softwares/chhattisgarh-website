import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';

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
        return this.fetchWithAuth<SystemConfig[]>('/config');
    }

    async upsertConfig(data: Partial<SystemConfig>): Promise<SystemConfig> {
        return this.fetchWithAuth<SystemConfig>('/config', {
            method: 'POST',
            body: JSON.stringify(data),
        });
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
