"use client";

import { useQuery } from "@tanstack/react-query";
import apiConfig from "@/lib/api.config";
import apiService from "@/lib/api.service";

export function useProfileContact(userId?: number | null, enabled = true) {
  return useQuery({
    queryKey: ["profile-contact", userId],
    queryFn: async () => {
      const res = await apiService.get(apiConfig.endpoints.profiles.contact(userId as number));
      return res.data.data;
    },
    enabled: Boolean(userId) && enabled,
    staleTime: 30000,
  });
}

export default useProfileContact;
