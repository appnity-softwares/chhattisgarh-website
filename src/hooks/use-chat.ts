"use client";

import { useState, useEffect, useCallback } from "react";
import socketService from "@/lib/socket.service";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import messagesService from "@/services/messages.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface Message {
    id?: number;
    text: string;
    sender: "me" | "them";
    time: string;
    status: "sent" | "received" | "read" | "failed" | "delivered";
    type: "TEXT" | "IMAGE" | "SYSTEM";
    imageUrl?: string;
    clientMsgId?: string;
}

export function useChat(otherUserId: number | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch message history
    useEffect(() => {
        if (!otherUserId) {
            setMessages([]);
            return;
        }

        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const res = await apiService.get(apiConfig.endpoints.messages.history(otherUserId));
                const history = res.data.data.messages.map((msg: { 
                    id: number; 
                    content: string; 
                    senderId: number; 
                    createdAt: string; 
                    status: string; 
                    contentType?: string; 
                }) => ({
                    id: msg.id,
                    text: msg.content,
                    sender: msg.senderId === otherUserId ? "them" : "me",
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: msg.status.toLowerCase(),
                    type: msg.contentType || "TEXT",
                    imageUrl: msg.contentType === "IMAGE" ? msg.content : undefined
                }));
                // Backend returns desc, we need asc for chat UI
                setMessages(history.reverse());
                
                // Mark received messages as read
                socketService.markAsRead(otherUserId);
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [otherUserId]);
    
    const handleNewMessage = useCallback((...args: unknown[]) => {
        const payload = args[0] as Record<string, unknown>;
        if (!otherUserId) return;
        if (payload.senderId === otherUserId || payload.receiverId === otherUserId) {
            const newMessage: Message = {
                id: payload.id as number,
                text: payload.content as string,
                sender: payload.senderId === otherUserId ? "them" : "me",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: "received",
                type: (payload.contentType as "TEXT" | "IMAGE" | "SYSTEM") || "TEXT",
                imageUrl: payload.contentType === "IMAGE" ? (payload.content as string) : undefined
            };
            setMessages(prev => [...prev, newMessage]);
            
            if (payload.senderId === otherUserId) {
                socketService.markAsRead(otherUserId);
            }
        }
    }, [otherUserId]);

    const handleMessageRead = useCallback((...args: unknown[]) => {
        const payload = args[0] as Record<string, unknown>;
        if (payload.byUser === otherUserId) {
            setMessages(prev => prev.map(msg => 
                msg.sender === "me" ? { ...msg, status: "read" } : msg
            ));
        }
    }, [otherUserId]);

    useEffect(() => {
        if (!otherUserId) return;

        socketService.on("message:received", handleNewMessage);
        socketService.on("typing:start", () => setIsTyping(true));
        socketService.on("typing:stop", () => setIsTyping(false));
        socketService.on("user:online", (data: unknown) => { 
            const d = data as { userId: number };
            if (d.userId === otherUserId) setIsOnline(true); 
        });
        socketService.on("user:offline", (data: unknown) => { 
            const d = data as { userId: number };
            if (d.userId === otherUserId) setIsOnline(false); 
        });
        socketService.on("message:read", handleMessageRead);

        return () => {
            socketService.off("message:received", handleNewMessage);
            socketService.off("message:read", handleMessageRead);
        };
    }, [otherUserId, handleNewMessage, handleMessageRead]);

    const sendMessage = (text: string, type: "TEXT" | "IMAGE" = "TEXT") => {
        if (!otherUserId) return;
        
        const clientMsgId = Date.now().toString();
        // Optimistic Update
        const optimisticMsg: Message = {
            text,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent",
            type,
            clientMsgId
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        socketService.sendMessage(otherUserId, text, type, clientMsgId);
    };

    const queryClient = useQueryClient();
    const { accessToken } = useUserAuthStore();
    const { toast } = useToast();

    const deleteMessage = useMutation({
        mutationFn: async (messageId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await messagesService.deleteMessage(messageId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to delete message");
            return res.data;
        },
        onSuccess: (_, messageId) => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            // Invalidate conversations list to update last message
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast({ title: "Message deleted" });
        },
        onError: (err: unknown) => {
            const error = err as Error;
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteConversation = useMutation({
        mutationFn: async (userId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await messagesService.deleteConversation(userId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to delete conversation");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast({ title: "Conversation deleted" });
        },
        onError: (err: unknown) => {
            const error = err as Error;
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const sendTyping = (typing: boolean) => {
        if (otherUserId) socketService.sendTyping(otherUserId, typing);
    };

    return {
        messages,
        setMessages,
        isTyping,
        isOnline,
        isLoading,
        sendMessage,
        sendTyping,
        deleteMessage,
        deleteConversation
    };
}
