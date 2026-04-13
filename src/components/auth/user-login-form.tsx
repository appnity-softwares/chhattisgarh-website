"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Heart, 
    Smartphone, 
    ArrowRight, 
    ShieldCheck,
    ChevronLeft,
    RotateCcw,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import userAuthService from "@/services/user-auth.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useRouter } from "next/navigation";

export function UserLoginForm() {
    const { toast } = useToast();
    const router = useRouter();
    const login = useUserAuthStore((state) => state.login);

    interface CustomWindow extends Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
    const win = (typeof window !== "undefined" ? window : {}) as CustomWindow;
    
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const [otpSent, setOtpSent] = useState(false);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Setup Recaptcha
    const setupRecaptcha = () => {
        if (!win.recaptchaVerifier) {
            win.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {}
            });
        }
    };
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length !== 10) {
            toast({
                variant: "destructive",
                title: "Invalid Phone Number",
                description: "Please enter a valid 10-digit mobile number.",
            });
            return;
        }

        setIsLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = win.recaptchaVerifier;
            if (!appVerifier) throw new Error("Recaptcha not initialized");
            const fullPhone = `+91${phone}`;
            
            const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
            setConfirmationResult(result);
            setOtpSent(true);
            setTimer(30);
            setCanResend(false);
            toast({
                title: "OTP Sent!",
                description: `Verification code sent to +91 ${phone}`,
            });
        } catch (error: unknown) {
            const err = error as Error;
            console.error("OTP Error:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to send OTP. Please try again.",
            });
            if (win.recaptchaVerifier) {
                win.recaptchaVerifier.clear();
                delete win.recaptchaVerifier;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6 || !confirmationResult) {
            toast({
                variant: "destructive",
                title: "Invalid OTP",
                description: "Please enter the 6-digit code sent to your phone.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await confirmationResult.confirm(otp);
            const idToken = await userCredential.user.getIdToken();
            
            // Send idToken to our backend
            const authData = await userAuthService.authenticateWithPhone(idToken);
            
            // Store in state
            login(authData.user, authData.accessToken, authData.refreshToken);
            
            toast({
                title: "Login Successful",
                description: "Welcome back to Chhattisgarh Shaadi!",
            });

            // Redirect based on profile status
            if (authData.isNewUser || !authData.user.profile) {
                router.push("/dashboard/profile");
            } else {
                router.push("/dashboard");
            }
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Verification Error:", err);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid OTP or authentication error. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-background overflow-hidden">
            {/* Immersive Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px] opacity-40 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[140px] opacity-30" />
                
                {/* Floating Hearts */}
                {isMounted && [...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                            opacity: [0.1, 0.3, 0.1], 
                            scale: [1, 1.2, 1],
                            y: [0, -50, 0],
                        }}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: i * 2 }}
                        className="absolute hidden md:block text-primary/20 fill-current"
                        style={{ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }}
                    >
                        <Heart className="w-8 h-8" />
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[450px] relative z-10"
            >
                {/* Header */}
                <div className="flex flex-col items-center mb-10 space-y-3">
                    <Logo className="scale-125 mb-4" />
                    <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
                        {otpSent ? "Verify" : "Login"} <span className="text-primary italic">Securely</span>
                    </h2>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                        {otpSent ? `Code sent to +91 ${phone}` : "Enter your mobile number to continue"}
                    </p>
                </div>

                <Card className="glass-card rounded-[2.5rem] border-white/10 shadow-3xl overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Loader2 className="w-10 h-10 text-primary" />
                            </motion.div>
                        </div>
                    )}

                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">
                            {!otpSent ? (
                                <motion.form 
                                    key="phone-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSendOTP}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Phone Number</Label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3 pointer-events-none">
                                                <Smartphone className="w-5 h-5 text-primary" />
                                                <span className="font-black text-sm text-foreground">+91</span>
                                            </div>
                                            <Input 
                                                type="tel"
                                                placeholder="0000 0000 00" 
                                                maxLength={10}
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                                className="pl-24 h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-black text-lg tracking-[0.2em] transition-all group-hover:border-primary/40 focus:bg-white/10"
                                            />
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit"
                                        disabled={phone.length < 10}
                                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all group"
                                    >
                                        SEND OTP
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    <div className="flex flex-col items-center space-y-4 pt-4">
                                        <Link href="/register" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                            New here? <span className="text-primary italic">Create Account</span>
                                        </Link>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.form 
                                    key="otp-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerifyOTP}
                                    className="space-y-8"
                                >
                                    <div className="space-y-6 text-center">
                                        <div className="flex justify-center gap-3">
                                            <Input 
                                                autoFocus
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                                className="w-full h-20 text-center text-4xl font-black tracking-[0.4em] bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 text-primary"
                                            />
                                        </div>
                                        
                                        <div className="flex items-center justify-between px-2">
                                            <button 
                                                type="button"
                                                onClick={() => setOtpSent(false)}
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                                                Edit Phone
                                            </button>

                                            <button 
                                                type="button"
                                                disabled={!canResend}
                                                onClick={() => {
                                                    setTimer(30);
                                                    setCanResend(false);
                                                    // handleSendOTP logic here
                                                }}
                                                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${canResend ? 'text-primary hover:text-primary/80' : 'text-muted-foreground opacity-50 cursor-not-allowed'}`}
                                            >
                                                <RotateCcw className={`w-3 h-3 ${!canResend && 'animate-spin-slow'}`} />
                                                {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                                            </button>
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit"
                                        disabled={otp.length < 6}
                                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                    >
                                        VERIFY & LOGIN
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    <div id="recaptcha-container"></div>
                    {/* Trust Footer */}
                    <div className="bg-white/5 p-6 border-t border-white/5 flex items-center justify-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Firebase Secured Auth</span>
                    </div>
                </Card>

                {/* Decorative Bottom Link */}
                <div className="mt-10 flex justify-center gap-6">
                    <Link href="/faq" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Help</Link>
                    <div className="w-1 h-1 bg-white/10 rounded-full my-auto" />
                    <Link href="/terms" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                    <div className="w-1 h-1 bg-white/10 rounded-full my-auto" />
                    <Link href="/privacy" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                </div>
            </motion.div>
        </div>
    );
}
