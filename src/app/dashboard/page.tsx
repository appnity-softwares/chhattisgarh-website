"use client";

import { motion } from "framer-motion";
import { 
    Users, 
    Heart, 
    MessageSquare, 
    Zap, 
    ChevronRight, 
    Filter,
    ArrowUpRight,
    Star,
    ShieldCheck,
    Sparkles,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileCard } from "@/components/profile/profile-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useInfiniteProfiles } from "@/hooks/use-infinite-profiles";

export default function DashboardPage() {
    const { 
        profileViews, 
        newMatches, 
        interestsReceived, 
        unreadMessages, 
        isLoading: statsLoading 
    } = useDashboardStats();

    const { 
        data: profilePages, 
        isLoading: profilesLoading 
    } = useInfiniteProfiles();

    const topPicks = profilePages?.pages[0]?.profiles?.slice(0, 4) || [];

    const statsConfig = [
        { label: "Profile Views", value: profileViews, trend: "+12%", icon: Users, color: "text-blue-400" },
        { label: "New Matches", value: newMatches, trend: "Discover", icon: Sparkles, color: "text-primary" },
        { label: "Interests", value: interestsReceived, trend: "Pending", icon: Heart, color: "text-accent" },
        { label: "Messages", value: unreadMessages, trend: "Unread", icon: MessageSquare, color: "text-green-400" },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Welcome Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary/80 to-rose-600/80 p-8 md:p-12 text-white shadow-2xl shadow-primary/20"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Bolein <span className="text-white italic">Shubharambh!</span></h1>
                        <p className="text-white/80 font-medium text-lg">You have {newMatches} new matches waiting for your response.</p>
                        <div className="flex items-center gap-2 pt-2">
                            <ShieldCheck className="w-4 h-4 text-white/90" />
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Safety Verified</span>
                        </div>
                    </div>
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-black rounded-2xl h-14 px-8 shadow-xl shadow-black/10">
                        BOOST PROFILE
                        <Zap className="w-5 h-5 ml-2 fill-current" />
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
                    >
                        <Card className="border-white/5 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden group hover:border-primary/20 transition-all cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:bg-primary group-hover:text-white transition-all`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{stat.trend}</span>
                                </div>
                                <div>
                                    {statsLoading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-30 mb-2" />
                                    ) : (
                                        <p className="text-4xl font-black text-foreground mb-1 tracking-tighter">{stat.value}</p>
                                    )}
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Discovery Feed */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Top <span className="text-primary italic">Picks</span> for You</h3>
                        </div>
                        <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2">
                            View All <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {profilesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-96 bg-card/20 rounded-[2.5rem] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {topPicks.map((profile: any, i: number) => (
                                <motion.div
                                    key={profile.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                >
                                    <ProfileCard 
                                        name={`${profile.firstName} ${profile.lastName}`}
                                        age={profile.age}
                                        city={profile.city}
                                        occupation={profile.occupation}
                                        gender={profile.gender.toLowerCase()}
                                        isVerified={profile.isVerified}
                                        image={profile.media?.[0]?.url}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-8">
                    {/* Search Pro Widget */}
                    <Card className="relative border-none bg-[#111] rounded-[2rem] p-8 overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <Star className="w-10 h-10 text-primary/20 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="bg-primary/20 w-fit p-3 rounded-2xl">
                                <Filter className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-black text-white leading-tight">Advanced <br />Search Filter</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">Find your ideal partner based on 50+ detailed parameters including community, location, and lifestyle.</p>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-12 shadow-lg shadow-primary/20">
                                OPEN SEARCH
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Card>
                </div>
            </div>
        </div>
    );
}
