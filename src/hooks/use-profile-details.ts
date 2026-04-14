"use client";

import { useQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { RelationshipInfo } from "@/services/relationship.service";

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
    organization?: string;
    education: string;
    highestEducation?: string;
    educationDetails?: string;
    specialization?: string;
    college?: string;
    bio?: string;
    about?: string;
    height?: string;
    weight?: string;
    maritalStatus: string;
    motherTongue: string;
    religion: string;
    caste: string;
    familyStatus?: string;
    familyType?: string;
    familyValues?: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    numberOfBrothers?: number;
    numberOfSisters?: number;
    diet?: string;
    smokingHabit?: string;
    drinkingHabit?: string;
    nativeVillage?: string;
    speaksChhattisgarhi?: boolean;
    residencyStatus?: string;
    annualIncome?: string;
    income?: string;
    dateOfBirth?: string;
    dob?: string;
    manglik?: boolean;
    nakshatra?: string;
    rashi?: string;
    membership?: 'FREE' | 'PREMIUM';
    isVerified?: boolean;
    media: Array<{ id: number; url: string; contentType: string; isProfile: boolean }>;
    profileCompleteness: number;
    isLiked?: boolean;
    isShortlisted?: boolean;
    isBlocked?: boolean;
    contactRequestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NONE';
    relationship?: RelationshipInfo;
    horoscope?: {
        birthTime?: string;
        birthPlace?: string;
        manglik?: boolean;
        gothra?: string;
        nakshatra?: string;
        rashi?: string;
    };
    family?: {
        fatherOccupation?: string;
        motherOccupation?: string;
        familyType?: string;
        familyStatus?: string;
        familyValues?: string;
        brothers?: number;
        sisters?: number;
    };
    lifestyle?: {
        diet?: string;
        smoking?: string;
        drinking?: string;
        bodyType?: string;
    };
}

export function useProfileDetails(profileId: string | number) {
    return useQuery({
        queryKey: ["profile-details", profileId],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.profiles.byId(Number(profileId)));
            const payload = res.data.data;
            const profile = payload.profile || payload;
            
            // Fetch relationship status separately if not included
            let relationship;
            try {
                const relRes = await apiService.get(apiConfig.endpoints.relationship.byUser(Number(profileId)));
                relationship = relRes.data.data;
            } catch (e) {
                console.error("Failed to fetch relationship status");
            }

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
                about: profile.bio || profile.about,
                dob: profile.dateOfBirth || profile.dob,
                income: profile.annualIncome || profile.income,
                relationship: relationship || profile.relationship,
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
