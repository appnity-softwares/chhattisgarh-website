"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, GraduationCap, ShieldCheck, Heart, MoreVertical, Ban, Flag, Loader2, Zap, Send, MessageSquare, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useInteractions } from "@/hooks/use-interactions";
import { useState, useRef, useEffect } from "react";

interface ProfileCardProps {
    name: string;
    age: number;
    city: string;
    occupation: string;
    education?: string;
    image?: string;
    isVerified?: boolean;
    gender: 'male' | 'female' | 'other';
    priority?: boolean;
    id: number | string;
    isShortlisted?: boolean;
    statusBadge?: React.ReactNode;
    isMatched?: boolean;
    canChat?: boolean;
    showInteractions?: boolean;
    customActions?: React.ReactNode;
    onActionSuccess?: (id: number | string, action: 'interest' | 'super_interest' | 'reject' | 'block') => void;
    onRemove?: (id: number | string) => void;
}

export function ProfileCard({ name, age, city, occupation, education, image, isVerified, gender, priority, id, isShortlisted, statusBadge, isMatched, canChat, showInteractions, customActions, onActionSuccess, onRemove }: ProfileCardProps) {
    const { toggleShortlist, sendInterest, sendSuperInterest, rejectProfile, blockUser, reportUser } = useInteractions();
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBlock = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`Block ${name}? They won't be able to see your profile or message you. This profile will be removed from your view.`)) {
            blockUser.mutate(targetId, {
                onSuccess: () => onActionSuccess?.(id, 'block')
            });
        }
        setShowMenu(false);
    };

    const handleReportSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!reportReason) return;
        reportUser.mutate({ userId: targetId, reason: reportReason, description: reportDescription });
        setShowReportModal(false);
        setReportReason("");
        setReportDescription("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative h-full"
        >
            <Card className="overflow-hidden bg-[#0f0f0f] border-white/5 rounded-[1.5rem] shadow-2xl transition-all duration-500 group-hover:border-primary/40 h-full flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden shrink-0">
                    <Image
                        src={image || (gender === 'female' ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80")}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    {/* Top Badges & Menu - Fixed for Overlap */}
                    <div className="absolute top-3 inset-x-3 flex justify-between items-start z-20">
                        <div className="flex flex-col gap-1.5 items-start">
                            {statusBadge && <div className="z-30">{statusBadge}</div>}
                            <div className="flex flex-wrap gap-1.5">
                                {isVerified && (
                                    <Badge className="bg-primary/80 backdrop-blur-md text-white border-none py-0.5 px-2 rounded-lg flex items-center gap-1 font-black text-[8px] uppercase tracking-wider shadow-lg">
                                        <ShieldCheck className="w-2.5 h-2.5" />
                                        Verified
                                    </Badge>
                                )}
                                {priority && (
                                    <Badge className="bg-amber-500/80 backdrop-blur-md text-white border-none py-0.5 px-2 rounded-lg font-black text-[8px] uppercase tracking-wider shadow-lg">
                                        Premium
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2" ref={menuRef}>
                            {onRemove && (
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(id); }}
                                    className="bg-black/50 backdrop-blur-md border border-white/10 p-1.5 rounded-lg text-red-400 hover:text-red-500 transition-all shadow-lg active:scale-90"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <div className="relative">
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                                    className="bg-black/50 backdrop-blur-md border border-white/10 p-1.5 rounded-lg text-white/70 hover:text-white transition-all shadow-lg active:scale-90"
                                >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="absolute right-0 top-10 z-50 w-40 bg-[#141414] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                                    >
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportModal(true); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-white/5 transition-colors"
                                        >
                                            <Flag className="w-3 h-3" />
                                            Report
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); rejectProfile.mutate(targetId, { onSuccess: () => onActionSuccess?.(id, 'reject') }); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 transition-colors border-t border-white/5"
                                        >
                                            <Ban className="w-3 h-3" />
                                            Not Interested
                                        </button>
                                        <button
                                            onClick={handleBlock}
                                            disabled={blockUser.isPending}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors border-t border-white/5"
                                        >
                                            {blockUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                                            Block User
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                            {name}, {age}
                        </h3>
                        <div className="flex items-center gap-1 text-[9px] text-white/60 font-black uppercase tracking-widest">
                            <MapPin className="w-2.5 h-2.5 text-primary shrink-0 opacity-80" />
                            {city}
                        </div>
                    </div>
                </div>

                <div className="p-3 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-widest bg-white/5 p-2 rounded-lg truncate">
                            <Briefcase className="w-2.5 h-2.5 text-primary shrink-0" />
                            {occupation}
                        </div>
                        {education && (
                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-widest bg-white/5 p-2 rounded-lg truncate">
                                <GraduationCap className="w-2.5 h-2.5 text-primary shrink-0" />
                                {education}
                            </div>
                        )}
                    </div>

                    {/* Labeled Interactions for Clarity */}
                    {customActions ? (
                        <div className="flex flex-col gap-1.5 w-full">
                            {customActions}
                        </div>
                    ) : showInteractions !== false && (
                        <div className={`grid gap-1.5 ${isMatched ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleShortlist.mutate({ targetUserId: targetId, isCurrentlyShortlisted: !!isShortlisted }); }}
                                className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl border transition-all ${isShortlisted ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/10 text-muted-foreground hover:text-white'}`}
                            >
                                <Heart className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
                                <span className="text-[7px] font-black uppercase tracking-widest">Shortlist</span>
                            </button>
                            {(isMatched || canChat) ? (
                                <Link 
                                    href={`/dashboard/chat?userId=${id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex flex-col items-center justify-center gap-1 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/30 transition-all"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">Chat</span>
                                </Link>
                            ) : (
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); sendInterest.mutate(targetId, { onSuccess: () => onActionSuccess?.(id, 'interest') }); }}
                                    className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/5 border border-white/5 hover:bg-blue-500/20 hover:border-blue-500/30 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition-all"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">Interest</span>
                                </button>
                            )}
                            {!isMatched && (
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); sendSuperInterest.mutate(targetId, { onSuccess: () => onActionSuccess?.(id, 'super_interest') }); }}
                                    className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/5 border border-white/5 hover:bg-amber-500/20 hover:border-amber-500/30 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 rounded-xl transition-all"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    <span className="text-[7px] font-black uppercase tracking-widest">Super</span>
                                </button>
                            )}
                        </div>
                    )}

                    <Button asChild variant="ghost" size="sm" className="w-full hover:bg-primary/5 text-primary font-black text-[9px] uppercase tracking-[0.3em] h-8 rounded-lg transition-all border border-primary/10">
                        <Link href={`/dashboard/profile/${id}`}>
                            View Profile
                        </Link>
                    </Button>
                </div>
            </Card>

            {/* Report Modal remains same but stylized */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#121212] border border-white/10 rounded-[1.5rem] p-6 w-full max-w-sm space-y-4 shadow-3xl"
                    >
                        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Report <span className="text-amber-500">Member</span></h2>
                        <div className="space-y-3">
                            <select 
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-[10px] font-black uppercase tracking-widest text-white"
                            >
                                <option value="" className="bg-[#121212]">Reason</option>
                                <option value="fake" className="bg-[#121212]">Fake</option>
                                <option value="spam" className="bg-[#121212]">Spam</option>
                                <option value="other" className="bg-[#121212]">Other</option>
                            </select>
                            <textarea 
                                placeholder="Details..."
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white min-h-[60px]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black" onClick={() => setShowReportModal(false)}>Cancel</Button>
                            <Button className="flex-1 rounded-xl text-[10px] font-black bg-amber-500 text-black" onClick={handleReportSubmit} disabled={!reportReason}>Submit</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
