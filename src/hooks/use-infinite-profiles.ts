"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";

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
}

export function useInfiniteProfiles(params: any = {}) {
    return useInfiniteQuery({
        queryKey: ["profiles", "discovery", params],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await apiService.get(apiConfig.endpoints.profiles.search, {
                params: {
                    ...params,
                    page: pageParam,
                    limit: 12,
                },
            });
            return res.data.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.pagination;
            return page < totalPages ? page + 1 : undefined;
        },
    });
}
