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
    Trash2,
    Calendar,
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
import { useProfile, useProfileCompletion } from "@/hooks/use-profile";
import { usePartnerPreference } from "@/hooks/use-partner-preference";
import { useAstrologyMetadata } from "@/hooks/use-astrology";
import { useRef } from "react";

const SECTIONS = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "religion", label: "Community", icon: Star },
    { id: "education", label: "Career", icon: Briefcase },
    { id: "location", label: "Location", icon: MapPin },
    { id: "about", label: "Bio", icon: Heart },
    { id: "photos", label: "Photos", icon: Camera },
    { id: "preferences", label: "Preferences", icon: Star },
];

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"] as const;
const MARITAL_STATUS_OPTIONS = [
    "NEVER_MARRIED",
    "DIVORCED",
    "WIDOWED",
    "AWAITING_DIVORCE",
    "ANNULLED",
] as const;
const RELIGION_OPTIONS = [
    "HINDU",
    "MUSLIM",
    "CHRISTIAN",
    "SIKH",
    "BUDDHIST",
    "JAIN",
    "PARSI",
    "JEWISH",
    "BAHAI",
    "NO_RELIGION",
    "SPIRITUAL",
    "OTHER",
] as const;
const MOTHER_TONGUE_OPTIONS = [
    "CHHATTISGARHI",
    "HINDI",
    "ENGLISH",
    "MARATHI",
    "GUJARATI",
    "PUNJABI",
    "BENGALI",
    "URDU",
    "OTHER",
] as const;
const ANNUAL_INCOME_OPTIONS = [
    "Below 3 LPA",
    "3-5 LPA",
    "5-8 LPA",
    "8-12 LPA",
    "12-20 LPA",
    "20+ LPA",
] as const;

const enumLabel = (value: string) =>
    value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

interface ProfileMedia {
    id: number;
    url: string;
}

interface ProfileData {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    height?: string;
    gender?: string;
    maritalStatus?: string;
    religion?: string;
    caste?: string;
    subCaste?: string;
    gothram?: string;
    manglik?: boolean;
    motherTongue?: string;
    highestEducation?: string;
    occupation?: string;
    annualIncome?: string;
    designation?: string;
    educationDetails?: string;
    city?: string;
    state?: string;
    country?: string;
    nativeVillage?: string;
    workLocation?: string;
    residencyStatus?: string;
    bio?: string;
    hobbies?: string;
    interests?: string;
    aboutFamily?: string;
    partnerExpectations?: string;
    nakshatra?: string;
    rashi?: string;
    media?: ProfileMedia[];
}

