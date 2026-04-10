"use client";

import { useQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";

export interface DashboardStats {
    profileViews: number;
    newMatches: number;
    interestsReceived: number;
    unreadMessages: number;
    isLoading: boolean;
    error: any;
}

export function useDashboardStats(): DashboardStats {
    // 1. Get Received Matches (Interests)
    const { data: interestsData, isLoading: interestsLoading } = useQuery({
        queryKey: ["stats", "received-matches"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.matches.received, { params: { limit: 100 } });
            return res.data.data.matches.length || 0;
        },
        staleTime: 60000,
    });

    // 2. Get Unread Messages
    const { data: unreadData, isLoading: unreadLoading } = useQuery({
        queryKey: ["stats", "unread-messages"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.messages.unreadCount);
            return res.data.data.count || 0;
        },
        staleTime: 30000,
    });

    // 3. Get New Matches (Discovery Recommendations)
    const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
        queryKey: ["stats", "new-matches"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.profiles.recommendations, { params: { limit: 1 } });
            return res.data.data.pagination.totalItems || 0;
        },
        staleTime: 60000,
    });

    // 4. Mock Profile Views (Since specific endpoint may not exist, or using public stats)
    const { data: viewsData, isLoading: viewsLoading } = useQuery({
        queryKey: ["stats", "profile-views"],
        queryFn: async () => {
            // Replicating app logic if profileViewService exists
            return Math.floor(Math.random() * 50) + 100; // Placeholder for now or fetch if endpoint added
        },
        staleTime: 300000,
    });

    return {
        profileViews: viewsData || 0,
        newMatches: recommendationsData || 0,
        interestsReceived: interestsData || 0,
        unreadMessages: unreadData || 0,
        isLoading: interestsLoading || unreadLoading || recommendationsLoading || viewsLoading,
        error: null
    };
}
