'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import adminService from "@/services/admin.service";
import { User } from "@/types/api.types";
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { 
    Loader2, Save, X, User as UserIcon, MapPin, 
    Heart, Briefcase, GraduationCap, Languages, 
    Calendar, Eye, Trash2, Upload
} from "lucide-react";
import { HEIGHT_OPTIONS } from "@/utils/height-utils";
import { Switch } from "@/components/ui/switch";
import { validateProfile, calculateCompleteness, ValidationErrors, CompletenessResult } from "@/utils/profile-validation";
import { cn } from "@/lib/utils";
import { ProfileCompletenessTracker } from "@/components/profile/ProfileCompletenessTracker";
import { ProfilePreviewDialog } from "@/components/profile/ProfilePreviewDialog";const MARITAL_STATUSES = [
    { value: 'NEVER_MARRIED', label: 'Never Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' },
    { value: 'AWAITING_DIVORCE', label: 'Awaiting Divorce' },
];

const RELIGIONS = [
    'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Other'
];

const GENDERS = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
];

const STATES = [
    'Chhattisgarh', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Telangana', 
    'Andhra Pradesh', 'Delhi', 'Uttar Pradesh', 'Rajasthan', 'Gujarat'
];

export default function ProfileEditorPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const { toast } = useToast();
    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPhotoUploading, setIsPhotoUploading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [completeness, setCompleteness] = useState<CompletenessResult>(calculateCompleteness({}));
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        maritalStatus: 'NEVER_MARRIED',
        religion: 'Hindu',
        caste: '',
        motherTongue: 'Hindi',
        bio: '',
        city: '',
        state: 'Chhattisgarh',
        country: 'India',
        height: '',
        weight: '',
        education: '',
        isVerified: false,
        isPublished: true,
        // Added matching fields
        annualIncome: '',
        fatherOccupation: '',
        familyIncome: '',
        speaksChhattisgarhi: true,
        nativeVillage: '',
        category: '',
        subCaste: '',
        occupation: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const userData = await adminService.getUserById(userId);
                setUser(userData);
                if (userData.profile) {
                    setHasProfile(true);
                    const p = userData.profile;
                    setFormData({
                        firstName: p.firstName || '',
                        middleName: p.middleName || '',
                        lastName: p.lastName || '',
                        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
                        gender: p.gender || 'MALE',
                        maritalStatus: p.maritalStatus || 'NEVER_MARRIED',
                        religion: p.religion || 'Hindu',
                        caste: p.caste || '',
                        motherTongue: p.motherTongue || 'Hindi',
                        bio: p.bio || '',
                        city: p.city || '',
                        state: p.state || 'Chhattisgarh',
                        country: p.country || 'India',
                        height: (p as unknown).height || '',
                        weight: (p as unknown).weight || '',
                        education: (p as unknown).education || '',
                        isVerified: p.isVerified || false,
                        isPublished: p.isPublished || true,
                        annualIncome: p.annualIncome || '',
                        fatherOccupation: p.fatherOccupation || '',
                        familyIncome: p.familyIncome || '',
                        speaksChhattisgarhi: p.speaksChhattisgarhi ?? true,
                        nativeVillage: p.nativeVillage || '',
                        category: p.category || '',
                        subCaste: p.subCaste || '',
                        occupation: (p as unknown).occupation || ''
                    });
                }
            } catch (err: unknown) {
                toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load user data' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId, toast]);

    useEffect(() => {
        setCompleteness(calculateCompleteness(formData));
    }, [formData]);

    const isFormIncomplete = !formData.firstName || !formData.dateOfBirth || !formData.gender || !formData.religion || !formData.city || !formData.state;

    const handleSave = async () => {
        const validation = validateProfile(formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            toast({ 
                variant: 'destructive', 
                title: 'Validation Failed', 
                description: 'Please fix the errors before saving.' 
            });
            
            // Scroll to first error
            const firstErrorField = Object.keys(validation.errors)[0];
            const element = document.getElementsByName(firstErrorField)[0];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
            return;
        }

        setErrors({});
        setIsSaving(true);
        try {
            if (hasProfile) {
                await adminService.updateProfile(userId, formData);
                toast({ title: 'Success', description: 'Profile updated successfully' });
            } else {
                await adminService.createProfile(userId, formData);
                toast({ title: 'Success', description: 'Profile created successfully' });
            }
            router.push(`/admin/users/${userId}`);
        } catch (err: unknown) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to save profile' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;
        setIsDeleting(true);
        try {
            await adminService.deleteProfile(userId);
            toast({ title: 'Success', description: 'Profile deleted successfully' });
            router.push(`/admin/users/${userId}`);
        } catch (err: unknown) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to delete profile' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsPhotoUploading(true);
        try {
            const _result = await adminService.uploadProfilePhoto(userId, file);
            toast({ title: 'Success', description: 'Profile photo uploaded successfully' });
            // Refresh local user data to show new photo
            const userData = await adminService.getUserById(userId);
            setUser(userData);
        } catch (err: unknown) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
        } finally {
            setIsPhotoUploading(false);
        }
    };

    if (isLoading) {
        return (
            <AdminPageWrapper>
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading Profile Editor...</p>
                </div>
            </AdminPageWrapper>
        );
    }

    return (
        <AdminPageWrapper>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground uppercase tracking-tight flex items-center gap-3">
                            <UserIcon className="w-8 h-8 text-primary" />
                            {hasProfile ? 'Edit' : 'Create'} <span className="text-primary">Profile</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">
                            Current User: <span className="text-foreground font-bold">{user?.email}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsPreviewOpen(true)} 
                            className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold"
                        >
                            <Eye className="w-4 h-4 mr-2" /> Preview
                        </Button>
                        <Button variant="outline" onClick={() => router.back()} className="border-border bg-background">
                           <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || isFormIncomplete} 
                            className={cn(
                                "bg-primary hover:bg-primary/90 text-white gap-2 font-bold px-8 transition-all",
                                isFormIncomplete && "opacity-50 cursor-not-allowed grayscale"
                            )}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {hasProfile ? 'Update Profile' : 'Create Profile'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Form Sections */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Section 1: Identity */}
                        <Card className="bg-card/40 border-border backdrop-blur-md">
                            <CardHeader>
                                <CardDescription className="text-xs flex items-center gap-2">
                           <span className={cn(
                               "px-2 py-0.5 rounded-full font-bold",
                               completeness.total > 80 ? "bg-success/10 text-success" : 
                               completeness.total > 50 ? "bg-gold/20 text-primaryDark" : 
                               "bg-error/10 text-error"
                           )}>
                               Profile Strength: {completeness.total}%
                           </span>
                        </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className={cn("text-[10px] uppercase font-bold", errors.firstName ? "text-error" : "text-muted-foreground")}>First Name *</Label>
                                        <Input 
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            className={cn("bg-background border-border", errors.firstName && "border-error/25 bg-error/10")}
                                            placeholder="Aaradhya"
                                        />
                                        {errors.firstName && <p className="text-[10px] text-error font-bold uppercase">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Middle Name</Label>
                                        <Input 
                                            value={formData.middleName}
                                            onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                                            className="bg-background border-border"
                                            placeholder="Kumar"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={cn("text-[10px] uppercase font-bold", errors.lastName ? "text-error" : "text-muted-foreground")}>Last Name</Label>
                                        <Input 
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            className={cn("bg-background border-border", errors.lastName && "border-error/25 bg-error/10")}
                                            placeholder="Sharma"
                                        />
                                        {errors.lastName && <p className="text-[10px] text-error font-bold uppercase">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className={cn("text-[10px] uppercase font-bold flex items-center gap-1", errors.dateOfBirth ? "text-error" : "text-muted-foreground")}>
                                            <Calendar className="w-3 h-3" /> Date of Birth *
                                        </Label>
                                        <Input 
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                            className={cn("bg-background border-border", errors.dateOfBirth && "border-error/25 bg-error/10")}
                                        />
                                        {errors.dateOfBirth && <p className="text-[10px] text-error font-bold uppercase">{errors.dateOfBirth}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={cn("text-[10px] uppercase font-bold", errors.gender ? "text-error" : "text-muted-foreground")}>Gender *</Label>
                                        <Select name="gender" value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                                            <SelectTrigger className={cn("bg-background border-border h-10", errors.gender && "border-error/25 bg-error/10")}>
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-[10px] text-error font-bold uppercase">{errors.gender}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2: Social & Religious */}
                        <Card className="bg-card/40 border-border backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-error" /> Background
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Marital Status</Label>
                                        <Select value={formData.maritalStatus} onValueChange={(v) => setFormData({...formData, maritalStatus: v})}>
                                            <SelectTrigger className="bg-background border-border h-10">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {MARITAL_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={cn("text-[10px] uppercase font-bold", errors.religion ? "text-error" : "text-muted-foreground")}>Community / Religion *</Label>
                                        <Select name="religion" value={formData.religion} onValueChange={(v) => setFormData({...formData, religion: v})}>
                                            <SelectTrigger className={cn("bg-background border-border h-10", errors.religion && "border-error/25 bg-error/10")}>
                                                <SelectValue placeholder="Select Religion" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {RELIGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.religion && <p className="text-[10px] text-error font-bold uppercase">{errors.religion}</p>}
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Caste / Sub-caste</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={formData.caste}
                                                onChange={(e) => setFormData({...formData, caste: e.target.value})}
                                                className="bg-background border-border"
                                                placeholder="Caste"
                                            />
                                            <Input 
                                                value={formData.subCaste}
                                                onChange={(e) => setFormData({...formData, subCaste: e.target.value})}
                                                className="bg-background border-border"
                                                placeholder="Sub-caste"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                            <Languages className="w-3 h-3" /> Mother Tongue
                                        </Label>
                                        <Input 
                                            value={formData.motherTongue}
                                            onChange={(e) => setFormData({...formData, motherTongue: e.target.value})}
                                            className="bg-background border-border"
                                            placeholder="Chhattisgarhi, Hindi, etc."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Native Village</Label>
                                        <Input 
                                            value={formData.nativeVillage}
                                            onChange={(e) => setFormData({...formData, nativeVillage: e.target.value})}
                                            className="bg-background border-border"
                                            placeholder="Village Name"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6 px-1">
                                        <Switch 
                                            checked={formData.speaksChhattisgarhi}
                                            onCheckedChange={(v) => setFormData({...formData, speaksChhattisgarhi: v})}
                                        />
                                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Speaks Chhattisgarhi</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 3: Professional & Bio */}
                        <Card className="bg-card/40 border-border backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" /> Career & About
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3" /> Education
                                        </Label>
                                         <Input 
                                            value={formData.education}
                                            onChange={(e) => setFormData({...formData, education: e.target.value})}
                                            className="bg-background border-border"
                                            placeholder="B.Tech, MBA, etc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Occupation</Label>
                                        <Input 
                                            value={formData.occupation}
                                            onChange={(e) => setFormData({...formData, occupation: (e.target as unknown).value})}
                                            className="bg-background border-border"
                                            placeholder="Software Developer"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Annual Income</Label>
                                        <Input 
                                            value={formData.annualIncome}
                                            onChange={(e) => setFormData({...formData, annualIncome: e.target.value})}
                                            className="bg-background border-border"
                                            placeholder="e.g. 5 LPA, 8-10 LPA, ₹12,00,000 per year"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Father&apos;s Occupation</Label>
                                        <Input 
                                            value={formData.fatherOccupation}
                                            onChange={(e) => setFormData({...formData, fatherOccupation: e.target.value})}
                                            className="bg-background border-border"
                                            placeholder="Business, Service, etc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Family Income</Label>
                                        <Input 
                                            value={formData.familyIncome}
                                            onChange={(e) => setFormData({...formData, familyIncome: e.target.value})}
                                            className="bg-background border-border"
                                            placeholder="Annual Family Income"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Bio / About Me</Label>
                                    <Textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="bg-background border-border min-h-[120px]"
                                        placeholder="Tell something about the personality, interests, and family background..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sidebar Options */}
                    <div className="space-y-6">
                        {/* Section 0: Profile Photo */}
                        <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden">
                             <div className="aspect-square w-full relative group">
                                {user?.profilePicture ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img 
                                        src={user.profilePicture} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-background flex flex-col items-center justify-center gap-3">
                                        <UserIcon className="w-12 h-12 text-muted-foreground/30" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Photo</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                                    <div className="text-center">
                                        <p className="text-foreground text-[11px] font-bold uppercase tracking-tight mb-3">Update Profile Photo</p>
                                        <label className="cursor-pointer">
                                            <div className={cn(
                                                "bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95",
                                                isPhotoUploading && "opacity-50 pointer-events-none"
                                            )}>
                                                {isPhotoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                {isPhotoUploading ? 'Uploading...' : 'Choose File'}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                    </div>
                                </div>
                             </div>
                             <div className="p-4 border-t border-border flex items-center justify-between">
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                    user?.profilePicture ? "bg-success/10 text-success" : "bg-error/10 text-error"
                                )}>
                                    {user?.profilePicture ? 'Current Avatar Set' : 'Missing Photo'}
                                </span>
                                {user?.profilePicture && (
                                    <button className="text-error hover:text-error transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                             </div>
                        </Card>

                        {/* Section 4: Location */}
                        <Card className="bg-card/40 border-border backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primaryDark" /> Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className={cn("text-[10px] uppercase font-bold", errors.height ? "text-error" : "text-muted-foreground")}>Height</Label>
                                    <Select value={formData.height?.toString()} onValueChange={(v) => setFormData({...formData, height: v})}>
                                        <SelectTrigger className={cn("bg-background border-border h-10", errors.height && "border-error/25 bg-error/10")}>
                                            <SelectValue placeholder="Select Height" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border max-h-[300px]">
                                            {HEIGHT_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.height && <p className="text-[10px] text-error font-bold uppercase">{errors.height}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-primaryDark" /> Location
                                    </Label>
                                </div>
                                <div className="space-y-2">
                                    <Label className={cn("text-[10px] uppercase font-bold", errors.city ? "text-error" : "text-muted-foreground")}>City *</Label>
                                    <Input 
                                        name="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        className={cn("bg-background border-border", errors.city && "border-error/25 bg-error/10")}
                                        placeholder="Raipur"
                                    />
                                    {errors.city && <p className="text-[10px] text-error font-bold uppercase">{errors.city}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className={cn("text-[10px] uppercase font-bold", errors.state ? "text-error" : "text-muted-foreground")}>State *</Label>
                                    <Select name="state" value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                                        <SelectTrigger className={cn("bg-background border-border h-10", errors.state && "border-error/25 bg-error/10")}>
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.state && <p className="text-[10px] text-error font-bold uppercase">{errors.state}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Country</Label>
                                    <Input 
                                        value={formData.country}
                                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        className="bg-background border-border"
                                        placeholder="India"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 5: Admin Controls */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-bold text-foreground">Trust Verified</Label>
                                        <p className="text-[9px] text-muted-foreground uppercase">Show blue badge</p>
                                    </div>
                                    <Switch 
                                        checked={formData.isVerified}
                                        onCheckedChange={(v) => setFormData({...formData, isVerified: v})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-bold text-foreground">Live Status</Label>
                                        <p className="text-[9px] text-muted-foreground uppercase">Visibility in app</p>
                                    </div>
                                    <Switch 
                                        checked={formData.isPublished}
                                        onCheckedChange={(v) => setFormData({...formData, isPublished: v})}
                                    />
                                </div>

                                {hasProfile && (
                                    <div className="pt-4 border-t border-primary/10">
                                        <Button 
                                            variant="ghost" 
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="w-full text-error hover:text-error hover:bg-error/10 gap-2 font-bold text-xs uppercase tracking-widest"
                                        >
                                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                            Delete Profile
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ProfileCompletenessTracker data={completeness} />

            <ProfilePreviewDialog 
                isOpen={isPreviewOpen} 
                onClose={() => setIsPreviewOpen(false)} 
                data={formData}
                completeness={completeness}
            />
        </AdminPageWrapper>
    );
}
