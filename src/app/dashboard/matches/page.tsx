"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    CheckCircle2, 
    Send, 
    Heart, 
    Search,
    Sparkles,
    Loader2,
    X,
    MessageSquare,
    Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/profile/profile-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMatches } from "@/hooks/use-matches";
import Link from "next/link";

function MatchCard({ match, type, onAccept, onReject, isAccepting, isRejecting }: {
    match: any;
    type: 'received' | 'sent' | 'accepted';
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    isAccepting?: boolean;
    isRejecting?: boolean;
}) {
    // Extract profile from match data based on type
    const user = type === 'received' ? match.sender : match.receiver;
    const profile = user?.profile || {};
    const userId = user?.id;

    const name = `${profile.firstName || 'User'} ${profile.lastName || ''}`.trim();
    const age = profile.age || (profile.dateOfBirth 
        ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
        : null);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
        >
            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-20">
                <Badge className={`font-black text-[8px] uppercase tracking-widest border px-3 py-1 backdrop-blur-md ${
                    match.status === 'ACCEPTED' 
                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                        : match.status === 'PENDING' 
                        ? 'bg-amber-400/20 border-amber-400/30 text-amber-400' 
                        : 'bg-white/10 border-white/20 text-white'
                }`}>
                    {match.status === 'ACCEPTED' ? '✓ Matched' : match.status === 'PENDING' ? '⏳ Pending' : match.status}
                </Badge>
            </div>

            <ProfileCard 
                id={userId}
                name={name}
                age={age || 0}
                city={profile.city || ''}
                occupation={profile.occupation || ''}
                gender={(profile.gender?.toLowerCase() as any) || 'female'}
                isVerified={profile.isVerified}
                image={profile.media?.[0]?.url || user?.profilePicture}
            />

            {/* Action Buttons for Received Matches */}
            {type === 'received' && match.status === 'PENDING' && (
                <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-2">
                    <Button
                        onClick={(e) => { e.stopPropagation(); onReject?.(match.id); }}
                        disabled={isRejecting}
                        size="sm"
                        variant="outline"
                        className="flex-1 h-11 rounded-xl bg-black/50 backdrop-blur-md border-white/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 font-black text-[10px] uppercase tracking-widest"
                    >
                        {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><X className="w-3 h-3 mr-1" /> Decline</>}
                    </Button>
                    <Button
                        onClick={(e) => { e.stopPropagation(); onAccept?.(match.id); }}
                        disabled={isAccepting}
                        size="sm"
                        className="flex-1 h-11 rounded-xl bg-primary/90 backdrop-blur-md border-primary/20 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        {isAccepting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Heart className="w-3 h-3 mr-1 fill-current" /> Accept</>}
                    </Button>
                </div>
            )}

            {/* Chat Button for Accepted Matches */}
            {type === 'accepted' && (
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <Link href={`/dashboard/chat`}>
                        <Button
                            size="sm"
                            className="w-full h-11 rounded-xl bg-green-500/90 backdrop-blur-md text-white hover:bg-green-500 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20"
                        >
                            <MessageSquare className="w-3 h-3 mr-1" /> Start Chat
                        </Button>
                    </Link>
                </div>
            )}
        </motion.div>
    );
}

function MatchTabContent({ type }: { type: 'received' | 'sent' | 'accepted' }) {
    const { matches, isLoading, acceptMatch, rejectMatch } = useMatches(type);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-96 bg-card/20 rounded-[2rem] animate-pulse" />
                ))}
            </div>
        );
    }

    if (matches.length === 0) {
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
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
            {matches.map((match: any) => (
                <MatchCard 
                    key={match.id}
                    match={match}
                    type={type}
                    onAccept={(id) => acceptMatch.mutate(id)}
                    onReject={(id) => rejectMatch.mutate(id)}
                    isAccepting={acceptMatch.isPending}
                    isRejecting={rejectMatch.isPending}
                />
            ))}
        </motion.div>
    );
}

export default function MatchesPage() {
    const [activeTab, setActiveTab] = useState("received");
    const { matches: receivedMatches } = useMatches('received');
    const pendingCount = (receivedMatches || []).filter((m: any) => m.status === 'PENDING').length;

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
            <Tabs defaultValue="received" className="w-full" onValueChange={setActiveTab}>
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
