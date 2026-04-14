import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { toast } from "@/hooks/use-toast";

export type RelationshipType = "none" | "sent" | "received" | "matched" | "rejected" | "blocked";

export interface RelationshipState {
  type: RelationshipType;
  isSuper: boolean;
  isShortlisted: boolean;
  lastActionBy: "me" | "other" | null;
  matchDate?: string;
}

interface InteractionStore {
  relationships: Record<number, RelationshipState>;
  setRelationship: (userId: number, state: Partial<RelationshipState>) => void;
  syncFromApi: (userId: number, apiData: any) => void;
  
  // Actions
  sendInterest: (userId: number) => Promise<void>;
  sendSuperInterest: (userId: number) => Promise<void>;
  acceptInterest: (userId: number, matchId: number) => Promise<void>;
  rejectInterest: (userId: number, matchId?: number) => Promise<void>;
  toggleShortlist: (userId: number) => Promise<void>;
  blockUser: (userId: number) => Promise<void>;
}

const DEFAULT_STATE: RelationshipState = {
  type: "none",
  isSuper: false,
  isShortlisted: false,
  lastActionBy: null
};

export const useInteractionStore = create<InteractionStore>()(
  immer((set, get) => ({
    relationships: {},

    setRelationship: (userId, state) => {
      set((s) => {
        s.relationships[userId] = {
          ...(s.relationships[userId] || DEFAULT_STATE),
          ...state,
        };
      });
    },

    syncFromApi: (userId, apiData) => {
      const type: RelationshipType = 
        apiData.status === 'accepted' ? 'matched' :
        apiData.status === 'sent' ? 'sent' :
        apiData.status === 'received' ? 'received' :
        apiData.status === 'rejected' ? 'rejected' :
        apiData.isBlocked ? 'blocked' : 'none';

      get().setRelationship(userId, {
        type,
        isSuper: apiData.isPriority || apiData.isSuper || false,
        isShortlisted: apiData.isShortlisted || false,
        lastActionBy: apiData.senderId === userId ? 'other' : 'me',
        matchDate: apiData.updatedAt || apiData.matchDate
      });
    },

    sendInterest: async (userId) => {
      const previousState = get().relationships[userId] || DEFAULT_STATE;
      get().setRelationship(userId, { type: "sent", lastActionBy: "me" });
      toast({ title: "Interest Sent", description: "Successfully sent interest to member." });

      try {
        await apiService.post(apiConfig.endpoints.matches.send, { receiverId: userId });
      } catch (error) {
        get().setRelationship(userId, previousState);
        toast({ title: "Failed", description: "Could not send interest.", variant: "destructive" });
      }
    },

    sendSuperInterest: async (userId) => {
      const previousState = get().relationships[userId] || DEFAULT_STATE;
      get().setRelationship(userId, { type: "sent", isSuper: true, lastActionBy: "me" });
      toast({ title: "Priority Interest Sent! ⚡", description: "Your profile is now prioritized." });

      try {
        await apiService.post(apiConfig.endpoints.matches.send, { receiverId: userId, isPriority: true });
      } catch (error) {
        get().setRelationship(userId, previousState);
        toast({ title: "Failed", description: "Could not send Priority Interest.", variant: "destructive" });
      }
    },

    acceptInterest: async (userId, matchId) => {
      const previousState = get().relationships[userId] || DEFAULT_STATE;
      get().setRelationship(userId, { type: "matched", matchDate: new Date().toISOString() });
      toast({ title: "It's a Match! ❤️", description: "You can now chat with each other." });

      try {
        await apiService.post(apiConfig.endpoints.matches.accept(matchId));
      } catch (error) {
        get().setRelationship(userId, previousState);
      }
    },

    rejectInterest: async (userId, matchId) => {
      const previousState = get().relationships[userId] || DEFAULT_STATE;
      get().setRelationship(userId, { type: "none" });
      toast({ title: "Interest Declined", description: "Profile has been skipped." });

      try {
        if (matchId) {
          await apiService.post(apiConfig.endpoints.matches.reject(matchId));
        }
      } catch (error) {
        get().setRelationship(userId, previousState);
      }
    },

    toggleShortlist: async (userId) => {
      const currentState = get().relationships[userId] || DEFAULT_STATE;
      const willBeShortlisted = !currentState.isShortlisted;
      get().setRelationship(userId, { isShortlisted: willBeShortlisted });
      
      toast({ 
        title: willBeShortlisted ? "Added to Shortlist" : "Removed from Shortlist",
        description: willBeShortlisted ? "Profile saved for later." : "Profile removed from your list."
      });

      try {
        if (willBeShortlisted) {
          await apiService.post(apiConfig.endpoints.shortlists.create, { targetUserId: userId });
        } else {
          await apiService.delete(apiConfig.endpoints.shortlists.delete(userId));
        }
      } catch (error) {
        get().setRelationship(userId, currentState);
      }
    },

    blockUser: async (userId) => {
      if (!window.confirm("Are you sure you want to block this user?")) return;

      const previousState = get().relationships[userId] || DEFAULT_STATE;
      get().setRelationship(userId, { type: "blocked" });
      toast({ title: "User Blocked", description: "You will no longer see this member.", variant: "destructive" });

      try {
        await apiService.post(apiConfig.endpoints.blocks.create, { blockedId: userId });
      } catch (error) {
        get().setRelationship(userId, previousState);
      }
    }
  }))
);
