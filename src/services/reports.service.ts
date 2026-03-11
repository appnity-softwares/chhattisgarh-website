import apiConfig, { getAuthHeaders, ApiResponse } from '@/lib/api.config';
import type { Report, ReportStatus } from '@/types/api.types';

class ReportsService {
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

    // Get all reports
    async getReports(
        page = 1,
        limit = 10,
        status?: ReportStatus
    ): Promise<{ reports: Report[]; pagination: any }> {
        let url = `${apiConfig.endpoints.admin.reports}?page=${page}&limit=${limit}`;
        if (status) {
            url += `&status=${status}`;
        }
        return this.fetchWithAuth<{ reports: Report[]; pagination: any }>(url);
    }

    // Get report by ID
    async getReportById(id: string): Promise<Report> {
        return this.fetchWithAuth<Report>(apiConfig.endpoints.admin.reportById(id));
    }

    // Update report status
    async updateReport(
        id: string,
        data: { status: ReportStatus; reviewNote?: string; actionTaken?: string }
    ): Promise<Report> {
        return this.fetchWithAuth<Report>(apiConfig.endpoints.admin.reportById(id), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
}

export const reportsService = new ReportsService();
export default reportsService;
