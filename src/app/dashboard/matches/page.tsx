"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Users, 
    CheckCircle2, 
    Send, 
    Heart, 
    Filter, 
    Search,
    SlidersHorizontal,
    MoreHorizontal,
    Sparkles,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/profile/profile-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useInfiniteProfiles } from "@/hooks/use-infinite-profiles";
import { useInView } from "react-intersection-observer";

export default function MatchesPage() {
    const [activeTab, setActiveTab] = useState("new");
    const [searchTerm, setSearchTerm] = useState("");
    
    // Automatic Pagination Trigger
    const { ref, inView } = useInView();

    const { 
        data, 
        isLoading, 
        isFetchingNextPage, 
        fetchNextPage, 
        hasNextPage 
    } = useInfiniteProfiles({
        type: activeTab === 'new' ? 'new' : (activeTab === 'accepted' ? 'accepted' : 'sent'),
        search: searchTerm
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const allProfiles = data?.pages.flatMap(page => page.profiles) || [];

    return (
        <div className="space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">My <span className="text-primary italic">Matches</span></h1>
                    <p className="text-muted-foreground font-light text-lg">Manage your connections and interests in one place</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Find in matches..." 
                            className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Match Tabs */}
            <Tabs defaultValue="new" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between border-b border-white/5 pb-0 mb-8 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent border-none p-0 h-auto gap-8">
                        <TabsTrigger 
                            value="new" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            New Matches
                        </TabsTrigger>
                        <TabsTrigger 
                            value="accepted" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Accepted
                        </TabsTrigger>
                        <TabsTrigger 
                            value="sent" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Interests Sent
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-96 bg-card/20 rounded-[2rem] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <TabsContent value={activeTab}>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            >
                                {allProfiles.map((profile, i) => (
                                    <motion.div key={profile.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
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
                            </motion.div>
                            
                            {/* Infinite Scroll Load Trigger */}
                            <div ref={ref} className="w-full py-12 flex items-center justify-center">
                                {isFetchingNextPage && (
                                    <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest italic animate-pulse">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Loading more matches...
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
