import apiConfig, { getAuthHeaders } from '@/lib/api.config';

export class ProfileWebService {
    async getCurrentProfile(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.me}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async getProfileById(userId: number, token?: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.byId(userId)}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async updateProfile(data: Record<string, unknown>, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.me}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        return res.json();
    }

    async getRecommendations(token: string, params?: Record<string, string>) {
        const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.recommendations}${queryParams}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async getPreferences(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.preferences}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async updatePreferences(data: Record<string, unknown>, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.preferences}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        return res.json();
    }

    async searchProfiles(token: string, searchParams: Record<string, unknown>) {
        const queryParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.search}?${queryParams.toString()}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    // Photo upload (multipart/form-data)
    async uploadProfilePhotos(files: File[], token: string) {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('photos', file);
        });

        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.photos}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        return res.json();
    }

    // Delete a specific photo
    async deleteProfilePhoto(mediaId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.deletePhoto(mediaId)}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    // Create profile (for registration)
    async createProfile(data: Record<string, unknown>, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.create}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        return res.json();
    }
}

export const profileWebService = new ProfileWebService();
export default profileWebService;
