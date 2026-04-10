"use client";

import { motion } from "framer-motion";
import { 
    Shield, 
    BellRing, 
    UserCog, 
    HelpCircle, 
    AlertTriangle,
    CheckCircle2,
    ShieldCheck,
    Smartphone,
    Mail,
    Globe,
    ChevronRight,
    Trash2,
    Lock,
    Loader2,
    MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserAuthStore } from "@/stores/user-auth-store";
import apiConfig, { getAuthHeaders } from "@/lib/api.config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
    Tabs, 
    TabsList, 
    TabsTrigger, 
    TabsContent 
} from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { accessToken, logout: logoutStore } = useUserAuthStore();
    const { settings, isLoading, updatePrivacy, updateNotifications } = useSettings();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState("privacy");

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast({
                title: "Type DELETE",
                description: "Please type DELETE to confirm account deletion.",
                variant: "destructive",
            });
            return;
        }
        
        setIsDeleting(true);
        try {
            const res = await fetch(`${apiConfig.baseUrl}/users/me`, {
                method: 'DELETE',
                headers: getAuthHeaders(accessToken || ''),
            });
            const data = await res.json();
            
            if (res.ok) {
                logoutStore();
                toast({
                    title: "Account Deleted",
                    description: "Your account has been permanently deleted.",
                });
                router.push("/login");
            } else {
                throw new Error(data.message || 'Failed to delete account');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete account.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setDeleteConfirmText("");
        }
    };

    const handleToggleNotification = (key: 'push' | 'email' | 'whatsapp') => {
        if (!settings) return;
        updateNotifications.mutate({
            [key]: !settings.notifications[key]
        });
    };

    const handleTogglePrivacy = (key: string) => {
        if (!settings) return;
        updatePrivacy.mutate({
            [key]: !settings.privacy[key as keyof typeof settings.privacy]
        });
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
            <div className="space-y-2 px-1">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">App <span className="text-primary italic">Settings</span></h1>
                <p className="text-muted-foreground font-light text-lg">Manage your account preferences and privacy controls</p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex border-b border-white/5 pb-0 mb-8 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent border-none p-0 h-auto gap-10">
                        <TabsTrigger 
                            value="privacy" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4" />
                            Privacy Settings
                        </TabsTrigger>
                        <TabsTrigger 
                            value="notifications" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all flex items-center gap-2"
                        >
                            <BellRing className="w-4 h-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger 
                            value="account" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all flex items-center gap-2"
                        >
                            <UserCog className="w-4 h-4" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger 
                            value="security" 
                            className="bg-transparent border-none p-0 pb-4 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none transition-all flex items-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            Security
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Privacy Content */}
                <TabsContent value="privacy" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Profile Visibility</h4>
                                        <p className="text-xs text-muted-foreground font-medium">Keep my profile private from search engines</p>
                                    </div>
                                    <Switch checked={settings?.privacy.profileVisibility} onCheckedChange={() => handleTogglePrivacy('profileVisibility')} />
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Photo Settings</h4>
                                        <p className="text-xs text-muted-foreground font-medium">Only show my photos to accepted matches</p>
                                    </div>
                                    <Switch checked={settings?.privacy.showPhotosToAcceptedOnly} onCheckedChange={() => handleTogglePrivacy('showPhotosToAcceptedOnly')} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Contact Privacy</h4>
                                        <p className="text-xs text-muted-foreground font-medium">Only premium members can see my phone</p>
                                    </div>
                                    <Switch checked={settings?.privacy.contactPrivacy} onCheckedChange={() => handleTogglePrivacy('contactPrivacy')} />
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Visit Log</h4>
                                        <p className="text-xs text-muted-foreground font-medium">Let others know when I view their profile</p>
                                    </div>
                                    <Switch checked={settings?.privacy.showVisitLog} onCheckedChange={() => handleTogglePrivacy('showVisitLog')} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex items-center gap-4 mx-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest text-foreground">Your data is encrypted</p>
                            <p className="text-xs text-muted-foreground font-medium">We never share your personal information with third party advertisers.</p>
                        </div>
                    </div>
                </TabsContent>

                {/* Notifications Content */}
                <TabsContent value="notifications" className="space-y-8">
                    <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden max-w-2xl">
                        <CardContent className="p-10 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                    <Smartphone className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">WhatsApp Alerts</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Get match alerts & messages on WhatsApp</p>
                                </div>
                                <Switch checked={settings?.notifications.whatsapp} onCheckedChange={() => handleToggleNotification('whatsapp')} />
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                                    <BellRing className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Desktop Push</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Instantly notify me about activity</p>
                                </div>
                                <Switch checked={settings?.notifications.push} onCheckedChange={() => handleToggleNotification('push')} />
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Email Digests</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Weekly summary of top match recommendations</p>
                                </div>
                                <Switch checked={settings?.notifications.email} onCheckedChange={() => handleToggleNotification('email')} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Content */}
                <TabsContent value="security" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-primary" />
                                        Login Security
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs text-white font-bold">Two-Factor Authentication</p>
                                            <p className="text-[10px] text-muted-foreground">Receive a code via SMS on login</p>
                                        </div>
                                        <Switch checked={true} disabled />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs text-white font-bold">Email Notifications</p>
                                            <p className="text-[10px] text-muted-foreground">Alert me of new logins</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                                <Button className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] rounded-xl">CHANGE PASSWORD</Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-8 space-y-6">
                                <h4 className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-primary" />
                                    Active Sessions
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { device: "MacBook Pro", location: "Raipur, India", status: "Active Now" },
                                        { device: "iPhone 15", location: "Bhilai, India", status: "2 days ago" }
                                    ].map((session, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div>
                                                <p className="text-xs font-bold text-white">{session.device}</p>
                                                <p className="text-[10px] text-muted-foreground">{session.location} • {session.status}</p>
                                            </div>
                                            {i > 0 && <Button variant="ghost" className="text-[10px] font-black uppercase text-primary hover:bg-primary/10 rounded-lg">Revoke</Button>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Account Content */}
                <TabsContent value="account" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2rem] overflow-hidden">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab('privacy')}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl">
                                                <Globe className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Search Visibility</h4>
                                                <p className="text-xs text-muted-foreground font-medium">Control who can find your profile</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl">
                                                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Communication Rules</h4>
                                                <p className="text-xs text-muted-foreground font-medium">Manage message and call permissions</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-red-500/5 border border-red-500/10 rounded-[2rem] overflow-hidden">
                                <CardContent className="p-10 space-y-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center animate-pulse">
                                                <AlertTriangle className="w-8 h-8 text-red-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-lg uppercase tracking-widest text-red-500">Danger Zone</h4>
                                                <p className="text-xs text-muted-foreground font-medium max-w-xs">Permanently delete your profile and all associated data from CG Shaadi.</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-xs uppercase tracking-[0.2em] px-8 h-12 rounded-xl border border-red-500/20"
                                        >
                                            DELETE ACCOUNT
                                        </Button>
                                    </div>
                                    
                                    {showDeleteConfirm && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }} 
                                            className="border-t border-red-500/10 pt-6 space-y-4"
                                        >
                                            <p className="text-sm text-red-400 font-bold">⚠️ This action is irreversible. All your data, matches, messages, and photos will be permanently deleted.</p>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Type DELETE to confirm"
                                                    value={deleteConfirmText}
                                                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                                                    className="flex-1 h-12 px-4 bg-red-500/5 border border-red-500/20 rounded-xl text-sm font-black text-red-400 placeholder:text-red-400/40 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                                />
                                                <Button
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                                    className="h-12 px-8 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-30"
                                                >
                                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONFIRM DELETE'}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <Card className="bg-primary/10 border-primary/20 rounded-[2rem] overflow-hidden text-center p-8">
                                <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-4">Premium Support</h4>
                                <p className="text-xs font-medium text-foreground/80 mb-6 leading-relaxed">Dedicated matchmakers available for premium members 24/7.</p>
                                <Button className="w-full bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl h-12 shadow-lg shadow-primary/20">
                                    UPGRADE NOW
                                </Button>
                            </Card>

                            <div className="text-center space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">App Version v1.0.1 Stable</p>
                                <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest">Built with love in Chhattisgarh</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
