"use client";

import { motion } from "framer-motion";
import { 
    Heart, 
    Star, 
    Quote, 
    Image as ImageIcon, 
    Calendar, 
    Send,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useSuccessStories, useCreateSuccessStory } from "@/hooks/use-success-stories";
import Image from "next/image";

export default function SuccessStoriesPage() {
    const { data: stories, isLoading } = useSuccessStories();
    const createStory = useCreateSuccessStory();
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const [formData, setFormData] = useState({
        partnerName: "",
        title: "",
        story: "",
        weddingDate: "",
        imageUrl: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createStory.mutateAsync(formData);
            setSubmitted(true);
            setShowForm(false);
        } catch (error) {
            console.error(error);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Story Submitted!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Thank you for sharing your journey. Our team will review and publish your story shortly. 
                        Wishing you a very happy married life!
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => { setSubmitted(false); setFormData({ partnerName: "", title: "", story: "", weddingDate: "", imageUrl: "" }); }}
                    className="h-14 px-10 rounded-2xl border-white/10"
                >
                    BACK TO STORIES
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-rose-600 to-indigo-900 p-10 md:p-16 text-white shadow-3xl">
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-20 -right-20 w-96 h-96 border-[30px] border-white/5 rounded-full" 
                    />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <Heart className="w-8 h-8 text-white fill-current" />
                    </div>
                    <div className="space-y-2 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight">
                            Real Stories, <span className="text-rose-400 italic">Real Love.</span> ❤️
                        </h1>
                        <p className="text-white/80 font-medium text-lg">Celebrate the beautiful unions found right here on Chhattisgarh Shadi.</p>
                    </div>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="h-14 px-8 bg-white text-rose-600 hover:bg-white/90 font-black rounded-2xl shadow-xl transition-all active:scale-95"
                    >
                        {showForm ? "VIEW STORIES" : "SHARE YOUR STORY"}
                    </Button>
                </div>
            </div>

            {showForm ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <Card className="bg-card/40 border-white/10 rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-10 space-y-8">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Your Success Story</h3>
                                <p className="text-muted-foreground text-sm font-medium">Inspire others by sharing how you found your soulmate.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Partner's Name</Label>
                                        <Input 
                                            required
                                            value={formData.partnerName}
                                            onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                                            className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                            placeholder="Who did you match with?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Wedding Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input 
                                                type="date"
                                                value={formData.weddingDate}
                                                onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                                                className="h-14 pl-12 bg-white/5 border-white/10 rounded-xl" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Story Title</Label>
                                    <Input 
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                        placeholder="e.g. Love at First Chat"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">The Journey</Label>
                                    <Textarea 
                                        required
                                        minLength={50}
                                        value={formData.story}
                                        onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                                        className="min-h-[150px] bg-white/5 border-white/10 rounded-xl p-6 leading-relaxed" 
                                        placeholder="Tell us how it all began... (min 50 characters)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Couple Photo URL (External)</Label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            className="h-14 pl-12 bg-white/5 border-white/10 rounded-xl" 
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground/60 px-1 italic">Provide a link to your beautiful photo (Google Drive, Cloudinary, etc.)</p>
                                </div>

                                <Button 
                                    type="submit"
                                    disabled={createStory.isPending}
                                    className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 group"
                                >
                                    {createStory.isPending ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            SUBMIT STORY
                                            <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-96 bg-white/5 rounded-[2.5rem] animate-pulse" />)
                    ) : (stories || []).length === 0 ? (
                        <div className="col-span-full py-20 text-center space-y-6">
                            <Quote className="w-16 h-16 text-muted-foreground opacity-20 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight opacity-40">No Stories Yet</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">Be the first to share your journey and inspire thousands of singles!</p>
                            </div>
                            <Button onClick={() => setShowForm(true)} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">Start Writing</Button>
                        </div>
                    ) : (
                        stories.map((story: any, i: number) => (
                            <motion.div 
                                key={story.id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="bg-card/30 border-white/5 rounded-[2.5rem] overflow-hidden group hover:bg-card/50 transition-all duration-500">
                                    <div className="relative h-64 overflow-hidden">
                                        {story.imageUrl ? (
                                            <Image 
                                                src={story.imageUrl} 
                                                alt={story.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-indigo-900/20 flex items-center justify-center opacity-40">
                                                <ImageIcon size={64} className="text-white/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-[8px] font-black uppercase tracking-widest">
                                                <Star className="w-3 h-3 mr-1 text-amber-400 fill-amber-400" />
                                                Verified Match
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 space-y-4">
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">{story.weddingDate ? new Date(story.weddingDate).toLocaleDateString() : 'Love Story'}</h4>
                                            <h3 className="text-xl font-bold text-white line-clamp-1">{story.title}</h3>
                                        </div>
                                        <div className="relative">
                                            <Quote className="absolute -left-2 -top-2 w-8 h-8 text-white/5 italic" />
                                            <p className="text-sm font-medium text-muted-foreground line-clamp-4 leading-relaxed italic z-10 relative">
                                                &ldquo;{story.story}&rdquo;
                                            </p>
                                        </div>
                                        <div className="pt-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Heart className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{story.user1.profile?.firstName} & {story.partnerName || story.user2?.profile?.firstName || 'Partner'}</p>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">A Beautiful Journey</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
