import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { Agent, AgentStatus } from '@/types/api.types';

interface CreateAgentData {
    agentName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    city?: string;
    district?: string;
    state?: string;
}

interface UpdateAgentData extends Partial<CreateAgentData> {
    status?: AgentStatus;
    isActive?: boolean;
}

class AgentsService {
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

    // Get all agents
    async getAgents(page = 1, limit = 10): Promise<{ agents: Agent[]; pagination: any }> {
        return this.fetchWithAuth<{ agents: Agent[]; pagination: any }>(
            `${apiConfig.endpoints.admin.agents}?page=${page}&limit=${limit}`
        );
    }

    // Get agent by ID
    async getAgentById(agentId: string): Promise<Agent> {
        return this.fetchWithAuth<Agent>(apiConfig.endpoints.admin.agentById(agentId));
    }

    // Get users referred by agent
    async getAgentUsers(agentId: string, page = 1, limit = 10): Promise<{ users: any[]; pagination: any }> {
        return this.fetchWithAuth<{ users: any[]; pagination: any }>(
            `${apiConfig.endpoints.admin.agentUsers(agentId)}?page=${page}&limit=${limit}`
        );
    }

    // Create new agent
    async createAgent(data: CreateAgentData): Promise<Agent> {
        return this.fetchWithAuth<Agent>(apiConfig.endpoints.admin.agents, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Update agent
    async updateAgent(agentId: string, data: UpdateAgentData): Promise<Agent> {
        return this.fetchWithAuth<Agent>(apiConfig.endpoints.admin.agentById(agentId), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Delete agent
    async deleteAgent(agentId: string): Promise<void> {
        return this.fetchWithAuth<void>(apiConfig.endpoints.admin.agentById(agentId), {
            method: 'DELETE',
        });
    }
}

export const agentsService = new AgentsService();
export default agentsService;
