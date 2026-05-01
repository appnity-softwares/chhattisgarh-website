"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import premiumWebService from "@/services/premium-web.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useToast } from "@/hooks/use-toast";

export function useBoostPackages() {
    return useQuery({
        queryKey: ["boost-packages"],
        queryFn: async () => {
            const res = await premiumWebService.getBoostPackages();
            if (!res.success) throw new Error(res.message || "Failed to fetch packages");
            return res.data;
        },
    });
}

export function useActiveBoost() {
    const { accessToken } = useUserAuthStore();
    return useQuery({
        queryKey: ["active-boost"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await premiumWebService.getActiveBoosts(accessToken);
            if (!res.success) throw new Error(res.message || "Failed to fetch active boost");
            return {
                activeBoost: res.data,
                hasActiveBoost: res.hasActiveBoost
            };
        },
        enabled: !!accessToken,
    });
}

export function useBoostPayment() {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const initiateBoost = useMutation({
        mutationFn: async (boostType: string) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await premiumWebService.createBoostOrder(boostType, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to create order");
            return res.data;
        },
    });

    const verifyBoost = useMutation({
        mutationFn: async (data: unknown) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await premiumWebService.verifyBoostPayment(data, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to verify boost");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["active-boost"] });
            toast({
                title: "Boost Activated! ⚡",
                description: "Your profile is now being promoted.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return { initiateBoost, verifyBoost };
}
