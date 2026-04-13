"use client";

import { motion } from "framer-motion";
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
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileCard } from "@/components/profile/profile-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useInfiniteProfiles, Profile } from "@/hooks/use-infinite-profiles";
import { LucideIcon } from "lucide-react";

export default function DashboardPage() {
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

    const featuredProfiles = featuredPages?.pages[0]?.profiles?.slice(0, 6) || [];
    const newProfiles = newPages?.pages[0]?.profiles?.slice(0, 4) || [];
    const discoveryProfiles = discoveryPages?.pages[0]?.profiles?.slice(0, 8) || [];

    const statsConfig: Array<{
        label: string;
        value: number;
        trend: string;
        icon: LucideIcon;
        color: string;
        link: string;
    }> = [
        { label: "Profile Views", value: profileViews, trend: "+12%", icon: Users, color: "text-blue-400", link: "/dashboard/activity" },
        { label: "New Matches", value: newMatches, trend: "Discover", icon: Sparkles, color: "text-primary", link: "/dashboard/matches" },
        { label: "Interests", value: interestsReceived, trend: "Pending", icon: Heart, color: "text-accent", link: "/dashboard/activity" },
        { label: "Messages", value: unreadMessages, trend: "Unread", icon: MessageSquare, color: "text-chat", link: "/dashboard/chat" },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Welcome Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary/80 to-rose-600/80 p-8 md:p-12 text-white shadow-2xl shadow-primary/20"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Bolein <span className="text-white italic">Shubharambh!</span></h1>
                        <p className="text-white/80 font-medium text-lg">Your perfect match is just one click away.</p>
                        <div className="flex items-center gap-2 pt-4">
                            <ShieldCheck className="w-4 h-4 text-white/90" />
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80">Safety & Privacy Verified</span>
                        </div>
                    </div>
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-black rounded-2xl h-16 px-10 shadow-2xl shadow-black/20 text-lg group">
                        BOOST NOW
                        <Zap className="w-5 h-5 ml-2 fill-current group-hover:scale-125 transition-transform" />
                    </Button>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statsConfig.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex"
                    >
                        <Link href={stat.link} className="w-full">
                            <Card className="border-white/5 bg-card/30 backdrop-blur-xl rounded-[2rem] overflow-hidden group hover:border-primary/40 transition-all cursor-pointer h-full border-t border-l border-white/10">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">{stat.trend}</span>
                                    </div>
                                    <div>
                                        {statsLoading ? (
                                            <div className="h-10 w-16 bg-white/5 rounded-lg animate-pulse mb-2" />
                                        ) : (
                                            <p className="text-5xl font-black text-foreground mb-1 tracking-tighter">{stat.value}</p>
                                        )}
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Featured / Recommended - Horizontal Scroll */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(224,30,90,0.5)]" />
                        <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">Suggested <span className="text-primary italic">For You</span></h3>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 px-2 no-scrollbar scroll-smooth">
                    {featuredLoading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="min-w-[320px] h-96 bg-card/20 rounded-[3rem] animate-pulse" />
                        ))
                    ) : (
                        featuredProfiles.map((profile: Profile, i: number) => (
                            <div key={profile.id} className="min-w-[320px]">
                                <ProfileCard 
                                    id={profile.id}
                                    name={`${profile.firstName} ${profile.lastName}`}
                                    age={profile.age}
                                    city={profile.city}
                                    occupation={profile.occupation}
                                    gender={(profile.gender?.toLowerCase() || 'male') as "male" | "female" | "other"}
                                    isVerified={profile.isVerified}
                                    image={profile.media?.[0]?.url}
                                    priority={i < 2}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Discovery Feed */}
                <div className="xl:col-span-2 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-10 bg-accent rounded-full shadow-[0_0_15px_rgba(255,100,100,0.5)]" />
                            <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">New <span className="text-accent italic">Members</span></h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {newLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-96 bg-card/20 rounded-[3rem] animate-pulse" />
                            ))
                        ) : (
                            newProfiles.map((profile: Profile) => (
                                <ProfileCard 
                                    key={profile.id}
                                    id={profile.id}
                                    name={`${profile.firstName} ${profile.lastName}`}
                                    age={profile.age}
                                    city={profile.city}
                                    occupation={profile.occupation}
                                    gender={(profile.gender?.toLowerCase() || 'male') as "male" | "female" | "other"}
                                    isVerified={profile.isVerified}
                                    image={profile.media?.[0]?.url}
                                />
                            ))
                        )}
                    </div>

                    <div className="pt-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-10 bg-primary/40 rounded-full" />
                                <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">Discover <span className="opacity-40">All Users</span></h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {discoveryLoading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-96 bg-card/20 rounded-[3rem] animate-pulse" />
                                ))
                            ) : (
                                discoveryProfiles.map((profile: Profile) => (
                                    <ProfileCard 
                                        key={profile.id}
                                        id={profile.id}
                                        name={`${profile.firstName} ${profile.lastName}`}
                                        age={profile.age}
                                        city={profile.city}
                                        occupation={profile.occupation}
                                        gender={(profile.gender?.toLowerCase() || 'male') as "male" | "female" | "other"}
                                        isVerified={profile.isVerified}
                                        image={profile.media?.[0]?.url}
                                    />
                                ))
                            )}
                        </div>

                        <div className="flex justify-center pt-8">
                            <Link href="/dashboard/matches">
                                <Button size="lg" variant="outline" className="rounded-2xl h-14 px-10 border-white/10 bg-white/5 hover:bg-white/10 font-black tracking-widest uppercase">
                                    Browse More Profiles
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-8 sticky top-24 h-fit">
                    {/* Search Pro Widget */}
                    <Card className="relative border-none bg-gradient-to-b from-[#111] to-black rounded-[2.5rem] p-10 overflow-hidden group shadow-3xl">
                        <div className="absolute top-0 right-0 p-6">
                            <Star className="w-12 h-12 text-primary/10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-700" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="bg-primary/20 w-fit p-4 rounded-[1.5rem] border border-primary/20 shadow-inner">
                                <Filter className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white leading-none tracking-tighter mb-4">Precision <br />Matching</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium opacity-80">Find your ideal partner based on 50+ detailed parameters including community, education, and lifestyle.</p>
                            </div>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-16 shadow-2xl shadow-primary/20 text-md">
                                ADVANCED SEARCH
                                <ArrowUpRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Card>

                    {/* Quick Stats/Activity Widget */}
                    <div className="bg-card/20 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Recent Activity</h4>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                        <Heart className="w-5 h-5 text-primary/60" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Profile Interest</p>
                                        <p className="text-[10px] text-muted-foreground">Received 2 hours ago</p>
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
