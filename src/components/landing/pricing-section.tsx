"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Shield, Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { webPaymentService } from "@/services/web-payment.service";
import type { SubscriptionPlan } from "@/types/api.types";
import Link from "next/link";

export function PricingSection() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await webPaymentService.getPublicPlans();
                setPlans(data || []);
            } catch {
                console.error("Failed to load pricing plans");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const parseFeatures = (features: unknown): string[] => {
        if (!features) return [];
        if (Array.isArray(features)) return features;
        if (typeof features === 'string') {
            try {
                const p = JSON.parse(features);
                return Array.isArray(p) ? p : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    if (loading && plans.length === 0) {
        return null; // Or a skeleton if preferred
    }

    if (plans.length === 0) return null;

    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-background">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                    >
                        <Zap className="w-3 h-3" />
                        Premium Experience
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter"
                    >
                        Upgrade Your <br /> <span className="text-primary font-medium italic">Success Scope</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg font-light leading-relaxed"
                    >
                        Choose a plan that fits your journey. Get more matches, direct contact, and better visibility with our premium tiers.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, index) => {
                        const features = parseFeatures(plan.features);
                        const isMostPopular = index === 1 || plan.name.toLowerCase().includes('gold') || plan.name.toLowerCase().includes('premium');
                        
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex"
                            >
                                <Card className={`flex-1 glass-card border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 group ${isMostPopular ? 'ring-2 ring-primary/40 shadow-2xl shadow-primary/10' : ''}`}>
                                    {isMostPopular && (
                                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-bl-3xl shadow-lg">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${isMostPopular ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors'}`}>
                                            <Crown className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 tracking-tight">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold tracking-tighter">₹{plan.effectivePrice || plan.price}</span>
                                            <span className="text-muted-foreground text-sm font-medium">/ {plan.durationDays} Days</span>
                                        </div>
                                        {plan.hasActiveDiscount && plan.originalPrice && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground line-through">₹{plan.originalPrice}</span>
                                                <span className="text-[10px] font-bold text-success uppercase tracking-tighter bg-success/10 px-2 py-0.5 rounded-full">
                                                    Save {plan.discountPercentage}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 flex-1 mb-8">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-primary" />
                                            What&apos;s Included
                                        </p>
                                        <div className="space-y-3">
                                            {features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="mt-1 p-0.5 rounded-full bg-primary/20 text-primary">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-sm text-foreground/80 leading-snug">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button asChild className={`w-full h-14 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${isMostPopular ? 'bg-primary hover:bg-primary-dark text-white shadow-md' : 'bg-surface hover:bg-muted text-foreground border border-border'}`}>
                                        <Link href="/register">
                                            Get Started
                                        </Link>
                                    </Button>
                                    
                                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
                                        <Shield className="w-3 h-3" />
                                        Secure Payment via Razorpay
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Secure Payment Badges */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-40 hover:opacity-100 transition-all duration-700"
                >
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl bg-white/5">
                        <Shield className="w-4 h-4 text-primary" />
                        PCI-DSS Compliant
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl bg-white/5">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Razorpay Secure
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl bg-white/5">
                        <ShieldCheck className="w-4 h-4 text-success" />
                        256-bit SSL
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
