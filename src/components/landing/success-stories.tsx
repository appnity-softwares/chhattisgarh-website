"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const stories = [
    {
        id: 1,
        names: "Rahul & Priya (Raipur)",
        image: PlaceHolderImages.find(img => img.id === 'testimonial-1')?.imageUrl || "/placeholder.jpg",
        date: "Married Dec 2024",
        quote: "We found each other on Chhattisgarh Shaadi within a week. The caste filters made it so easy to find compatible families."
    },
    {
        id: 2,
        names: "Amit & Sneha (Bilaspur)",
        image: PlaceHolderImages.find(img => img.id === 'testimonial-2')?.imageUrl || "/placeholder.jpg",
        date: "Married Nov 2024",
        quote: "The verification process gave us peace of mind. Highly recommended for anyone looking for a serious relationship."
    },
    {
        id: 3,
        names: "Vikram & Anjali (Durg)",
        image: PlaceHolderImages.find(img => img.id === 'testimonial-3')?.imageUrl || "/placeholder.jpg",
        date: "Married Oct 2024",
        quote: "Thank you for helping me find my soulmate. The app is very user friendly, even for our parents."
    }
];

export function SuccessStories() {
    return (
        <section id="stories" className="py-24 bg-gradient-to-b from-secondary/30 to-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-2 block">Success Stories</span>
                    <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 text-gray-900 leading-tight">
                        Real People. <span className="text-primary">Real Love.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light">
                        We have helped thousands of couples find their perfect match. Be our next success story.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-12">
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                        <CarouselContent className="-ml-4">
                            {stories.map((story) => (
                                <CarouselItem key={story.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                    <div className="group h-full">
                                        <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col bg-white rounded-3xl transform hover:-translate-y-2">
                                            <div className="relative h-72 w-full overflow-hidden">
                                                <Image
                                                    src={story.image}
                                                    alt={story.names}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                                                <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                    <p className="font-bold text-xl mb-1">{story.names}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-1 w-1 bg-primary rounded-full"></span>
                                                        <p className="text-xs uppercase tracking-wide font-medium text-gray-200">{story.date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardContent className="p-6 relative flex-1 flex flex-col justify-between bg-white">
                                                <Quote className="absolute -top-4 right-6 h-10 w-10 text-primary bg-white p-2 rounded-full shadow-md rotate-180" />
                                                <p className="text-gray-600 italic leading-relaxed pt-4 text-base font-light">
                                                    "{story.quote}"
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
