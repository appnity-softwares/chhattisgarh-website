"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Heart, ShieldCheck } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useUserAuthStore } from "@/stores/user-auth-store";
import Link from "next/link";
import { Sparkles, LayoutDashboard } from "lucide-react";

export function HeroSection() {
    const user = useUserAuthStore((state) => state.user);
    return (
        <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-background pt-16">
            {/* Elegant Background Patterns */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(139,30,63,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(212,175,55,0.03)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-12 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Left Content: The Message */}
                    <div className="flex flex-col text-left space-y-10 max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex w-fit items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-primary"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Chhattisgarh&apos;s #1 Trusted Matrimony
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] text-foreground"
                            >
                                Find Your <br />
                                <span className="text-primary font-medium italic">Soulmate</span> <br />
                                Today.
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-lg md:text-xl leading-relaxed text-muted-foreground max-w-lg font-medium opacity-80"
                            >
                                Discover verified profiles across Chhattisgarh. Begin your journey toward a meaningful union with trust and tradition.
                            </motion.p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex flex-wrap gap-6 items-center"
                        >
                            {user ? (
                                <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white font-bold text-base h-16 px-12 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:-translate-y-1">
                                    <Link href="/dashboard" className="flex items-center gap-3">
                                        <LayoutDashboard className="w-5 h-5" />
                                        EXPLORE PROFILES
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white font-bold text-base h-16 px-12 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:-translate-y-1 group">
                                    <Link href="/register" className="flex items-center gap-3">
                                        JOIN NOW
                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    </Link>
                                </Button>
                            )}

                            <div className="flex items-center gap-5">
                                <div className="flex -space-x-3">
                                    {[1,2,3,4].map((i) => (
                                        <div key={i} className="h-12 w-12 rounded-full border-4 border-background bg-muted shadow-sm" />
                                    ))}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-sm font-bold text-foreground">10k+ Couples Matched</span>
                                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-70">Success Stories</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content: The Quick Search Action */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Sharper Decorative Elements */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold/10 rounded-3xl border border-gold/20" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full border border-primary/10" />

                        <Card className="relative z-10 overflow-hidden rounded-[2.5rem] border-border bg-surface p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-t border-l border-white/50">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <Heart className="w-32 h-32 text-primary fill-current" />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                                    <Search className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Begin Search</h2>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Find your ideal match</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Looking For</label>
                                        <Select defaultValue="female">
                                            <SelectTrigger className="bg-background border-border h-14 rounded-2xl focus:ring-primary/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="female">A Bride (Woman)</SelectItem>
                                                <SelectItem value="male">A Groom (Man)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Community</label>
                                        <Select defaultValue="any">
                                            <SelectTrigger className="bg-background border-border h-14 rounded-2xl focus:ring-primary/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">Open to All</SelectItem>
                                                <SelectItem value="hindu">Hindu</SelectItem>
                                                <SelectItem value="muslim">Muslim</SelectItem>
                                                <SelectItem value="christian">Christian</SelectItem>
                                                <SelectItem value="sikh">Sikh</SelectItem>
                                                <SelectItem value="jain">Jain</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Age Min</label>
                                        <Select defaultValue="18">
                                            <SelectTrigger className="bg-background border-border h-14 rounded-2xl focus:ring-primary/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 53 }, (_, i) => i + 18).map(age => (
                                                    <SelectItem key={age} value={age.toString()}>{age} Years</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Age Max</label>
                                        <Select defaultValue="30">
                                            <SelectTrigger className="bg-background border-border h-14 rounded-2xl focus:ring-primary/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 53 }, (_, i) => i + 18).map(age => (
                                                    <SelectItem key={age} value={age.toString()}>{age} Years</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button className="w-full h-16 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] active:scale-95 group">
                                    <Search className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                                    SEARCH MATCHES
                                </Button>
                                
                                <div className="flex items-center justify-center gap-4 py-2 border-t border-border/50">
                                    <div className="flex -space-x-1">
                                        {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-success animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                                        5,240 active members online
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
