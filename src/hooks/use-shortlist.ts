"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import interactionsService from "@/services/interactions.service";
import { useToast } from "@/hooks/use-toast";
import { useUserAuthStore } from "@/stores/user-auth-store";

export function useShortlist() {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: shortlistData, isLoading } = useQuery({
        queryKey: ["interactions", "shortlists"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.getShortlists(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch shortlist");
            
            const data = res.data?.shortlists || res.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: !!accessToken,
    });

    const removeFromShortlist = useMutation({
        mutationFn: async (shortlistedUserId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.removeFromShortlist(shortlistedUserId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to remove from shortlist");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interactions", "shortlists"] });
            toast({
                title: "Removed",
                description: "Profile removed from your shortlist.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to remove from shortlist.",
                variant: "destructive",
            });
        },
    });

    return {
        shortlist: shortlistData || [],
        isLoading,
        removeFromShortlist,
    };
}
