"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import interactionsService from "@/services/interactions.service";
import { useToast } from "@/hooks/use-toast";
import { useUserAuthStore } from "@/stores/user-auth-store";

export function useProfileVisitors() {
    const { accessToken } = useUserAuthStore();
    return useQuery({
        queryKey: ["interactions", "visitors"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.getProfileVisitors(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch visitors");
            
            // Be extremely defensive about the data structure
            const rawData = res.data;
            if (Array.isArray(rawData)) return rawData;
            if (rawData && typeof rawData === 'object') {
                if (Array.isArray((rawData as unknown).visitors)) return (rawData as unknown).visitors;
                if (Array.isArray((rawData as unknown).profiles)) return (rawData as unknown).profiles;
                if (Array.isArray((rawData as unknown).data)) return (rawData as unknown).data;
            }
            return [];
        },
        enabled: !!accessToken,
        retry: 1,
    });
}

export function useInteractions() {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const sendInterest = useMutation({
        mutationFn: async (targetUserId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.sendMatchRequest(targetUserId, accessToken);
            if (!res.success) {
                if (res.statusCode === 409 || res.message?.toLowerCase().includes('already exists')) {
                    return { alreadyExists: true };
                }
                throw new Error(res.message || "Failed to send interest");
            }
            return res.data;
        },
        onSuccess: (data: unknown) => {
            if (data?.alreadyExists) {
                toast({
                    title: "Status Update",
                    description: "You've already sent interest to this member. We've updated your view.",
                });
            } else {
                toast({
                    title: "Interest Sent!",
                    description: "The member has been notified of your interest.",
                });
            }
            queryClient.invalidateQueries({ queryKey: ["interactions"] });
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to send interest.",
                variant: "destructive",
            });
        }
    });

    const acceptInterest = useMutation({
        mutationFn: async (matchId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.acceptMatch(matchId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to accept interest");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Interest Accepted",
                description: "You can now chat and view contact details based on backend policy.",
            });
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["relationship"] });
            queryClient.invalidateQueries({ queryKey: ["profile-contact"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to accept interest.",
                variant: "destructive",
            });
        }
    });

    const rejectInterest = useMutation({
        mutationFn: async (matchId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.rejectMatch(matchId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to decline interest");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Interest Declined",
                description: "The request has been declined.",
            });
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["relationship"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to decline interest.",
                variant: "destructive",
            });
        }
    });

    const sendSuperInterest = useMutation({
        mutationFn: async (targetUserId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            // Super interest is a match request with a special message
            const res = await interactionsService.sendMatchRequest(targetUserId, accessToken, "SUPER_INTEREST");
            if (!res.success) {
                if (res.statusCode === 409 || res.message?.toLowerCase().includes('already exists')) {
                    return { alreadyExists: true };
                }
                throw new Error(res.message || "Failed to send super interest");
            }
            return res.data;
        },
        onSuccess: (data: unknown) => {
            if (data?.alreadyExists) {
                toast({
                    title: "Status Update",
                    description: "You've already sent a priority request to this member.",
                });
            } else {
                toast({
                    title: "Super Interest!",
                    description: "You've sent a priority interest to this profile.",
                    className: "bg-primary text-white font-bold",
                });
            }
            queryClient.invalidateQueries({ queryKey: ["interactions"] });
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to send super interest.",
                variant: "destructive",
            });
        }
    });

    const rejectProfile = useMutation({
        mutationFn: async (targetUserId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.blockUser(targetUserId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to reject profile");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Profile Passed",
                description: "You won't see this profile again in your discovery.",
            });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
            queryClient.invalidateQueries({ queryKey: ["interactions"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to pass profile.",
                variant: "destructive",
            });
        }
    });

    const toggleShortlist = useMutation({
        mutationFn: async ({ targetUserId, isCurrentlyShortlisted }: { targetUserId: number; isCurrentlyShortlisted: boolean }) => {
            if (!accessToken) throw new Error("Unauthorized");
            if (isCurrentlyShortlisted) {
                const res = await interactionsService.removeFromShortlist(targetUserId, accessToken);
                if (!res.success) throw new Error(res.message || "Failed to remove from shortlist");
                return { action: 'removed', targetUserId };
            } else {
                const res = await interactionsService.addToShortlist(targetUserId, accessToken);
                if (!res.success) throw new Error(res.message || "Failed to add to shortlist");
                return { action: 'added', targetUserId };
            }
        },
        onSuccess: (data) => {
            toast({
                title: data.action === 'added' ? "Added to Shortlist" : "Removed from Shortlist",
                description: data.action === 'added' ? "Profile has been added to your shortlist." : "Profile removed from your shortlist.",
            });
            queryClient.invalidateQueries({ queryKey: ["interactions", "shortlists"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to update shortlist.",
                variant: "destructive",
            });
        }
    });

    // --- Block User ---
    const blockUser = useMutation({
        mutationFn: async (targetUserId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.blockUser(targetUserId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to block user");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "User Blocked",
                description: "This user has been blocked. They can no longer view your profile.",
            });
            queryClient.invalidateQueries({ queryKey: ["interactions"] });
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to block user.",
                variant: "destructive",
            });
        }
    });

    // --- Unblock User ---
    const unblockUser = useMutation({
        mutationFn: async (blockId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.unblockUser(blockId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to unblock user");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "User Unblocked",
                description: "This user has been unblocked.",
            });
            queryClient.invalidateQueries({ queryKey: ["interactions", "blocked"] });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to unblock user.",
                variant: "destructive",
            });
        }
    });

    // --- Report User ---
    const reportUser = useMutation({
        mutationFn: async ({ userId, reason, description }: { userId: number; reason: string; description: string }) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.reportUser(userId, reason, description, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to report user");
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Report Submitted",
                description: "Thank you. Our team will review this report within 24 hours.",
            });
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to submit report.",
                variant: "destructive",
            });
        }
    });

    return {
        sendInterest,
        sendSuperInterest,
        acceptInterest,
        rejectInterest,
        rejectProfile,
        toggleShortlist,
        blockUser,
        unblockUser,
        reportUser,
    };
}

// --- Blocked Users List ---
export function useBlockedUsers() {
    const { accessToken } = useUserAuthStore();
    return useQuery({
        queryKey: ["interactions", "blocked"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await interactionsService.getBlockedUsers(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch blocked users");
            
            // Be extremely defensive about the data structure
            const rawData = res.data;
            if (Array.isArray(rawData)) return rawData;
            if (rawData && typeof rawData === 'object' && Array.isArray((rawData as unknown).profiles)) {
                return (rawData as unknown).profiles;
            }
            if (rawData && typeof rawData === 'object' && Array.isArray((rawData as unknown).blockedUsers)) {
                return (rawData as unknown).blockedUsers;
            }
            if (rawData && typeof rawData === 'object' && Array.isArray((rawData as unknown).blocks)) {
                return (rawData as unknown).blocks;
            }
            return [];
        },
        enabled: !!accessToken,
    });
}
