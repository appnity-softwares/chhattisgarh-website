"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import interactionsService from "@/services/interactions.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useToast } from "@/hooks/use-toast";

export interface ContactRequest {
    id: number;
    requesterId: number;
    profileId: number;
    requestType: 'PHONE' | 'EMAIL' | 'WHATSAPP';
    message?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    createdAt: string;
    expiresAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    requester?: {
        id: number;
        profile: {
            firstName: string;
            lastName: string;
            media?: { url: string }[];
        };
    };
    profile?: {
        id: number;
        firstName: string;
        lastName: string;
        media?: { url: string }[];
    };
}

export interface ContactRequestsResponse {
    requests: ContactRequest[];
    pagination: {
        page: number;
        totalPages: number;
        totalItems: number;
    };
}

export function useContactRequests() {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Get received contact requests
    const received = useQuery({
        queryKey: ["contact-requests", "received"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.getReceivedContactRequests(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch received requests");

            // Handle different response structures
            const data = res.data;
            if (data?.requests) return data.requests as ContactRequest[];
            if (Array.isArray(data)) return data as ContactRequest[];
            return [];
        },
        enabled: !!accessToken,
        staleTime: 30000, // 30 seconds
    });

    // Get sent contact requests
    const sent = useQuery({
        queryKey: ["contact-requests", "sent"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.getSentContactRequests(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch sent requests");

            // Handle different response structures
            const data = res.data;
            if (data?.requests) return data.requests as ContactRequest[];
            if (Array.isArray(data)) return data as ContactRequest[];
            return [];
        },
        enabled: !!accessToken,
        staleTime: 30000,
    });

    // Send contact request
    const send = useMutation({
        mutationFn: async ({ profileId, requestType, message }: { profileId: number; requestType: 'PHONE' | 'EMAIL' | 'WHATSAPP'; message?: string }) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.sendContactRequest(profileId, accessToken, requestType, message);
            if (!res.success) throw new Error(res.message || "Failed to send contact request");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Contact Request Sent",
                description: "They will be notified of your request.",
            });
            queryClient.invalidateQueries({ queryKey: ["contact-requests", "sent"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to send contact request.",
                variant: "destructive",
            });
        }
    });

    // Accept contact request
    const accept = useMutation({
        mutationFn: async (requestId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.acceptContactRequest(requestId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to accept request");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Request Accepted",
                description: "Contact information is now shared.",
            });
            queryClient.invalidateQueries({ queryKey: ["contact-requests", "received"] });
            queryClient.invalidateQueries({ queryKey: ["profile-contact"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to accept request.",
                variant: "destructive",
            });
        }
    });

    // Reject contact request
    const reject = useMutation({
        mutationFn: async (requestId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.rejectContactRequest(requestId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to reject request");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Request Declined",
                description: "The contact request has been declined.",
            });
            queryClient.invalidateQueries({ queryKey: ["contact-requests", "received"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to decline request.",
                variant: "destructive",
            });
        }
    });

    // Count of pending received requests
    const pendingCount = received.data?.filter(r => r.status === 'PENDING').length || 0;

    return {
        received: received.data || [],
        sent: sent.data || [],
        isLoading: received.isLoading || sent.isLoading,
        isError: received.isError || sent.isError,
        pendingCount,
        send,
        accept,
        reject,
        refetch: () => {
            received.refetch();
            sent.refetch();
        }
    };
}

export default useContactRequests;
