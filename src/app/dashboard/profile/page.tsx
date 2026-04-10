"use client";

import { motion, AnimatePresence } from "framer-motion";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useProfileCompletion } from "@/hooks/use-profile";
import { useRef } from "react";

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
    const { data: userData, isLoading, updateProfile, uploadPhotos, deletePhoto } = useProfile();
    const { data: completion } = useProfileCompletion();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = useState("basic");
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (userData?.profile) {
            setFormData(userData.profile);
        }
    }, [userData]);

    const isSaving = updateProfile.isPending || uploadPhotos.isPending || deletePhoto.isPending;

    const handleSave = () => {
        updateProfile.mutate(formData);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            uploadPhotos.mutate(files);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-30" />
            </div>
        );
    }

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
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">First Name</Label>
                                                <Input 
                                                    value={formData.firstName || ""} 
                                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Last Name</Label>
                                                <Input 
                                                    value={formData.lastName || ""} 
                                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Date of Birth</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                    <Input 
                                                        type="date" 
                                                        value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ""} 
                                                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Height (e.g. 5.4)</Label>
                                                <Input 
                                                    value={formData.height || ""} 
                                                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" 
                                                />
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
                                            {formData.media?.map((media: any, idx: number) => (
                                                <div key={media.id} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border-2 border-primary/20">
                                                    <img src={media.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <button 
                                                        onClick={() => deletePhoto.mutate(media.id)}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        {deletePhoto.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                    {idx === 0 && (
                                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Main Photo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Photo Slot */}
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadPhotos.isPending}
                                                className="aspect-square rounded-[1.5rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all hover:border-primary/40 group overflow-hidden"
                                            >
                                                {uploadPhotos.isPending ? (
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Plus className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Photo</span>
                                                    </>
                                                )}
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    multiple 
                                                    onChange={handleFileChange} 
                                                />
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
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-black text-sm uppercase tracking-widest text-foreground">Profile Completeness: {completion?.percentage || 0}%</p>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completion?.percentage || 0}%` }}
                                    className="h-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                                />
                            </div>
                            {completion?.missingFields?.length > 0 && (
                                <p className="text-[9px] text-muted-foreground font-bold mt-2 uppercase">Missing: {completion.missingFields.slice(0, 3).join(', ')}...</p>
                            )}
                        </div>
                        <Button variant="outline" className="ml-auto rounded-xl border-amber-400/30 font-bold active:scale-95 text-xs">View Tips</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

