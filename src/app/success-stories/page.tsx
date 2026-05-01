"use client";

import { motion } from "framer-motion";
import { Heart, Star, Quote, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useSuccessStories, useCreateSuccessStory } from "@/hooks/use-success-stories";
import type { SuccessStory } from "@/types/api.types";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function SuccessStoriesPage() {
    const { data: stories, isLoading } = useSuccessStories();
    const createStory = useCreateSuccessStory();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        partnerName: "",
        weddingDate: "",
        story: "",
        image: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createStory.mutate(formData, {
            onSuccess: () => {
                setShowForm(false);
                setFormData({ partnerName: "", weddingDate: "", story: "", image: "" });
            }
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 pb-20">
                {/* Hero Section */}
                <div className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-surface border-b border-border">
                    <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('/grid.svg')]" />
                    
                    <div className="relative z-10 text-center space-y-6 px-4">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        >
                            <Heart className="w-8 h-8 text-primary fill-primary" />
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-foreground">Success <span className="text-primary font-medium">Stories</span></h1>
                        <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto font-medium">Every heart has a story, find yours in Chhattisgarh.</p>
                        
                        <Button 
                            onClick={() => setShowForm(!showForm)}
                            className="mt-4 h-14 px-10 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
                        >
                            {showForm ? "VIEW STORIES" : "SHARE YOUR STORY"}
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12">
                    {showForm ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="bg-surface border-border rounded-[2.5rem] shadow-xl overflow-hidden max-w-2xl mx-auto">
                                <CardContent className="p-10 md:p-16 space-y-8">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-bold uppercase text-foreground">Share Your <span className="text-primary font-medium">Joy</span></h2>
                                        <p className="text-muted-foreground font-medium text-xs tracking-widest uppercase">Inspire others with your beautiful journey</p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Partner&apos;s Name</label>
                                            <Input 
                                                value={formData.partnerName}
                                                onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                                                className="h-14 bg-background border-border rounded-xl focus:ring-primary/20" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Wedding Date</label>
                                            <Input 
                                                type="date"
                                                value={formData.weddingDate}
                                                onChange={(e) => setFormData({...formData, weddingDate: e.target.value})}
                                                className="h-14 bg-background border-border rounded-xl focus:ring-primary/20" 
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Your Story</label>
                                            <Textarea 
                                                value={formData.story}
                                                onChange={(e) => setFormData({...formData, story: e.target.value})}
                                                className="min-h-[150px] bg-background border-border rounded-xl p-4 focus:ring-primary/20" 
                                                placeholder="Tell us how you met..."
                                                required
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            disabled={createStory.isPending}
                                            className="w-full h-16 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-md text-lg transition-all"
                                        >
                                            {createStory.isPending ? <Loader2 className="animate-spin" /> : "SUBMIT FOR REVIEW"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {isLoading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-[500px] bg-muted animate-pulse rounded-[2.5rem]" />
                                ))
                            ) : stories?.length > 0 ? (
                                stories.map((story: SuccessStory, idx: number) => (
                                    <motion.div 
                                        key={story.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="group bg-surface border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500">
                                            <div className="relative h-72 overflow-hidden">
                                                <Image 
                                                    src={story.imageUrl || `https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80`} 
                                                    alt={story.partnerName || "Success Story"}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                                />
                                                <div className="absolute inset-0 bg-foreground/60" />
                                                <div className="absolute bottom-6 left-8 right-8">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight leading-tight">
                                                        {story.partnerName} & <br />
                                                        <span className="text-primary-foreground font-medium opacity-80">Partner</span>
                                                    </h3>
                                                </div>
                                            </div>
                                            <CardContent className="p-8 space-y-6">
                                                <div className="relative">
                                                    <Quote className="absolute -top-1 -left-1 w-6 h-6 text-primary opacity-20" />
                                                    <p className="text-muted-foreground font-medium leading-relaxed line-clamp-4 pl-6 text-sm">
                                                        &quot;{story.story}&quot;
                                                    </p>
                                                </div>
                                                <div className="pt-6 border-t border-border flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                        {story.weddingDate ? new Date(story.weddingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Wedding Date'}
                                                    </span>
                                                    <Button variant="ghost" className="text-primary font-bold uppercase tracking-widest text-[10px] p-0 h-auto hover:bg-transparent hover:translate-x-1 transition-transform">
                                                        Full Story →
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center space-y-4 opacity-20">
                                    <Heart className="w-16 h-16 mx-auto" />
                                    <p className="text-xl font-bold uppercase tracking-widest">No stories found yet. Be the first!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
