"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Loader2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import { useEffect, useState } from "react";
import { publicService } from "@/services/public.service";
import type { SuccessStory } from "@/types/api.types";

export function SuccessStories() {
    const [stories, setStories] = useState<SuccessStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await publicService.getSuccessStories();
                setStories(data || []);
            } catch (err) {
                console.error("Failed to fetch success stories");
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    if (loading && stories.length === 0) {
        return (
            <div className="py-24 bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!stories || stories.length === 0) return null;

    return (
        <section id="stories" className="py-24 bg-background relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Testimonials</span>
                    <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 text-foreground leading-tight">
                        Real People. <span className="text-primary italic">Real Love.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        We have helped thousands of couples find their perfect match. Be our next success story.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-12">
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                        <CarouselContent className="-ml-6">
                            {stories.map((story) => (
                                <CarouselItem key={story.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                                    <div className="group h-full pb-4">
                                        <Card className="border border-white/5 shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden h-full flex flex-col bg-card/40 backdrop-blur-md rounded-[2.5rem] transform hover:-translate-y-2">
                                            <div className="relative h-72 w-full overflow-hidden">
                                                <Image
                                                    src={story.imageUrl || "/placeholder.jpg"}
                                                    alt={story.title || "Success Story"}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
                                                <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                    <p className="font-bold text-2xl mb-1">{story.title || story.partnerName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--primary))]"></div>
                                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-300">
                                                            {story.weddingDate ? new Date(story.weddingDate).getFullYear() : "Success Story"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardContent className="p-8 relative flex-1 flex flex-col justify-between">
                                                <div className="bg-primary/20 p-3 rounded-2xl absolute -top-6 right-8 shadow-xl backdrop-blur-md border border-white/10">
                                                    <Quote className="h-6 w-6 text-primary rotate-180" />
                                                </div>
                                                <p className="text-muted-foreground italic leading-relaxed pt-2 text-base font-light group-hover:text-foreground transition-colors duration-500">
                                                    "{story.story}"
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex justify-center mt-10 gap-4">
                            <CarouselPrevious className="static transform-none translate-y-0 h-12 w-12 border-2 border-primary/20 hover:bg-primary hover:text-white transition-colors" />
                            <CarouselNext className="static transform-none translate-y-0 h-12 w-12 border-2 border-primary/20 hover:bg-primary hover:text-white transition-colors" />
                        </div>
                    </Carousel>
                </div>

            </div>
        </section>
    );
}
