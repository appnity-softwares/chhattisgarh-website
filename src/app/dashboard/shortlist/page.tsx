"use client";

import { motion } from "framer-motion";
import { 
    Heart, 
    Search, 
    SlidersHorizontal,
    Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/profile/profile-card";
import { useState } from "react";

// Mock Data for Shortlist
const SHORTLIST_DATA = [
    { id: 1, name: "Sneha Patel", age: 24, city: "Raipur", occupation: "Doctor", gender: 'female' as const, isVerified: true },
    { id: 2, name: "Anjali Sahu", age: 25, city: "Durg", occupation: "Architect", gender: 'female' as const, isVerified: true },
    { id: 3, name: "Pooja Verma", age: 23, city: "Bilaspur", occupation: "Designer", gender: 'female' as const, isVerified: false },
    { id: 4, name: "Megha Yadav", age: 26, city: "Bhilai", occupation: "HR", gender: 'female' as const, isVerified: true },
];

export default function ShortlistPage() {
    const [profiles, setProfiles] = useState(SHORTLIST_DATA);

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-foreground">My <span className="text-primary italic">Shortlist</span></h1>
                    <p className="text-muted-foreground font-light text-lg">Profiles you've bookmarked for later consideration</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search folder..." 
                            className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {profiles.length > 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {profiles.map((profile, index) => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ProfileCard {...profile} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="py-40 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-muted-foreground">
                        <Heart className="w-10 h-10" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-2xl font-black text-white/90">Your shortlist is empty</h3>
                        <p className="text-muted-foreground font-medium mt-2 leading-relaxed italic">
                            Profiles you heart will appear here so you can find them again easily.
                        </p>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-12 px-8 shadow-xl shadow-primary/20">
                        <a href="/dashboard">EXPLORE PROFILES</a>
                    </Button>
                </div>
            )}

            {/* Floating Quick Stats - High End Add-on */}
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
                            <p className="text-xs text-muted-foreground font-bold">Total Saveds</p>
                            <p className="text-lg font-black text-foreground">{profiles.length}</p>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "65%" }}
                                className="h-full bg-primary" 
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight italic">
                            Shortlisted profiles are 3x more likely to lead to a connection.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
