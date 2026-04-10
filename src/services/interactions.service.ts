import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';

export class InteractionsService {
    // --- Matches ---
    async getReceivedMatches(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.received}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async getSentMatches(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.sent}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async sendMatchRequest(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.send}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ targetUserId: userId }),
        });
        return res.json();
    }

    async acceptMatch(matchId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.accept(matchId)}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async rejectMatch(matchId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.reject(matchId)}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    // --- Shortlists ---
    async getShortlists(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.shortlists.list}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async addToShortlist(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.shortlists.create}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ targetUserId: userId }),
        });
        return res.json();
    }

    async removeFromShortlist(id: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.shortlists.delete(id)}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    // --- Blocks ---
    async getBlockedUsers(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.blocks.list}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async blockUser(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.blocks.create}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ targetUserId: userId }),
        });
        return res.json();
    }

    async unblockUser(id: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.blocks.delete(id)}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    // --- Contact Requests ---
    async getReceivedContactRequests(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contactRequests.received}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async sendContactRequest(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contactRequests.send}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ targetUserId: userId }),
        });
        return res.json();
    }

    async acceptContactRequest(requestId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contactRequests.accept(requestId)}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    // --- Photo Requests ---
    async getReceivedPhotoRequests(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.photoRequests.received}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async sendPhotoRequest(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.photoRequests.send}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ targetUserId: userId }),
        });
        return res.json();
    }

    async acceptPhotoRequest(requestId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.photoRequests.accept(requestId)}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    // --- Views ---
    async getProfileVisitors(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.views.visitors}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async recordProfileView(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.views.record}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ targetUserId: userId }),
        });
        return res.json();
    }

    // --- Reports ---
    async reportUser(userId: number, reason: string, description: string, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.reports.create}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ reportedUserId: userId, reason, description }),
        });
        return res.json();
    }
}

export const interactionsService = new InteractionsService();
export default interactionsService;
