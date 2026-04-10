"use client";

import { motion } from "framer-motion";
import { 
    User, 
    Camera, 
    Briefcase, 
    MapPin, 
    Star, 
    Heart, 
    CheckCircle2, 
    Save,
    Plus,
    X,
    Trash2,
    Calendar,
    ChevronRight,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "religion", label: "Community", icon: Star },
    { id: "education", label: "Career", icon: Briefcase },
    { id: "location", label: "Location", icon: MapPin },
    { id: "about", label: "Bio", icon: Heart },
    { id: "photos", label: "Photos", icon: Camera },
];

export default function ProfilePage() {
    const { toast } = useToast();
    const [activeSection, setActiveSection] = useState("basic");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        }, 1500);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">Edit <span className="text-primary italic">Profile</span></h1>
                    <p className="text-muted-foreground font-light text-lg">Keep your details updated to find better matches</p>
                </div>
                
                <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 min-w-[180px]"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? "SAVING..." : "SAVE CHANGES"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Navigation Sidebar */}
                <Card className="lg:col-span-3 bg-card/30 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden sticky top-8">
                    <div className="p-4 space-y-1">
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black text-sm uppercase tracking-widest ${activeSection === section.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                            >
                                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-primary'}`} />
                                {section.label}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Form Content */}
                <div className="lg:col-span-9 space-y-8">
                    <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden min-h-[600px]">
                        <CardContent className="p-8 md:p-12">
                            <AnimatePresence mode="wait">
                                {activeSection === "basic" && (
                                    <motion.div key="basic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                                                <Input defaultValue="Priya Sahu" className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Date of Birth</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                    <Input type="date" className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Height</Label>
                                                <Select defaultValue="5-4">
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="5-0">5' 0"</SelectItem>
                                                        <SelectItem value="5-4">5' 4"</SelectItem>
                                                        <SelectItem value="5-8">5' 8"</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Mother Tongue</Label>
                                                <Select defaultValue="chhattisgarhi">
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="chhattisgarhi">Chhattisgarhi</SelectItem>
                                                        <SelectItem value="hindi">Hindi</SelectItem>
                                                        <SelectItem value="english">English</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "religion" && (
                                    <motion.div key="religion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Religion</Label>
                                                <Select defaultValue="hindu">
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hindu">Hindu</SelectItem>
                                                        <SelectItem value="jain">Jain</SelectItem>
                                                        <SelectItem value="sikh">Sikh</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Caste</Label>
                                                <Input defaultValue="Sahu" className="h-14 bg-white/5 border-white/10 rounded-xl" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Gothram</Label>
                                                <Input placeholder="Enter your Gothram" className="h-14 bg-white/5 border-white/10 rounded-xl" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Manglik Status</Label>
                                                <Select defaultValue="no">
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="no">No</SelectItem>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="partial">Anshik Manglik</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "education" && (
                                    <motion.div key="education" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Education</Label>
                                                <Input defaultValue="Master of Commerce" className="h-14 bg-white/5 border-white/10 rounded-xl" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Occupation</Label>
                                                <Select defaultValue="finance">
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="finance">Finance Professional</SelectItem>
                                                        <SelectItem value="it">IT Professional</SelectItem>
                                                        <SelectItem value="doctor">Medical Doctor</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Annual Income</Label>
                                                <Select defaultValue="8-12">
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="5-8">₹5 - 8 LPA</SelectItem>
                                                        <SelectItem value="8-12">₹8 - 12 LPA</SelectItem>
                                                        <SelectItem value="12+">₹12+ LPA</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "about" && (
                                    <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Bio / About Me</Label>
                                            <Textarea 
                                                placeholder="Describe yourself, your interests and what you are looking for in a partner..." 
                                                className="min-h-[200px] bg-white/5 border-white/10 rounded-2xl p-6 text-lg font-medium leading-relaxed"
                                                defaultValue="I am a simple, down-to-earth person with a positive outlook on life..."
                                            />
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-right">Min 50 characters recommended</p>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Hobbies & Interests</Label>
                                            <Input defaultValue="Cooking, Traveling, Classical Music" className="h-14 bg-white/5 border-white/10 rounded-xl" />
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "photos" && (
                                    <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                            {/* Existing Photos */}
                                            <div className="relative group aspect-square rounded-[1.5rem] overflow-hidden border-2 border-primary/20">
                                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <button className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Main Photo</span>
                                                </div>
                                            </div>

                                            {/* Add Photo Slot */}
                                            <button className="aspect-square rounded-[1.5rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all hover:border-primary/40 group">
                                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Plus className="w-6 h-6 text-primary" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Photo</span>
                                            </button>
                                        </div>

                                        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex items-start gap-4">
                                            <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                                            <div>
                                                <h4 className="font-black text-sm uppercase tracking-widest text-primary">Photo Guidelines</h4>
                                                <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">Profiles with real photos get 10x more responses. Avoid group photos, blurring, or hats/sunglasses in your primary photo.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Quick Preview Mobile-style Info */}
                    <div className="flex bg-amber-400/10 border border-amber-400/20 p-6 rounded-[2rem] items-center gap-4">
                        <div className="bg-amber-400 p-3 rounded-2xl shadow-lg shadow-amber-400/20">
                            <Star className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest text-foreground">Profile Completeness: 85%</p>
                            <p className="text-xs text-muted-foreground font-medium">Add more photos to reach 100% and get featured in 'New Profiles'</p>
                        </div>
                        <Button variant="outline" className="ml-auto rounded-xl border-amber-400/30 font-bold active:scale-95">View Tips</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrap with AnimatePresence for transitions
import { AnimatePresence } from "framer-motion";
