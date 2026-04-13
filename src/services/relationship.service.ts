import apiConfig from "@/lib/api.config";
import apiService from "@/lib/api.service";

export interface RelationshipInfo {
  status: "none" | "sent" | "received" | "accepted" | "declined" | "blocked";
  canSendInterest: boolean;
  canChat: boolean;
  canViewContacts: boolean;
  reason?: string;
  matchId?: number | null;
}

class RelationshipService {
  async getRelationship(userId: number) {
    const res = await apiService.get(apiConfig.endpoints.relationship.byUser(userId));
    return res.data.data as RelationshipInfo;
  }
}

export const relationshipService = new RelationshipService();
export default relationshipService;
