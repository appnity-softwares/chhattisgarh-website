"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import settingsWebService from "@/services/settings-web.service";
import { useToast } from "@/hooks/use-toast";
import { useUserAuthStore } from "@/stores/user-auth-store";

export interface Notification {
    id: number;
    type: string;
    title?: string;
    message: string;
    isRead: boolean;
    data?: any;
    createdAt: string;
    updatedAt?: string;
}

export function useNotifications() {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await settingsWebService.getNotifications(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch notifications");
            
            const data = res.data?.notifications || res.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: !!accessToken,
        refetchInterval: 30000, // Poll every 30s
    });

    const { data: unreadCount } = useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await settingsWebService.getUnreadNotificationCount(accessToken);
            if (!res.success) return 0;
            return res.data?.count || res.data?.unreadCount || 0;
        },
        enabled: !!accessToken,
        refetchInterval: 15000,
    });

    const markAsRead = useMutation({
        mutationFn: async (notificationId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            return settingsWebService.markNotificationRead(notificationId, accessToken);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllRead = useMutation({
        mutationFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1'}/notifications/read-all`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast({
                title: "All Read",
                description: "All notifications marked as read.",
            });
        },
    });

    const deleteAll = useMutation({
        mutationFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'https://api.chhattisgarhshadi.com/api/v1'}/notifications`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast({
                title: "Cleared",
                description: "All notifications have been deleted.",
            });
        },
    });

    return {
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
        isLoading,
        markAsRead,
        markAllRead,
        deleteAll,
    };
}