export default function ProfilePage() {
    const { data: userData, isLoading, updateProfile, uploadPhotos, deletePhoto } = useProfile();
    const { preference: prefData, updatePreference, isLoading: isPrefLoading } = usePartnerPreference();
    const { data: completion } = useProfileCompletion();
    const { nakshatras, rashis } = useAstrologyMetadata();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = useState("basic");
    const [formData, setFormData] = useState<ProfileData>({});
    const [prefFormData, setPrefFormData] = useState<any>({});

    useEffect(() => {
        if (userData?.profile) {
            setTimeout(() => setFormData(userData.profile as ProfileData), 0);
        }
    }, [userData]);

    useEffect(() => {
        if (prefData) {
            setPrefFormData(prefData);
        }
    }, [prefData]);

    const isSaving = updateProfile.isPending || uploadPhotos.isPending || deletePhoto.isPending || updatePreference.isPending;
    const media = Array.isArray(formData.media) ? formData.media : [];
    const dateOfBirthValue = formData.dateOfBirth
        ? new Date(formData.dateOfBirth as string).toISOString().split("T")[0]
        : "";

    const handleSave = () => {
        if (activeSection === "preferences") {
            updatePreference.mutate(prefFormData);
        } else {
            updateProfile.mutate(formData as Record<string, unknown>);
        }
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
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-foreground">
                        {(!userData?.profile || (completion?.percentage || 0) < 20) ? "Create" : "Edit"}{" "}
                        <span className="text-primary italic">Profile</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg italic">
                        {(!userData?.profile || (completion?.percentage || 0) < 20) 
                            ? "Welcome! Let's build your identity to find your perfect match." 
                            : "Keep your details updated to find better matches"}
                    </p>
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
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">First Name</Label>
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
                                                        value={dateOfBirthValue} 
                                                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Height (cm)</Label>
                                                <Input 
                                                    value={formData.height || ""} 
                                                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Gender</Label>
                                                <Select value={(formData.gender as string) || ""} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {GENDER_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {enumLabel(option)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Marital Status</Label>
                                                <Select value={(formData.maritalStatus as string) || ""} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MARITAL_STATUS_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {enumLabel(option)}
                                                            </SelectItem>
                                                        ))}
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
                                                <Select value={(formData.religion as string) || ""} onValueChange={(value) => setFormData({ ...formData, religion: value })}>
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select religion" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {RELIGION_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {enumLabel(option)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Caste</Label>
                                                <Input 
                                                    value={formData.caste || ""} 
                                                    onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Gothram</Label>
                                                <Input 
                                                    value={formData.gothram || ""} 
                                                    onChange={(e) => setFormData({ ...formData, gothram: e.target.value })}
                                                    placeholder="Enter your Gothram" 
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Manglik Status</Label>
                                                <Select 
                                                    value={typeof formData.manglik === "boolean" ? String(formData.manglik) : ""}
                                                    onValueChange={(value) => setFormData({ ...formData, manglik: value === "true" })}
                                                >
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="false">No</SelectItem>
                                                        <SelectItem value="true">Yes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Mother Tongue</Label>
                                                <Select value={(formData.motherTongue as string) || ""} onValueChange={(value) => setFormData({ ...formData, motherTongue: value })}>
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select mother tongue" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MOTHER_TONGUE_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {enumLabel(option)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Sub Caste</Label>
                                                <Input 
                                                    value={formData.subCaste || ""} 
                                                    onChange={(e) => setFormData({ ...formData, subCaste: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Nakshatra</Label>
                                                <Select value={(formData.nakshatra as string) || ""} onValueChange={(value) => setFormData({ ...formData, nakshatra: value })}>
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select Nakshatra" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {nakshatras.data?.map((n) => (
                                                            <SelectItem key={n.id} value={n.name}>
                                                                {n.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Rashi</Label>
                                                <Select value={(formData.rashi as string) || ""} onValueChange={(value) => setFormData({ ...formData, rashi: value })}>
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select Rashi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {rashis.data?.map((r) => (
                                                            <SelectItem key={r.id} value={r.name}>
                                                                {r.name}
                                                            </SelectItem>
                                                        ))}
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
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Highest Education</Label>
                                                <Input 
                                                    value={formData.highestEducation || ""} 
                                                    onChange={(e) => setFormData({ ...formData, highestEducation: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Occupation</Label>
                                                <Input 
                                                    value={formData.occupation || ""} 
                                                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Annual Income</Label>
                                                <Select value={(formData.annualIncome as string) || ""} onValueChange={(value) => setFormData({ ...formData, annualIncome: value })}>
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select annual income" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ANNUAL_INCOME_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Designation</Label>
                                                <Input 
                                                    value={formData.designation || ""} 
                                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3 md:col-span-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Education Details</Label>
                                                <Textarea 
                                                    value={formData.educationDetails || ""} 
                                                    onChange={(e) => setFormData({ ...formData, educationDetails: e.target.value })}
                                                    placeholder="Degree, specialization, institution, certifications..." 
                                                    className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-5 font-medium leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "location" && (
                                    <motion.div key="location" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">City</Label>
                                                <Input 
                                                    value={formData.city || ""} 
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">State</Label>
                                                <Input 
                                                    value={formData.state || ""} 
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Country</Label>
                                                <Input 
                                                    value={formData.country || ""} 
                                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Native Village</Label>
                                                <Input 
                                                    value={formData.nativeVillage || ""} 
                                                    onChange={(e) => setFormData({ ...formData, nativeVillage: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Work Location</Label>
                                                <Input 
                                                    value={formData.workLocation || ""} 
                                                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Residency Status</Label>
                                                <Input 
                                                    value={formData.residencyStatus || ""} 
                                                    onChange={(e) => setFormData({ ...formData, residencyStatus: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
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
                                                value={formData.bio || ""}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-right">Min 50 characters recommended</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Hobbies</Label>
                                                <Input 
                                                    value={formData.hobbies || ""} 
                                                    onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Interests</Label>
                                                <Input 
                                                    value={formData.interests || ""} 
                                                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl" 
                                                />
                                            </div>
                                            <div className="space-y-4 md:col-span-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">About Family</Label>
                                                <Textarea 
                                                    value={formData.aboutFamily || ""} 
                                                    onChange={(e) => setFormData({ ...formData, aboutFamily: e.target.value })}
                                                    className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-5 font-medium leading-relaxed"
                                                />
                                            </div>
                                            <div className="space-y-4 md:col-span-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Partner Expectations</Label>
                                                <Textarea 
                                                    value={formData.partnerExpectations || ""} 
                                                    onChange={(e) => setFormData({ ...formData, partnerExpectations: e.target.value })}
                                                    className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl p-5 font-medium leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "photos" && (
                                    <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                            {/* Existing Photos */}
                                            {media.map((item, idx) => (
                                                <div key={item.id || idx} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border-2 border-primary/20">
                                                    <img src={item.url} alt={String(formData.firstName || 'Profile Photo')} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <button 
                                                        onClick={() => deletePhoto.mutate(item.id)}
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
                                {activeSection === "preferences" && (
                                    <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                        <div className="space-y-8">
                                            {/* Age & Height */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-6">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Age Range</Label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">Min Age</p>
                                                            <Input 
                                                                type="number"
                                                                value={prefFormData.minAge || ""}
                                                                onChange={(e) => setPrefFormData({ ...prefFormData, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="h-14 bg-white/5 border-white/10 rounded-xl text-center font-bold"
                                                            />
                                                        </div>
                                                        <div className="w-4 h-0.5 bg-white/10 mt-6" />
                                                        <div className="flex-1 space-y-2">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">Max Age</p>
                                                            <Input 
                                                                type="number"
                                                                value={prefFormData.maxAge || ""}
                                                                onChange={(e) => setPrefFormData({ ...prefFormData, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="h-14 bg-white/5 border-white/10 rounded-xl text-center font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Height Range (cm)</Label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">Min Height</p>
                                                            <Input 
                                                                type="number"
                                                                value={prefFormData.minHeight || ""}
                                                                onChange={(e) => setPrefFormData({ ...prefFormData, minHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="h-14 bg-white/5 border-white/10 rounded-xl text-center font-bold"
                                                            />
                                                        </div>
                                                        <div className="w-4 h-0.5 bg-white/10 mt-6" />
                                                        <div className="flex-1 space-y-2">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">Max Height</p>
                                                            <Input 
                                                                type="number"
                                                                value={prefFormData.maxHeight || ""}
                                                                onChange={(e) => setPrefFormData({ ...prefFormData, maxHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="h-14 bg-white/5 border-white/10 rounded-xl text-center font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Community & Status */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Marital Status</Label>
                                                    <Select 
                                                        value={prefFormData.maritalStatus?.[0] || ""} 
                                                        onValueChange={(val) => setPrefFormData({ ...prefFormData, maritalStatus: [val] })}
                                                    >
                                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                            <SelectValue placeholder="Preferred Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {MARITAL_STATUS_OPTIONS.map(opt => (
                                                                <SelectItem key={opt} value={opt}>{enumLabel(opt)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Religion</Label>
                                                    <Select 
                                                        value={prefFormData.religion?.[0] || ""} 
                                                        onValueChange={(val) => setPrefFormData({ ...prefFormData, religion: [val] })}
                                                    >
                                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                            <SelectValue placeholder="Preferred Religion" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {RELIGION_OPTIONS.map(opt => (
                                                                <SelectItem key={opt} value={opt}>{enumLabel(opt)}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Caste(s)</Label>
                                                <Input 
                                                    placeholder="Enter preferred castes (comma separated)" 
                                                    value={Array.isArray(prefFormData.caste) ? prefFormData.caste.join(", ") : ""}
                                                    onChange={(e) => setPrefFormData({ 
                                                        ...prefFormData, 
                                                        caste: e.target.value.split(",").map(c => c.trim()).filter(Boolean) 
                                                    })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Manglik Status</Label>
                                                <Select 
                                                    value={typeof prefFormData.manglik === "boolean" ? String(prefFormData.manglik) : "any"}
                                                    onValueChange={(val) => setPrefFormData({ ...prefFormData, manglik: val === "any" ? null : val === "true" })}
                                                >
                                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="any">Does Not Matter</SelectItem>
                                                        <SelectItem value="false">Non-Manglik Only</SelectItem>
                                                        <SelectItem value="true">Manglik Only</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-4">
                                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                                                <Star className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm uppercase tracking-widest text-blue-500">Matching Algorithm</h4>
                                                <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                                                    Updating these preferences will instantly refresh your match recommendations. 
                                                    We use these criteria to calculate compatibility scores for every profile you view.
                                                </p>
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
