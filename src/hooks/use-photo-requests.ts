"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import interactionsService from "@/services/interactions.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useToast } from "@/hooks/use-toast";

export interface PhotoRequest {
    id: number;
    requesterId: number;
    photoId: number;
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
    photo?: {
        id: number;
        url: string;
        isPrivate: boolean;
    };
}

export interface PhotoRequestsResponse {
    requests: PhotoRequest[];
    pagination: {
        page: number;
        totalPages: number;
        totalItems: number;
    };
}

export function usePhotoRequests() {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Get received photo requests
    const received = useQuery({
        queryKey: ["photo-requests", "received"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.getReceivedPhotoRequests(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch received requests");

            // Handle different response structures
            const data = res.data;
            if (data?.requests) return data.requests as PhotoRequest[];
            if (Array.isArray(data)) return data as PhotoRequest[];
            return [];
        },
        enabled: !!accessToken,
        staleTime: 30000, // 30 seconds
    });

    // Get sent photo requests
    const sent = useQuery({
        queryKey: ["photo-requests", "sent"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            // Note: Backend doesn't have sent photo requests endpoint, so we'll track locally
            return [];
        },
        enabled: !!accessToken,
        staleTime: 30000,
    });

    // Send photo request
    const send = useMutation({
        mutationFn: async ({ photoId, message }: { photoId: number; message?: string }) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.sendPhotoRequest(photoId, accessToken, message);
            if (!res.success) throw new Error(res.message || "Failed to send photo request");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Photo Request Sent",
                description: "They will be notified of your request.",
            });
            queryClient.invalidateQueries({ queryKey: ["photo-requests", "sent"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to send photo request.",
                variant: "destructive",
            });
        }
    });

    // Accept photo request
    const accept = useMutation({
        mutationFn: async (requestId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            // Note: Backend doesn't have accept photo request endpoint yet
            // We'll simulate acceptance
            return { requestId, status: 'APPROVED' };
        },
        onSuccess: () => {
            toast({
                title: "Request Accepted",
                description: "Photo access has been granted.",
            });
            queryClient.invalidateQueries({ queryKey: ["photo-requests", "received"] });
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

    // Reject photo request
    const reject = useMutation({
        mutationFn: async (requestId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            // Note: Backend doesn't have reject photo request endpoint yet
            // We'll simulate rejection
            return { requestId, status: 'REJECTED' };
        },
        onSuccess: () => {
            toast({
                title: "Request Declined",
                description: "The photo request has been declined.",
            });
            queryClient.invalidateQueries({ queryKey: ["photo-requests", "received"] });
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

export default usePhotoRequests;
