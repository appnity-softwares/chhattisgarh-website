"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, ShieldCheck, Heart, MoreVertical, Ban, Flag, Loader2, Zap, Send, MessageSquare, UserPlus, Phone, Mail, MessageCircle, Camera, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useInteractions } from "@/hooks/use-interactions";
import { useContactRequests } from "@/hooks/use-contact-requests";
import { usePhotoRequests } from "@/hooks/use-photo-requests";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from "next/navigation";
import { useUserAccess } from "@/hooks/use-user-access";
import { useInteractionStore } from "@/store/interaction-store";
import { useToast } from "@/hooks/use-toast";
import { ProfileQRCode } from "./qr-share";
import { displayValue } from "@/lib/display-format";

interface ProfileCardProps {
    name: string;
    age?: number | null;
    city?: string | null;
    occupation?: string | null;
    education?: string;
    image?: string;
    media?: { url: string; isProfile?: boolean }[];
    isVerified?: boolean;
    gender?: 'male' | 'female' | 'other';
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
    allowPhotoRequest?: boolean;
}

export function ProfileCard({ name, age, city, occupation, education: _education, image, media, isVerified, gender, priority: _priority, id, isShortlisted, statusBadge, isMatched, canChat: _propCanChat, showInteractions: _showInteractions, customActions: _customActions, onActionSuccess: _onActionSuccess, onRemove: _onRemove, relationship: propRelationship, allowPhotoRequest }: ProfileCardProps) {
    const { send: sendContact } = useContactRequests();
    const { send: sendPhoto } = usePhotoRequests();
    const { toast: _toast } = useToast();
    const [showContactModal, setShowContactModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const targetId = typeof id === 'string' ? parseInt(id) : id;
    const {
        relationships,
        setRelationship,
        sendInterest,
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
    const safeName = displayValue(name, "Profile");
    const safeAge = typeof age === "number" && age > 0 ? String(age) : "";
    const safeCity = displayValue(city, "Location not shared");
    const safeOccupation = displayValue(occupation, "Occupation not shared");
    const safeGender = gender === "male" || gender === "female" ? gender : "other";

    const handleReportSubmit = async () => {
        if (!reportReason) return;
        try {
            await reportUser.mutateAsync({
                userId: targetId,
                reason: reportReason as unknown,
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
    const [_selectedIndex, setSelectedIndex] = useState(0);
    const [_scrollSnaps, setScrollSnaps] = useState<number[]>([]);

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

    const _scrollPrev = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const _scrollNext = useCallback((e: React.MouseEvent) => {
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
        return [safeGender === 'female'
            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"
            : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"];
    }, [media, image, safeGender]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative h-full flex flex-col bg-foreground border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/20 cursor-pointer"
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
                                        alt={safeName}
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
                                    <Badge className="bg-success/90 backdrop-blur-md text-white border-none py-1 px-2.5 rounded-full flex items-center gap-1.5 font-black text-[8px] uppercase tracking-widest shadow-xl">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </Badge>
                                )}
                                {state.type === 'matched' && (
                                    <Badge className="bg-primary backdrop-blur-md text-white border-none py-1 px-2.5 rounded-full flex items-center gap-1.5 font-black text-[8px] uppercase tracking-widest shadow-xl animate-pulse">
                                        <Heart className="w-3 h-3 fill-current" /> Matched
                                    </Badge>
                                )}
                                {state.isSuper && (
                                    <Badge className="bg-accentGold backdrop-blur-md text-primaryDark border-none py-1 px-2.5 rounded-full flex items-center gap-1.5 font-black text-[8px] uppercase tracking-widest shadow-xl">
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
                                        className="absolute right-0 top-11 z-50 w-36 bg-foreground border border-white/10 rounded-2xl shadow-3xl overflow-hidden"
                                    >
                                        <ProfileQRCode
                                            userId={id}
                                            userName={safeName}
                                            profileUrl={`/dashboard/profile/${id}`}
                                        />
                                        <div className="border-t border-white/5">
                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportModal(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-white/5 transition-colors">
                                                <Flag className="w-3.5 h-3.5" /> Report
                                            </button>
                                        </div>
                                        <button onClick={(e) => handleAction(e, () => blockUser(targetId))} className="w-full flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-error hover:bg-error/10 transition-colors border-t border-white/5">
                                            <Ban className="w-3.5 h-3.5" /> Block
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-base font-black tracking-tight flex items-center gap-1.5 drop-shadow-lg">
                            {safeName}{safeAge ? `, ${safeAge}` : ""}
                        </h3>
                        <div className="flex items-center gap-1 text-[9px] text-white/80 font-black uppercase tracking-widest">
                            <MapPin className="w-3 h-3 text-primary opacity-90" />
                            {safeCity}
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-white/[0.03] px-3 py-2.5 rounded-2xl truncate border border-white/5">
                            <Briefcase className="w-3.5 h-3.5 text-primary shrink-0 opacity-80" />
                            {safeOccupation}
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
                                className="flex-1 flex items-center justify-center gap-2 bg-success/10 border border-success/20 text-success rounded-2xl hover:bg-success/20 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>{state.type === 'matched' ? 'Message' : 'Pre-Match Chat 💬'}</span>
                            </Link>
                        ) : state.type === 'received' ? (
                            <div className="flex-1 flex gap-2">
                                <button
                                    onClick={(e) => handleAction(e, () => acceptInterest(targetId, propRelationship?.matchId || 0))}
                                    className="flex-1 bg-success text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-success/90 transition-all active:scale-95"
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
                            </div>
                        ) : state.type === 'rejected' ? (
                            <button
                                onClick={(e) => handleAction(e, () => sendInterest(targetId))}
                                className="flex-1 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all"
                            >
                                Connect Again
                            </button>
                        ) : state.type === 'blocked' ? (
                            <button disabled className="flex-1 bg-error/10 text-error border border-error/20 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
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
                            </div>
                        )}

                        <div className="flex gap-2">
                            {/* Photo Request Button - Visible if privacy allows and not matched */}
                            {state.type !== 'matched' && !isPremium && allowPhotoRequest && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPhotoModal(true);
                                    }}
                                    className="flex-1 h-full px-3 bg-accentGold/10 border border-accentGold/30 text-accentGold font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-accentGold/20 active:scale-95 flex items-center justify-center gap-2"
                                    title="Request Photo Access"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span className="hidden sm:inline">Photo</span>
                                </button>
                            )}

                            {(state.type === 'matched' || isPremium) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowContactModal(true);
                                    }}
                                    className="flex-1 h-full px-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primaryDark active:scale-95 shadow-xl flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Contact
                                </button>
                            )}
                            <Button asChild className="flex-1 h-full px-5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/90 active:scale-95 shadow-xl">
                                <Link href={`/dashboard/profile/${id}`}>View</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stylized Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowReportModal(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-foreground border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-6 shadow-4xl">
                        <h2 className="text-base font-black text-white uppercase tracking-tighter">Report <span className="text-accentGold font-italic">Member</span></h2>
                        <div className="space-y-3">
                            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/50 transition-colors">
                                <option value="" className="bg-foreground">Select Reason</option>
                                <option value="fake" className="bg-foreground">Fake Profile</option>
                                <option value="spam" className="bg-foreground">Spam/Commercial</option>
                                <option value="harassment" className="bg-foreground">Harassment</option>
                                <option value="other" className="bg-foreground">Other</option>
                            </select>
                            <textarea placeholder="Tell us more about the issue..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white min-h-[100px] outline-none focus:border-primary/50 transition-colors" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11" onClick={() => setShowReportModal(false)}>Cancel</Button>
                            <Button variant="premium" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11" onClick={handleReportSubmit} disabled={!reportReason}>Submit Report</Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Contact Request Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowContactModal(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-foreground border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-6 shadow-4xl">
                        <div className="space-y-2">
                            <h2 className="text-base font-black text-white uppercase tracking-tighter">Request <span className="text-primary font-italic">Contact</span></h2>
                            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                <Lock className="w-3.5 h-3.5 text-primary" />
                                Phone, email and WhatsApp stay hidden until approved.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">What would you like to request?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => sendContact.mutate({ profileId: targetId, requestType: 'PHONE' })}
                                        disabled={sendContact.isPending}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                                    >
                                        <Phone className="w-5 h-5 text-primary" />
                                        <span className="text-xs text-white font-black uppercase">Phone</span>
                                    </button>
                                    <button
                                        onClick={() => sendContact.mutate({ profileId: targetId, requestType: 'EMAIL' })}
                                        disabled={sendContact.isPending}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                                    >
                                        <Mail className="w-5 h-5 text-primary" />
                                        <span className="text-xs text-white font-black uppercase">Email</span>
                                    </button>
                                    <button
                                        onClick={() => sendContact.mutate({ profileId: targetId, requestType: 'WHATSAPP' })}
                                        disabled={sendContact.isPending}
                                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                                    >
                                        <MessageCircle className="w-5 h-5 text-primary" />
                                        <span className="text-xs text-white font-black uppercase">WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Message (Optional)</label>
                                <textarea
                                    placeholder="Hi, I'd like to connect with you..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white min-h-[80px] outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11" onClick={() => setShowContactModal(false)}>Cancel</Button>
                                <Button className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11" onClick={() => setShowContactModal(false)}>Close</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Photo Request Modal */}
            {showPhotoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowPhotoModal(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-foreground border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-6 shadow-4xl">
                        <h2 className="text-base font-black text-white uppercase tracking-tighter">Request <span className="text-accentGold font-italic">Photo Access</span></h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Message (Optional)</label>
                                <textarea
                                    placeholder="Hi, I'd like to see your photos..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white min-h-[80px] outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11" onClick={() => setShowPhotoModal(false)}>Cancel</Button>
                            <Button
                                variant="premium"
                                className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-11"
                                onClick={() => {
                                    sendPhoto.mutate({
                                        photoId: 1, // Use first photo ID (backend will handle mapping)
                                        message: "I'd like to see your photos"
                                    });
                                    setShowPhotoModal(false);
                                }}
                                disabled={sendPhoto.isPending}
                            >
                                {sendPhoto.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Camera className="w-4 h-4 mr-2" />
                                )}
                                Send Request
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
