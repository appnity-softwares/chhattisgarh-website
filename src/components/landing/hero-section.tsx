"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { AppStoreBadges } from "@/components/layout/app-store-badges";

export function HeroSection() {
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero-banner');

    return (
        <div className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden pt-16 md:pt-0">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center h-full justify-center">
                {/* Headline */}
                <div className="max-w-5xl mx-auto mb-12 animate-fade-in-up">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 drop-shadow-2xl font-headline tracking-tight leading-tight px-2 break-words">
                        Find Your <span className="text-primary italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">Perfect Match</span> <br className="hidden md:block" /> in Chhattisgarh
                    </h1>
                    <p className="text-base md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto drop-shadow-lg font-light leading-relaxed px-4">
                        Thousands of verified profiles from your community. <br className="hidden sm:block" /> Trusted by families across the state.
                    </p>

                    <div className="flex flex-col items-center gap-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="scale-90 sm:scale-110 md:scale-125 p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
                            <AppStoreBadges />
                        </div>
                        <p className="text-[10px] md:text-sm text-gray-300 uppercase tracking-[0.2em] font-medium animate-pulse mt-2">
                            Download the App Now
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
