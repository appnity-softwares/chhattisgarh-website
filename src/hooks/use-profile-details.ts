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
            return res.data.data as ProfileDetails;
        },
        enabled: !!profileId,
    });
}
