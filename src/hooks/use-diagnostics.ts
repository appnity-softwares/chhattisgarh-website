import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { useToast } from "@/hooks/use-toast";

export function useSystemDiagnostics() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const diagnosticsQuery = useQuery({
        queryKey: ["admin-diagnostics"],
        queryFn: async () => {
            const res = await apiService.get(apiConfig.endpoints.admin.diagnostics);
            return (res.data as unknown).data;
        },
        refetchInterval: 60000, 
    });

    const flushCache = useMutation({
        mutationFn: async () => {
            const res = await apiService.post(apiConfig.endpoints.admin.flushCache, {});
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Cache Flushed",
                description: "Redis cache has been cleared successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["admin-diagnostics"] });
        },
        onError: (error: unknown) => {
            toast({
                title: "Flush Failed",
                description: error.message || "Failed to clear Redis cache.",
                variant: "destructive",
            });
        }
    });

    return {
        ...diagnosticsQuery,
        flushCache
    };
}
