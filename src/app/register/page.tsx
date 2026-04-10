"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Heart, 
    Smartphone, 
    ArrowRight, 
    User,
    Calendar,
    ChevronRight,
    Sparkles,
    RotateCcw,
    ChevronLeft,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // Timer Logic for OTP Step
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 3 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-background overflow-hidden">
            {/* Immersive Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px] opacity-40 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[140px] opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[500px] relative z-10"
            >
                <div className="flex flex-col items-center mb-10 space-y-3">
                    <Logo className="scale-125 mb-4" />
                    <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
                        {step === 3 ? "Verify" : "Join"} <span className="text-primary italic">CG Shaadi</span>
                    </h2>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] text-center">
                        {step === 3 ? `Code sent to +91 ${phone}` : "Find your life partner in Chhattisgarh"}
                    </p>
                </div>

                <Card className="glass-card rounded-[2.5rem] border-white/10 shadow-3xl overflow-hidden relative">
                    <div className="p-8 md:p-12">
                        
                        {/* Progress Stepper */}
                        {step < 3 && (
                            <div className="flex items-center justify-center gap-3 mb-10">
                                {[1, 2].map((s) => (
                                    <div 
                                        key={s} 
                                        className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-16 bg-primary shadow-[0_0_10px_rgba(224,30,90,0.5)]' : 'w-4 bg-white/10'}`} 
                                    />
                                ))}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Creating account for</Label>
                                        <Select defaultValue="self">
                                            <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-black text-sm uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 text-white">
                                                <SelectItem value="self">Self</SelectItem>
                                                <SelectItem value="son">Son</SelectItem>
                                                <SelectItem value="daughter">Daughter</SelectItem>
                                                <SelectItem value="brother">Brother</SelectItem>
                                                <SelectItem value="sister">Sister</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Gender</Label>
                                            <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 h-16">
                                                <Button variant="ghost" className="flex-1 bg-primary text-white h-full rounded-xl text-[10px] font-black tracking-widest uppercase">MALE</Button>
                                                <Button variant="ghost" className="flex-1 hover:bg-white/5 h-full rounded-xl text-[10px] font-black tracking-widest text-muted-foreground uppercase">FEMALE</Button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Date of Birth</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                <Input 
                                                    type="date"
                                                    className="pl-12 h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => setStep(2)}
                                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] mt-4"
                                    >
                                        CONTINUE
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                            <Input 
                                                placeholder="Enter full name" 
                                                className="pl-14 h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-black"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Mobile Number</Label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3 pointer-events-none">
                                                <Smartphone className="w-5 h-5 text-primary" />
                                                <span className="font-black text-sm text-foreground">+91</span>
                                            </div>
                                            <Input 
                                                placeholder="0000 0000 00" 
                                                maxLength={10}
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                                className="pl-24 h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-black text-lg tracking-[0.2em]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="h-16 w-24 border-white/10 hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Back
                                        </Button>
                                        <Button 
                                            onClick={() => setStep(3)}
                                            disabled={phone.length < 10}
                                            className="flex-1 h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] group"
                                        >
                                            CREATE PROFILE
                                            <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div 
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center space-y-8 text-center"
                                >
                                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center animate-bounce shadow-inner border border-primary/20">
                                        <Heart className="w-12 h-12 text-primary fill-primary" />
                                    </div>
                                    
                                    <div className="space-y-6 w-full">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Verify OTP</Label>
                                            <Input 
                                                autoFocus
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                className="h-20 text-center text-4xl font-black tracking-[0.4em] bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 text-primary"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <button 
                                                onClick={() => setStep(2)}
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                                                Edit Phone
                                            </button>

                                            <button 
                                                disabled={!canResend}
                                                onClick={() => {
                                                    setTimer(30);
                                                    setCanResend(false);
                                                }}
                                                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${canResend ? 'text-primary hover:text-primary/80' : 'text-muted-foreground opacity-50 cursor-not-allowed'}`}
                                            >
                                                <RotateCcw className={`w-3 h-3 ${!canResend && 'animate-spin-slow'}`} />
                                                {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                                            </button>
                                        </div>
                                    </div>

                                    <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
                                        VERIFY & REGISTER
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="text-center pt-8 border-t border-white/5 mt-8">
                            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                Already have an account? <span className="text-primary italic">Sign In</span>
                            </Link>
                        </div>
                    </div>
                </Card>

                {/* Secure Trust Badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Verified by Firebase Phone Identity
                </div>
            </motion.div>
        </div>
    );
}
