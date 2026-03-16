// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1';

export const apiConfig = {
    baseUrl: API_BASE_URL,
    endpoints: {
        // Auth
        auth: {
            google: '/auth/google',
            refresh: '/auth/refresh',
            logout: '/auth/logout',
        },
        // Admin
        admin: {
            stats: '/admin/stats',
            users: '/admin/users',
            recentUsers: '/admin/users/recent',
            userById: (userId: string) => `/admin/users/${userId}`,
            userRole: (userId: string) => `/admin/users/${userId}/role`,
            profiles: '/admin/profiles',
            recentMatches: '/admin/matches/recent',
            reports: '/admin/reports',
            reportById: (id: string) => `/admin/reports/${id}`,
            plans: '/admin/plans',
            planById: (planId: string) => `/admin/plans/${planId}`,
            planDiscount: (planId: string) => `/admin/plans/${planId}/discount`,
            agents: '/admin/agents',
            agentById: (agentId: string) => `/admin/agents/${agentId}`,
            agentUsers: (agentId: string) => `/admin/agents/${agentId}/users`,
            verifications: '/admin/verifications',
            // Analytics
            analyticsRevenue: '/admin/analytics/revenue',
            analyticsSignups: '/admin/analytics/signups',
            analyticsSubscriptions: '/admin/analytics/subscriptions',
            // Verifications
            verificationsPending: '/admin/verifications/pending',
            verificationsStats: '/admin/verifications/stats',
            verificationById: (mediaId: string) => `/admin/verifications/${mediaId}`,
            verificationApprove: (mediaId: string) => `/admin/verifications/${mediaId}/approve`,
            verificationReject: (mediaId: string) => `/admin/verifications/${mediaId}/reject`,
            verificationResubmit: (mediaId: string) => `/admin/verifications/${mediaId}/resubmit`,
            // Activity Logs
            activityLogs: '/admin/activity-logs',
            activityLogsStats: '/admin/activity-logs/stats',
        },
        // Contact
        contact: {
            submit: '/contact',
            messages: '/contact',
            messageById: (id: string) => `/contact/${id}`,
            updateStatus: (id: string) => `/contact/${id}/status`,
        },
        // FAQ
        faq: {
            public: '/faq',
            admin: '/faq/admin',
            create: '/faq',
            update: (id: number) => `/faq/${id}`,
            delete: (id: number) => `/faq/${id}`,
        },
    },
};

// Create headers with auth token
export const getAuthHeaders = (token?: string): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// API Response wrapper
export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export default apiConfig;
