"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    RefreshCw, 
    ShieldCheck, 
    AlertCircle, 
    CreditCard, 
    Zap, 
    Shield,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { webPaymentService } from "@/services/web-payment.service";
import Script from "next/script";
import Link from "next/link";

function BoostCheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [details, setDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid boost session. Please restart from the app.");
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const data = await webPaymentService.getBoostDetails(token);
                setDetails(data);
            } catch (err: any) {
                console.error("Boost details error:", err);
                setError(err.message || "Failed to load boost session.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [token]);

    const handlePayment = () => {
        if (!details || !window.Razorpay) return;

        const options = {
            key: details.razorpayKey,
            amount: details.amount,
            currency: details.currency,
            name: "Chhattisgarh Shadi",
            description: `Profile Boost: ${details.boost.name}`,
            order_id: details.orderId,
            handler: async (response: any) => {
                setVerifying(true);
                try {
                    const result = await webPaymentService.handlePaymentSuccess({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        boostType: details.boostType,
                        userId: details.user.id
                    });

                    if (result.success) {
                        setSuccess(true);
                        setTimeout(() => {
                            window.location.href = result.redirectUrl;
                        }, 3000);
                    }
                } catch (err: any) {
                    setError(err.message || "Payment verification failed.");
                    setVerifying(false);
                }
            },
            prefill: {
                name: details.user.name,
                email: details.user.email,
                contact: details.user.phone,
            },
            theme: {
                color: "#f59e0b", // Amber-500 for Boost
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse text-sm uppercase tracking-widest font-bold">Preparing Boost Checkout...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto py-10">
                <Card className="glass-card border-red-500/20 p-8 text-center bg-red-500/5">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Checkout Error</h2>
                    <p className="text-muted-foreground text-sm mb-8">{error}</p>
                    <Button asChild variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto py-10">
                <Card className="glass-card border-amber-500/20 p-10 text-center bg-amber-500/10">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20"
                    >
                        <Zap className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white mb-3">Boost Activated!</h2>
                    <p className="text-amber-200/60 text-sm mb-10 font-medium">
                        Your profile is now receiving maximum visibility.
                    </p>
                    
                    <Button asChild className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-widest">
                        <a href={details.deepLinkSuccess}>
                            COMPLETE IN APP
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        </a>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-8"
            >
                <Card className="glass-card-heavy border-amber-500/10 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden ring-1 ring-amber-500/20 shadow-2xl shadow-amber-500/5">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Zap className="w-32 h-32 text-amber-500" />
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-500">Profile Acceleration</p>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{details.boost.name}</h2>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-end border-b border-white/5 pb-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Boost Duration</p>
                                <p className="text-xs text-muted-foreground italic">{details.boost.duration} Hours active push</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-white tracking-tighter">₹{details.amount / 100}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-500">Instant Activation</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <p className="text-sm text-foreground/90 leading-relaxed font-light">
                                <Sparkles className="w-4 h-4 text-amber-500 inline mr-2" />
                                {details.boost.description || "Your profile will be shown at the top of all search results for the next " + details.boost.duration + " hours."}
                            </p>
                        </div>
                    </div>

                    <Button 
                        onClick={handlePayment} 
                        disabled={verifying}
                        className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xl rounded-2xl shadow-2xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        {verifying ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                ACTIVATE BOOST
                                <CreditCard className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            </>
                        )}
                    </Button>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 px-3 py-1.5 rounded-lg bg-white/5">
                            <Shield className="w-3.5 h-3.5 text-amber-500" />
                            PCI-DSS
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 px-3 py-1.5 rounded-lg bg-white/5">
                            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                            RAZORPAY
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 px-3 py-1.5 rounded-lg bg-white/5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            256-bit SSL
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function BoostCheckoutPage() {
    return (
        <main className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="container relative z-10">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse text-sm">Preparing Secure Boost...</p>
                    </div>
                }>
                    <BoostCheckoutContent />
                </Suspense>
            </div>
        </main>
    );
}
