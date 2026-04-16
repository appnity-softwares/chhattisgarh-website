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

    // Validate file before upload
    private validateFile(file: File): { isValid: boolean; error?: string } {
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (file.size > MAX_FILE_SIZE) {
            return { isValid: false, error: 'File size must be less than 10MB' };
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
        }

        return { isValid: true };
    }

    // Photo upload with retry logic and progress tracking
    async uploadProfilePhotos(files: File[], token: string, onProgress?: (progress: number) => void): Promise<any> {
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 1000;

        // Validate all files first
        for (const file of files) {
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
        }

        let attempt = 0;
        
        while (attempt < MAX_RETRIES) {
            try {
                const formData = new FormData();
                files.forEach((file) => {
                    formData.append('photos', file);
                });

                // Create upload with progress tracking
                const xhr = new XMLHttpRequest();
                
                return new Promise((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable && onProgress) {
                            const progress = Math.round((event.loaded / event.total) * 100);
                            onProgress(progress);
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                reject(new Error('Invalid response from server'));
                            }
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    });

                    xhr.addEventListener('error', () => {
                        reject(new Error('Network error during upload'));
                    });

                    xhr.addEventListener('timeout', () => {
                        reject(new Error('Upload timed out'));
                    });

                    xhr.timeout = 60000; // 60 second timeout
                    xhr.open('POST', `${apiConfig.baseUrl}${apiConfig.endpoints.profiles.photos}`);
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(formData);
                });

            } catch (error) {
                attempt++;
                
                if (attempt >= MAX_RETRIES) {
                    throw error;
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            }
        }

        throw new Error('Upload failed after multiple attempts');
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
