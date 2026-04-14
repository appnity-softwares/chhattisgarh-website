const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const apiConfig = {
  baseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  endpoints: {
    auth: {
      login: '/admin/login',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      phoneLogin: '/auth/phone/login',
      verifyFirebasePhone: '/auth/phone/verify-firebase',
    },
    users: {
      me: '/users/me',
      access: '/users/access',
      search: '/users/search',
      byId: (userId: number | string) => `/users/${userId}`,
      fcmToken: '/users/fcm-token',
    },
    profiles: {
      me: '/profiles/me',
      create: '/profiles',
      delete: '/profiles/me',
      search: '/profiles/search',
      recommendations: '/profiles/recommendations',
      preferences: '/preference',
      byId: (userId: number | string) => `/profiles/${userId}`,
      contact: (userId: number | string) => `/profiles/${userId}/contact`,
      photos: '/uploads/profile-photos',
      deletePhoto: (mediaId: number | string) => `/profiles/photos/${mediaId}`,
      completion: '/profile/completion',
    },
    relationship: {
      byUser: (userId: number | string) => `/relationship/${userId}`,
    },
    matches: {
      send: '/matches',
      sent: '/matches/sent',
      received: '/matches/received',
      accepted: '/matches/accepted',
      accept: (matchId: number | string) => `/matches/${matchId}/accept`,
      reject: (matchId: number | string) => `/matches/${matchId}/reject`,
      delete: (matchId: number | string) => `/matches/${matchId}`,
    },
    shortlists: {
      create: '/shortlist',
      list: '/shortlist',
      delete: (userId: number | string) => `/shortlist/${userId}`,
    },
    blocks: {
      create: '/block',
      list: '/block',
      delete: (blockedId: number | string) => `/block/${blockedId}`,
    },
    reports: {
      create: '/report',
    },
    views: {
      record: '/view',
      history: '/view/my-history',
      visitors: '/view/who-viewed-me',
    },
    contactRequests: {
      send: '/contact-request',
      sent: '/contact-request/sent',
      received: '/contact-request/received',
      respond: (requestId: number | string) => `/contact-request/${requestId}/respond`,
    },
    photoRequests: {
      send: '/photo-request',
      sent: '/photo-request/sent',
      received: '/photo-request/received',
      respond: (requestId: number | string) => `/photo-request/${requestId}/respond`,
    },
    recommendations: {
      get: '/recommendations',
      superMatches: '/recommendations/super-matches',
      score: (userId: number | string) => `/recommendations/score/${userId}`,
    },
    messages: {
      send: '/messages',
      conversations: '/messages/conversations',
      history: (userId: number | string) => `/messages/${userId}`,
      eligibility: (userId: number | string) => `/messages/eligibility/${userId}`,
      unreadCount: '/messages/unread-count',
      markRead: (userId: number | string) => `/messages/${userId}/read`,
      delete: (messageId: number | string) => `/messages/${messageId}`,
      deleteConversation: (userId: number | string) => `/messages/conversations/${userId}`,
    },
    notifications: {
      list: '/notifications',
      unreadCount: '/notifications/unread-count',
      markRead: (notificationId: number | string) => `/notifications/${notificationId}/read`,
      markAllRead: '/notifications/read-all',
      delete: (notificationId: number | string) => `/notifications/${notificationId}`,
      deleteAll: '/notifications',
      registerDevice: '/notifications/device',
      unregisterDevice: (token: string) => `/notifications/device/${encodeURIComponent(token)}`,
    },
    plans: {
      list: '/plans',
    },
    payments: {
      createOrder: '/payments/orders',
      createUpgradeOrder: '/payments/upgrade',
      verify: '/payments/verify',
      history: '/payments/me',
      byId: (paymentId: number | string) => `/payments/${paymentId}`,
      validatePromo: '/payments/promo-codes/validate',
      status: (orderId: string) => `/payments/status/${orderId}`,
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
      featured: '/boost/featured',
      active: '/boost/active',
      activate: '/boost/activate',
      createOrder: '/boost/order',
      verify: '/boost/verify',
    },
    astrology: {
      nakshatras: '/astrology/nakshatras',
      rashis: '/astrology/rashis',
      match: (userId: number | string) => `/astrology/match/${userId}`,
    },
    settings: {
      privacy: '/privacy/profile',
      communication: '/privacy/communication',
      search: '/privacy/search',
      security: '/privacy/security',
      notifications: '/settings/notifications',
      photoPrivacy: (mediaId: number | string) => `/photos/${mediaId}/privacy`,
    },
    metadata: {
      education: '/education',
      occupation: '/occupation',
      locationByPin: (pin: string) => `/location?pincode=${encodeURIComponent(pin)}`,
    },
    contact: {
      submit: '/contact',
      messages: '/contact',
      messageById: (id: string | number) => `/contact/${id}`,
      updateStatus: (id: string | number) => `/contact/${id}/status`,
    },
    admin: {
      stats: '/admin/stats',
      users: '/admin/users',
      recentUsers: '/admin/users/recent',
      userById: (id: string) => `/admin/users/${id}`,
      userRole: (id: string) => `/admin/users/${id}/role`,
      profiles: '/admin/profiles',
      verificationsPending: '/admin/verifications/pending',
      verificationsStats: '/admin/verifications/stats',
      verificationApprove: (id: string) => `/admin/verifications/${id}/approve`,
      verificationReject: (id: string) => `/admin/verifications/${id}/reject`,
      verificationResubmit: (id: string) => `/admin/verifications/${id}/resubmit`,
      analyticsRevenue: '/admin/analytics/revenue',
      analyticsSignups: '/admin/analytics/signups',
      analyticsSubscriptions: '/admin/analytics/subscriptions',
      recentMatches: '/admin/matches/recent',
      reports: '/admin/reports',
      reportById: (id: string) => `/admin/reports/${id}`,
      notificationsSend: '/admin/notifications/send',
      notificationsHistory: '/admin/notifications/history',
      promoCodes: '/admin/promo-codes',
      promoCodeById: (id: string) => `/admin/promo-codes/${id}`,
      successStories: '/admin/success-stories',
      auditLogs: '/admin/activity-logs',
      activityLogs: '/admin/activity-logs',
      activityLogsStats: '/admin/activity-logs/stats',
      cleanupTokens: '/admin/cleanup/tokens',
      plans: '/admin/plans',
      planById: (id: string | number) => `/admin/plans/${id}`,
      planDiscount: (id: string | number) => `/admin/plans/${id}/discount`,
      grantSubscription: (id: string) => `/admin/users/${id}/grant-subscription`,
      userProfile: (id: string) => `/admin/users/${id}/profile`,
      userBan: (id: string) => `/admin/users/${id}/ban`,
      userUnban: (id: string) => `/admin/users/${id}/unban`,
      userBulkUpload: '/admin/users/bulk-upload',
      profileVerify: (id: number | string) => `/admin/profiles/${id}/verify`,
      profileStatus: (id: number | string) => `/admin/profiles/${id}/status`,
      agents: '/admin/agents',
      agentById: (id: string) => `/admin/agents/${id}`,
      agentUsers: (id: string) => `/admin/agents/${id}/users`,
      payments: '/admin/payments',
      diagnostics: '/admin/diagnostics',
      flushCache: '/admin/diagnostics/flush-cache',
      faq: '/faq',
      faqAdmin: '/faq/admin',
      faqById: (id: string | number) => `/faq/${id}`,
    },
    public: {
      faq: '/faq',
      successStories: '/success-stories',
      stats: '/public/stats',
      theme: '/theme',
      config: '/config/public',
    },
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
  },
};

export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  total?: number;
  totalItems?: number;
  itemsPerPage?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export default apiConfig;
