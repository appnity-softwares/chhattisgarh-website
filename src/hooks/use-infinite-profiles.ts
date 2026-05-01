"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { MatchRequest } from "@/types/api.types";

export interface Profile {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    age: number;
    gender: 'MALE' | 'FEMALE';
    city: string;
    occupation: string;
    education?: string;
    isVerified?: boolean;
    media?: Array<{ url: string }>;
    score?: number;
    isShortlisted?: boolean;
    allowPhotoRequest?: boolean;
}

export function useInfiniteProfiles(params: Record<string, unknown> = {}) {
    return useInfiniteQuery({
        queryKey: ["profiles", params.type || "discovery", params],
        queryFn: async ({ pageParam = 1 }) => {
            let endpoint = apiConfig.endpoints.profiles.search;
            
            // Handle different types for Matches Page
            if (params.type === 'accepted') endpoint = apiConfig.endpoints.matches.accepted;
            if (params.type === 'sent') endpoint = apiConfig.endpoints.matches.sent;
            if (params.type === 'received' || params.type === 'new') endpoint = apiConfig.endpoints.matches.received;
            if (params.type === 'recommendations') endpoint = apiConfig.endpoints.profiles.recommendations;

            const res = await apiService.get(endpoint, {
                params: {
                    ...params,
                    page: pageParam,
                    limit: 12,
                },
            });

            const rawData = res.data.data;
            
            // Normalize data: match endpoints return 'matches', search returns 'profiles'
            let profiles = rawData.profiles || [];
            
            if (rawData.matches) {
                profiles = (rawData.matches as MatchRequest[]).map((m) => {
                    // For matches, the profile we want to show is usually the 'other' person.
                    // If we are looking at 'sent', we want 'receiver'
                    // If we are looking at 'received', we want 'sender'
                    const target = params.type === 'sent' ? m.receiver : m.sender;
                    // Normalize data: match endpoints return 'matches', search returns 'profiles'
                    const profileData = (target?.profile || target || {}) as unknown;
                    
                    return {
                        ...profileData,
                        id: profileData.id || target?.id || m.id,
                        firstName: profileData.firstName || "User",
                        lastName: profileData.lastName || "",
                    };
                });
            }

            return {
                profiles,
                pagination: rawData.pagination || { page: pageParam, totalPages: 1 }
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.pagination;
            return page < totalPages ? page + 1 : undefined;
        },
    });
}
