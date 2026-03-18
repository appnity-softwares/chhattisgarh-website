import { DashboardStats, User, MatchRequest } from '@/types/api.types';
import { RevenueAnalytics, SignupAnalytics, SubscriptionAnalytics } from './analytics.service';
import { PendingVerification, VerificationStats } from './verifications.service';
import { SubscriptionPlan } from '@/types/api.types';
import { SystemConfig } from './config.service';

/**
 * Mock Service implementation for Offline Mode
 * This allows testing the UI without a running backend
 */

export const mockData = {
    stats: {
        totalUsers: 1250,
        totalProfiles: 1180,
        totalMatches: 2450,
        totalMessages: 15600,
        totalPayments: 840,
        pendingReports: 5,
        pendingStories: 12,
        totalRevenue: 45000
    } as DashboardStats,

    users: [
        {
            id: 1,
            email: 'rahul.sahu@example.com',
            role: 'USER',
            isActive: true,
            isBanned: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            profile: { firstName: 'Rahul', lastName: 'Sahu' }
        },
        {
            id: 2,
            email: 'priya.verma@example.com',
            role: 'PREMIUM_USER',
            isActive: true,
            isBanned: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            profile: { firstName: 'Priya', lastName: 'Verma' }
        },
        {
            id: 3,
            email: 'amit.patel@example.com',
            role: 'USER',
            isActive: false,
            isBanned: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            lastLoginAt: null,
            profile: { firstName: 'Amit', lastName: 'Patel' }
        },
        {
            id: 4,
            email: 'banned.user@example.com',
            role: 'USER',
            isActive: true,
            isBanned: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
            profile: { firstName: 'Restricted', lastName: 'User' }
        },
        {
            id: 5,
            email: 'admin.test@example.com',
            role: 'ADMIN',
            isActive: true,
            isBanned: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
            lastLoginAt: new Date().toISOString(),
            profile: { firstName: 'System', lastName: 'Admin' }
        }
    ] as User[],

    matches: [
        { id: 1, senderId: 10, receiverId: 20, status: 'PENDING', createdAt: new Date().toISOString() },
        { id: 2, senderId: 15, receiverId: 25, status: 'ACCEPTED', createdAt: new Date().toISOString() }
    ] as MatchRequest[],

    revenue: {
        totalRevenue: 158400,
        growth: 12.5,
        data: [
            { month: 'Oct', year: 2025, revenue: 12000 },
            { month: 'Nov', year: 2025, revenue: 18000 },
            { month: 'Dec', year: 2025, revenue: 15000 },
            { month: 'Jan', year: 2026, revenue: 22000 },
            { month: 'Feb', year: 2026, revenue: 28000 },
            { month: 'Mar', year: 2026, revenue: 35000 }
        ]
    } as RevenueAnalytics,

    signups: {
        newUsers30d: 145,
        growth: 8.2,
        data: [
            { district: 'Raipur', users: 450 },
            { district: 'Durg', users: 320 },
            { district: 'Bilapur', users: 280 },
            { district: 'Korba', users: 150 },
            { district: 'Rajnandgaon', users: 120 }
        ]
    } as SignupAnalytics,

    subscriptions: {
        activeSubscriptions: 342,
        mostPopularPlan: 'Gold Plan',
        breakdown: [
            { plan: 'Free', count: 850 },
            { plan: 'Silver', count: 120 },
            { plan: 'Gold', count: 180 },
            { plan: 'Platinum', count: 42 }
        ]
    } as SubscriptionAnalytics,

    verifications: [
        {
            id: 1,
            userId: 1,
            mediaType: 'AADHAAR',
            mediaUrl: 'https://images.unsplash.com/photo-1633113088983-12fb3b2fe464?w=800&q=80',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            user: { id: 1, email: 'rahul.sahu@example.com', profile: { firstName: 'Rahul', lastName: 'Sahu' } }
        },
        {
            id: 2,
            userId: 2,
            mediaType: 'SELFIE',
            mediaUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            user: { id: 2, email: 'priya.verma@example.com', profile: { firstName: 'Priya', lastName: 'Verma' } }
        }
    ] as PendingVerification[],

    verifStats: {
        pending: 2,
        approved: 450,
        rejected: 25,
        total: 477
    } as VerificationStats,

    plans: [
        { id: 1, name: 'Silver Plan', description: 'Basic features for 1 month', price: 499, originalPrice: 999, durationDays: 30, features: ['10 interests/day', 'Direct chat'], isActive: true, hasActiveDiscount: true, discountPercentage: 50, effectivePrice: 499 },
        { id: 2, name: 'Gold Plan', description: 'Advanced features for 3 months', price: 1299, originalPrice: 1299, durationDays: 90, features: ['Unlimited interests', 'Direct chat', 'Profile boost'], isActive: true, hasActiveDiscount: false, discountPercentage: 0, effectivePrice: 1299 },
        { id: 3, name: 'Platinum Plan', description: 'Full access for 1 year', price: 3499, originalPrice: 4999, durationDays: 365, features: ['All Gold features', 'Personal manager', 'Verified badge'], isActive: true, hasActiveDiscount: true, discountPercentage: 30, effectivePrice: 3499 }
    ] as SubscriptionPlan[],

    notifications: [
        { id: 1, title: 'Happy Holi!', body: 'Get 50% off on all plans today.', target: 'ALL', status: 'SENT', sentAt: new Date().toISOString(), reach: 1250 },
        { id: 2, title: 'Complete your profile', body: 'Add more photos to get more matches!', target: 'PARTIAL_PROFILES', status: 'SENT', sentAt: new Date(Date.now() - 86400000).toISOString(), reach: 450 }
    ],

    promoCodes: [
        { id: 1, code: 'CG2026', discount: 20, type: 'PERCENTAGE', usageCount: 85, isActive: true, expiresAt: '2026-12-31' },
        { id: 2, code: 'NEW500', discount: 500, type: 'FLAT', usageCount: 124, isActive: false, expiresAt: '2025-12-31' }
    ],

    auditLogs: [
        { id: 1, admin: 'Admin Rahul', action: 'CHANGE_ROLE', target: 'User #224', timestamp: new Date().toISOString(), details: 'Updated to PREMIUM_USER' },
        { id: 2, admin: 'Admin Priya', action: 'TOGGLE_FEATURE', target: 'Maintenance Mode', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Enabled Maintenance' },
        { id: 3, admin: 'Admin Amit', action: 'APPROVE_PAYMENT', target: 'Order #9812', timestamp: new Date(Date.now() - 10800000).toISOString(), details: 'Verified Razorpay signature' }
    ],

    configs: [
        { id: 1, key: 'app_theme', value: JSON.stringify({ primary: '#FF9900', secondary: '#78B13F', background: '#FDFBF7', surface: '#FFFFFF', text: '#3D2A20', muted: '#9C8B7B', accent: '#F0C040', border: '#D8D3C5' }), category: 'theme' },
        { id: 2, key: 'app_info', value: JSON.stringify({ 
            name: 'Chhattisgarh Shaadi', 
            slogan: "Chhattisgarh's #1 Matrimony App", 
            description: 'Find your perfect life partner in Chhattisgarh.',
            googlePlayUrl: 'https://play.google.com/store/apps',
            apkUrl: '#'
        }), category: 'general' },
        { id: 3, key: 'app_features', value: JSON.stringify({ 
            maintenanceMode: false, 
            disableChat: false, 
            disableSignups: false, 
            showTestimonials: true,
            enablePayments: true,
            enableVerification: true,
            enableDiscovery: true,
            enableAgencyLogin: true,
            enableNotifications: true,
            enforceAppUpdate: false
        }), category: 'features' }
    ] as any[]
};

// Check both process.env and localStorage for offline mode
export const getOfflineStatus = (): boolean => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('APP_OFFLINE_MODE');
        if (stored !== null) return stored === 'true';
    }
    return process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true';
};

export const IS_OFFLINE = getOfflineStatus();

export async function withMock<T>(mockValue: T, realCall: () => Promise<T>): Promise<T> {
    if (getOfflineStatus()) {
        console.log('--- [%cOFFLINE MODE%c]: Returning mock data ---', 'color: orange; font-weight: bold', '');
        return new Promise((resolve) => setTimeout(() => resolve(mockValue), 500));
    }
    return realCall();
}
