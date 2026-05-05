import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiConfig from "@/lib/api.config";
import apiService from "@/lib/api.service";
import { useToast } from "@/hooks/use-toast";
import profileWebService from "@/services/profile-web.service";
import { useUserAuthStore } from "@/stores/user-auth-store";

type ApiEnvelope<T> = {
  data: T;
};

type ProfileApiData = {
  profile: Record<string, unknown> | null;
  profileCompleteness?: number;
};

type ServiceResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getHttpStatus = (error: unknown): number | undefined => {
  if (!isRecord(error) || !isRecord(error.response)) return undefined;
  return typeof error.response.status === "number" ? error.response.status : undefined;
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (isRecord(error) && isRecord(error.response) && isRecord(error.response.data)) {
    const { message, error: responseError } = error.response.data;
    if (typeof message === "string" && message.trim()) return message;
    if (typeof responseError === "string" && responseError.trim()) return responseError;
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

const NUMERIC_PROFILE_FIELDS = new Set([
  "height",
  "weight",
  "numberOfBrothers",
  "numberOfSisters",
  "brothersMarried",
  "sistersMarried",
]);

const BOOLEAN_PROFILE_FIELDS = new Set([
  "manglik",
  "speaksChhattisgarhi",
  "showLastName",
  "showExactAge",
  "showDateOfBirth",
  "showExactLocation",
  "showCity",
  "showState",
  "showCompanyName",
  "showWorkLocation",
  "showParentOccupation",
  "showSiblingDetails",
  "showHoroscope",
  "showBirthTime",
  "showBirthPlace",
  "showDiet",
  "showLastActive",
  "showOnlineStatus",
  "showProfileViews",
  "showWhoViewedProfile",
  "showShortlistedBy",
  "showNativeDistrict",
  "showNativeVillage",
  "speaksChhattisgarhi",
]);

const OPTIONAL_STRING_FIELDS = new Set([
  "middleName",
  "displayName",
  "caste",
  "subCaste",
  "gothram",
  "nativeVillage",
  "physicalDisability",
  "diet",
  "smokingHabit",
  "drinkingHabit",
  "residencyStatus",
  "bio",
  "hobbies",
  "interests",
  "aboutFamily",
  "partnerExpectations",
  "fatherName",
  "fatherOccupation",
  "fatherStatus",
  "motherName",
  "motherOccupation",
  "motherStatus",
  "familyType",
  "familyValues",
  "familyIncome",
  "ancestralOrigin",
  "birthTime",
  "birthPlace",
  "rashi",
  "nakshatra",
  "highestEducation",
  "educationDetails",
  "collegeName",
  "occupationType",
  "occupation",
  "designation",
  "companyName",
  "annualIncome",
  "workLocation",
  "middleName",
  "physicalDisability",
  "smokingHabit",
  "drinkingHabit",
  "fatherName",
  "fatherOccupation",
  "fatherStatus",
  "motherName",
  "motherOccupation",
  "motherStatus",
  "familyType",
  "familyValues",
  "familyIncome",
  "ancestralOrigin",
  "birthTime",
  "birthPlace",
]);

const normalizeProfilePayload = (input: Record<string, unknown>) => {
  const payload: Record<string, unknown> = {};

  Object.entries(input || {}).forEach(([key, value]) => {
    if (value === undefined || key === "media") {
      return;
    }

    if (key === "dateOfBirth" && typeof value === "string") {
      if (value.trim() === "") {
        return;
      }
      payload[key] = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00.000Z`).toISOString()
        : new Date(value).toISOString();
      return;
    }

    if (NUMERIC_PROFILE_FIELDS.has(key)) {
      if (value === "" || value === null) {
        return;
      }

      const numberValue = Number(value);
      if (!Number.isNaN(numberValue)) {
        payload[key] = numberValue;
      }
      return;
    }

    if (BOOLEAN_PROFILE_FIELDS.has(key)) {
      payload[key] = typeof value === "string" ? value === "true" : Boolean(value);
      return;
    }

    if (OPTIONAL_STRING_FIELDS.has(key) && typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      payload[key] = trimmed;
      return;
    }

    payload[key] = value;
  });

  return payload;
};

export interface UserProfile {
  id: number;
  email?: string | null;
  phone?: string | null;
  profile: Record<string, unknown> | null;
  profileCompleteness?: number;
  subscriptions?: Record<string, unknown>[];
  subscription?: Record<string, unknown> | null;
  payments?: Record<string, unknown>[];
  agent?: Record<string, unknown>;
  role?: string;
}

export function useProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { accessToken } = useUserAuthStore();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      // Fetch user data first
      const userRes = await apiService.get<ApiEnvelope<UserProfile>>(apiConfig.endpoints.users.me);
      const userData = userRes.data.data;

      let profileData: ProfileApiData = { profile: null, profileCompleteness: 0 };
      
      try {
        // Option A: Call GET /profiles/me on load to check existence
        const profileRes = await apiService.get<ApiEnvelope<ProfileApiData>>(apiConfig.endpoints.profiles.me);
        profileData = profileRes.data.data;
      } catch (err: unknown) {
        // If 404 or 400, profile doesn't exist yet
        const status = getHttpStatus(err);
        if (status !== 404 && status !== 400) {
          throw err;
        }
      }

      const activeSubscription =
        (userData.subscriptions as Record<string, unknown>[])?.find(
          (subscription) =>
            subscription.status === "ACTIVE" &&
            (!subscription.endDate || new Date(subscription.endDate as string) > new Date())
        ) || null;

      return {
        ...userData,
        profile: profileData?.profile || null,
        profileCompleteness: profileData?.profileCompleteness ?? 0,
        subscription: activeSubscription,
      } as UserProfile;
    },
    staleTime: 300000,
  });

  // Derived states
  const profileExists = !!query.data?.profile?.id;
  const isFirstSave = !profileExists;

  const saveProfile = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = normalizeProfilePayload(data);
      
      // Strategy: Intelligently switch based on existence
      if (!profileExists) {
        // CREATE: POST /profiles
        const res = await apiService.post(apiConfig.endpoints.profiles.create, payload);
        return res.data.data;
      } else {
        // UPDATE: PUT /profiles/me
        const res = await apiService.put(apiConfig.endpoints.profiles.me, payload);
        return res.data.data;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to force fresh data sync
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["user-access"] });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
      
      toast({
        title: profileExists ? "Profile Updated" : "Profile Created! 🎉",
        description: profileExists 
          ? "Your changes have been saved successfully." 
          : "Welcome aboard! Your profile is now live.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Save Failed",
        description: getApiErrorMessage(error, "Could not fulfill profile request."),
        variant: "destructive",
      });
    },
  });

  const uploadPhotos = useMutation({
    mutationFn: async ({ files, onProgress }: { files: File[]; onProgress?: (progress: number) => void }) => {
      if (!accessToken) throw new Error("Unauthorized");
      const res = await profileWebService.uploadProfilePhotos(files, accessToken, onProgress) as ServiceResponse;
      if (!res.success) throw new Error(res.message || "Failed to upload photos");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile-completion"] });
      toast({ title: "Photos uploaded successfully" });
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error, "Failed to upload photos");
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    },
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
    onError: (error: unknown) => {
      toast({ title: "Delete Failed", description: getApiErrorMessage(error, "Failed to delete photo"), variant: "destructive" });
    },
  });

  return {
    ...query,
    profileExists,
    isFirstSave,
    saveProfile,
    uploadPhotos,
    deletePhoto,
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
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          return { percentage: 0, tips: ["Could not fetch completion status"] };
        }

        const data = await res.json();
        return data?.data || { percentage: 0, tips: [] };
      } catch (err) {
        console.error("Error in useProfileCompletion:", err);
        return { percentage: 0, tips: ["Error connecting to server"] };
      }
    },
    enabled: !!accessToken,
    retry: 1,
  });
}
