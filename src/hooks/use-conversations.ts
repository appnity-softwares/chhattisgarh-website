"use client";

import { useQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { useEffect } from "react";
import socketService from "@/lib/socket.service";

export interface Conversation {
    user: {
        id: number;
        profilePicture?: string;
        profile: {
            firstName: string;
            lastName: string;
            isVerified?: boolean;
            media: Array<{ url: string }>;
        };
    };
    lastMessage?: {
        content: string;
        createdAt: string;
        status: string;
    };
    unreadCount: number;
    lastMessageAt: string;
}

export function useConversations() {
    const query = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.messages.conversations);
            return res.data.data as Conversation[];
        },
        staleTime: 30000,
    });

    // Refresh on new messages
    useEffect(() => {
        const handleRefresh = () => query.refetch();
        
        socketService.on("message:received", handleRefresh);
        socketService.on("message:read", handleRefresh);

        return () => {
            socketService.off("message:received", handleRefresh);
            socketService.off("message:read", handleRefresh);
        };
    }, [query]);

    return query;
}
