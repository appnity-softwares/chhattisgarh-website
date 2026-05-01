"use client";
import { useBoostPackages, useActiveBoost, useBoostPayment } from "@/hooks/use-boost";
import { loadScript } from "@/lib/script-loader";
import { useToast } from "@/hooks/use-toast";
import { 
    Zap, 
    TrendingUp, 
    Users, 
    ArrowUpRight, 
    CheckCircle2, 
    ShieldCheck, 
    Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function BoostPage() {
    const { data: packages, isLoading: _packsLoading } = useBoostPackages();
    const { data: activeStatus, isLoading: _activeLoading } = useActiveBoost();
    const { initiateBoost, verifyBoost } = useBoostPayment();
    const { toast } = useToast();

    const handleBoostPayment = async (boostType: string) => {
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
            const orderData = await initiateBoost.mutateAsync(boostType);
            
            const options = {
                key: orderData.razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Chhattisgarh Shaadi",
                description: `Boost: ${orderData.boostPackage?.name || boostType}`,
                image: "/logo.png",
                order_id: orderData.orderId,
                handler: async function (response: unknown) {
                    await verifyBoost.mutateAsync({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        boostType: boostType
                    });
                },
                theme: {
                    color: "#8B1E3F",
                },
            };

            // @ts-expect-error - Legacy third-party typing is incomplete
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error: unknown) {
            console.error("Boost payment failed:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to initiate boost payment",
                variant: "destructive"
            });
        }
    };

    const displayPackages = packages || [
        { id: 'BASIC', name: 'Express Boost', duration: '24 Hours', multiplier: '5x', price: 149, description: 'Perfect for a quick visibility spike during weekends.' },
        { id: 'SUPER', name: 'Dominator', duration: '7 Days', multiplier: '12x', price: 599, recommended: true, description: 'Most popular choice for serious members. Priority search results.' },
        { id: 'SPOTLIGHT', name: 'Elite Spotlight', duration: '30 Days', multiplier: '30x', price: 1999, description: 'Maximum exposure. Be the first profile everyone sees for a month.' }
    ];

    const hasActive = activeStatus?.hasActiveBoost;

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-foreground to-black border border-white/5 p-8 lg:p-12">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full -mr-20 -mt-20 animate-pulse pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em]">Visibility Engine 2.0</Badge>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                            Get <span className="text-primary italic">Noticed</span> <br /> 
                            By Your <span className="underline decoration-primary/30 underline-offset-8">Ideal Match</span>
                        </h1>
                        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest leading-relaxed max-w-lg opacity-70">
                            Our proprietary algorithm boosts your profile to the top of search results, 
                            ensuring 5x - 30x more organic profiles visits and interest requests.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">3x Conversion</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Global Reach</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-72 aspect-[4/5] relative">
                         <div className={`absolute inset-0 rounded-[2.5rem] rotate-6 border blur-sm transition-all duration-700 ${hasActive ? 'bg-green-500/20 border-green-500/30' : 'bg-primary/20 border-primary/30 rotate-6 group-hover:rotate-3'}`} />
                         <div className="relative h-full bg-foreground border border-white/10 rounded-[2.5rem] p-6 flex flex-col justify-between overflow-hidden">
                             <div className="flex justify-between items-start">
                                 <div className={`p-2.5 rounded-2xl ${hasActive ? 'bg-green-500/10' : 'bg-white/10'}`}>
                                     <Zap className={`w-6 h-6 ${hasActive ? 'text-green-500 fill-green-500/20' : 'text-primary fill-primary/20'}`} />
                                 </div>
                                 <Badge className={`${hasActive ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'} border-none font-bold text-[8px] uppercase tracking-widest px-2 py-0.5`}>
                                     {hasActive ? 'Active Now' : 'Limited Reach'}
                                 </Badge>
                             </div>
                             
                             <div className="space-y-4">
                                 <div className="space-y-1">
                                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Algorithm Rank</p>
                                     <h3 className="text-2xl font-black text-white">{hasActive ? '#1 Priority' : 'Top 40%'}</h3>
                                 </div>
                                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: hasActive ? "100%" : "30%" }}
                                        className={`h-full ${hasActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(224,30,90,0.5)]'}`} 
                                     />
                                 </div>
                                 <p className={`text-[8px] font-black uppercase tracking-widest italic ${hasActive ? 'text-green-400' : 'text-primary'}`}>
                                     {hasActive ? 'Promotion active until ' + new Date(activeStatus.activeBoost.expiresAt).toLocaleDateString() : 'Activate boost for instant growth'}
                                 </p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Profile Discoverability', value: '+300%', color: 'text-primary' },
                    { label: 'Chat Initiation Rate', value: '2.4x', color: 'text-blue-400' },
                    { label: 'Search Priority', value: 'Rank #1', color: 'text-amber-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-white/[0.02] border-white/5 rounded-[1.5rem] overflow-hidden group hover:border-white/10 transition-all">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                                <h4 className={`text-2xl font-black uppercase tracking-tighter ${stat.color}`}>{stat.value}</h4>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl group-hover:bg-white/10 transition-colors">
                                <ArrowUpRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pricing Section */}
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase">Select Your <span className="text-primary italic">Accelerator</span></h2>
                    <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest opacity-60">High Performance Visibility Packages</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {displayPackages.map((option: unknown) => (
                        <motion.div
                            key={option.id}
                            whileHover={{ y: -10 }}
                            className={`relative bg-foreground border rounded-[2rem] p-8 flex flex-col gap-8 transition-all duration-500 overflow-hidden ${option.recommended ? 'border-primary shadow-2xl shadow-primary/10 scale-105 z-10' : 'border-white/5'}`}
                        >
                            {option.recommended && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-6 py-2 rounded-bl-2xl uppercase tracking-widest">Recommended</div>
                            )}
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-white italic tracking-tight">{option.name}</h4>
                                    <p className="text-[10px] font-medium text-muted-foreground opacity-70 italic leading-relaxed">{option.description || 'Boost your profile visibility immediately.'}</p>
                                </div>
                                
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white tracking-tighter">₹{option.price}</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">/ {option.duration}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-green-500" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{option.multiplier || '10x'} Visibility</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-green-500" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Search Rank #1</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-green-500" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Premium Badge Entry</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button 
                                    onClick={() => handleBoostPayment(option.id)}
                                    disabled={initiateBoost.isPending || verifyBoost.isPending}
                                    className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${option.recommended ? 'bg-primary text-white hover:bg-primary shadow-primary/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                                >
                                    {initiateBoost.isPending && initiateBoost.variables === option.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : 'ACTIVATE NOW'}
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web/boost/create-link`, {
                                                method: 'POST',
                                                headers: { 
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                                                },
                                                body: JSON.stringify({ boostType: option.id }),
                                            });
                                            const data = await res.json();
                                            if (data.success && data.data.paymentLink) {
                                                await navigator.clipboard.writeText(data.data.paymentLink);
                                                toast({
                                                    title: "Boost Link Copied!",
                                                    description: "Send this link to someone who can pay for your boost.",
                                                });
                                            }
                                        } catch (_err) {
                                            toast({
                                                title: "Error",
                                                description: "Failed to generate boost link.",
                                                variant: "destructive"
                                            });
                                        }
                                    }}
                                    className="h-8 rounded-xl bg-green-500/5 hover:bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/10"
                                >
                                    Share Link
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Proof */}
            <div className="bg-primary/5 rounded-[2rem] p-10 flex flex-col items-center text-center space-y-6">
                <div className="flex -space-x-3">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-foreground bg-muted overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <div className="max-w-xl space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-white italic">&quot;My profile views jumped from 20 to 500 in just 2 days. I found my match within a week of boosting!&quot;</p>
                    <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/60">— Surbhi V., Raipur</p>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Secured with MatriShield™ Precision AI</span>
                </div>
            </div>
        </div>
    );
}
