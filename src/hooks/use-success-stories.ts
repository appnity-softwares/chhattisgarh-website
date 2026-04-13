"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { useToast } from "@/hooks/use-toast";

export function useSuccessStories() {
    return useQuery({
        queryKey: ["success-stories"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.public.successStories);
            return res.data.data.stories || [];
        },
    });
}

export function useCreateSuccessStory() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const res = await apiService.post(apiConfig.endpoints.public.successStories, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["success-stories"] });
            toast({ title: "Success story submitted!", description: "It will be visible after review." });
        },
    });
}
