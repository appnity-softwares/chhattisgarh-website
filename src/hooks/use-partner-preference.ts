import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionsService } from "@/services/interactions.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useToast } from "@/hooks/use-toast";

export interface PartnerPreference {
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
    religion?: string[];
    caste?: string[];
    motherTongue?: string[];
    maritalStatus?: string[];
    country?: string[];
    state?: string[];
    city?: string[];
    residencyStatus?: string[];
    education?: string[];
    occupation?: string[];
    diet?: string[];
    manglik?: boolean | null;
    intercasteAllowed?: boolean;
    casteMandatory?: boolean;
    gothraMandatory?: boolean;
}

export function usePartnerPreference() {
    const { accessToken } = useUserAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: preference, isLoading } = useQuery({
        queryKey: ["partner-preference"],
        queryFn: async () => {
            if (!accessToken) return null;
            const res = await interactionsService.getPartnerPreference(accessToken);
            return res.data;
        },
        enabled: !!accessToken,
    });

    const updatePreference = useMutation({
        mutationFn: async (data: PartnerPreference) => {
            if (!accessToken) throw new Error("Not authenticated");
            const res = await interactionsService.updatePartnerPreference(data, accessToken);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partner-preference"] });
            queryClient.invalidateQueries({ queryKey: ["recommendations"] });
            toast({
                title: "Preferences Updated",
                description: "Your partner preferences have been saved successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update preferences.",
                variant: "destructive",
            });
        },
    });

    return {
        preference,
        isLoading,
        updatePreference,
    };
}
