// API Types matching backend Prisma schema

export enum UserRole {
    USER = 'USER',
    BASIC_USER = 'BASIC_USER',
    PREMIUM_USER = 'PREMIUM_USER',
    ADMIN = 'ADMIN',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum MaritalStatus {
    NEVER_MARRIED = 'NEVER_MARRIED',
    DIVORCED = 'DIVORCED',
    WIDOWED = 'WIDOWED',
    AWAITING_DIVORCE = 'AWAITING_DIVORCE',
    ANNULLED = 'ANNULLED',
}

export enum ReportStatus {
    PENDING = 'PENDING',
    UNDER_REVIEW = 'UNDER_REVIEW',
    RESOLVED = 'RESOLVED',
    DISMISSED = 'DISMISSED',
    ESCALATED = 'ESCALATED',
}

export enum ReportReason {
    FAKE_PROFILE = 'FAKE_PROFILE',
    INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
    HARASSMENT = 'HARASSMENT',
    SCAM = 'SCAM',
    SPAM = 'SPAM',
    UNDERAGE = 'UNDERAGE',
    IMPERSONATION = 'IMPERSONATION',
    PRIVACY_VIOLATION = 'PRIVACY_VIOLATION',
    OTHER = 'OTHER',
}

export enum AgentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    TERMINATED = 'TERMINATED',
}

export enum VerificationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    RESUBMIT_REQUIRED = 'RESUBMIT_REQUIRED',
}

// User Type
export interface User {
    id: number;
    email?: string;
    phone: string;
    isPhoneVerified: boolean;
    profilePicture?: string;
    role: UserRole;
    isActive: boolean;
    isBanned: boolean;
    banReason?: string;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    profile?: Profile;
    agent?: {
        agentCode: string;
        agentName: string;
    };
    subscriptions?: any[];
    payments?: any[];
    reportsReceived?: Report[];
    activityLogs?: ActivityLog[];
}

// Profile Type
export interface Profile {
    id: number;
    userId: number;
    profileId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    displayName?: string;
    dateOfBirth: string;
    gender: Gender;
    maritalStatus: MaritalStatus;
    religion: string;
    caste?: string;
    motherTongue: string;
    city: string;
    state: string;
    country: string;
    bio?: string;
    profileCompleteness: number;
    isVerified: boolean;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

// Report Type
export interface Report {
    id: number;
    reporterId: number;
    reportedUserId: number;
    reason: ReportReason;
    description: string;
    evidence?: string[];
    status: ReportStatus;
    reviewNote?: string;
    actionTaken?: string;
    reviewedAt?: string;
    createdAt: string;
    reporter: {
        id: number;
        email: string;
        profile?: { firstName: string; lastName: string };
    };
    reportedUser: {
        id: number;
        email: string;
        profile?: { firstName: string; lastName: string };
    };
}

// Agent Type
export interface Agent {
    id: number;
    agentCode: string;
    agentName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    city?: string;
    district?: string;
    state?: string;
    totalUsersAdded: number;
    activeUsers: number;
    status: AgentStatus;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Subscription Plan Type
export interface SubscriptionPlan {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    durationDays: number;
    features: string[];
    discountPercentage: number;
    discountValidUntil?: string;
    displayOrder: number;
    isActive: boolean;
    effectivePrice?: number;
    hasActiveDiscount?: boolean;
    roleToAssign: UserRole;
}

// Dashboard Stats Type
export interface DashboardStats {
    totalUsers: number;
    totalProfiles: number;
    totalMatches: number;
    totalMessages: number;
    totalPayments: number;
    pendingReports: number;
    pendingStories: number;
}

// Match Request Type
export interface MatchRequest {
    id: number;
    senderId: number;
    receiverId: number;
    status: string;
    createdAt: string;
    sender: {
        id: number;
        email: string;
        profile?: Profile;
    };
    receiver: {
        id: number;
        email: string;
        profile?: Profile;
    };
}

// Auth Response
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    isNewUser: boolean;
}

export interface AdminLoginResponse {
    token: string;
    user: {
        email: string;
        role: string;
    };
}

export interface ActivityLog {
    id: number;
    userId: number;
    action: string;
    description: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    user?: {
        id: number;
        email: string;
        profilePicture?: string;
        profile?: {
            firstName: string;
            lastName: string;
        };
    };
}

export enum ContactMessageStatus {
    PENDING = 'PENDING',
    READ = 'READ',
    REPLIED = 'REPLIED',
}

export enum SuccessStoryStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
}

export interface PromoCode {
    id: number;
    code: string;
    discount: number;
    discountType: 'PERCENTAGE' | 'FLAT';
    usageCount: number;
    maxUsage?: number;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
}

export interface SuccessStory {
    id: number;
    userId1: number;
    user1: {
        id: number;
        email: string;
        phone?: string;
        profile?: Profile;
    };
    userId2?: number;
    user2?: {
        id: number;
        email: string;
        phone?: string;
        profile?: Profile;
    };
    partnerName?: string;
    title?: string;
    story: string;
    weddingDate?: string;
    imageUrl?: string;
    galleryUrls?: string; // JSON string
    status: SuccessStoryStatus;
    isFeatured: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: ContactMessageStatus;
    createdAt: string;
    updatedAt: string;
}
