"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Ban, 
    UserX, 
    ShieldAlert, 
    Loader2,
    RefreshCw,
    Search,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBlockedUsers, useInteractions } from "@/hooks/use-interactions";
import { useState } from "react";

export default function BlockedUsersPage() {
    const { data: blockedUsers, isLoading, refetch } = useBlockedUsers();
    const { unblockUser } = useInteractions();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = (blockedUsers || []).filter((user: any) => {
        const profile = user.profile || {};
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''} ${user.email || ''}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-32 pt-4 px-4 sm:px-6">
            {/* Minimal Glossy Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
                        Blocked <span className="text-primary italic">Members</span>
                        <Badge className="bg-red-500/10 text-red-500 border-none px-2 h-5 text-[9px] font-black uppercase tracking-widest hidden sm:flex">Restricted</Badge>
                    </h1>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] opacity-60 mt-2">Manage your restricted connections and privacy circle</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group w-full sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Find by name or email..." 
                            className="h-12 pl-12 pr-6 bg-white/[0.03] border-white/10 rounded-2xl text-xs font-bold focus:ring-primary/20 transition-all border-t border-l border-white/[0.08]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => refetch()} 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/5"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Stats & Info Sidebar */}
                <div className="space-y-4 lg:col-span-1">
                    <div className="bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-red-500/10 transition-all duration-700" />
                        
                        <div className="space-y-4 relative">
                            <div className="bg-red-500/10 w-10 h-10 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Privacy Circle</h4>
                                <p className="text-[24px] font-black text-white mt-1">{(blockedUsers || []).length}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-white/5 rounded-lg shrink-0">
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">
                                    Blocked users cannot view your profile or contact you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] bg-white/[0.02] border border-white/5 gap-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin opacity-40" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Accessing Vault</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Retrieving restricted profiles</p>
                                </div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-24 flex flex-col items-center text-center space-y-6 bg-white/[0.02] border border-dashed border-white/5 rounded-[2.5rem]"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/30">
                                    <UserX className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                                        {searchQuery ? 'Search Clearance Failed' : 'Privacy Maintained'}
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                                        {searchQuery ? `No restricted members match "${searchQuery}" in your current vault.` : 'Your restricted connections list is currently empty. Enjoy your open experience!'}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredUsers.map((user: any, index: number) => {
                                    const profile = user.profile || {};
                                    const name = `${profile.firstName || 'Member'} ${profile.lastName || ''}`.trim();
                                    
                                    // Robust Avatar Logic
                                    const avatarUrl = user.profilePicture || profile.media?.[0]?.url;
                                    const initial = name.charAt(0).toUpperCase();

                                    return (
                                        <motion.div
                                            key={user.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
                                            className="group bg-[#0f0f0f] border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between hover:border-primary/20 transition-all shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-white/5 group-hover:border-primary/30 transition-all duration-500 overflow-hidden shadow-xl">
                                                        <AvatarImage 
                                                            src={avatarUrl} 
                                                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                                            alt={name}
                                                        />
                                                        <AvatarFallback className="bg-gradient-to-br from-[#1a1a1a] to-black text-primary font-black text-lg">
                                                            {initial}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-[#0f0f0f] z-10">
                                                        <Ban className="w-2 h-2 text-white" />
                                                    </div>
                                                </div>
                                                
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-black text-white tracking-tight group-hover:text-primary transition-colors truncate">{name}</h4>
                                                    <div className="flex flex-col gap-1 mt-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                                                Restricted Access
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="bg-white/5 hover:bg-white/10 text-[7px] font-bold uppercase tracking-widest border-none h-5 px-1.5 w-fit">
                                                            Blocked {user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : 'Recently'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => {
                                                    if (confirm(`Full interaction with ${name} will be restored. Continue?`)) {
                                                        unblockUser.mutate(user.id);
                                                    }
                                                }}
                                                disabled={unblockUser.isPending}
                                                variant="outline" 
                                                size="sm"
                                                className="h-10 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-green-500/10 hover:border-green-500/20 hover:text-green-500 transition-all group/btn font-black text-[9px] uppercase tracking-widest shadow-lg"
                                            >
                                                {unblockUser.isPending ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <RefreshCw className="w-3.5 h-3.5 mr-2 group-hover/btn:rotate-180 transition-transform duration-700" />
                                                        Restore
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
