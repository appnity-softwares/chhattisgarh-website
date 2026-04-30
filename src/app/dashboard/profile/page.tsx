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
    Loader2,
    Shield,
    Lock,
    Users,
    Eye,
    Zap,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { usePhotoPrivacy } from "@/hooks/use-photo-privacy";
import { useRef } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "religion", label: "Community", icon: Star },
    { id: "education", label: "Career", icon: Briefcase },
    { id: "location", label: "Location", icon: MapPin },
    { id: "about", label: "Bio", icon: Heart },
    { id: "photos", label: "Photos", icon: Camera },
    { id: "family", label: "Family", icon: Users },
    { id: "lifestyle", label: "Lifestyle", icon: Zap },
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
const enumLabel = (value: string) =>
    value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

interface ProfileMedia {
    id: number;
    url: string;
    privacySettings?: {
        visibility: "PUBLIC" | "REGISTERED" | "MATCHED" | "PRIVATE";
        blurForNonPremium: boolean;
    };
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
    middleName?: string;
    weight?: string;
    physicalDisability?: string;
    diet?: string;
    smokingHabit?: string;
    drinkingHabit?: string;
    speaksChhattisgarhi?: boolean;
    fatherName?: string;
    fatherOccupation?: string;
    fatherStatus?: string;
    motherName?: string;
    motherOccupation?: string;
    motherStatus?: string;
    numberOfBrothers?: number;
    numberOfSisters?: number;
    brothersMarried?: number;
    sistersMarried?: number;
    familyType?: string;
    familyValues?: string;
    familyIncome?: string;
    ancestralOrigin?: string;
    birthTime?: string;
    birthPlace?: string;
}

