"use client";

import { motion } from "framer-motion";
import { 
    Eye, 
    TrendingUp, 
    Rocket,
    Clock,
    ShieldCheck,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileCard } from "@/components/profile/profile-card";
import { useState } from "react";
import { useProfileVisitors } from "@/hooks/use-interactions";
import { Loader2 } from "lucide-react";
import { ProfileView } from "@/types/api.types";

interface ProfileDisplay {
    id: number;
    firstName?: string;
    lastName?: string;
    age?: number;
    city?: string;
    occupation?: string;
    gender?: string;
    isVerified?: boolean;
    media?: { url: string }[];
}

export default function ActivityPage() {
    const [filter, setFilter] = useState("all");
    const { data: visitorsData, isLoading } = useProfileVisitors();
    
    // We assume the data contains a list of profiles or interactions with viewer profiles
    const visitors = (visitorsData?.visitors || visitorsData || []) as ProfileView[];
    const totalViews = visitors.length;
    const viewsToday = visitors.filter((v: ProfileView) => new Date(v.viewedAt || v.createdAt).toDateString() === new Date().toDateString()).length;

    return (
        <div className="space-y-10 pb-20">
            {/* Header & Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">Profile <span className="text-primary italic">Activity</span></h1>
                    <p className="text-muted-foreground font-light text-lg">See who is interested in your profile and visiting your page</p>
                </div>

                <div className="lg:col-span-4 flex gap-4">
                    <Card className="flex-1 bg-primary/10 border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-primary">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalViews}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Total Views</span>
                    </Card>
                    <Card className="flex-1 bg-amber-400/10 border-amber-400/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black text-amber-500">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `+${viewsToday}`}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Viewed Today</span>
                    </Card>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit items-center gap-2">
                {["all", "today", "this-week"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                    >
                        {f.replace("-", " ")}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Results Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {isLoading ? (
                            <div className="col-span-full py-12 flex justify-center border border-white/5 rounded-[2.5rem] bg-card/30">
                                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                            </div>
                        ) : visitors.length === 0 ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center border border-white/5 rounded-[2.5rem] bg-card/30">
                                <Eye className="w-8 h-8 text-muted-foreground opacity-30 mb-2" />
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No recent visitors</span>
                            </div>
                        ) : visitors.map((interaction: ProfileView, i: number) => {
                            const profile = (interaction.viewer || (interaction as Record<string, unknown>).profile || interaction) as unknown as ProfileDisplay;
                            return (
                                <motion.div 
                                    key={interaction.id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="relative group"
                                >
                                    <div className="absolute top-4 left-4 z-20">
                                        <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-[8px] font-black uppercase tracking-widest">
                                            <Clock className="w-2.5 h-2.5 mr-1" />
                                            Seen {new Date(interaction.viewedAt || interaction.createdAt).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                    <ProfileCard 
                                        id={profile.id}
                                        name={`${profile.firstName} ${profile.lastName}`}
                                        age={profile.age}
                                        city={profile.city}
                                        occupation={profile.occupation}
                                        gender={profile.gender?.toLowerCase() || 'female'}
                                        isVerified={profile.isVerified}
                                        image={profile.media?.[0]?.url}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Empty State / Load More simulation */}
                    <div className="bg-card/30 border border-white/5 rounded-[2.5rem] p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <Users className="w-10 h-10 text-muted-foreground opacity-20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-xl uppercase tracking-widest text-foreground">Discover More Visitors</h3>
                            <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">Boost your profile to increase visibility and let more potential matches find you today.</p>
                        </div>
                        <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 group">
                            BOOST VISIBILITY NOW
                            <Rocket className="w-5 h-5 ml-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Side Insights Column */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-4 text-primary">
                                <TrendingUp className="w-8 h-8" />
                                <h3 className="font-black text-sm uppercase tracking-widest">Discovery Insights</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground">Search Appearances</span>
                                        <span className="text-foreground">42 Times</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[65%] bg-primary rounded-full shadow-[0_0_8px_rgba(224,30,90,0.5)]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground">Interest Conv. Rate</span>
                                        <span className="text-foreground">12%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[35%] bg-amber-400 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest">VIEW ANALYTICS</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-background border-primary/20 rounded-[2rem] p-8 space-y-6 border-2 border-dashed">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Verified Only</h4>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">We only show visitors who have completed their mobile verification for your safety.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
