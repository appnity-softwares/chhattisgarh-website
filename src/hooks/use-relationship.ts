"use client";

import { useQuery } from "@tanstack/react-query";
import relationshipService from "@/services/relationship.service";

export function useRelationship(userId?: number | null) {
  return useQuery({
    queryKey: ["relationship", userId],
    queryFn: () => relationshipService.getRelationship(userId as number),
    enabled: Boolean(userId),
    staleTime: 30000,
  });
}

export default useRelationship;
