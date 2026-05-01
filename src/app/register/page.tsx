"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Heart, 
    Smartphone, 
    User,
    Calendar,
    ChevronRight,
    Sparkles,
    RotateCcw,
    ChevronLeft,
    CheckCircle2,
    Loader2
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
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import userAuthService from "@/services/user-auth.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import apiConfig, { getAuthHeaders } from "@/lib/api.config";

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

export default function RegisterPage() {
    const { toast } = useToast();
    const router = useRouter();
    const loginStore = useUserAuthStore((state) => state.login);
    
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Step 1 - Basic Info
    const [creatingFor, setCreatingFor] = useState("self");
    const [gender, setGender] = useState<'MALE' | 'FEMALE'>("MALE");
    const [dateOfBirth, setDateOfBirth] = useState("");
    
    // Step 2 - Name + Phone
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    
    // Step 3 - OTP
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

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

    // Setup Recaptcha
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {}
            });
        }
    };

    const handleStep1Continue = () => {
        if (!dateOfBirth) {
            toast({
                variant: "destructive",
                title: "Missing Info",
                description: "Please select your date of birth.",
            });
            return;
        }
        setStep(2);
    };

    const handleSendOTP = async () => {
        if (!firstName.trim()) {
            toast({ variant: "destructive", title: "Missing Name", description: "Please enter your first name." });
            return;
        }
        if (phone.length < 10) {
            toast({ variant: "destructive", title: "Invalid Phone", description: "Please enter a valid 10-digit number." });
            return;
        }

        setIsLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            if (!appVerifier) throw new Error("Recaptcha not initialized");
            const fullPhone = `+91${phone}`;
            
            const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
            setConfirmationResult(result);
            setStep(3);
            setTimer(30);
            setCanResend(false);
            toast({
                title: "OTP Sent!",
                description: `Verification code sent to +91 ${phone}`,
            });
        } catch (error: unknown) {
            console.error("OTP Error:", error);
            const err = error as { message?: string };
            toast({
                variant: "destructive",
                title: "Error",
                description: err.message || "Failed to send OTP. Please try again.",
            });
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                delete window.recaptchaVerifier;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async () => {
        if (otp.length !== 6 || !confirmationResult) {
            toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter the 6-digit code." });
            return;
        }

        setIsLoading(true);
        try {
            // 1. Verify OTP with Firebase
            const userCredential = await confirmationResult.confirm(otp);
            const idToken = await userCredential.user.getIdToken();
            
            // 2. Authenticate with backend (this creates user if new)
            const authData = await userAuthService.authenticateWithPhone(idToken);
            
            // 3. Store tokens
            loginStore(authData.user, authData.accessToken, authData.refreshToken);
            
            // 4. Create profile if new user
            if (authData.isNewUser || !authData.user.profile) {
                try {
                    const profileRes = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.profiles.create}`, {
                        method: 'POST',
                        headers: getAuthHeaders(authData.accessToken),
                        body: JSON.stringify({
                            firstName: firstName.trim(),
                            lastName: lastName.trim(),
                            gender,
                            dateOfBirth,
                            createdFor: creatingFor,
                        }),
                    });
                    const profileData = await profileRes.json();
                    if (!profileRes.ok) {
                        console.warn("Profile creation response:", profileData);
                    }
                } catch (profileError) {
                    console.warn("Profile creation error (continuing anyway):", profileError);
                }
            }
            
            toast({
                title: "Welcome to CG Shaadi! 🎉",
                description: "Your account has been created successfully.",
            });

            // 5. Redirect to profile page to complete setup
            router.push("/dashboard/profile");
            
        } catch (error: unknown) {
            console.error("Registration Error:", error);
            const err = error as { message?: string };
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: err.message || "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setTimer(30);
        setCanResend(false);
        setIsLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            if (!appVerifier) throw new Error("Recaptcha not initialized");
            const fullPhone = `+91${phone}`;
            const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
            setConfirmationResult(result);
            toast({ title: "OTP Resent!", description: `New code sent to +91 ${phone}` });
        } catch (error: unknown) {
            const err = error as { message?: string };
            toast({ variant: "destructive", title: "Error", description: err.message || "Failed to resend OTP." });
        } finally {
            setIsLoading(false);
        }
    };

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
                    {isLoading && (
                        <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Loader2 className="w-10 h-10 text-primary" />
                            </motion.div>
                        </div>
                    )}

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
                                        <Select defaultValue={creatingFor} onValueChange={setCreatingFor}>
                                            <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-black text-sm uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-foreground border-white/10 text-white">
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
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    onClick={() => setGender("MALE")}
                                                    className={`flex-1 h-full rounded-xl text-[10px] font-black tracking-widest uppercase ${gender === 'MALE' ? 'bg-primary text-white' : 'hover:bg-white/5 text-muted-foreground'}`}
                                                >MALE</Button>
                                                <Button 
                                                    type="button"
                                                    variant="ghost" 
                                                    onClick={() => setGender("FEMALE")}
                                                    className={`flex-1 h-full rounded-xl text-[10px] font-black tracking-widest uppercase ${gender === 'FEMALE' ? 'bg-primary text-white' : 'hover:bg-white/5 text-muted-foreground'}`}
                                                >FEMALE</Button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Date of Birth</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                <Input 
                                                    type="date"
                                                    value={dateOfBirth}
                                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                                    className="pl-12 h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleStep1Continue}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">First Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                                <Input 
                                                    placeholder="First name" 
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="pl-14 h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-black"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Last Name</Label>
                                            <Input 
                                                placeholder="Last name" 
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-black"
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
                                            onClick={handleSendOTP}
                                            disabled={phone.length < 10 || !firstName.trim()}
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
                                                onClick={handleResendOTP}
                                                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${canResend ? 'text-primary hover:text-primary/80' : 'text-muted-foreground opacity-50 cursor-not-allowed'}`}
                                            >
                                                <RotateCcw className={`w-3 h-3 ${!canResend && 'animate-spin-slow'}`} />
                                                {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                                            </button>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleVerifyAndRegister}
                                        disabled={otp.length < 6}
                                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                    >
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

                    <div id="recaptcha-container"></div>
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
