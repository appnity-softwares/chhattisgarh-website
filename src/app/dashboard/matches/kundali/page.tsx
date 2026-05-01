"use client";

import { motion } from "framer-motion";
import { 
    Zap, 
    Flame, 
    CheckCircle2, 
    ArrowLeft,
    Info,
    Compass,
    Stars,
    Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAstrologyMatch, useAstrologyMetadata } from "@/hooks/use-astrology";

const _GUNA_DATA = [
    { name: "Varna", score: 1, max: 1, desc: "Work Compatibility" },
    { name: "Vashya", score: 2, max: 2, desc: "Dominance Compatibility" },
    { name: "Tara", score: 1.5, max: 3, desc: "Destiny Compatibility" },
    { name: "Yoni", score: 4, max: 4, desc: "Nature Compatibility" },
    { name: "Graha", score: 3, max: 5, desc: "Mental Compatibility" },
    { name: "Gana", score: 6, max: 6, desc: "Temperament" },
    { name: "Bhakoot", score: 0, max: 7, desc: "Love Compatibility" },
    { name: "Nadi", score: 8, max: 8, desc: "Health & Genes" },
];

export default function KundaliReportPage() {
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get("userId");
    const { data: kundaliMatch, isLoading } = useAstrologyMatch(targetUserId || '');
    const { nakshatras: _nakshatras, rashis: _rashis } = useAstrologyMetadata();
    
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-pulse">
                <div className="h-64 bg-background rounded-[3rem]" />
                <div className="grid grid-cols-2 gap-8">
                    <div className="h-64 bg-background rounded-[2.5rem]" />
                    <div className="h-64 bg-background rounded-[2.5rem]" />
                </div>
                <div className="h-96 bg-background rounded-[2.5rem]" />
            </div>
        );
    }

    const gunaData = kundaliMatch?.breakdown || [
        { name: "Varna", score: 0, maxScore: 1, desc: "Work Compatibility" },
        { name: "Vashya", score: 0, maxScore: 2, desc: "Dominance Compatibility" },
        { name: "Tara", score: 0, maxScore: 3, desc: "Destiny Compatibility" },
        { name: "Yoni", score: 0, maxScore: 4, desc: "Nature Compatibility" },
        { name: "Graha", score: 0, maxScore: 5, desc: "Mental Compatibility" },
        { name: "Gana", score: 0, maxScore: 6, desc: "Temperament" },
        { name: "Bhakoot", score: 0, maxScore: 7, desc: "Love Compatibility" },
        { name: "Nadi", score: 0, maxScore: 8, desc: "Health & Genes" },
    ];
    const score = kundaliMatch?.score || 0;
    const isManglikCompatible = kundaliMatch?.manglikStatus?.compatible !== false;
    const recommendation = kundaliMatch?.recommendation || "Matching scores not available";

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-primary rounded-[3rem] p-10 md:p-16 border border-border shadow-3xl">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Compass className="w-64 h-64 text-foreground rotate-12" />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <Link href="/dashboard/matches" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back to Match</span>
                    </Link>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground uppercase leading-none">Kundali <span className="text-primary font-medium">Matching</span></h1>
                        <p className="text-primary-foreground/80 font-medium text-lg">Detailed Horoscope Compatibility Report for <span className="text-foreground font-bold font-medium">Sneha Patel</span></p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge className="bg-background text-foreground border-border py-2 px-4 rounded-xl flex items-center gap-2">
                            <Stars className="w-4 h-4 text-primary" />
                            Guna Milan 32pt System
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Score & Recommendation */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-surface backdrop-blur-3xl border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-foreground/5"
                                />
                                <motion.circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 88}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - score / 36) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="text-primary"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold text-foreground">{score}</span>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">/ 36 Gunas</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold uppercase tracking-tight text-primary font-medium">Match Result</h3>
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-xs uppercase tracking-widest">{recommendation}</p>
                        </div>
                    </Card>

                    <Card className="bg-surface backdrop-blur-3xl border-border rounded-[2.5rem] p-10 space-y-8 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center">
                                <Flame className="w-6 h-6 text-primaryDark" />
                            </div>
                            <h3 className="font-bold text-lg uppercase tracking-widest">Manglik Dosha</h3>
                        </div>
                        <div className="flex items-center gap-6 p-6 bg-background rounded-3xl border border-border">
                            {isManglikCompatible ? (
                                <>
                                    <CheckCircle2 className="w-10 h-10 text-success" />
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-success">Profiles are Compatible</h4>
                                        <p className="text-xs text-muted-foreground font-medium">{kundaliMatch?.manglikStatus?.message || 'Both profiles are compatible, ensuring a smooth path together.'}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-gold/20 rounded-2xl flex items-center justify-center">
                                        <Flame className="w-6 h-6 text-primaryDark" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primaryDark">Manglik Dosha Present</h4>
                                        <p className="text-xs text-muted-foreground font-medium">{kundaliMatch?.manglikStatus?.message || 'One or both profiles have Manglik dosha - astrological remedies recommended.'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-start gap-3 px-2">
                            <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-widest">This analysis is based on provided Birth Date, Time & Location. For detailed corrections, consult our verified astrologers.</p>
                        </div>
                    </Card>
                </div>

                {/* Detailed Breakdown */}
                <div className="lg:col-span-12">
                    <Card className="bg-surface backdrop-blur-xl border-border rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-border">
                            <h3 className="font-bold text-lg uppercase tracking-widest flex items-center gap-3">
                                <Moon className="w-5 h-5 text-primary" />
                                Ashtakoot Breakdown
                            </h3>
                        </div>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {gunaData.map((guna: unknown, i: number) => (
                                    <div key={i} className={`p-8 flex items-center justify-between group hover:bg-background transition-colors border-border ${i % 2 === 0 ? 'md:border-r' : ''} ${i < gunaData.length - 2 ? 'border-b' : ''}`}>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{guna.name}</h4>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{guna.desc}</p>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <span className="text-sm font-bold text-foreground">{guna.score} <span className="text-[10px] text-muted-foreground">/ {guna.maxScore}</span></span>
                                            <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${guna.score === guna.maxScore ? 'bg-success/10 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gold/20'}`} 
                                                    style={{ width: `${(guna.score / guna.maxScore) * 100}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Premium Action */}
                <div className="lg:col-span-12">
                    <div className="bg-primary rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-background rounded-[1.5rem] flex items-center justify-center backdrop-blur-md">
                                <Zap className="w-8 h-8 text-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl uppercase tracking-widest">Get Detailed Analysis</h4>
                                <p className="text-sm font-medium opacity-80 max-w-md">Talk to our verified astrologers for a one-on-one session about this match.</p>
                            </div>
                        </div>
                        <Button className="h-14 px-10 bg-white text-primary hover:bg-background font-bold text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl relative z-10 transition-transform active:scale-95">
                            CONSULT ASTROLOGER
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
