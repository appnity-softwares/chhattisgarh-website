"use client";

import { motion } from "framer-motion";
import { 
    UserCheck, 
    ShieldCheck, 
    ArrowLeft,
    MapPin,
    Calendar,
    Search,
    Info,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";

const BLOCKED_USERS = [
    {
        id: 1,
        name: "Ramesh Sharma",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        location: "Raipur, Chhattisgarh",
        blockedDate: "12 Oct, 2023",
        reason: "Misbehavior"
    },
    {
        id: 2,
        name: "Alok Sahu",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
        location: "Bilaspur, Chhattisgarh",
        blockedDate: "05 Sep, 2023",
        reason: "Fake Profile"
    }
];

export default function BlockedUsersPage() {
    const [blockedList, setBlockedList] = useState(BLOCKED_USERS);

    const handleUnblock = (id: number) => {
        setBlockedList(prev => prev.filter(user => user.id !== id));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Blocked <span className="text-primary italic">Profiles</span></h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">Manage restricted users & privacy</p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-4 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">{blockedList.length} Users Restricted</span>
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex items-start gap-4">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-widest">
                    Blocked users cannot see your profile, send you interests, or message you. You can unblock them at any time to restore interaction.
                </p>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    placeholder="Search blocked users..." 
                    className="w-full h-14 bg-card/40 backdrop-blur-3xl border border-white/5 rounded-2xl pl-16 pr-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                />
            </div>

            {/* List */}
            <div className="grid gap-6">
                {blockedList.length > 0 ? (
                    blockedList.map((user, idx) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="bg-card/30 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden group hover:bg-card/50 transition-all">
                                <div className="p-6 md:p-8 flex items-center gap-6">
                                    <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-white/5 group-hover:ring-primary/20 transition-all">
                                        <AvatarImage src={user.photo} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                                            <h4 className="font-black text-lg text-foreground uppercase tracking-tight">{user.name}</h4>
                                            <Badge variant="outline" className="w-fit text-[8px] font-black uppercase tracking-widest border-white/10 opacity-60">ID: {29910 + user.id}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                                <span className="text-[10px] font-bold uppercase">{user.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest italic">{user.blockedDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-3">
                                        <Button 
                                            onClick={() => handleUnblock(user.id)}
                                            className="h-12 px-6 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 font-black text-[10px] uppercase tracking-widest gap-2 flex"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            Unblock
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl border border-white/5">
                                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-card/10 rounded-[3rem] border border-dashed border-white/5">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                            <UserCheck className="w-10 h-10 text-muted-foreground opacity-30" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-xl uppercase tracking-widest opacity-30">All Clear!</h3>
                            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">You haven&apos;t blocked any users yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
