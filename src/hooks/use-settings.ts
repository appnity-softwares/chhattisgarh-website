"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
    privacy: {
        profileVisibility: boolean;
        showPhotosToAcceptedOnly: boolean;
        contactPrivacy: boolean;
        showVisitLog: boolean;
    };
    notifications: {
        push: boolean;
        email: boolean;
        whatsapp: boolean;
    };
}

export function useSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ["user-settings"],
        queryFn: async () => {
            // Fetch multiple settings in parallel
            try {
                const [privacyRes, notificationsRes] = await Promise.all([
                    apiService.get(apiConfig.endpoints.settings.privacy),
                    apiService.get(apiConfig.endpoints.settings.notifications)
                ]);

                const pData = privacyRes.data.data;
                const nData = notificationsRes.data.data;

                return {
                    privacy: {
                        ...pData, // Spread first
                        profileVisibility: pData.profileVisibility === 'HIDDEN',
                        showPhotosToAcceptedOnly: false, 
                        contactPrivacy: pData.showPhoneNumber === 'MATCHED',
                        showVisitLog: pData.showWhoViewedProfile || false,
                    },
                    notifications: {
                        ...nData, // Spread first
                        push: nData.matchRequestPush || false,
                        email: nData.matchRequestEmail || false,
                        whatsapp: nData.matchRequestSms || false,
                    }
                };
            } catch (err) {
                console.error("Failed to load settings:", err);
                return {
                    privacy: { profileVisibility: false, showPhotosToAcceptedOnly: false, contactPrivacy: false, showVisitLog: true },
                    notifications: { push: true, email: true, whatsapp: true }
                };
            }
        }
    });

    const updatePrivacy = useMutation({
        mutationFn: async (data: Partial<UserSettings['privacy']>) => {
            // Map simplified frontend fields to granular backend fields
            const payload: any = {};
            
            if (data.profileVisibility !== undefined) {
                payload.profileVisibility = data.profileVisibility ? 'HIDDEN' : 'PUBLIC';
            }
            if (data.contactPrivacy !== undefined) {
                payload.showPhoneNumber = data.contactPrivacy ? 'MATCHED' : 'REGISTERED';
                payload.showEmail = data.contactPrivacy ? 'MATCHED' : 'REGISTERED';
            }
            if (data.showVisitLog !== undefined) {
                payload.showWhoViewedProfile = data.showVisitLog;
            }

            const res = await apiService.put(apiConfig.endpoints.settings.privacy, payload);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            toast({
                title: "Privacy Updated",
                description: "Your privacy settings have been saved.",
            });
        }
    });

    const updateNotifications = useMutation({
        mutationFn: async (data: Partial<UserSettings['notifications']>) => {
            const payload: any = {};
            
            if (data.push !== undefined) {
                payload.matchRequestPush = data.push;
                payload.matchAcceptedPush = data.push;
                payload.newMessagePush = data.push;
            }
            if (data.email !== undefined) {
                payload.matchRequestEmail = data.email;
                payload.matchAcceptedEmail = data.email;
            }
            if (data.whatsapp !== undefined) {
                payload.matchRequestSms = data.whatsapp;
            }

            const res = await apiService.put(apiConfig.endpoints.settings.notifications, payload);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            toast({
                title: "Notifications Updated",
                description: "Your notification preferences have been saved.",
            });
        }
    });

    return {
        settings,
        isLoading,
        updatePrivacy,
        updateNotifications
    };
}
