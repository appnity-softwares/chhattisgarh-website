// API Configuration - Synchronized with Mobile App Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1';

export const apiConfig = {
    baseUrl: API_BASE_URL,
    socketUrl: 'https://api.chhattisgarhshadi.com',
    endpoints: {
        // Shared User Auth
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            google: '/auth/google',
            refresh: '/auth/refresh',
            logout: '/auth/logout',
            phoneLogin: '/auth/phone/login',
        },
        // Shared User Profiles
        profiles: {
            me: '/profiles/me',
            create: '/profiles',
            search: '/profiles/search',
            recommendations: '/profiles/recommendations',
            byId: (userId: number) => `/profiles/${userId}`,
            photos: '/uploads/profile-photos',
            deletePhoto: (mediaId: number) => `/profiles/photos/${mediaId}`,
        },
        // Matches & Interactions
        matches: {
            send: '/matches',
            sent: '/matches/sent',
            received: '/matches/received',
            accepted: '/matches/accepted',
            accept: (id: number) => `/matches/${id}/accept`,
            reject: (id: number) => `/matches/${id}/reject`,
        },
        shortlists: {
            create: '/shortlist',
            list: '/shortlist',
            delete: (id: number) => `/shortlist/${id}`,
        },
        // Communication
        messages: {
            send: '/messages',
            conversations: '/messages/conversations',
            history: (userId: number) => `/messages/${userId}`,
            unreadCount: '/messages/unread-count',
            markRead: (userId: number) => `/messages/${userId}/read`,
        },
        // Payments & Business
        payments: {
            plans: '/plans',
            createOrder: '/payments/orders',
            verify: '/payments/verify',
            history: '/payments/me',
            validatePromo: '/payments/promo-codes/validate',
        },
        // Admin Specific (Unique to Web Admin Console)
        admin: {
            stats: '/admin/stats',
            users: '/admin/users',
            recentUsers: '/admin/users', // Reusing users with limit
            userById: (id: string) => `/admin/users/${id}`,
            userRole: (id: string) => `/admin/users/${id}/role`,
            profiles: '/admin/profiles',
            verifications: '/admin/verifications',
            analyticsRevenue: '/admin/analytics/revenue',
            analyticsSignups: '/admin/analytics/signups',
            analyticsSubscriptions: '/admin/analytics/subscriptions',
            recentMatches: '/admin/matches', // Reusing matches with limit
            reports: '/admin/reports',
            notifications: '/admin/notifications/send',
            promoCodes: '/admin/promo-codes',
            successStories: '/admin/success-stories',
            auditLogs: '/admin/activity-logs',
            activityLogs: '/admin/activity-logs', // Alias
            activityLogsStats: '/admin/activity-logs/stats',
            reportById: (id: string) => `/admin/reports/${id}`,
            verificationsPending: '/admin/verifications/pending',
            verificationsStats: '/admin/verifications/stats',
            verificationApprove: (id: string) => `/admin/verifications/${id}/approve`,
            verificationReject: (id: string) => `/admin/verifications/${id}/reject`,
            verificationResubmit: (id: string) => `/admin/verifications/${id}/resubmit`,
            grantSubscription: (id: string) => `/admin/users/${id}/grant-subscription`,
            userProfile: (id: string) => `/admin/users/${id}/profile`,
            plans: '/admin/plans',
        },
        public: {
            faq: '/faq',
            successStories: '/admin/success-stories', // Shared with admin
            stats: '/admin/verifications/stats', // Example public stat
        }
    },
    socketEvents: {
        CONNECTION: 'connection',
        DISCONNECT: 'disconnect',
        MESSAGE_SEND: 'message:send',
        MESSAGE_RECEIVED: 'message:received',
        MESSAGE_READ: 'message:read',
        MESSAGE_DELIVERED: 'message:delivered',
        TYPING_START: 'typing:start',
        TYPING_STOP: 'typing:stop',
        USER_ONLINE: 'user:online',
        USER_OFFLINE: 'user:offline',
    }
};

// Create headers with auth token for web fetch/axios
export const getAuthHeaders = (token?: string): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// API Response wrapper consistent with backend
export interface ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export default apiConfig;
