import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { useToast } from "@/hooks/use-toast";
import profileWebService from "@/services/profile-web.service";
import { useUserAuthStore } from "@/stores/user-auth-store";

export interface UserProfile {
    id: number;
    email: string;
    phone: string;
    profile: any; // Using any for flexibility or I can define more strictly
    subscription?: any;
}

export function useProfile() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { accessToken } = useUserAuthStore();

    const query = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.profiles.me);
            return res.data.data as UserProfile;
        },
        staleTime: 300000,
    });

    const updateProfile = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiService.put(apiConfig.endpoints.profiles.me, data);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update profile",
                variant: "destructive"
            });
        }
    });

    const uploadPhotos = useMutation({
        mutationFn: async (files: File[]) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await profileWebService.uploadProfilePhotos(files, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to upload photos");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
            toast({ title: "Photos uploaded successfully" });
        },
        onError: (error: any) => {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        }
    });

    const deletePhoto = useMutation({
        mutationFn: async (mediaId: number) => {
            if (!accessToken) throw new Error("Unauthorized");
            const res = await profileWebService.deleteProfilePhoto(mediaId, accessToken);
            if (!res.success) throw new Error(res.message || "Failed to delete photo");
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
            toast({ title: "Photo deleted" });
        },
        onError: (error: any) => {
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        }
    });

    return {
        ...query,
        updateProfile,
        uploadPhotos,
        deletePhoto
    };
}

export function useProfileCompletion() {
    const { accessToken } = useUserAuthStore();
    return useQuery({
        queryKey: ["profile-completion"],
        queryFn: async () => {
            if (!accessToken) return null;
            try {
                const res = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.completion}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                if (!res.ok) return { percentage: 0, tips: ["Could not fetch completion status"] };
                const data = await res.json();
                return data?.data || { percentage: 0, tips: [] };
            } catch (err) {
                console.error("Error in useProfileCompletion:", err);
                return { percentage: 0, tips: ["Error connecting to server"] };
            }
        },
        enabled: !!accessToken,
        retry: 1, // Minimize retries on 500
    });
}