export default function ProfilePage() {
    const { data: userData, isLoading, saveProfile, uploadPhotos, deletePhoto } = useProfile();
    const { updatePrivacy } = usePhotoPrivacy();
    const { preference: prefData, updatePreference, isLoading: isPrefLoading } = usePartnerPreference();
    const { data: completion } = useProfileCompletion();
    const { nakshatras, rashis } = useAstrologyMetadata();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = useState("basic");
    const [formData, setFormData] = useState<ProfileData>({});
    const [prefFormData, setPrefFormData] = useState<any>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Profile validation rules
    const validateProfile = (data: ProfileData) => {
        const newErrors: Record<string, string> = {};

        // Mandatory Fields
        if (!data.firstName?.trim()) newErrors.firstName = "First name is required";
        if (!data.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!data.gender) newErrors.gender = "Gender is required";
        if (!data.religion) newErrors.religion = "Religion is required";
        if (!data.caste?.trim()) newErrors.caste = "Caste is required";
        if (!data.city?.trim()) newErrors.city = "City is required";
        if (!data.state?.trim()) newErrors.state = "State is required";

        const heightVal = Number(data.height);
        if (!data.height) newErrors.height = "Height is required";
        else if (isNaN(heightVal) || heightVal < 100 || heightVal > 250) newErrors.height = "Please enter a valid height in cm (e.g. 170)";

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    // Helper to find which section an error belongs to
    const getSectionForError = (field: string) => {
        if (["firstName", "lastName", "dateOfBirth", "gender", "maritalStatus"].includes(field)) return "basic";
        if (["religion", "caste", "subCaste", "motherTongue", "manglik"].includes(field)) return "religion";
        if (["city", "state", "country", "nativeVillage"].includes(field)) return "location";
        if (["highestEducation", "occupation", "annualIncome"].includes(field)) return "education";
        if (["height", "weight"].includes(field)) return "basic"; // height is in basic for this UX
        return activeSection;
    };

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

    const isSaving = saveProfile.isPending || uploadPhotos.isPending || deletePhoto.isPending || updatePreference.isPending;
    const media = Array.isArray(formData.media) ? formData.media : [];
    const dateOfBirthValue = formData.dateOfBirth
        ? new Date(formData.dateOfBirth as string).toISOString().split("T")[0]
        : "";

    const handleSave = () => {
        if (activeSection === "preferences") {
            updatePreference.mutate(prefFormData);
        } else {
            // Run Validation
            const validation = validateProfile(formData);
            setErrors(validation.errors);

            if (!validation.isValid) {
                // Focus first error
                const firstErrorField = Object.keys(validation.errors)[0];
                const targetSection = getSectionForError(firstErrorField);

                if (targetSection !== activeSection) {
                    setActiveSection(targetSection);
                }

                toast({
                    title: "Missing Information",
                    description: "Please fill all mandatory fields marked in red.",
                    variant: "destructive"
                });

                // Smooth scroll to top of form
                window.scrollTo({ top: 200, behavior: 'smooth' });
                return;
            }

            saveProfile.mutate(formData as Record<string, unknown>);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            uploadPhotos.mutate({ files });
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
                <div className="space-y-4">
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

                    {/* Quick Progress Indicator */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completion?.percentage || 0}%` }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                {completion?.percentage || 0}% Complete
                            </span>
                        </div>
                        {completion?.tips && completion.tips.length > 0 && (
                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">
                                Tip: {completion.tips[0]}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 min-w-[180px]">
                    {!userData?.profile?.isVerified && (
                        <Link href="/dashboard/profile/verify">
                            <Button
                                variant="outline"
                                className="h-14 px-8 border-primary/20 hover:bg-primary/5 text-primary font-black rounded-2xl transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Shield className="w-5 h-5" />
                                VERIFY PROFILE
                            </Button>
                        </Link>
                    )}

                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? "SAVING..." : "SAVE CHANGES"}
                    </Button>
                </div>
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
                                                <Label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.firstName ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    First Name {errors.firstName && "— Required"}
                                                </Label>
                                                <Input
                                                    value={formData.firstName || ""}
                                                    onChange={(e) => {
                                                        setFormData({...formData, firstName: e.target.value});
                                                        if (errors.firstName) setErrors({...errors, firstName: ""});
                                                    }}
                                                    className={`h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold ${errors.firstName ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Middle Name</Label>
                                                <Input
                                                    value={formData.middleName || ""}
                                                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
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
                                                <Label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.dateOfBirth ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    Date of Birth {errors.dateOfBirth && "— Required"}
                                                </Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                    <Input
                                                        type="date"
                                                        value={dateOfBirthValue}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, dateOfBirth: e.target.value });
                                                            if (errors.dateOfBirth) setErrors({...errors, dateOfBirth: ""});
                                                        }}
                                                        className={`pl-12 h-14 bg-white/5 border-white/10 rounded-xl transition-all ${errors.dateOfBirth ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.gender ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    Gender {errors.gender && "— Required"}
                                                </Label>
                                                <Select
                                                    value={formData.gender || ""}
                                                    onValueChange={(value) => {
                                                        setFormData({ ...formData, gender: value as 'MALE' | 'FEMALE' });
                                                        if (errors.gender) setErrors({...errors, gender: ""});
                                                    }}
                                                >
                                                    <SelectTrigger className={`h-14 bg-white/5 border-white/10 rounded-xl transition-all ${errors.gender ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MALE">Male</SelectItem>
                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.height ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    Height (cm) {errors.height && `— ${errors.height}`}
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={formData.height || ""}
                                                    placeholder="e.g. 170"
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, height: e.target.value });
                                                        if (errors.height) setErrors({...errors, height: ""});
                                                    }}
                                                    className={`h-14 bg-white/5 border-white/10 rounded-xl transition-all ${errors.height ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Weight (kg)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.weight || ""}
                                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl transition-all"
                                                />
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
                                                <Label
                                                    className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.religion ? 'text-red-500' : 'text-muted-foreground'}`}
                                                >
                                                    Religion {errors.religion && "— Required"}
                                                </Label>
                                                <Select
                                                    value={(formData.religion as string) || ""}
                                                    onValueChange={(value) => {
                                                        setFormData({ ...formData, religion: value });
                                                        if (errors.religion) setErrors({...errors, religion: ""});
                                                    }}
                                                >
                                                    <SelectTrigger className={`h-14 bg-white/5 border-white/10 rounded-xl transition-all ${errors.religion ? 'border-red-500/50 bg-red-500/5' : ''}`}>
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
                                                <Label
                                                    className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.caste ? 'text-red-500' : 'text-muted-foreground'}`}
                                                >
                                                    Caste {errors.caste && "— Required"}
                                                </Label>
                                                <Input
                                                    value={formData.caste || ""}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, caste: e.target.value });
                                                        if (errors.caste) setErrors({...errors, caste: ""});
                                                    }}
                                                    className={`h-14 bg-white/5 border-white/10 rounded-xl transition-all ${errors.caste ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : ''}`}
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
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Birth Place</Label>
                                                <Input
                                                    value={formData.birthPlace || ""}
                                                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Birth Time</Label>
                                                <Input
                                                    type="time"
                                                    value={formData.birthTime || ""}
                                                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-3 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="space-y-0.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Chhattisgarhi Fluency</Label>
                                                    <p className="text-[8px] font-bold text-muted-foreground/40 uppercase">Do you speak Chhattisgarhi?</p>
                                                </div>
                                                <Switch
                                                    checked={formData.speaksChhattisgarhi ?? true}
                                                    onCheckedChange={(checked) => setFormData({ ...formData, speaksChhattisgarhi: checked })}
                                                />
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
                                                <Input
                                                    value={(formData.annualIncome as string) || ""}
                                                    onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                                                    placeholder="e.g. 5 LPA, 8-10 LPA, ₹12,00,000 per year"
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl"
                                                />
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
                                                <Label
                                                    className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.city ? 'text-red-500' : 'text-muted-foreground'}`}
                                                >
                                                    City {errors.city && "— Required"}
                                                </Label>
                                                <Input
                                                    value={formData.city || ""}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, city: e.target.value });
                                                        if (errors.city) setErrors({...errors, city: ""});
                                                    }}
                                                    className={`h-14 bg-white/5 border-white/10 rounded-xl transition-all ${errors.city ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label
                                                    className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${errors.state ? 'text-red-500' : 'text-muted-foreground'}`}
                                                >
                                                    State {errors.state && "— Required"}
                                                </Label>
                                                <Input
                                                    value={formData.state || ""}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, state: e.target.value });
                                                        if (errors.state) setErrors({...errors, state: ""});
                                                    }}
                                                    className={`h-14 bg-white/5 border-white/10 rounded-xl transition-all ${errors.state ? 'border-red-500/50 bg-red-500/5' : ''}`}
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
                                                <div key={item.id || idx} className="relative group aspect-square rounded-[1.5rem] overflow-hidden border-2 border-primary/20 bg-background/50">
                                                    <img src={item.url} alt={String(formData.firstName || 'Profile Photo')} className="w-full h-full object-cover transition-transform group-hover:scale-110" />

                                                    {/* Privacy Controls overlay */}
                                                    <div className="absolute top-2 left-2 flex gap-1">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 border-none">
                                                                    <Shield className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" className="w-56 bg-card/95 backdrop-blur-xl border-white/10 rounded-xl">
                                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Visibility Setting</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => updatePrivacy.mutate({ mediaId: item.id, data: { visibility: 'PUBLIC' } })}>
                                                                    <Eye className="w-4 h-4 mr-2 text-green-400" /> Public
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updatePrivacy.mutate({ mediaId: item.id, data: { visibility: 'REGISTERED' } })}>
                                                                    <User className="w-4 h-4 mr-2 text-blue-400" /> Registered Only
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updatePrivacy.mutate({ mediaId: item.id, data: { visibility: 'MATCHED' } })}>
                                                                    <Heart className="w-4 h-4 mr-2 text-rose-400" /> Matches Only
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => updatePrivacy.mutate({ mediaId: item.id, data: { visibility: 'PRIVATE' } })}>
                                                                    <Lock className="w-4 h-4 mr-2 text-amber-400" /> Private
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-white/5" />
                                                                <DropdownMenuCheckboxItem
                                                                    checked={item.privacySettings?.blurForNonPremium}
                                                                    onCheckedChange={(checked) => updatePrivacy.mutate({ mediaId: item.id, data: { blurForNonPremium: checked } })}
                                                                >
                                                                    Blur for Non-Premium
                                                                </DropdownMenuCheckboxItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <button
                                                        onClick={() => deletePhoto.mutate(item.id)}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all"
                                                    >
                                                        {deletePhoto.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>

                                                    {/* Privacy Indicator */}
                                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg flex items-center gap-1.5 border border-white/5">
                                                        {item.privacySettings?.visibility === 'PRIVATE' ? <Lock className="w-2.5 h-2.5 text-amber-400" /> :
                                                         item.privacySettings?.visibility === 'MATCHED' ? <Heart className="w-2.5 h-2.5 text-rose-400" /> :
                                                         item.privacySettings?.visibility === 'REGISTERED' ? <User className="w-2.5 h-2.5 text-blue-400" /> :
                                                         <Eye className="w-2.5 h-2.5 text-green-400" />}
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">
                                                            {item.privacySettings?.visibility || 'REGISTERED'}
                                                        </span>
                                                    </div>

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

                                {activeSection === "family" && (
                                    <motion.div key="family" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Father's Info */}
                                            <Card className="bg-white/5 border-white/5 rounded-[2rem] p-6 space-y-6">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Father's Details
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Father's Name</Label>
                                                        <Input value={formData.fatherName || ""} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Occupation</Label>
                                                        <Input value={formData.fatherOccupation || ""} onChange={(e) => setFormData({...formData, fatherOccupation: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Status</Label>
                                                        <Select value={formData.fatherStatus || ""} onValueChange={(val) => setFormData({...formData, fatherStatus: val})}>
                                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="EMPLOYED">Employed</SelectItem>
                                                                <SelectItem value="BUSINESS">Business</SelectItem>
                                                                <SelectItem value="RETIRED">Retired</SelectItem>
                                                                <SelectItem value="DECEASED">Deceased</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Mother's Info */}
                                            <Card className="bg-white/5 border-white/5 rounded-[2rem] p-6 space-y-6">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Mother's Details
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mother's Name</Label>
                                                        <Input value={formData.motherName || ""} onChange={(e) => setFormData({...formData, motherName: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Occupation</Label>
                                                        <Input value={formData.motherOccupation || ""} onChange={(e) => setFormData({...formData, motherOccupation: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Status</Label>
                                                        <Select value={formData.motherStatus || ""} onValueChange={(val) => setFormData({...formData, motherStatus: val})}>
                                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="HOMEMAKER">Homemaker</SelectItem>
                                                                <SelectItem value="EMPLOYED">Employed</SelectItem>
                                                                <SelectItem value="BUSINESS">Business</SelectItem>
                                                                <SelectItem value="DECEASED">Deceased</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Siblings */}
                                            <Card className="bg-white/5 border-white/5 rounded-[2rem] p-6 space-y-6 md:col-span-2">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Siblings Information</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brothers</Label>
                                                        <Input type="number" value={formData.numberOfBrothers || 0} onChange={(e) => setFormData({...formData, numberOfBrothers: parseInt(e.target.value)})} className="h-12 bg-white/5 border-white/10 rounded-xl text-center" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Married Bros</Label>
                                                        <Input type="number" value={formData.brothersMarried || 0} onChange={(e) => setFormData({...formData, brothersMarried: parseInt(e.target.value)})} className="h-12 bg-white/5 border-white/10 rounded-xl text-center" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sisters</Label>
                                                        <Input type="number" value={formData.numberOfSisters || 0} onChange={(e) => setFormData({...formData, numberOfSisters: parseInt(e.target.value)})} className="h-12 bg-white/5 border-white/10 rounded-xl text-center" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Married Sisters</Label>
                                                        <Input type="number" value={formData.sistersMarried || 0} onChange={(e) => setFormData({...formData, sistersMarried: parseInt(e.target.value)})} className="h-12 bg-white/5 border-white/10 rounded-xl text-center" />
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Family Values & Background */}
                                            <Card className="bg-white/5 border-white/5 rounded-[2rem] p-6 space-y-6 md:col-span-2">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Family Values & Origin</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Family Type</Label>
                                                        <Select value={formData.familyType || ""} onValueChange={(val) => setFormData({...formData, familyType: val})}>
                                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="NUCLEAR">Nuclear</SelectItem>
                                                                <SelectItem value="JOINT">Joint</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Family Values</Label>
                                                        <Select value={formData.familyValues || ""} onValueChange={(val) => setFormData({...formData, familyValues: val})}>
                                                            <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="TRADITIONAL">Traditional</SelectItem>
                                                                <SelectItem value="MODERATE">Moderate</SelectItem>
                                                                <SelectItem value="LIBERAL">Liberal</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ancestral Origin</Label>
                                                        <Input value={formData.ancestralOrigin || ""} onChange={(e) => setFormData({...formData, ancestralOrigin: e.target.value})} placeholder="e.g. Bilaspur, CG" className="h-12 bg-white/5 border-white/10 rounded-xl" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </motion.div>
                                )}

                                {activeSection === "lifestyle" && (
                                    <motion.div key="lifestyle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                        <Card className="bg-white/5 border-white/5 rounded-[2.5rem] p-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Dietary Habits</Label>
                                                    <Select value={formData.diet || ""} onValueChange={(val) => setFormData({...formData, diet: val})}>
                                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select Diet" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                                                            <SelectItem value="NON_VEGETARIAN">Non-Vegetarian</SelectItem>
                                                            <SelectItem value="EGGETARIAN">Eggetarian</SelectItem>
                                                            <SelectItem value="JAIN">Jain</SelectItem>
                                                            <SelectItem value="VEGAN">Vegan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Smoking Habit</Label>
                                                    <Select value={formData.smokingHabit || ""} onValueChange={(val) => setFormData({...formData, smokingHabit: val})}>
                                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NEVER">Never</SelectItem>
                                                            <SelectItem value="OCCASIONAL">Occasional</SelectItem>
                                                            <SelectItem value="REGULAR">Regular</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Drinking Habit</Label>
                                                    <Select value={formData.drinkingHabit || ""} onValueChange={(val) => setFormData({...formData, drinkingHabit: val})}>
                                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NEVER">Never</SelectItem>
                                                            <SelectItem value="OCCASIONAL">Occasional</SelectItem>
                                                            <SelectItem value="REGULAR">Regular</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Physical Disability</Label>
                                                    <Input value={formData.physicalDisability || ""} onChange={(e) => setFormData({...formData, physicalDisability: e.target.value})} placeholder="None / Specify if any" className="h-14 bg-white/5 border-white/10 rounded-xl" />
                                                </div>
                                            </div>
                                        </Card>

                                        <div className="bg-amber-400/5 border border-amber-400/20 p-8 rounded-[2rem] flex items-center gap-6">
                                            <div className="w-16 h-16 bg-amber-400/10 rounded-[1.5rem] flex items-center justify-center shrink-0">
                                                <Star className="w-8 h-8 text-amber-500 fill-current" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm uppercase tracking-widest text-amber-500">Why Lifestyle Matters?</h4>
                                                <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">Honest lifestyle details help find partners with compatible daily routines, leading to 4x higher success in long-term relationships.</p>
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

                                            {/* Inter-caste & Gothra */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-4">
                                                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-primary/30 transition-all">
                                                    <div className="space-y-1">
                                                        <Label className="text-sm font-black uppercase tracking-widest text-foreground">Open to Inter-caste?</Label>
                                                        <p className="text-[10px] text-muted-foreground font-medium">Show profiles from other castes if they match your criteria.</p>
                                                    </div>
                                                    <Switch
                                                        checked={prefFormData.intercasteAllowed || false}
                                                        onCheckedChange={(val) => setPrefFormData({ ...prefFormData, intercasteAllowed: val })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-primary/30 transition-all">
                                                    <div className="space-y-1">
                                                        <Label className="text-sm font-black uppercase tracking-widest text-foreground">Strict Gothra Filter?</Label>
                                                        <p className="text-[10px] text-muted-foreground font-medium">Automatically avoid profiles with the same Gothra as yours.</p>
                                                    </div>
                                                    <Switch
                                                        checked={prefFormData.gothraMandatory || false}
                                                        onCheckedChange={(val) => setPrefFormData({ ...prefFormData, gothraMandatory: val })}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-primary/30 transition-all">
                                                    <div className="space-y-1">
                                                        <Label className="text-sm font-black uppercase tracking-widest text-foreground">Must Speak Chhattisgarhi?</Label>
                                                        <p className="text-[10px] text-muted-foreground font-medium">Only show me partners who are fluent in Chhattisgarhi.</p>
                                                    </div>
                                                    <Switch
                                                        checked={prefFormData.mustSpeakChhattisgarhi || false}
                                                        onCheckedChange={(val) => setPrefFormData({ ...prefFormData, mustSpeakChhattisgarhi: val })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Lifestyle Preferences */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Preferred Smoking Habit</Label>
                                                    <Select
                                                        value={prefFormData.smoking || "any"}
                                                        onValueChange={(val) => setPrefFormData({ ...prefFormData, smoking: val === "any" ? null : val })}
                                                    >
                                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="any">Does Not Matter</SelectItem>
                                                            <SelectItem value="NEVER">Non-Smoker Only</SelectItem>
                                                            <SelectItem value="OCCASIONAL">Occasional Allowed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Preferred Drinking Habit</Label>
                                                    <Select
                                                        value={prefFormData.drinking || "any"}
                                                        onValueChange={(val) => setPrefFormData({ ...prefFormData, drinking: val === "any" ? null : val })}
                                                    >
                                                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="any">Does Not Matter</SelectItem>
                                                            <SelectItem value="NEVER">Non-Drinker Only</SelectItem>
                                                            <SelectItem value="OCCASIONAL">Occasional Allowed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
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
