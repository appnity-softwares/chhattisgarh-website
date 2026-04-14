"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    Users, 
    Heart, 
    MessageSquare, 
    Zap, 
    Filter,
    ArrowUpRight,
    Star,
    ShieldCheck,
    Sparkles,
    Search,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileCard } from "@/components/profile/profile-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useInfiniteProfiles, Profile } from "@/hooks/use-infinite-profiles";
import { useUserAccess } from "@/hooks/use-user-access";
import { useProfile, useProfileCompletion } from "@/hooks/use-profile";
import { LucideIcon } from "lucide-react";

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: access } = useUserAccess();
    const { data: profile } = useProfile();
    const { data: completion } = useProfileCompletion();
    
    // Read tab from URL, default to 'suggested'
    const activeTab = (searchParams.get("tab") as 'suggested' | 'new' | 'discover') || 'suggested';

    const { 
        profileViews, 
        newMatches, 
        interestsReceived, 
        unreadMessages, 
        isLoading: statsLoading 
    } = useDashboardStats();

    // Featured / Recommended
    const { 
        data: featuredPages, 
        isLoading: featuredLoading 
    } = useInfiniteProfiles({ type: 'recommendations' });

    // New Members (Discovery sorted by newest)
    const { 
        data: newPages, 
        isLoading: newLoading 
    } = useInfiniteProfiles({ type: 'discovery', sortBy: 'createdAt', order: 'desc' });

    // Discovery Feed (All Users)
    const { 
        data: discoveryPages, 
        isLoading: discoveryLoading 
    } = useInfiniteProfiles({ type: 'discovery' });

    const featuredProfiles = featuredPages?.pages[0]?.profiles?.slice(0, 8) || [];
    const newProfiles = newPages?.pages[0]?.profiles?.slice(0, 8) || [];
    const discoveryProfiles = discoveryPages?.pages.flatMap((p: any) => p.profiles) || [];

    const [hiddenIds, setHiddenIds] = useState<Set<number | string>>(new Set());

    const handleActionSuccess = (id: number | string) => {
        setHiddenIds((prev: Set<number | string>) => new Set(prev).add(id));
    };

    // Filter out profiles that have been interacted with in current session
    const filteredFeatured = featuredProfiles.filter((p: Profile) => !hiddenIds.has(p.id));
    const filteredNew = newProfiles.filter((p: Profile) => !hiddenIds.has(p.id));
    const filteredDiscovery = discoveryProfiles.filter((p: Profile) => !hiddenIds.has(p.id));

    const tabs = [
        { id: 'suggested', label: 'Suggested', icon: Sparkles, color: 'text-primary' },
        { id: 'new', label: 'New Members', icon: Zap, color: 'text-accent' },
        { id: 'discover', label: 'Discover', icon: Users, color: 'text-blue-400' },
    ];

    const statsConfig = [
        { label: "Views", value: profileViews, trend: "+12%", icon: Users, color: "text-blue-400", link: "/dashboard/activity" },
        { label: "Matches", value: newMatches, trend: "Discover", icon: Sparkles, color: "text-primary", link: "/dashboard/matches" },
        { label: "Interests", value: interestsReceived, trend: "Pending", icon: Heart, color: "text-accent", link: "/dashboard/activity" },
        { label: "Messages", value: unreadMessages, trend: "Unread", icon: MessageSquare, color: "text-chat", link: "/dashboard/chat" },
    ];

    const setTab = (id: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("tab", id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Profile Completion Alert for New Users */}
            {(!profile?.profile || (completion?.percentage || 0) < 50) && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 rounded-[2rem] bg-amber-400 text-black shadow-2xl shadow-amber-400/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-all duration-1000" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center shrink-0">
                                <User className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Complete Your Profile</h3>
                                <p className="text-sm font-bold opacity-80 italic">Verified profiles are 10x more likely to find a match!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex-1 md:w-40 h-2 bg-black/10 rounded-full overflow-hidden">
                                <div className="h-full bg-black transition-all duration-1000" style={{ width: `${completion?.percentage || 0}%` }} />
                            </div>
                            <span className="font-black text-sm">{completion?.percentage || 0}%</span>
                            <Link href="/dashboard/profile">
                                <Button className="bg-black text-white hover:bg-black/90 font-black rounded-xl px-8 h-12">
                                    FINISH NOW
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Compact Welcome Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-primary/90 to-rose-600/90 p-6 text-white shadow-xl"
            >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">Shubharambh!</h1>
                        <p className="text-white/80 font-bold text-sm">Find your perfect match in Chhattisgarh.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/search">
                            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white font-black rounded-xl px-6 h-10 border border-white/20 backdrop-blur-md">
                                <Search className="w-4 h-4 mr-2" />
                                ADVANCED SEARCH
                            </Button>
                        </Link>
                        <Link href="/dashboard/boost">
                            <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-black rounded-xl px-6 h-10 shadow-lg">
                                <Zap className="w-4 h-4 mr-2 fill-current" />
                                BOOST
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Tight Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statsConfig.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Link href={stat.link}>
                            <Card className="border-white/5 bg-card/30 backdrop-blur-lg rounded-[1.2rem] group hover:border-primary/40 transition-all border-t border-l border-white/10 overflow-hidden">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color} group-hover:bg-primary group-hover:text-white transition-all`}>
                                            <stat.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                            {statsLoading ? (
                                                <div className="h-6 w-10 bg-white/5 rounded animate-pulse" />
                                            ) : (
                                                <p className="text-xl font-black text-foreground tracking-tighter leading-none">{stat.value}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">{stat.trend}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Smart Tabs Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-white/5">
                <div className="flex p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setTab(tab.id)}
                            className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                                activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-white"
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabCompact"
                                    className="absolute inset-0 bg-primary shadow-lg shadow-primary/20 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            <tab.icon className={`w-3.5 h-3.5 relative z-20 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                            <span className="relative z-20">{tab.label}</span>
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    Real-time Discovery
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Action Area */}
                <div className="xl:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-primary rounded-full" />
                                    <h3 className="text-xl font-black tracking-tight uppercase">
                                        {activeTab === 'suggested' && <>Suggested <span className="text-primary italic">Matches</span></>}
                                        {activeTab === 'new' && <>New <span className="text-accent italic">Members</span></>}
                                        {activeTab === 'discover' && <>Discover <span className="opacity-40">All</span></>}
                                    </h3>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/5 tracking-wider">
                                    Showing Top Profiles
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {activeTab === 'suggested' && (
                                        featuredLoading ? [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-card/10 rounded-[1.5rem] animate-pulse border border-white/5" />)
                                        : filteredFeatured.map((p: Profile) => (
                                            <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                                                <ProfileCard {...p} name={`${p.firstName} ${p.lastName}`} id={p.id} gender={p.gender?.toLowerCase() as any} image={p.media?.[0]?.url} canChat={access?.isPremium} onActionSuccess={handleActionSuccess} />
                                            </motion.div>
                                        ))
                                    )}
                                    {activeTab === 'new' && (
                                        newLoading ? [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-card/10 rounded-[1.5rem] animate-pulse border border-white/5" />)
                                        : filteredNew.map((p: Profile) => (
                                            <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                                                <ProfileCard {...p} name={`${p.firstName} ${p.lastName}`} id={p.id} gender={p.gender?.toLowerCase() as any} image={p.media?.[0]?.url} canChat={access?.isPremium} onActionSuccess={handleActionSuccess} />
                                            </motion.div>
                                        ))
                                    )}
                                    {activeTab === 'discover' && (
                                        discoveryLoading ? [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-card/10 rounded-[1.5rem] animate-pulse border border-white/5" />)
                                        : filteredDiscovery.slice(0, 12).map((p: Profile) => (
                                            <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                                                <ProfileCard {...p} name={`${p.firstName} ${p.lastName}`} id={p.id} gender={p.gender?.toLowerCase() as any} image={p.media?.[0]?.url} canChat={access?.isPremium} onActionSuccess={handleActionSuccess} />
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            <div className="flex justify-center pt-4">
                                <Link href="/dashboard/matches">
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:bg-primary/5 rounded-xl h-12 w-full max-w-xs border border-primary/10 transition-all">
                                        Explore All {activeTab} Profiles
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dense Sidebar */}
                <div className="space-y-4">
                    <Card className="relative border-none bg-gradient-to-br from-[#111] to-black rounded-[1.5rem] p-6 overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Star className="w-16 h-16 text-primary group-hover:rotate-12 transition-transform duration-700" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">Precision <br />Search</h3>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-wider leading-relaxed">Find your ideal match among 50+ detailed parameters.</p>
                            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-11 text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                <Link href="/dashboard/search">
                                    USE FILTERS <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-card/20 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/5">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/70 mb-5">Quick Stats</h4>
                        <div className="space-y-4">
                            {[
                                { icon: ShieldCheck, label: "Profile Status", value: "Verified", color: "text-green-500" },
                                { icon: Zap, label: "Boost Credits", value: "12 Left", color: "text-amber-500" },
                                { icon: Heart, label: "Favorited by", value: "24 Members", color: "text-rose-500" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                                        <item.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase leading-none mb-1">{item.label}</p>
                                        <p className="text-xs font-black text-white uppercase leading-none">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Zap className="w-10 h-10 animate-pulse text-primary" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}
