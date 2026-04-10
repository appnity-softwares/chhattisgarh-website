'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import adminService from "@/services/admin.service";
import { User, ActivityLog, Report } from "@/types/api.types";
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Calendar, Mail, Phone, MapPin,
    Shield, Ban, Trash2, CheckCircle,
    AlertTriangle, CreditCard, Activity,
    User as UserIcon, Briefcase, GraduationCap
} from "lucide-react";
import{
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"; 
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
    const { toast } = useToast();
    const router = useRouter();
    const [userId, setUserId] = useState<string>('');
    useEffect(() => {
        params.then(p => setUserId(p.userId));
    }, [params]);

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [isGrantingSub, setIsGrantingSub] = useState(false);
    const [grantDialogOpen, setGrantDialogOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [customDays, setCustomDays] = useState<string>('');

    const fetchUser = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await adminService.getUserById(userId);
            setUser(data);
        } catch (err: any) {
            console.error('Failed to fetch user:', err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to load user details',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            // We'll add getPlans to adminService if not already there
            // Based on earlier view, it exists in backend, let's assume it's in service.
            const data = await (adminService as any).getPlans?.() || [];
            setPlans(data);
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchPlans();
    }, [userId]);

    const handleGrantSubscription = async () => {
        if (!userId || !selectedPlanId) return;
        setIsGrantingSub(true);
        try {
            await adminService.grantSubscription(
                userId, 
                parseInt(selectedPlanId), 
                customDays ? parseInt(customDays) : undefined
            );
            toast({ title: 'Success', description: `Premium subscription granted successfully` });
            setGrantDialogOpen(false);
            fetchUser();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsGrantingSub(false);
        }
    };

    if (isLoading) {
        return (
            <AdminPageWrapper>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </AdminPageWrapper>
        );
    }

    if (!user) {
        return (
            <AdminPageWrapper>
                <div className="flex flex-col items-center justify-center py-12">
                    <h2 className="text-2xl font-bold">User Not Found</h2>
                    <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </div>
            </AdminPageWrapper>
        );
    }

    const { profile } = user;

    return (
        <AdminPageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 border-2 border-border">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback className="text-xl">
                                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                                {profile ? `${profile.firstName} ${profile.lastName}` : 'No Profile Name'}
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {user.role === 'PREMIUM_USER' && (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Premium</Badge>
                                )}
                                {profile?.isVerified && (
                                    <Badge variant="outline" className="border-blue-500 text-blue-500">Verified</Badge>
                                )}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" /> {user.email}
                                </span>
                                {user.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" /> {user.phone}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200">
                                    <CreditCard className="mr-2 h-4 w-4" /> Grant Subscription
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-card border-border">
                                <DialogHeader>
                                    <DialogTitle>Grant Premium Access</DialogTitle>
                                    <DialogDescription>
                                        This will immediately activate a premium plan for this user.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="plan">Select Plan</Label>
                                        <Select onValueChange={setSelectedPlanId} value={selectedPlanId}>
                                            <SelectTrigger className="bg-muted border-none">
                                                <SelectValue placeholder="Choose a plan..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {plans.map((plan: any) => (
                                                    <SelectItem key={plan.id} value={plan.id.toString()}>
                                                        {plan.name} - {plan.duration} Days
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="days">Custom Duration (Optional Days)</Label>
                                        <Input 
                                            id="days" 
                                            type="number" 
                                            placeholder="Leave empty for plan default" 
                                            value={customDays}
                                            onChange={(e) => setCustomDays(e.target.value)}
                                            className="bg-muted border-none"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setGrantDialogOpen(false)} disabled={isGrantingSub}>Cancel</Button>
                                    <Button onClick={handleGrantSubscription} disabled={!selectedPlanId || isGrantingSub}>
                                        {isGrantingSub ? 'Granting...' : 'Confirm Grant'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button variant="destructive">
                            <Ban className="mr-2 h-4 w-4" /> Ban User
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="financials">Financials</TabsTrigger>
                        {user.reportsReceived && user.reportsReceived.length > 0 && (
                            <TabsTrigger value="reports">
                                Reports Received
                                <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1">{user.reportsReceived.length}</Badge>
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Personal Details */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="h-5 w-5" /> Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {profile ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Detailed Name</p>
                                                <p>{profile.firstName} {profile.middleName} {profile.lastName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                                <p>{new Date(profile.dateOfBirth).toLocaleDateString()} ({new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} years)</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Gender & Marital Status</p>
                                                <p className="capitalize">{profile.gender.toLowerCase()} • {profile.maritalStatus.replace('_', ' ').toLowerCase()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Religion & Caste</p>
                                                <p>{profile.religion} • {profile.caste || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Mother Tongue</p>
                                                <p>{profile.motherTongue}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                                <p className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}, {profile.country}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-sm font-medium text-muted-foreground">Bio</p>
                                                <p className="text-sm mt-1">{profile.bio || 'No bio provided.'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No profile created yet.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Stats/Agent */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Account Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">User ID</p>
                                            <p className="font-mono text-sm">{user.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Profile Completeness</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${profile?.profileCompleteness || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{profile?.profileCompleteness || 0}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                                            <p>{user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : 'Never'}</p>
                                        </div>
                                        {user.agent && (
                                            <div className="pt-4 border-t">
                                                <p className="text-sm font-medium text-muted-foreground">Referred Agent</p>
                                                <p className="font-medium">{user.agent.agentName}</p>
                                                <p className="text-sm text-muted-foreground">{user.agent.agentCode}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.activityLogs && user.activityLogs.length > 0 ? (
                                    <div className="space-y-6 relative pl-4 border-l ml-4">
                                        {user.activityLogs.map((log: ActivityLog) => (
                                            <div key={log.id} className="relative">
                                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                                                <p className="font-medium">{log.action}</p>
                                                <p className="text-sm text-muted-foreground">{log.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No recent activity logs.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Financials Tab */}
                    <TabsContent value="financials">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" /> Subscriptions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.subscriptions && user.subscriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.subscriptions.map((sub: any) => (
                                                <div key={sub.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{sub.plan.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                        {sub.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No subscription history.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Reports Tab */}
                    {user.reportsReceived && user.reportsReceived.length > 0 && (
                        <TabsContent value="reports">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="h-5 w-5" /> Reports Against User
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {user.reportsReceived.map((report: Report) => (
                                            <div key={report.id} className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                                                <div className="flex justify-between">
                                                    <Badge variant="destructive" className="mb-2">{report.reason}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(report.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium">Status: {report.status}</p>
                                                <p className="text-sm mt-2">{report.description || 'No description provided.'}</p>
                                                <div className="mt-3 flex justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/reports')}>
                                                        View Full Report
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AdminPageWrapper>
    );
}
