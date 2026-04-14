import { useQuery } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";

export interface AstrologyMetadata {
    id: number;
    name: string;
}

export function useAstrologyMetadata() {
    const nakshatras = useQuery({
        queryKey: ["astrology-nakshatras"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.astrology.nakshatras);
            return (res.data as any).data as AstrologyMetadata[];
        },
        staleTime: Infinity,
    });

    const rashis = useQuery({
        queryKey: ["astrology-rashis"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.astrology.rashis);
            return (res.data as any).data as AstrologyMetadata[];
        },
        staleTime: Infinity,
    });

    return {
        nakshatras,
        rashis,
        isLoading: nakshatras.isLoading || rashis.isLoading,
        isError: nakshatras.isError || rashis.isError,
    };
}

export function useAstrologyMatch(targetUserId: number | string) {
    return useQuery({
        queryKey: ["astrology-match", targetUserId],
        queryFn: async () => {
            if (!targetUserId) return null;
            const res = await apiService.get(apiConfig.endpoints.astrology.match(targetUserId));
            return (res.data as any).data;
        },
        enabled: !!targetUserId,
    });
}
