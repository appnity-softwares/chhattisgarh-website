import apiConfig, { getAuthHeaders } from '@/lib/api.config';

export class SettingsWebService {
    // --- Privacy Settings ---
    async getPrivacySettings(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.settings.privacy}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async updatePrivacySettings(data: Record<string, unknown>, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.settings.privacy}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        return res.json();
    }

    // --- Photo Privacy Settings ---
    async getPhotoPrivacy(mediaId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.settings.photoPrivacy(mediaId)}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async updatePhotoPrivacy(mediaId: number, data: Record<string, unknown>, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.settings.photoPrivacy(mediaId)}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        return res.json();
    }

    // --- Notification Settings ---
    async getNotificationSettings(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.settings.notifications}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async updateNotificationSettings(data: Record<string, unknown>, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.settings.notifications}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        return res.json();
    }

    // --- System Notifications ---
    async getNotifications(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.notifications.list}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async getUnreadNotificationCount(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.notifications.unreadCount}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async markNotificationRead(id: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.notifications.markRead(id)}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async markAllNotificationsRead(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.notifications.markAllRead}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async deleteNotification(id: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.notifications.delete(id)}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async deleteAllNotifications(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.notifications.deleteAll}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }
}

export const settingsWebService = new SettingsWebService();
export default settingsWebService;
