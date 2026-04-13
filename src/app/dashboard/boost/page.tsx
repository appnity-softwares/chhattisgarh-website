"use client";

import { motion } from "framer-motion";
import { 
    Rocket, 
    Zap, 
    Crown, 
    CheckCircle2, 
    Loader2,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import premiumWebService from "@/services/premium-web.service";
import { useUserAuthStore } from "@/stores/user-auth-store";
import { useToast } from "@/hooks/use-toast";
import { loadScript } from "@/lib/script-loader";
import { BoostPackage } from "@/types/api.types";

const BOOST_ICONS = [Zap, Rocket, Crown];
const BOOST_COLORS = ['from-amber-500 to-orange-600', 'from-primary to-rose-600', 'from-violet-500 to-purple-700'];

export default function BoostPage() {
    const { accessToken } = useUserAuthStore();
    const { toast } = useToast();
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

    // Fetch boost packages
    const { data: packages, isLoading: packagesLoading } = useQuery<BoostPackage[]>({
        queryKey: ["boost-packages"],
        queryFn: async () => {
            const res = await premiumWebService.getBoostPackages();
            const data = res.data;
            return (Array.isArray(data) ? data : (data?.packages || data?.boosts || [])) as BoostPackage[];
        },
    });

    // Fetch active boost
    const { data: activeBoost } = useQuery({
        queryKey: ["active-boost"],
        queryFn: async () => {
            if (!accessToken) return null;
            const res = await premiumWebService.getActiveBoosts(accessToken);
            return res.data;
        },
        enabled: !!accessToken,
    });

    // Set default selected
    useEffect(() => {
        if (packages && packages.length > 0 && !selectedPackage) {
            setTimeout(() => setSelectedPackage(packages[0].type || packages[0].id.toString()), 0);
        }
    }, [packages, selectedPackage]);

    // Initiate boost payment
    const initiateBoost = useMutation({
        mutationFn: async (boostType: string) => {
            if (!accessToken) throw new Error("Please login first");
            const res = await premiumWebService.initBoostPayment(boostType, accessToken);
            return res.data;
        },
        onError: (error: unknown) => {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message || "Failed to start boost purchase.",
                variant: "destructive",
            });
        },
    });

    const handlePaymentSuccess = () => {
        toast({ title: "Boost Activated! 🚀", description: "Your profile is now boosted!" });
        window.location.reload();
    };

    const handleBoostPurchase = async () => {
        if (!selectedPackage) return;

        const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!loaded) {
            toast({ title: "Error", description: "Payment SDK failed to load.", variant: "destructive" });
            return;
        }

        try {
            const orderData = await initiateBoost.mutateAsync(selectedPackage);
            
            if (orderData?.paymentUrl) {
                window.open(orderData.paymentUrl, '_blank');
                return;
            }
            
            if (orderData?.orderId) {
                const options = {
                    key: orderData.razorpayKey,
                    amount: orderData.amount,
                    currency: orderData.currency || 'INR',
                    name: "Chhattisgarh Shaadi",
                    description: `Profile Boost`,
                    order_id: orderData.orderId,
                    handler: function () {
                        handlePaymentSuccess();
                    },
                    theme: { color: "#E01E5A" },
                };
                // @ts-expect-error - Razorpay is loaded via script
                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            }
        } catch (error) {
            console.error("Boost payment error:", error);
        }
    };

    const selectedPkg = packages?.find((p: BoostPackage) => (p.type || p.id.toString()) === selectedPackage);

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-amber-500 to-orange-600 p-10 md:p-16 text-white text-center shadow-3xl shadow-amber-500/30"
            >
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px]" 
                    />
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
                            Boost Your <span className="italic">Visibility!</span> 🔥
                        </h1>
                        <p className="text-white/80 font-medium text-lg md:text-xl">Get seen by 10x more potential matches in your area</p>
                    </div>

                    {activeBoost && (
                        <div className="flex bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 items-center gap-4">
                            <Zap className="w-5 h-5 text-yellow-300" />
                            <span className="text-sm font-bold tracking-tight">Active Boost: Expires {new Date(activeBoost.expiresAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Boost Packages */}
            {packagesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[400px] bg-white/5 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {packages?.map((pkg: BoostPackage, i: number) => {
                        const IconComp = BOOST_ICONS[i % 3];
                        const pkgId = (pkg.type || pkg.id).toString();
                        return (
                            <motion.div
                                key={pkgId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card 
                                    onClick={() => setSelectedPackage(pkgId)}
                                    className={`h-full relative cursor-pointer group transition-all duration-500 rounded-[2.5rem] border-white/5 overflow-hidden ${selectedPackage === pkgId ? 'bg-card/60 ring-2 ring-amber-500 shadow-2xl shadow-amber-500/10' : 'bg-card/30 hover:bg-card/40'}`}
                                >
                                    {i === 1 && (
                                        <div className="absolute top-0 right-0 p-6">
                                            <Badge className="bg-amber-500 text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase shadow-lg shadow-amber-500/20">Best Value</Badge>
                                        </div>
                                    )}

                                    <CardContent className="p-10 flex flex-col h-full">
                                        <div className="mb-8 space-y-3">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${BOOST_COLORS[i % 3]} rounded-2xl flex items-center justify-center`}>
                                                <IconComp className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground group-hover:text-amber-500 transition-colors">{pkg.name || pkg.type}</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black tracking-tighter text-foreground">₹{pkg.price}</span>
                                                <span className="text-sm font-bold text-muted-foreground">/ {pkg.duration || pkg.durationHours || 24}h</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4 mb-10">
                                            {(pkg.features || [
                                                `${pkg.multiplier || '10'}x More Visibility`,
                                                'Priority in search results',
                                                `Active for ${pkg.duration || pkg.durationHours || 24} hours`,
                                                'Featured profile badge',
                                            ]).map((feature: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className="bg-amber-500/10 p-1 rounded-full mt-0.5">
                                                        <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button className={`w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95 ${selectedPackage === pkgId ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-white/5 border border-white/10 text-foreground hover:bg-amber-500 hover:text-white'}`}>
                                            {selectedPackage === pkgId ? 'SELECTED' : 'SELECT'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Purchase Button */}
            <div className="flex flex-col items-center gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 text-muted-foreground">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-bold">Secured by Razorpay • Instant Activation</span>
                </div>
                <Button 
                    size="lg" 
                    onClick={handleBoostPurchase}
                    disabled={!selectedPackage || initiateBoost.isPending}
                    className="w-full max-w-md h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xl rounded-[1.5rem] shadow-2xl shadow-amber-500/30 group disabled:opacity-50"
                >
                    {initiateBoost.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            BOOST NOW — ₹{selectedPkg?.price || 0}
                            <Rocket className="w-6 h-6 ml-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
