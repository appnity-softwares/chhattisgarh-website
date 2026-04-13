"use client";

import { useQuery } from "@tanstack/react-query";
import apiConfig from "@/lib/api.config";
import apiService from "@/lib/api.service";
import { useUserAuthStore } from "@/stores/user-auth-store";

export interface UserAccess {
  canChat: boolean;
  requiresMatchToChat: boolean;
  messageLimitPerDay: number;
  canInitiateChat: boolean;
  canSeeProfileVisitors: boolean;
  priorityListing: boolean;
  verifiedBadge: boolean;
  planName: string;
  isPremium: boolean;
  canViewContacts: boolean;
  photoLimit: number;
}

export function useUserAccess() {
  const { accessToken } = useUserAuthStore();

  return useQuery({
    queryKey: ["user-access"],
    queryFn: async () => {
      const res = await apiService.get(apiConfig.endpoints.users.access);
      return res.data.data as UserAccess;
    },
    enabled: !!accessToken,
    staleTime: 60000,
  });
}

export default useUserAccess;
