"use client";

import { motion } from "framer-motion";
import { 
    Zap, 
    CheckCircle2, 
    ShieldCheck, 
    Rocket,
    Clock,
    Lock,
    ChevronRight,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { useMembership, Plan } from "@/hooks/use-membership";
import { loadScript } from "@/lib/script-loader";
import { useToast } from "@/hooks/use-toast";

export default function MembershipPage() {
    const { plans, plansLoading, initiatePayment, verifyPayment } = useMembership();
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [promoCode, setPromoCode] = useState("");
    const { toast } = useToast();

    // Set default selected plan
    useEffect(() => {
        if (plans && plans.length > 0 && selectedPlanId === null) {
            setTimeout(() => setSelectedPlanId(plans[0].id), 0);
        }
    }, [plans, selectedPlanId]);

    const handlePayment = async () => {
        if (!selectedPlanId) return;

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            toast({
                title: "SDK Error",
                description: "Razorpay SDK failed to load. Are you online?",
                variant: "destructive"
            });
            return;
        }

        try {
            const orderData = await initiatePayment.mutateAsync({ 
                planId: selectedPlanId, 
                promoCode: promoCode.trim() || undefined 
            });
            
            const options = {
                key: orderData.razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Chhattisgarh Shadi",
                description: `Subscription: ${orderData.plan.name}`,
                image: "/logo.png",
                order_id: orderData.orderId,
                handler: async function (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) {
                    await verifyPayment.mutateAsync({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                },
                prefill: {
                    name: orderData.user.name,
                    email: orderData.user.email,
                    contact: orderData.user.phone,
                },
                theme: {
                    color: "#E01E5A",
                },
            };

            // @ts-ignore - Razorpay is loaded via script
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Payment initiation failed:", error);
        }
    };

    const activePlan = Array.isArray(plans) ? plans.find(p => p.id === selectedPlanId) : null;

    return (
        <div className="space-y-12 pb-20">
            {/* Premium Membership Hero */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary to-rose-700 p-10 md:p-16 text-white text-center shadow-3xl shadow-primary/30"
            >
                {/* Abstract Background */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px]" 
                    />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-[80px]" />
                </div>

                <div className="relative z-10 flex flex-col items-center space-y-6">
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] border border-white/30 flex items-center justify-center shadow-2xl"
                    >
                        <Rocket className="w-12 h-12 text-white fill-current" />
                    </motion.div>
                    
                    <div className="space-y-2 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight">
                            Unlock Your <span className="text-white italic">Soulmate!</span> 👑
                        </h1>
                        <p className="text-white/80 font-medium text-lg md:text-xl">Choose a premium plan that fits your journey to a beautiful marriage.</p>
                    </div>

                    <div className="flex bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 items-center gap-4">
                        <ShieldCheck className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-bold tracking-tight">Trusted by 50,000+ Verified Profiles</span>
                    </div>
                </div>
            </motion.div>

            {/* Plan Selection */}
            {plansLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[500px] bg-white/5 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {plans?.map((plan: Plan, i: number) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card 
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`h-full relative cursor-pointer group transition-all duration-500 rounded-[2.5rem] border-white/5 overflow-hidden ${selectedPlanId === plan.id ? 'bg-card/60 ring-2 ring-primary shadow-2xl shadow-primary/10' : 'bg-card/30 hover:bg-card/40'}`}
                            >
                                {i === 1 && (
                                    <div className="absolute top-0 right-0 p-6">
                                        <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase shadow-lg shadow-primary/20">Most Popular</Badge>
                                    </div>
                                )}

                                <CardContent className="p-10 flex flex-col h-full">
                                    <div className="mb-8 space-y-1">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{plan.name}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black tracking-tighter text-foreground">₹{plan.price}</span>
                                            <span className="text-sm font-bold text-muted-foreground">/ {plan.duration} days</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest pt-2 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            Active for {plan.duration} Days
                                        </p>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-10">
                                        {plan.features.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button className={`w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95 ${selectedPlanId === plan.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border border-white/10 text-foreground hover:bg-primary hover:text-white'}`}>
                                        {selectedPlanId === plan.id ? 'SELECTED' : 'SELECT PLAN'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Bottom Section - Summary & Pay */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 pt-10 border-t border-white/5 mx-2">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-3 rounded-2xl">
                            <ShieldCheck className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest text-foreground">Secure Payment</p>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Verified by Razorpay</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-400/20 p-3 rounded-2xl">
                            <Lock className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest text-foreground">Instant Activation</p>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Immediate profile upgrade</p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-6">
                    {/* Promo Code Input */}
                    <div className="relative w-full sm:w-[240px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group">
                            <Tag className={`w-4 h-4 transition-colors ${promoCode ? 'text-primary' : ''}`} />
                        </div>
                        <Input 
                            placeholder="Promo Code" 
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="h-14 pl-11 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal"
                        />
                        {promoCode && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="text-[10px] font-black text-primary animate-pulse">APPLYING</span>
                            </div>
                        )}
                    </div>

                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Selected: <span className="text-foreground">{activePlan?.name}</span></p>
                        <p className="text-3xl font-black text-foreground">₹{activePlan?.price || 0}</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <Button 
                            size="lg" 
                            onClick={handlePayment}
                            disabled={initiatePayment.isPending || verifyPayment.isPending}
                            className="w-full lg:w-[280px] h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-[1.5rem] shadow-2xl shadow-primary/30 group disabled:opacity-50"
                        >
                            {initiatePayment.isPending || verifyPayment.isPending ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    PROCEED TO PAY
                                    <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                if (!selectedPlanId) return;
                                try {
                                    // Use the existing initiatePayment logic or a direct service call if needed
                                    // In this case, we'll assume there's a specific route for generating a shareable link
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web/payment/create-link`, {
                                        method: 'POST',
                                        headers: { 
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                                        },
                                        body: JSON.stringify({ 
                                            planId: selectedPlanId,
                                            promoCode: promoCode.trim() || undefined
                                        }),
                                    });
                                    const data = await res.json();
                                    if (data.success && data.data.paymentLink) {
                                        await navigator.clipboard.writeText(data.data.paymentLink);
                                        toast({
                                            title: "Link Copied!",
                                            description: "Payment link copied to clipboard. Share it via WhatsApp.",
                                        });
                                    }
                                } catch (err) {
                                    toast({
                                        title: "Error",
                                        description: "Failed to generate sharing link.",
                                        variant: "destructive"
                                    });
                                }
                            }}
                            className="h-10 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20"
                        >
                            Share Payment Link
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
