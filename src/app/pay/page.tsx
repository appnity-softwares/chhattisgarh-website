"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
    RefreshCw, 
    ShieldCheck, 
    AlertCircle, 
    CreditCard, 
    Crown, 
    CheckCircle2,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { webPaymentService } from "@/services/web-payment.service";
import Script from "next/script";

declare global {
    interface Window {
        Razorpay: {
            new (options: unknown): {
                open: () => void;
            };
        };
    }
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [details, setDetails] = useState<{
        razorpayKey: string;
        amount: number;
        currency: string;
        orderId: string;
        plan: { name: string; duration: string; features: string[] };
        user: { id: number; name: string; email: string; phone: string };
        deepLinkSuccess: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid payment session. Please restart payment from the app.");
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const data = await webPaymentService.getPaymentDetails(token);
                setDetails(data);
            } catch (err: unknown) {
                console.error("Payment details error:", err);
                const errorMsg = err as { message?: string };
                setError(errorMsg.message || "Failed to load payment session.");
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
            description: `${details.plan.name} - ${details.plan.duration} Subscription`,
            order_id: details.orderId,
            handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                setVerifying(true);
                try {
                    const result = await webPaymentService.handlePaymentSuccess({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (result.success) {
                        setSuccess(true);
                        // Optional: Automatic redirect after 3 seconds
                        setTimeout(() => {
                            window.location.href = result.redirectUrl;
                        }, 3000);
                    }
                } catch (err: unknown) {
                    const errorMsg = err as { message?: string };
                    setError(errorMsg.message || "Payment verification failed.");
                    setVerifying(false);
                }
            },
            prefill: {
                name: details.user.name,
                email: details.user.email,
                contact: details.user.phone,
            },
            theme: {
                color: "#9333ea", // Purple-600 to match our theme
            },
            modal: {
                ondismiss: function() {
                    console.log("Checkout closed");
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse text-sm uppercase tracking-widest font-bold">Securely Loading Checkout...</p>
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
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                        {error}
                    </p>
                    <Button asChild variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5">
                        <Link href="/">Return to Website</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-md mx-auto py-10">
                <Card className="glass-card border-emerald-500/20 p-10 text-center bg-emerald-500/10 relative overflow-hidden">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20"
                    >
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Payment Successful!</h2>
                    <p className="text-emerald-200/60 text-sm mb-10 font-medium tracking-wide">
                        Your {details.plan.name} is now active.
                    </p>
                    
                    <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-400 mb-2">
                            Redirecting to App...
                        </p>
                        <Button asChild className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                            <a href={details.deepLinkSuccess}>
                                RETURN TO APP
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            </a>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid gap-8"
            >
                {/* Info Card */}
                <Card className="glass-card-heavy border-white/10 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Crown className="w-32 h-32 text-primary" />
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <Crown className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Membership Upgrade</p>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{details.plan.name} Plan</h2>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-end border-b border-white/5 pb-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground font-medium">Monthly/Package Rate</p>
                                <p className="text-xs text-muted-foreground italic">Validity: {details.plan.duration}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black text-white tracking-tighter">₹{details.amount / 100}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-primary">All Inclusive</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {details.plan.features.map((f: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button 
                        onClick={handlePayment} 
                        disabled={verifying}
                        className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        {verifying ? (
                            <>
                                <RefreshCw className="w-6 h-6 animate-spin" />
                                VERIFYING...
                            </>
                        ) : (
                            <>
                                PAY SECURELY
                                <CreditCard className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            </>
                        )}
                    </Button>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 px-3 py-1.5 rounded-lg bg-white/5">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            PCI-DSS
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 px-3 py-1.5 rounded-lg bg-white/5">
                            <CreditCard className="w-3.5 h-3.5 text-primary" />
                            RAZORPAY
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 px-3 py-1.5 rounded-lg bg-white/5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            256-bit SSL
                        </div>
                    </div>
                </Card>

                {/* Account Details Hint */}
                <div className="px-6 flex items-center justify-between text-muted-foreground/50">
                    <div className="text-xs font-medium">Paying for: <span className="text-white/40">{details.user.name}</span></div>
                    <div className="text-xs font-medium">Order ID: <span className="text-white/40">#{details.orderId.split('_')[1]}</span></div>
                </div>
            </motion.div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <main className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-float" />
            </div>

            <div className="container relative z-10">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse text-sm">Preparing Secure Session...</p>
                    </div>
                }>
                    <CheckoutContent />
                </Suspense>
            </div>
        </main>
    );
}
