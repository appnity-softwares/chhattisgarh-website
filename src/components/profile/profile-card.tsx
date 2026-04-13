"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, GraduationCap, ShieldCheck, Heart, MoreVertical, Ban, Flag, Loader2 } from "lucide-react";
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
}

export function ProfileCard({ name, age, city, occupation, education, image, isVerified, gender, priority, id, isShortlisted }: ProfileCardProps) {
    const { toggleShortlist, blockUser, reportUser } = useInteractions();
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
        if (window.confirm(`Block ${name}? They won't be able to see your profile or message you.`)) {
            blockUser.mutate(targetId);
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
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden border-white/5 bg-card/40 backdrop-blur-md rounded-[2rem] group h-full shadow-xl hover:shadow-primary/5 transition-all">
                <div className="relative h-72 w-full overflow-hidden">
                    <Image
                        src={image || (gender === 'female' ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" : gender === 'male' ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80")}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={priority}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        {isVerified && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                            </Badge>
                        )}
                        
                        {/* More Actions Dropdown */}
                        <div ref={menuRef} className="relative">
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <MoreVertical className="w-4 h-4 text-white" />
                            </button>
                            
                            {showMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute right-0 top-12 z-50 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                                >
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportModal(true); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-400 hover:bg-white/5 transition-colors"
                                    >
                                        <Flag className="w-4 h-4" />
                                        Report Profile
                                    </button>
                                    <button
                                        onClick={handleBlock}
                                        disabled={blockUser.isPending}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-white/5 transition-colors border-t border-white/5"
                                    >
                                        {blockUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                                        Block User
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">{name}, {age}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium mt-1">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    {city}
                                </div>
                            </div>
                             <div 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleShortlist.mutate({ targetUserId: targetId, isCurrentlyShortlisted: !!isShortlisted }); }}
                                className={`bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 transition-all cursor-pointer ${isShortlisted ? 'bg-primary/20 border-primary/40' : 'hover:bg-primary/10'}`}
                            >
                                <Heart className={`w-5 h-5 ${isShortlisted ? 'text-primary fill-primary' : 'text-primary'} ${toggleShortlist.isPending ? 'animate-pulse' : ''} transition-all`} />
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="truncate">{occupation}</span>
                        </div>
                        {education && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span className="truncate">{education}</span>
                            </div>
                        )}
                    </div>

                    <Button asChild variant="outline" className="w-full border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-bold rounded-xl transition-all group/btn">
                        <Link href={`/dashboard/profile/${id}`}>
                            View Details
                            <motion.span
                                initial={{ x: 0 }}
                                whileHover={{ x: 4 }}
                                className="ml-2 inline-block"
                            >
                                →
                            </motion.span>
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-8 w-full max-w-md space-y-6 shadow-2xl"
                    >
                        <div className="space-y-2">
                            <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Report <span className="text-primary">{name}</span></h3>
                            <p className="text-xs text-muted-foreground font-medium">Help us keep the community safe. Select a reason below.</p>
                        </div>
                        
                        <div className="space-y-2">
                            {['FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SCAM', 'SPAM', 'IMPERSONATION', 'OTHER'].map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => setReportReason(reason)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border ${reportReason === reason ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/5 text-foreground hover:bg-white/10'}`}
                                >
                                    {reason.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Additional details (optional)..."
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowReportModal(false)} className="flex-1 h-12 rounded-xl border-white/10 font-black text-xs uppercase tracking-widest">
                                CANCEL
                            </Button>
                            <Button 
                                onClick={handleReportSubmit}
                                disabled={!reportReason || reportUser.isPending}
                                className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest disabled:opacity-30"
                            >
                                {reportUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SUBMIT REPORT'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
