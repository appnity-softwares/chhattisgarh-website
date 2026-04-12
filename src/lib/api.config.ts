// API Configuration - Synchronized with Mobile App Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1';

export const apiConfig = {
    baseUrl: API_BASE_URL,
    socketUrl: 'https://api.chhattisgarhshadi.com',
    endpoints: {
        // Shared User Auth
        auth: {
            login: '/admin/login',
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
            preferences: '/preference',
            byId: (userId: number) => `/profiles/${userId}`,
            photos: '/uploads/profile-photos',
            deletePhoto: (mediaId: number) => `/profiles/photos/${mediaId}`,
            completion: '/profile/completion',
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
        blocks: {
            create: '/block',
            list: '/block',
            delete: (id: number) => `/block/${id}`,
        },
        reports: {
            create: '/report',
        },
        views: {
            record: '/view',
            history: '/view/history',
            visitors: '/view/who-viewed-me',
        },
        contactRequests: {
            send: '/contact-request',
            received: '/contact-request/received',
            sent: '/contact-request/sent',
            accept: (id: number) => `/contact-request/${id}/accept`,
            reject: (id: number) => `/contact-request/${id}/reject`,
        },
        photoRequests: {
            send: '/photo-request',
            received: '/photo-request/received',
            sent: '/photo-request/sent',
            accept: (id: number) => `/photo-request/${id}/accept`,
            reject: (id: number) => `/photo-request/${id}/reject`,
        },
        recommendations: {
            get: '/recommendations',
        },
        // Communication
        messages: {
            send: '/messages',
            conversations: '/messages/conversations',
            history: (userId: number) => `/messages/${userId}`,
            unreadCount: '/messages/unread-count',
            markRead: (userId: number) => `/messages/${userId}/read`,
        },
        notifications: {
            list: '/notifications',
            unreadCount: '/notifications/unread-count',
            markRead: (id: number) => `/notifications/${id}/read`,
            markAllRead: '/notifications/mark-all-read',
        },
        // Payments & Business
        payments: {
            plans: '/plans',
            createOrder: '/payments/orders',
            verify: '/payments/verify',
            history: '/payments/me',
            validatePromo: '/payments/promo-codes/validate',
        },
        webPayments: {
            plans: '/web/payment/plans',
            createLink: '/web/payment/create-link',
            initiateSession: '/web/payment/initiate-session',
            details: '/web/payment/details',
            success: '/web/payment/success',
            failed: '/web/payment/failed',
            boostCreateLink: '/web/boost/create-link',
            boostDetails: '/web/boost/details',
            boostSuccess: '/web/boost/success',
        },
        boosts: {
            packages: '/boost/packages',
            active: '/boost/active',
            history: '/boost/history',
        },
        astrology: {
            generateKundli: '/astrology/kundli',
            match: '/astrology/match',
        },
        horoscope: {
            match: '/horoscope/match',
            details: '/horoscope/details',
        },
        // Settings & Privacy
        settings: {
            privacy: '/privacy/profile',
            communication: '/privacy/communication',
            photoPrivacy: '/settings/photos/privacy',
            notifications: '/settings/notifications',
        },
        // Meta Data / Dictionaries
        metadata: {
            education: '/education',
            occupation: '/occupation',
            locationByPin: (pin: string) => `/location/pincode/${pin}`,
        },
        // Admin Specific (Unique to Web Admin Console)
        admin: {
            stats: '/admin/stats',
            users: '/admin/users',
            recentUsers: '/admin/users/recent',
            userById: (id: string) => `/admin/users/${id}`,
            userRole: (id: string) => `/admin/users/${id}/role`,
            profiles: '/admin/profiles',
            verifications: '/admin/verifications',
            analyticsRevenue: '/admin/analytics/revenue',
            analyticsSignups: '/admin/analytics/signups',
            analyticsSubscriptions: '/admin/analytics/subscriptions',
            recentMatches: '/admin/matches/recent',
            reports: '/admin/reports',
            notifications: '/admin/notifications/send',
            notificationsSend: '/admin/notifications/send',
            notificationsHistory: '/admin/notifications/history',
            promoCodes: '/admin/promo-codes',
            promoCodeById: (id: string) => `/admin/promo-codes/${id}`,
            successStories: '/admin/success-stories',
            auditLogs: '/admin/activity-logs',
            activityLogs: '/admin/activity-logs',
            activityLogsStats: '/admin/activity-logs/stats',
            reportById: (id: string) => `/admin/reports/${id}`,
            verificationsPending: '/admin/verifications/pending',
            verificationsStats: '/admin/verifications/stats',
            verificationApprove: (id: string) => `/admin/verifications/${id}/approve`,
            verificationReject: (id: string) => `/admin/verifications/${id}/reject`,
            verificationResubmit: (id: string) => `/admin/verifications/${id}/resubmit`,
            grantSubscription: (id: string) => `/admin/users/${id}/grant-subscription`,
            userProfile: (id: string) => `/admin/users/${id}/profile`,
            userBan: (id: string) => `/admin/users/${id}/ban`,
            userUnban: (id: string) => `/admin/users/${id}/unban`,
            userBulkUpload: '/admin/users/bulk-upload',
            profileVerify: (id: number) => `/admin/profiles/${id}/verify`,
            profileStatus: (id: number) => `/admin/profiles/${id}/status`,
            cleanupTokens: '/admin/cleanup/tokens',
            plans: '/admin/plans',
            planById: (id: string | number) => `/admin/plans/${id}`,
            planDiscount: (id: string | number) => `/admin/plans/${id}/discount`,
            // Agents Management
            agents: '/admin/agents',
            agentById: (id: string) => `/admin/agents/${id}`,
            agentUsers: (id: string) => `/admin/agents/${id}/users`,
        },
        public: {
            faq: '/faq',
            successStories: '/success-stories', 
            stats: '/admin/verifications/stats', // Example public stat
            theme: '/theme',
            config: '/config/public',
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
