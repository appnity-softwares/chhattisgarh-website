import apiConfig, { getAuthHeaders } from '@/lib/api.config';

export class InteractionsService {
    // --- Matches ---
    async getAcceptedMatches(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.accepted}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

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

    async sendMatchRequest(userId: number, token: string, message?: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.send}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ 
                receiverId: userId,
                message 
            }),
        });
        return res.json();
    }

    async acceptMatch(matchId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.accept(matchId)}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async rejectMatch(matchId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.reject(matchId)}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async deleteMatch(matchId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.matches.delete(matchId)}`, {
            method: 'DELETE',
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
            body: JSON.stringify({ shortlistedUserId: userId }),
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
            body: JSON.stringify({ blockedId: userId }),
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

    async sendContactRequest(profileId: number, token: string, requestType: 'PHONE' | 'EMAIL' | 'WHATSAPP' = 'PHONE', message?: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contactRequests.send}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ profileId, requestType, message }),
        });
        return res.json();
    }

    async acceptContactRequest(requestId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contactRequests.respond(requestId)}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ status: 'APPROVED' }),
        });
        return res.json();
    }

    async rejectContactRequest(requestId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contactRequests.respond(requestId)}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ status: 'REJECTED' }),
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

    async sendPhotoRequest(photoId: number, token: string, message?: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.photoRequests.send}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ photoId, message }),
        });
        return res.json();
    }

    async acceptPhotoRequest(requestId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.photoRequests.respond(requestId)}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ status: 'APPROVED' }),
        });
        return res.json();
    }

    async rejectPhotoRequest(requestId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.photoRequests.respond(requestId)}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ status: 'REJECTED' }),
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
            body: JSON.stringify({ profileId: userId }),
        });
        return res.json();
    }

    // --- Partner Preferences ---
    async getPartnerPreference(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.preferences}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async updatePartnerPreference(data: any, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.preferences}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(data),
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
