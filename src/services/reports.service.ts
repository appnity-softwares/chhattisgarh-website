import apiConfig, { ApiResponse } from '@/lib/api.config';
import apiService from '@/lib/api.service';
import type { Report, ReportStatus } from '@/types/api.types';

class ReportsService {
    // Helper to extract response data
    private async handleResponse<T>(promise: Promise<any>): Promise<T> {
        try {
            const res = await promise;
            return res.data?.data || res.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }

    // Get all reports
    async getReports(
        page = 1,
        limit = 10,
        status?: ReportStatus
    ): Promise<{ reports: Report[]; pagination: any }> {
        return this.handleResponse<{ reports: Report[]; pagination: any }>(
            apiService.get(apiConfig.endpoints.admin.reports, { 
                params: { page, limit, status } 
            })
        );
    }

    // Get report by ID
    async getReportById(id: string): Promise<Report> {
        return this.handleResponse<Report>(apiService.get(apiConfig.endpoints.admin.reportById(id)));
    }

    // Update report status
    async updateReport(
        id: string,
        data: { status: ReportStatus; reviewNote?: string; actionTaken?: string }
    ): Promise<Report> {
        return this.handleResponse<Report>(
            apiService.put(apiConfig.endpoints.admin.reportById(id), data)
        );
    }
}

export const reportsService = new ReportsService();
export default reportsService;
