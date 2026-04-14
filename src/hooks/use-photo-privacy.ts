import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiConfig from "@/lib/api.config";
import apiService from "@/lib/api.service";
import { useToast } from "@/hooks/use-toast";

export interface PhotoPrivacyData {
  visibility?: "PUBLIC" | "REGISTERED" | "MATCHED" | "PRIVATE";
  blurForNonPremium?: boolean;
  allowViewRequests?: boolean;
}

export function usePhotoPrivacy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePrivacy = useMutation({
    mutationFn: async ({ mediaId, data }: { mediaId: number; data: PhotoPrivacyData }) => {
      const res = await apiService.put(
        apiConfig.endpoints.settings.photoPrivacy(mediaId),
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: "Privacy Updated",
        description: "Your photo visibility settings have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update privacy settings.",
        variant: "destructive",
      });
    },
  });

  return {
    updatePrivacy,
  };
}
