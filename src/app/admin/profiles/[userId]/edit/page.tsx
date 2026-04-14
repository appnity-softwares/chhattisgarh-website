'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import adminService from "@/services/admin.service";
import { Profile, User } from "@/types/api.types";
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
    Calendar, ShieldCheck, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const MARITAL_STATUSES = [
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
    const [user, setUser] = useState<User | null>(null);
    const [hasProfile, setHasProfile] = useState(false);

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
        occupation: '',
        education: '',
        isVerified: false,
        isPublished: true
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
                        height: (p as any).height || '',
                        weight: (p as any).weight || '',
                        occupation: (p as any).occupation || '',
                        education: (p as any).education || '',
                        isVerified: p.isVerified || false,
                        isPublished: p.isPublished || true
                    });
                }
            } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load user data' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId, toast]);

    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Date of Birth are required' });
            return;
        }

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
        } catch (err: any) {
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
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to delete profile' });
        } finally {
            setIsDeleting(false);
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
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <UserIcon className="w-8 h-8 text-primary" />
                            {hasProfile ? 'Edit' : 'Create'} <span className="text-primary">Profile</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">
                            Current User: <span className="text-white font-bold">{user?.email}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.back()} className="border-white/10 bg-white/5">
                           <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white gap-2 font-bold px-8">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {hasProfile ? 'Update Profile' : 'Create Profile'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Form Sections */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Section 1: Identity */}
                        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Identity Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">First Name</Label>
                                        <Input 
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            className="bg-white/5 border-white/10"
                                            placeholder="Aaradhya"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Middle Name</Label>
                                        <Input 
                                            value={formData.middleName}
                                            onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                                            className="bg-white/5 border-white/10"
                                            placeholder="Kumar"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Last Name</Label>
                                        <Input 
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            className="bg-white/5 border-white/10"
                                            placeholder="Sharma"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Date of Birth
                                        </Label>
                                        <Input 
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Gender</Label>
                                        <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                                            <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2: Social & Religious */}
                        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-rose-400" /> Background
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Marital Status</Label>
                                        <Select value={formData.maritalStatus} onValueChange={(v) => setFormData({...formData, maritalStatus: v})}>
                                            <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {MARITAL_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Religion</Label>
                                        <Select value={formData.religion} onValueChange={(v) => setFormData({...formData, religion: v})}>
                                            <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                                <SelectValue placeholder="Select Religion" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {RELIGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Caste / Sub-caste</Label>
                                        <Input 
                                            value={formData.caste}
                                            onChange={(e) => setFormData({...formData, caste: e.target.value})}
                                            className="bg-white/5 border-white/10"
                                            placeholder="Sahu, Kurmi, etc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                            <Languages className="w-3 h-3" /> Mother Tongue
                                        </Label>
                                        <Input 
                                            value={formData.motherTongue}
                                            onChange={(e) => setFormData({...formData, motherTongue: e.target.value})}
                                            className="bg-white/5 border-white/10"
                                            placeholder="Chhattisgarhi, Hindi, etc."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 3: Professional & Bio */}
                        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-400" /> Career & About
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
                                            className="bg-white/5 border-white/10"
                                            placeholder="B.Tech, MBA, etc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Occupation</Label>
                                        <Input 
                                            value={formData.occupation}
                                            onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                                            className="bg-white/5 border-white/10"
                                            placeholder="Software Developer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Bio / About Me</Label>
                                    <Textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="bg-white/5 border-white/10 min-h-[120px]"
                                        placeholder="Tell something about the personality, interests, and family background..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sidebar Options */}
                    <div className="space-y-6">
                        {/* Section 4: Location */}
                        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-amber-400" /> Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">City</Label>
                                    <Input 
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        className="bg-white/5 border-white/10"
                                        placeholder="Raipur"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">State</Label>
                                    <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Country</Label>
                                    <Input 
                                        value={formData.country}
                                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        className="bg-white/5 border-white/10"
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
                                        <Label className="text-xs font-bold text-white">Trust Verified</Label>
                                        <p className="text-[9px] text-muted-foreground uppercase">Show blue badge</p>
                                    </div>
                                    <Switch 
                                        checked={formData.isVerified}
                                        onCheckedChange={(v) => setFormData({...formData, isVerified: v})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-bold text-white">Live Status</Label>
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
                                            className="w-full text-red-400 hover:text-red-400 hover:bg-red-500/10 gap-2 font-bold text-xs uppercase tracking-widest"
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
        </AdminPageWrapper>
    );
}
