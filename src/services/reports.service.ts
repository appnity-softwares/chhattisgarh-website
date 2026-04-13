import apiConfig from '@/lib/api.config';
import apiService from '@/lib/api.service';
import type { Report, ReportStatus, PaginationData } from '@/types/api.types';
import type { AxiosResponse } from 'axios';

class ReportsService {
    // Helper to extract response data
    private async handleResponse<T>(promise: Promise<AxiosResponse<unknown>>): Promise<T> {
        try {
            const res = await promise;
            const data = res.data as { data?: T };
            return (data?.data || res.data) as T;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            throw new Error(err.response?.data?.message || err.message || 'Request failed');
        }
    }

    // Get all reports
    async getReports(
        page = 1,
        limit = 10,
        status?: ReportStatus
    ): Promise<{ reports: Report[]; pagination: PaginationData }> {
        const response = await this.handleResponse<{ 
            reports: Report[]; 
            pagination: { total: number; pages: number; currentPage: number; limit: number } 
        }>(
            apiService.get(apiConfig.endpoints.admin.reports, { 
                params: { page, limit, status } 
            })
        );

        return {
            reports: response.reports,
            pagination: {
                total: response.pagination.total,
                totalPages: response.pagination.pages,
                page: response.pagination.currentPage,
                limit: response.pagination.limit
            }
        };
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
