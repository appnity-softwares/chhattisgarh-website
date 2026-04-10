"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import interactionsService from "@/services/interactions.service";
import { useToast } from "@/hooks/use-toast";
import { useUserAuthStore } from "@/stores/user-auth-store";

export function useMatches(type: 'received' | 'sent' | 'accepted' = 'received') {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: matchesData, isLoading, refetch } = useQuery({
        queryKey: ["matches", type],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            let res;
            switch (type) {
                case 'received':
                    res = await interactionsService.getReceivedMatches(accessToken);
                    break;
                case 'sent':
                    res = await interactionsService.getSentMatches(accessToken);
                    break;
                case 'accepted':
                    // Use the accepted endpoint
                    const acceptedRes = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1'}/matches/accepted`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        }
                    );
                    res = await acceptedRes.json();
                    break;
            }
            if (!res.success) throw new Error(res.message || "Failed to fetch matches");
            
            const data = res.data;
            if (Array.isArray(data)) return data;
            if (data?.matches && Array.isArray(data.matches)) return data.matches;
            if (data?.receivedMatches && Array.isArray(data.receivedMatches)) return data.receivedMatches;
            if (data?.sentMatches && Array.isArray(data.sentMatches)) return data.sentMatches;
            if (data?.acceptedMatches && Array.isArray(data.acceptedMatches)) return data.acceptedMatches;
            
            return [];
        },
        enabled: !!accessToken,
    });

    const acceptMatch = useMutation({
        mutationFn: async (matchId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.acceptMatch(matchId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to accept match");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            toast({
                title: "Match Accepted! 💕",
                description: "You can now chat with this person.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to accept match.",
                variant: "destructive",
            });
        },
    });

    const rejectMatch = useMutation({
        mutationFn: async (matchId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.rejectMatch(matchId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to reject match");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            toast({
                title: "Match Declined",
                description: "This match has been declined.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to decline match.",
                variant: "destructive",
            });
        },
    });

    return {
        matches: matchesData || [],
        isLoading,
        refetch,
        acceptMatch,
        rejectMatch,
    };
}
