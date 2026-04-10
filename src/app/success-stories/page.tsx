"use client";

import { motion } from "framer-motion";
import { Heart, Star, Quote, Plus, Loader2, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useSuccessStories, useCreateSuccessStory } from "@/hooks/use-success-stories";

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
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-500/20 to-primary/20">
                <div className="absolute inset-0 z-0">
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[120px]" 
                    />
                </div>
                
                <div className="relative z-10 text-center space-y-6 px-4">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-white shadow-2xl rounded-[2rem] flex items-center justify-center mx-auto mb-8"
                    >
                        <Heart className="w-10 h-10 text-primary fill-primary" />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-foreground">Success <span className="text-primary italic">Stories</span></h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto italic">"Every heart has a story, find yours in Chhattisgarh."</p>
                    
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="mt-8 h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        {showForm ? "VIEW STORIES" : "SHARE YOUR STORY"}
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -translate-y-12">
                {showForm ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[3rem] shadow-3xl overflow-hidden max-w-2xl mx-auto">
                            <CardContent className="p-10 md:p-16 space-y-8">
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-black uppercase text-foreground">Share Your <span className="text-primary italic">Joy</span></h2>
                                    <p className="text-muted-foreground font-medium">Inspire others with your beautiful journey</p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Partner's Name</label>
                                        <Input 
                                            value={formData.partnerName}
                                            onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                                            className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Wedding Date</label>
                                        <Input 
                                            type="date"
                                            value={formData.weddingDate}
                                            onChange={(e) => setFormData({...formData, weddingDate: e.target.value})}
                                            className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Your Story</label>
                                        <Textarea 
                                            value={formData.story}
                                            onChange={(e) => setFormData({...formData, story: e.target.value})}
                                            className="min-h-[150px] bg-white/5 border-white/10 rounded-xl p-4" 
                                            placeholder="Tell us how you met..."
                                            required
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={createStory.isPending}
                                        className="w-full h-16 bg-primary font-black rounded-2xl shadow-xl shadow-primary/20 text-lg"
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
                                <div key={i} className="h-[500px] bg-white/5 rounded-[3rem] animate-pulse" />
                            ))
                        ) : stories?.length > 0 ? (
                            stories.map((story: any, idx: number) => (
                                <motion.div 
                                    key={story.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="group bg-card/40 backdrop-blur-md border-white/5 rounded-[3rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                                        <div className="relative h-80 overflow-hidden">
                                            <img 
                                                src={story.imageUrl || `https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80`} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-6 left-8 right-8">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                </div>
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                                                    {story.partnerName} & <br />
                                                    <span className="text-primary italic">Partner</span>
                                                </h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="relative">
                                                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary opacity-20" />
                                                <p className="text-muted-foreground font-medium italic leading-relaxed line-clamp-4 pl-6">
                                                    "{story.story}"
                                                </p>
                                            </div>
                                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                                                    {new Date(story.weddingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                                </span>
                                                <Button variant="ghost" className="text-primary font-black uppercase tracking-widest text-[10px] p-0 h-auto hover:bg-transparent hover:translate-x-1 transition-transform">
                                                    Full Story →
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                                <Heart className="w-20 h-20 mx-auto" />
                                <p className="text-2xl font-black uppercase tracking-widest italic">No stories found yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
