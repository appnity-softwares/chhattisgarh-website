import apiConfig, { getAuthHeaders } from '@/lib/api.config';

export class MessagesService {
    async getConversations(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.messages.conversations}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async getHistory(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.messages.history(userId)}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async sendMessage(receiverId: number, content: string, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.messages.send}`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ receiverId, content }),
        });
        return res.json();
    }

    async getUnreadCount(token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.messages.unreadCount}`, {
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async markAsRead(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.messages.markRead(userId)}`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async deleteMessage(messageId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}/messages/${messageId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }

    async deleteConversation(userId: number, token: string) {
        const res = await fetch(`${apiConfig.baseUrl}/messages/conversations/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(token),
        });
        return res.json();
    }
}

export const messagesService = new MessagesService();
export default messagesService;
