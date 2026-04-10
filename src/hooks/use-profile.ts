"use client";

import { useQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";

export interface UserProfile {
    id: number;
    email: string;
    phone: string;
    profile: {
        firstName: string;
        lastName: string;
        gender: string;
        dateOfBirth: string;
        media: { url: string; type: string }[];
    };
    subscription?: {
        id: number;
        planName: string;
        status: string;
        endDate: string;
        planId: number;
    };
}

export function useProfile() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.profiles.me);
            return res.data.data as UserProfile;
        },
        staleTime: 300000, // 5 minutes
    });
}
