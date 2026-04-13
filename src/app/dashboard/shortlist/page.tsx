"use client";

import { motion } from "framer-motion";
import { 
    Heart, 
    Search,
    Trash2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/profile/profile-card";
import { useState, useMemo } from "react";
import { useShortlist } from "@/hooks/use-shortlist";
import Link from "next/link";

interface ShortlistItem {
    id: number;
    shortlistedUser?: {
        id: number;
        profilePicture?: string;
        isPhoneVerified?: boolean;
        profile?: Record<string, unknown>;
    };
    user?: {
        id: number;
        profilePicture?: string;
        isPhoneVerified?: boolean;
    };
    profile?: Record<string, unknown>;
}

interface ProfileData {
    userId?: number;
    firstName?: string;
    lastName?: string;
    age?: number;
    dateOfBirth?: string;
    city?: string;
    occupation?: string;
    education?: string;
    gender?: string;
    isVerified?: boolean;
    media?: { url: string }[];
}

interface UserData {
    id?: number;
    isPhoneVerified?: boolean;
    profilePicture?: string;
}


interface ProfileSummary {
    shortlistId: number;
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    age?: number;
    city?: string;
    occupation?: string;
    education?: string;
    gender: 'male' | 'female' | 'other';
    isVerified?: boolean;
    image?: string;
}

export default function ShortlistPage() {
    const { shortlist, isLoading, removeFromShortlist } = useShortlist();
    const [searchQuery, setSearchQuery] = useState("");
    const [now] = useState(() => Date.now());

    // Extract profile from shortlist item (backend returns the shortlisted user with profile)
    const profiles = useMemo((): ProfileSummary[] => {
        return (shortlist || []).map((item: ShortlistItem) => {
            const profile = (item.shortlistedUser?.profile || item.profile || item) as ProfileData;
            const user = (item.shortlistedUser || item.user || {}) as UserData;
            
            return {
                shortlistId: item.id,
                id: Number(user.id || profile.userId || item.id),
                name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                age: profile.age || (profile.dateOfBirth ? Math.floor((now - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0),
                city: profile.city,
                occupation: profile.occupation,
                education: profile.education,
                gender: (profile.gender?.toLowerCase() as 'male' | 'female' | 'other') || 'female',
                isVerified: profile.isVerified || user.isPhoneVerified,
                image: profile.media?.[0]?.url || user.profilePicture,
            };
        });
    }, [shortlist, now]);

    // Filter by search
    const filteredProfiles = profiles.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (p.name as string)?.toLowerCase().includes(q) ||
            (p.city as string)?.toLowerCase().includes(q) ||
            (p.occupation as string)?.toLowerCase().includes(q)
        );
    });

    const handleRemove = (shortlistId: number) => {
        if (window.confirm("Remove this profile from your shortlist?")) {
            removeFromShortlist.mutate(shortlistId);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-foreground">My <span className="text-primary italic">Shortlist</span></h1>
                    <p className="text-muted-foreground font-light text-lg">
                        {isLoading ? 'Loading...' : `${profiles.length} profiles saved for later`}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search shortlist..." 
                            className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[400px] bg-card/20 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            )}

            {/* Content Area */}
            {!isLoading && filteredProfiles.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {filteredProfiles.map((profile: ProfileSummary, index: number) => (
                        <motion.div
                            key={profile.shortlistId || profile.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group"
                        >
                            <ProfileCard 
                                {...profile} 
                                age={profile.age || 0} 
                                city={profile.city || "Not Specified"}
                                occupation={profile.occupation || "Not Specified"}
                            />
                            {/* Remove from shortlist button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleRemove(profile.shortlistId);
                                }}
                                disabled={removeFromShortlist.isPending}
                                className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/30 active:scale-90"
                                title="Remove from shortlist"
                            >
                                {removeFromShortlist.isPending ? (
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                )}
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && filteredProfiles.length === 0 && (
                <div className="py-40 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-muted-foreground">
                        <Heart className="w-10 h-10" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-2xl font-black text-white/90">
                            {searchQuery ? 'No matching profiles' : 'Your shortlist is empty'}
                        </h3>
                        <p className="text-muted-foreground font-medium mt-2 leading-relaxed italic">
                            {searchQuery 
                                ? 'Try a different search term.' 
                                : 'Profiles you heart will appear here so you can find them again easily.'}
                        </p>
                    </div>
                    {!searchQuery && (
                        <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-12 px-8 shadow-xl shadow-primary/20">
                            <Link href="/dashboard">EXPLORE PROFILES</Link>
                        </Button>
                    )}
                </div>
            )}

            {/* Floating Quick Stats */}
            {!isLoading && profiles.length > 0 && (
                <div className="fixed bottom-10 right-10 hidden md:block">
                    <div className="bg-card/30 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-3xl max-w-xs group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/20 p-2 rounded-xl">
                                <Heart className="w-5 h-5 text-primary fill-primary/30" />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-foreground">Shortlist Stats</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground font-bold">Total Saved</p>
                                <p className="text-lg font-black text-foreground">{profiles.length}</p>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((profiles.length / 20) * 100, 100)}%` }}
                                    className="h-full bg-primary" 
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight italic">
                                Shortlisted profiles are 3x more likely to lead to a connection.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
