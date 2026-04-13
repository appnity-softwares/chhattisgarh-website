"use client";

import { useQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";

export interface ProfileDetails {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    age: number;
    gender: 'MALE' | 'FEMALE';
    city: string;
    state: string;
    occupation: string;
    education: string;
    bio?: string;
    height?: string;
    weight?: string;
    maritalStatus: string;
    motherTongue: string;
    religion: string;
    caste: string;
    familyStatus?: string;
    familyType?: string;
    familyValues?: string;
    isVerified?: boolean;
    media: Array<{ id: number; url: string; contentType: string; isProfile: boolean }>;
    profileCompleteness: number;
    isLiked?: boolean;
    isShortlisted?: boolean;
    isBlocked?: boolean;
    contactRequestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NONE';
}

export function useProfileDetails(profileId: string | number) {
    return useQuery({
        queryKey: ["profile-details", profileId],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.profiles.byId(Number(profileId)));
            const payload = res.data.data;
            const profile = payload.profile || payload;
            const derivedAge = profile.dateOfBirth
                ? Math.max(
                    0,
                    Math.floor(
                        (Date.now() - new Date(profile.dateOfBirth).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )
                )
                : 0;

            return {
                ...profile,
                age: profile.age || derivedAge,
                education: Array.isArray(profile.education) ? profile.education[0] : profile.education,
                media: (profile.media || []).map((media: { id: number; url: string; contentType: string; isProfile?: boolean; isProfilePicture?: boolean; isDefault?: boolean }) => ({
                    ...media,
                    isProfile: media.isProfile || media.isProfilePicture || media.isDefault,
                })),
                profileCompleteness:
                    payload.profileCompleteness ??
                    profile.profileCompleteness ??
                    0,
            } as ProfileDetails;
        },
        enabled: !!profileId,
    });
}
