"use client";

import Image from "next/image";
import Link from "next/link";
import { 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    ShieldCheck, 
    Heart, 
    MoreVertical, 
    Ban, 
    Flag, 
    Loader2, 
    Zap, 
    Send, 
    MessageSquare, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Crown,
    Star
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useInteractions } from "@/hooks/use-interactions";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from "next/navigation";
import { useUserAccess } from "@/hooks/use-user-access";
import { useInteractionStore } from "@/store/interaction-store";

interface ProfileCardProps {
    name: string;
    age: number;
    city: string;
    occupation: string;
    education?: string;
    image?: string;
    media?: { url: string; isProfile?: boolean }[];
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
    relationship?: {
        status: string;
        matchId?: number;
    };
}

export function ProfileCard({ name, age, city, occupation, education, image, media, isVerified, gender, priority, id, isShortlisted, statusBadge, isMatched, canChat: propCanChat, showInteractions, customActions, onActionSuccess, onRemove, relationship: propRelationship }: ProfileCardProps) {
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    const { 
        relationships, 
        setRelationship, 
        sendInterest, 
        sendSuperInterest, 
        acceptInterest, 
        rejectInterest, 
        toggleShortlist, 
        blockUser,
        syncFromApi 
    } = useInteractionStore();
    
    // Sync with store on mount/update
    useEffect(() => {
        if (propRelationship) {
            syncFromApi(targetId, {
                ...propRelationship,
                isShortlisted,
                isMatched
            });
        } else {
            setRelationship(targetId, {
                isShortlisted,
                type: isMatched ? "matched" : "none"
            });
        }
    }, [targetId, propRelationship, isShortlisted, isMatched, syncFromApi, setRelationship]);

    const state = relationships[targetId] || { type: "none", isShortlisted, isSuper: false, lastActionBy: null };

    const [showMenu, setShowMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { reportUser } = useInteractions();
    const { data: access } = useUserAccess();
    const isPremium = access?.isPremium;

    const handleReportSubmit = async () => {
        if (!reportReason) return;
        try {
            await reportUser.mutateAsync({ 
                userId: targetId, 
                reason: reportReason as any, 
                description: reportDescription 
            });
            setShowReportModal(false);
            setReportReason("");
            setReportDescription("");
        } catch (error) {
            console.error("Report failed:", error);
        }
    };

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const handleAction = async (e: React.MouseEvent, action: () => Promise<void>) => {
        e.preventDefault();
        e.stopPropagation();
        await action();
    };

    const profileImages = useMemo(() => {
        if (media && media.length > 0) return media.map(m => m.url);
        if (image) return [image];
        return [gender === 'female' 
            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"
            : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"];
    }, [media, image, gender]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative h-full flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/20 cursor-pointer"
            onClick={() => router.push(`/dashboard/profile/${id}`)}
        >
            <Card className="h-full overflow-hidden bg-transparent border-none flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden shrink-0">
                    <div className="h-full" ref={emblaRef}>
                        <div className="flex h-full">
                            {profileImages.map((src, index) => (
                                <div className="relative flex-[0_0_100%] min-w-0" key={index}>
                                    <Image
                                        src={src}
                                        alt={`${name}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 300px"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    
                    {/* Interaction Buttons Overlay */}
                    <div className="absolute top-4 inset-x-4 flex justify-between items-start z-30">
                        <div className="flex flex-col gap-1.5">
                            {statusBadge}
                            <div className="flex flex-wrap gap-1.5">
                                {isVerified && (
                                    <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-none py-1 px-2.5 rounded-full flex items-center gap-1.5 font-black text-[8px] uppercase tracking-widest shadow-xl">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </Badge>
                                )}
                                {state.type === 'matched' && (
                                    <Badge className="bg-primary backdrop-blur-md text-white border-none py-1 px-2.5 rounded-full flex items-center gap-1.5 font-black text-[8px] uppercase tracking-widest shadow-xl animate-pulse">
                                        <Heart className="w-3 h-3 fill-current" /> Matched
                                    </Badge>
                                )}
                                {state.isSuper && (
                                    <Badge className="bg-amber-500 backdrop-blur-md text-black border-none py-1 px-2.5 rounded-full flex items-center gap-1.5 font-black text-[8px] uppercase tracking-widest shadow-xl">
                                        <Zap className="w-3 h-3 fill-current" /> Priority
                                    </Badge>
                                )}
                            </div>
                        </div>
                        
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="bg-black/40 backdrop-blur-md border border-white/10 w-9 h-9 rounded-full text-white/70 hover:text-white transition-all shadow-xl flex items-center justify-center"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                        className="absolute right-0 top-11 z-50 w-36 bg-[#111] border border-white/10 rounded-2xl shadow-3xl overflow-hidden"
                                    >
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportModal(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-white/5 transition-colors">
                                            <Flag className="w-3.5 h-3.5" /> Report
                                        </button>
                                        <button onClick={(e) => handleAction(e, () => blockUser(targetId))} className="w-full flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors border-t border-white/5">
                                            <Ban className="w-3.5 h-3.5" /> Block
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-base font-black tracking-tight flex items-center gap-1.5 drop-shadow-lg">
                            {name}, {age}
                        </h3>
                        <div className="flex items-center gap-1 text-[9px] text-white/80 font-black uppercase tracking-widest">
                            <MapPin className="w-3 h-3 text-primary opacity-90" />
                            {city}
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-white/[0.03] px-3 py-2.5 rounded-2xl truncate border border-white/5">
                            <Briefcase className="w-3.5 h-3.5 text-primary shrink-0 opacity-80" />
                            {occupation}
                        </div>
                    </div>

                    {/* ACTION HUB - Strictly Defined Behavior */}
                    <div className="flex gap-2.5 h-11">
                        <button 
                            onClick={(e) => handleAction(e, () => toggleShortlist(targetId))}
                            className={`aspect-square flex items-center justify-center rounded-2xl border transition-all active:scale-95 ${state.isShortlisted ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 border-white/5 hover:border-primary/40 text-muted-foreground'}`}
                        >
                            <Heart className={`w-5 h-5 ${state.isShortlisted ? 'fill-current' : ''}`} />
                        </button>

                        { (state.type === 'matched' || isPremium) ? (
                            <Link 
                                href={`/dashboard/chat?userId=${targetId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/20 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>{state.type === 'matched' ? 'Message' : 'Pre-Match Chat 💬'}</span>
                            </Link>
                        ) : state.type === 'received' ? (
                            <div className="flex-1 flex gap-2">
                                <button 
                                    onClick={(e) => handleAction(e, () => acceptInterest(targetId, propRelationship?.matchId || 0))}
                                    className="flex-1 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
                                >
                                    Accept
                                </button>
                                <button 
                                    onClick={(e) => handleAction(e, () => rejectInterest(targetId, propRelationship?.matchId))}
                                    className="px-4 bg-white/5 text-muted-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Skip
                                </button>
                            </div>
                        ) : state.type === 'sent' ? (
                            <div className="flex-1 flex gap-2">
                                <button disabled className="flex-1 bg-white/10 text-muted-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                                    Pending
                                </button>
                                {!state.isSuper && (
                                    <button 
                                        onClick={(e) => handleAction(e, () => sendSuperInterest(targetId))}
                                        className="aspect-square flex items-center justify-center rounded-2xl bg-amber-500 text-black hover:bg-amber-600 transition-all"
                                        title="Upgrade to Priority"
                                    >
                                        <Zap className="w-4 h-4 fill-current" />
                                    </button>
                                )}
                            </div>
                        ) : state.type === 'rejected' ? (
                            <button 
                                onClick={(e) => handleAction(e, () => sendInterest(targetId))}
                                className="flex-1 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all"
                            >
                                Connect Again
                            </button>
                        ) : state.type === 'blocked' ? (
                            <button disabled className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                                User Blocked
                            </button>
                        ) : (
                            <div className="flex-1 flex gap-2">
                                <button 
                                    onClick={(e) => handleAction(e, () => sendInterest(targetId))}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Connect</span>
                                </button>
                                <button 
                                    onClick={(e) => handleAction(e, () => sendSuperInterest(targetId))}
                                    className="aspect-square flex items-center justify-center rounded-2xl bg-amber-500 text-black hover:bg-amber-600 transition-all"
                                    title="Priority Connection"
                                >
                                    <Zap className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        )}
                        
                        <Button asChild className="h-full px-5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/90 active:scale-95 shadow-xl">
                            <Link href={`/dashboard/profile/${id}`}>View</Link>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Stylized Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowReportModal(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-6 shadow-4xl">
                        <h2 className="text-base font-black text-white uppercase tracking-tighter">Report <span className="text-amber-500 font-italic">Member</span></h2>
                        <div className="space-y-3">
                            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/50 transition-colors">
                                <option value="" className="bg-[#111]">Select Reason</option>
                                <option value="fake" className="bg-[#111]">Fake Profile</option>
                                <option value="spam" className="bg-[#111]">Spam/Commercial</option>
                                <option value="harassment" className="bg-[#111]">Harassment</option>
                                <option value="other" className="bg-[#111]">Other</option>
                            </select>
                            <textarea placeholder="Tell us more about the issue..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white min-h-[100px] outline-none focus:border-primary/50 transition-colors" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11" onClick={() => setShowReportModal(false)}>Cancel</Button>
                            <Button className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11 bg-amber-500 text-black hover:bg-amber-600" onClick={handleReportSubmit} disabled={!reportReason}>Submit Report</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
