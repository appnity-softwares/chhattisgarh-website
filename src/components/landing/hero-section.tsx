"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Heart, User, ShieldCheck } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export function HeroSection() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Immersive Background Decor */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] mix-blend-screen opacity-50" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[160px] mix-blend-screen opacity-30" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-20 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Content: The Message */}
                    <div className="flex flex-col text-left space-y-8 max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em]"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Chhattisgarh's #1 Trusted Matrimony
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] text-foreground"
                        >
                            Find Your <br />
                            <span className="gradient-text italic">Soulmate</span> <br />
                            Today.
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg"
                        >
                            Connect with verified profiles from your community in Chhattisgarh. Your journey to a beautiful forever starts right here.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-wrap gap-4 pt-4"
                        >
                            <div className="flex -space-x-3 overflow-hidden">
                                {[1,2,3,4].map((i) => (
                                    <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-background bg-muted border border-border" />
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">10,000+ Success Stories</span>
                                <span className="text-xs text-muted-foreground">Joined by users across Raipur, Bilaspur & more</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content: The Quick Search Action */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Decorative floating elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-2xl blur-2xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" />

                        <Card className="glass-card shadow-3xl border-white/10 p-8 md:p-10 rounded-[2.5rem] relative z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Heart className="w-24 h-24 text-primary fill-current" />
                            </div>
                            
                            <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-3">
                                <Search className="w-6 h-6 text-primary" />
                                Begin Your Search
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Looking For</label>
                                    <Select defaultValue="female">
                                        <SelectTrigger className="bg-background/50 border-white/10 h-12 rounded-xl">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="female">A Bride (Woman)</SelectItem>
                                            <SelectItem value="male">A Groom (Man)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Age Min</label>
                                        <Select defaultValue="18">
                                            <SelectTrigger className="bg-background/50 border-white/10 h-12 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 53 }, (_, i) => i + 18).map(age => (
                                                    <SelectItem key={age} value={age.toString()}>{age} Years</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Age Max</label>
                                        <Select defaultValue="30">
                                            <SelectTrigger className="bg-background/50 border-white/10 h-12 rounded-xl">
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

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Community</label>
                                    <Select defaultValue="any">
                                        <SelectTrigger className="bg-background/50 border-white/10 h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Open to All Communities</SelectItem>
                                            <SelectItem value="hindu">Hindu</SelectItem>
                                            <SelectItem value="muslim">Muslim</SelectItem>
                                            <SelectItem value="christian">Christian</SelectItem>
                                            <SelectItem value="sikh">Sikh</SelectItem>
                                            <SelectItem value="jain">Jain</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group">
                                    <Search className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                    SEARCH MATCHES
                                </Button>
                                
                                <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
                                    Over 5,000+ active profiles daily
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
