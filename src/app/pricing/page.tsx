"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PricingSection } from "@/components/landing/pricing-section";
import { motion } from "framer-motion";

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
                {/* Optional Hero for Pricing Page */}
                <div className="pt-20 pb-10 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter"
                    >
                        Simple <span className="text-primary">Pricing.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-xl mt-4 font-light"
                    >
                        No hidden fees. Just transparent plans to help you find your match.
                    </motion.p>
                </div>
                <PricingSection />
            </main>
            <Footer />
        </div>
    );
}
