"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CheckCircle2, 
    Send, 
    Heart, 
    Sparkles,
    Loader2,
    X,
    MessageSquare,
    Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/profile/profile-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMatches } from "@/hooks/use-matches";
import Link from "next/link";
import { MatchRequest } from "@/types/api.types";
import { calculateAge, formatProfileName } from "@/lib/display-format";

function MatchCard({ match, type, onAccept, onReject, onCancel, isAccepting, isRejecting, isCancelling }: {
    match: MatchRequest;
    type: 'received' | 'sent' | 'accepted';
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    onCancel?: (id: number) => void;
    isAccepting?: boolean;
    isRejecting?: boolean;
    isCancelling?: boolean;
}) {
    // Extract profile from match data based on type
    const user = (type === 'received' ? match.sender : match.receiver) as unknown;
    const profile = (user?.profile || {}) as unknown;
    const userId = user?.id;

    const name = formatProfileName({ ...profile, id: userId });
    const age = profile.age || calculateAge(profile.dateOfBirth);

    const statusBadge = (
        <Badge className={`font-black text-[8px] uppercase tracking-widest border px-3 py-1 shadow-lg ${
            match.status === 'ACCEPTED' 
                ? 'bg-green-500 text-white border-green-600'
                : match.status === 'PENDING' 
                ? 'bg-amber-400 text-black border-amber-500' 
                : 'bg-white/10 border-white/20 text-white'
        }`}>
            {match.status === 'ACCEPTED' ? '✓ Matched' : match.status === 'PENDING' ? '⏳ Pending' : match.status}
        </Badge>
    );

    const customActions = (
        <div className="flex gap-2 w-full">
            {type === 'received' && match.status === 'PENDING' && (
                <>
                    <Button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReject?.(match.id); }}
                        disabled={isRejecting}
                        size="sm"
                        variant="outline"
                        className="flex-1 h-9 rounded-xl bg-black/60 border-white/10 text-red-400 hover:bg-red-500/20 font-black text-[9px] uppercase tracking-widest"
                    >
                        {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Decline'}
                    </Button>
                    <Button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAccept?.(match.id); }}
                        disabled={isAccepting}
                        size="sm"
                        className="flex-1 h-9 rounded-xl bg-primary/90 text-white hover:bg-primary font-black text-[9px] uppercase tracking-widest shadow-lg"
                    >
                        {isAccepting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Accept'}
                    </Button>
                </>
            )}

            {type === 'sent' && (
                <Button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel?.(match.id); }}
                    disabled={isCancelling}
                    size="sm"
                    variant="outline"
                    className="w-full h-9 rounded-xl bg-white/5 border-white/10 text-red-400 hover:bg-red-500/20 font-black text-[9px] uppercase tracking-widest"
                >
                    {isCancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                        <><X className="w-3 h-3 mr-2" /> Cancel Request</>
                    )}
                </Button>
            )}

            {type === 'accepted' && (
                <Link href={`/dashboard/chat?userId=${userId}`} className="w-full">
                    <Button
                        size="sm"
                        className="w-full h-9 rounded-xl bg-green-500/90 text-white hover:bg-green-600 font-black text-[9px] uppercase tracking-widest shadow-lg"
                    >
                        <MessageSquare className="w-3 h-3 mr-1.5" /> Start Chat
                    </Button>
                </Link>
            )}
        </div>
    );

    return (
        <MatchCardWrapper>
            <ProfileCard 
                id={userId || ''}
                name={name}
                age={age || 0}
                city={profile.city}
                occupation={profile.occupation}
                gender={profile.gender?.toLowerCase() as unknown}
                isVerified={profile.isVerified}
                image={profile.media?.[0]?.url || user?.profilePicture}
                statusBadge={statusBadge}
                isMatched={match.status === 'ACCEPTED'}
                canChat={(match as unknown).canChat || false}
                customActions={customActions}
            />
        </MatchCardWrapper>
    );
}

function MatchCardWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-full"
        >
            {children}
        </motion.div>
    );
}

function MatchTabContent({ type }: { type: 'received' | 'sent' | 'accepted' }) {
    const { matches, isLoading, acceptMatch, rejectMatch, cancelMatch } = useMatches(type);
    const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
    const displayMatches = (matches || []).filter((m: MatchRequest) => !hiddenIds.has(m.id));

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-96 bg-card/20 rounded-[2rem] animate-pulse" />
                ))}
            </div>
        );
    }

    if (displayMatches.length === 0) {
        return (
            <div className="py-32 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    {type === 'received' ? <Inbox className="w-10 h-10 text-muted-foreground opacity-30" /> :
                     type === 'sent' ? <Send className="w-10 h-10 text-muted-foreground opacity-30" /> :
                     <Heart className="w-10 h-10 text-muted-foreground opacity-30" />}
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-widest text-foreground">
                        {type === 'received' ? 'No Requests Yet' : 
                         type === 'sent' ? 'No Interests Sent' : 
                         'No Accepted Matches'}
                    </h3>
                    <p className="text-muted-foreground font-medium italic">
                        {type === 'received' ? 'When someone sends you an interest, it will appear here.' :
                         type === 'sent' ? 'Send interests to profiles you like from the search page.' :
                         'Accepted matches will show up here. Start a conversation!'}
                    </p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-12 px-8 shadow-xl shadow-primary/20">
                    <a href="/dashboard/search">EXPLORE PROFILES</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
                {displayMatches.map((match: MatchRequest) => (
                    <motion.div
                        key={match.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <MatchCard 
                            match={match}
                            type={type}
                            onAccept={(id) => acceptMatch.mutate(id, { onSuccess: () => setHiddenIds((prev: Set<number>) => new Set(prev).add(id)) })}
                            onReject={(id) => rejectMatch.mutate(id, { onSuccess: () => setHiddenIds((prev: Set<number>) => new Set(prev).add(id)) })}
                            onCancel={(id) => cancelMatch.mutate(id, { onSuccess: () => setHiddenIds((prev: Set<number>) => new Set(prev).add(id)) })}
                            isAccepting={acceptMatch.isPending}
                            isRejecting={rejectMatch.isPending}
                            isCancelling={cancelMatch.isPending}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default function MatchesPage() {

    const { matches: receivedMatches } = useMatches('received');
    const pendingCount = (receivedMatches || []).filter((m: MatchRequest) => m.status === 'PENDING').length;

    return (
        <div className="space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">My <span className="text-primary italic">Matches</span></h1>
                    <p className="text-muted-foreground font-light text-lg">Manage your connections and interests in one place</p>
                </div>
            </div>

            {/* Match Tabs */}
            <Tabs defaultValue="received" className="w-full">
                <div className="flex items-center justify-between border-b border-white/5 pb-0 mb-8 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent border-none p-0 h-auto gap-8">
                        <TabsTrigger 
                            value="received" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all gap-2 relative"
                        >
                            <Sparkles className="w-4 h-4" />
                            Received
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-3 bg-primary text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                                    {pendingCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger 
                            value="sent" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Sent
                        </TabsTrigger>
                        <TabsTrigger 
                            value="accepted" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Accepted
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="received">
                    <MatchTabContent type="received" />
                </TabsContent>
                <TabsContent value="sent">
                    <MatchTabContent type="sent" />
                </TabsContent>
                <TabsContent value="accepted">
                    <MatchTabContent type="accepted" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
