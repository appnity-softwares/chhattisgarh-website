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
    Lock
} from "lucide-react";
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

export default function SettingsPage() {
    const { toast } = useToast();
    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        whatsapp: true
    });

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        toast({
            title: "Settings Updated",
            description: "Your preferences have been saved.",
        });
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-2 px-1">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-foreground">App <span className="text-primary italic">Settings</span></h1>
                <p className="text-muted-foreground font-light text-lg">Manage your account preferences and privacy controls</p>
            </div>

            <Tabs defaultValue="privacy" className="w-full">
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
                            Account & Safety
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
                                    <Switch defaultChecked />
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Photo Settings</h4>
                                        <p className="text-xs text-muted-foreground font-medium">Only show my photos to accepted matches</p>
                                    </div>
                                    <Switch defaultChecked />
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
                                    <Switch />
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Visit Log</h4>
                                        <p className="text-xs text-muted-foreground font-medium">Let others know when I view their profile</p>
                                    </div>
                                    <Switch defaultChecked />
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
                                <Switch checked={notifications.whatsapp} onCheckedChange={() => handleToggle('whatsapp')} />
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                                    <BellRing className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Desktop Push</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Instantly notify me about activity</p>
                                </div>
                                <Switch checked={notifications.push} onCheckedChange={() => handleToggle('push')} />
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Email Digests</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Weekly summary of top match recommendations</p>
                                </div>
                                <Switch checked={notifications.email} onCheckedChange={() => handleToggle('email')} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Account Content */}
                <TabsContent value="account" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            <Card className="bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2rem] overflow-hidden">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl">
                                                <Globe className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Preferred Language</h4>
                                                <p className="text-xs text-muted-foreground font-medium">Currently set to English & Hindi</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-2xl">
                                                <Lock className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Change Password</h4>
                                                <p className="text-xs text-muted-foreground font-medium">Last updated 2 months ago</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-red-500/5 border border-red-500/10 rounded-[2rem] overflow-hidden">
                                <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center animate-pulse">
                                            <AlertTriangle className="w-8 h-8 text-red-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-black text-lg uppercase tracking-widest text-red-500">Danger Zone</h4>
                                            <p className="text-xs text-muted-foreground font-medium max-w-xs">Permanently delete your profile and all associated data from CG Shaadi.</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black text-xs uppercase tracking-[0.2em] px-8 h-12 rounded-xl border border-red-500/20">
                                        DELETE ACCOUNT
                                    </Button>
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
