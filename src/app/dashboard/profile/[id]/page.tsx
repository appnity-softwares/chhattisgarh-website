"use client";

import { useProfileDetails } from "@/hooks/use-profile-details";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    ShieldCheck, 
    Heart, 
    MessageSquare, 
    UserPlus, 
    Star, 
    ChevronLeft,
    Share2,
    Calendar,
    Users,
    Info,
    Loader2,
    Lock,
    Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useState } from "react";
import { useInteractions } from "@/hooks/use-interactions";
import premiumWebService from "@/services/premium-web.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useQuery } from "@tanstack/react-query";

export default function ProfileDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: profile, isLoading } = useProfileDetails(id as string);
    const { sendInterest, toggleShortlist } = useInteractions();
    const { accessToken } = useUserAuthStore();
    const [activeTab, setActiveTab] = useState("about");
    const [showHoroscope, setShowHoroscope] = useState(false);

    const { data: horoscope, isFetching: horoscopeLoading } = useQuery({
        queryKey: ["horoscope", id],
        queryFn: async () => {
            if (!accessToken || !id) return null;
            const res = await premiumWebService.matchHoroscope(parseInt(id as string), accessToken);
            return res.data;
        },
        enabled: showHoroscope && !!accessToken && !!id,
    });

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-black tracking-widest uppercase italic animate-pulse">Loading Profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
                <h1 className="text-4xl font-black uppercase text-foreground">Profile Not Found</h1>
                <Button onClick={() => router.back()} className="rounded-full px-8">GO BACK</Button>
            </div>
        );
    }

    const mainImage = profile.media.find(m => m.isProfile)?.url || profile.media[0]?.url || (profile.gender === 'FEMALE' ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80");

    const targetUserId = parseInt(profile.userId.toString());

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-12">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between px-2">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full px-4 font-black uppercase tracking-widest text-xs gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Matches
                </Button>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full hover:bg-white/10"
                        onClick={() => toggleShortlist.mutate(targetUserId)}
                    >
                        <Heart className={`w-4 h-4 ${toggleShortlist.isPending ? 'animate-pulse' : 'text-primary'}`} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Visuals & Actions */}
                <div className="lg:col-span-5 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 group"
                    >
                        <Image 
                            src={mainImage}
                            alt={profile.firstName}
                            fill
                            priority
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        <div className="absolute bottom-8 left-8 right-8 text-white space-y-4">
                            <div className="flex items-center gap-3">
                                {profile.isVerified && (
                                    <Badge className="bg-green-500 text-white font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                                        Verified Member
                                    </Badge>
                                )}
                                <Badge className="bg-primary/80 backdrop-blur-md text-white font-black px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                                    {profile.profileCompleteness}% Complete
                                </Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
                                {profile.firstName} <br />
                                <span className="text-primary italic">{profile.lastName}</span>, {profile.age}
                            </h1>
                            <div className="flex items-center gap-2 text-white/80 font-medium">
                                <MapPin className="w-4 h-4 text-primary" />
                                {profile.city}, {profile.state}
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Hub */}
                    <div className="flex gap-4 p-2 bg-card/20 backdrop-blur-xl rounded-[2.5rem] border border-white/5">
                        <Button 
                            onClick={() => sendInterest.mutate(targetUserId)}
                            disabled={sendInterest.isPending}
                            className="flex-1 h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-primary/20 group"
                        >
                            {sendInterest.isPending ? <Loader2 className="animate-spin" /> : 'SEND INTEREST'}
                            <Heart className={`w-6 h-6 ml-2 transition-all ${sendInterest.isSuccess ? 'fill-white' : 'group-hover:fill-white'}`} />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-16 w-16 bg-white/5 border-white/10 hover:bg-white/10 text-primary rounded-[2rem]"
                            onClick={() => router.push(`/dashboard/chat/${profile.userId}`)}
                        >
                            <MessageSquare className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Right Column: Information Tabs & Details */}
                <div className="lg:col-span-7 space-y-10">
                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-8 border-b border-white/5 overflow-x-auto no-scrollbar">
                        {['about', 'personal', 'family', 'lifestyle'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            {activeTab === 'about' && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                                            <Info className="w-6 h-6 text-primary" />
                                            Biographical <span className="text-primary italic">Note</span>
                                        </h3>
                                        <p className="text-lg text-muted-foreground leading-relaxed font-light italic">
                                            "{profile.bio || `I am a ${profile.occupation} from ${profile.city}, looking for a compatible partner to share life's beautiful journey with.`}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <HighlightCard icon={Briefcase} label="Professional" value={profile.occupation} />
                                        <HighlightCard icon={GraduationCap} label="Academic" value={profile.education} />
                                        <HighlightCard icon={Calendar} label="Marital Status" value={profile.maritalStatus} />
                                        <HighlightCard icon={Users} label="Religion / Caste" value={`${profile.religion}, ${profile.caste}`} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <DetailItem label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
                                    <DetailItem label="Age" value={`${profile.age} Years`} />
                                    <DetailItem label="Date of Birth" value="12 Aug 1997 (Locked)" isLocked />
                                    <DetailItem label="Height" value={profile.height || "5'6\""} />
                                    <DetailItem label="Weight" value={profile.weight || "62 kg"} />
                                    <DetailItem label="Mother Tongue" value={profile.motherTongue} />
                                    <DetailItem label="Location" value={`${profile.city}, ${profile.state}`} />
                                </div>
                            )}

                            {activeTab === 'family' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <DetailItem label="Family Status" value={profile.familyStatus || "Middle Class"} />
                                    <DetailItem label="Family Type" value={profile.familyType || "Nuclear"} />
                                    <DetailItem label="Family Values" value={profile.familyValues || "Traditional"} />
                                    <DetailItem label="Fathers Profession" value="Business Owner" isLocked />
                                    <DetailItem label="Mothers Profession" value="Homemaker" isLocked />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Horoscope Widget */}
                    <Card className="bg-card/40 backdrop-blur-3xl border-white/5 rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                        <Star className="w-6 h-6 text-amber-500 fill-amber-500/30" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Horoscope <span className="text-amber-500">Matching</span></h4>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Calculate Gun Milan (Ashtakoot)</p>
                                    </div>
                                </div>
                                {!horoscope && (
                                    <Button 
                                        onClick={() => setShowHoroscope(true)}
                                        disabled={horoscopeLoading}
                                        className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20"
                                    >
                                        {horoscopeLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Star className="w-3 h-3 mr-2" />}
                                        CHECK NOW
                                    </Button>
                                )}
                            </div>

                            {horoscope && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-6"
                                >
                                    <div className="flex items-center justify-center gap-10">
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-amber-500">{horoscope.score || 0}<span className="text-sm text-muted-foreground">/36</span></p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total Points</p>
                                        </div>
                                        <div className="h-10 w-px bg-amber-500/20" />
                                        <div className="text-left">
                                            <p className="text-lg font-black text-foreground uppercase tracking-tight">{horoscope.conclusion || 'Good Match'}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium leading-tight">Highly compatible based on Vedic astrology charts.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(horoscope.details || { "Varna": "1/1", "Vashya": "2/2", "Tara": "3/3", "Yoni": "4/4" }).map(([key, val]: any) => (
                                            <div key={key} className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-xl">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{key}</span>
                                                <span className="text-[10px] font-black text-amber-500">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Premium Paywall Upsell (Demo) */}
                    {!profile.isVerified && (
                        <Card className="border-none bg-gradient-to-r from-rose-600 to-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform">
                                <Crown className="w-16 h-16" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-xl font-black uppercase italic">Unlock Direct Contact 📞</h4>
                                <p className="text-sm font-medium text-white/80 max-w-sm leading-relaxed">Upgrade to Premium to view mobile numbers, emails, and address of profiles you like.</p>
                                <Button className="bg-white text-primary hover:bg-white/90 font-black rounded-xl px-10 h-12 uppercase tracking-widest text-xs">
                                    UPGRADE NOW
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function HighlightCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-6 bg-card/40 backdrop-blur-md rounded-[2rem] border border-white/5 flex gap-4 items-center">
            <div className="bg-primary/10 p-4 rounded-2xl">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

function DetailItem({ label, value, isLocked = false }: { label: string, value: string, isLocked?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${isLocked ? 'blur-sm text-muted-foreground' : 'text-foreground'}`}>{value}</p>
                {isLocked && <Lock className="w-3 h-3 text-primary opacity-50" />}
            </div>
        </div>
    );
}
