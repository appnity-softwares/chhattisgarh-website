'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { configService } from '@/services/config.service';
import { getOfflineStatus } from '@/services/mock.data';
import { 
    Loader2, Save, Palette, Settings, Globe, ShieldCheck, CheckCircle2, 
    Layout, MessageSquare, UserPlus, AlertTriangle, 
    Database, Zap, CreditCard, Shield, Smartphone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const hexToHsl = (hex: string): string => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
    
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
};

export default function SettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Theme Colors
    const [theme, setTheme] = useState({
        primary: '#FF9900',
        secondary: '#78B13F',
        background: '#FDFBF7',
        surface: '#FFFFFF',
        text: '#3D2A20',
        muted: '#9C8B7B',
        accent: '#F0C040',
        border: '#D8D3C5'
    });
    
    // General App Info
    const [appInfo, setAppInfo] = useState({
        name: 'Chhattisgarh Shadi',
        slogan: "Chhattisgarh's #1 Matrimony App",
        description: 'Find your perfect life partner in Chhattisgarh.',
        supportEmail: 'chhattisgarhshadi@gmail.com',
        supportPhone: '+91 99999 88888',
        website: 'https://chhattisgarhshadi.com',
        googlePlayUrl: 'https://play.google.com/store/apps',
        apkUrl: '#'
    });

    // Feature Toggles
    const [features, setFeatures] = useState({
        maintenanceMode: false,
        disableChat: false,
        disableSignups: false,
        showTestimonials: true,
        enablePayments: true,
        enableVerification: true,
        enableDiscovery: true,
        enableAgencyLogin: true,
        enableNotifications: true,
        enforceAppUpdate: false
    });

    const [offlineMode, setOfflineMode] = useState(false);

    useEffect(() => {
        setOfflineMode(getOfflineStatus());
        loadConfigs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleOfflineMode = (val: boolean) => {
        setOfflineMode(val);
        localStorage.setItem('APP_OFFLINE_MODE', val ? 'true' : 'false');
        toast({
            title: val ? 'Test Mode Enabled' : 'Production Mode Enabled',
            description: val 
                ? 'App is now using local test data. Refresh to apply changes.' 
                : 'App will now attempt to connect to the live backend API.',
        });
    };

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const data = await configService.getAllConfigs();
            
            // Map configs to state with safe merging
            const themeConfig = data.find(c => c.key === 'app_theme');
            if (themeConfig) setTheme(prev => ({ ...prev, ...JSON.parse(themeConfig.value) }));

            const infoConfig = data.find(c => c.key === 'app_info');
            if (infoConfig) setAppInfo(prev => ({ ...prev, ...JSON.parse(infoConfig.value) }));

            const featureConfig = data.find(c => c.key === 'app_features');
            if (featureConfig) setFeatures(prev => ({ ...prev, ...JSON.parse(featureConfig.value) }));

        } catch (error: unknown) {
            console.error('Failed to load configs:', error);
            toast({
                title: 'Note',
                description: 'Using default settings for now.',
                variant: 'default',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string | Record<string, unknown>, category: string) => {
        try {
            setSaving(true);
            await configService.upsertConfig({
                key,
                value: typeof value === 'string' ? value : JSON.stringify(value),
                category,
                isPublic: true,
                dataType: typeof value === 'string' ? 'string' : 'json'
            });

            toast({
                title: 'Success',
                description: `${key.replace('app_', '').replace('_', ' ')} updated successfully.`,
            });
            
            // Apply theme changes to admin panel immediately
            if (key === 'app_theme') {
                const colors = value as typeof theme;
                Object.entries(colors).forEach(([name, hex]) => {
                    try {
                        const hsl = hexToHsl(hex as string);
                        document.documentElement.style.setProperty(`--${name}`, hsl);
                        if (name === 'primary') {
                            document.documentElement.style.setProperty('--sidebar-primary', hsl);
                            document.documentElement.style.setProperty('--ring', hsl);
                        }
                    } catch {
                        // Ignore hex parsing errors
                    }
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: `Failed to save ${key.replace('app_', '')}.`,
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const ColorPicker = ({ label, value, onChange, description }: { label: string, value: string, onChange: (val: string) => void, description?: string }) => (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <div 
                    className="w-10 h-10 rounded-md border shadow-sm cursor-pointer shrink-0" 
                    style={{ backgroundColor: value }}
                    onClick={() => document.getElementById(`cp-${label}`)?.click()}
                />
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="font-mono text-sm"
                />
                <input 
                    id={`cp-${label}`}
                    type="color" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className="sr-only"
                />
            </div>
            {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Full Control Panel</h1>
                    <p className="text-muted-foreground">Customize every pixel and feature of your Matrimony app.</p>
                </div>
            </div>

            <Tabs defaultValue="theme" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="theme">
                        <Palette className="w-4 h-4 mr-2" />
                        Branding
                    </TabsTrigger>
                    <TabsTrigger value="info">
                        <Globe className="w-4 h-4 mr-2" />
                        App Info
                    </TabsTrigger>
                    <TabsTrigger value="features">
                        <Settings className="w-4 h-4 mr-2" />
                        Features
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Access
                    </TabsTrigger>
                </TabsList>

                {/* THEME & BRANDING */}
                <TabsContent value="theme" className="mt-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Core Design System</CardTitle>
                                <CardDescription>Update the primary colors of the mobile app and admin dashboard.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <ColorPicker 
                                    label="Primary" 
                                    value={theme.primary} 
                                    onChange={(val) => setTheme({...theme, primary: val})} 
                                    description="Main brand color (Buttons, active state)"
                                />
                                <ColorPicker 
                                    label="Secondary" 
                                    value={theme.secondary} 
                                    onChange={(val) => setTheme({...theme, secondary: val})} 
                                    description="Accent brand color (Badges, highlights)"
                                />
                                <ColorPicker 
                                    label="Background" 
                                    value={theme.background} 
                                    onChange={(val) => setTheme({...theme, background: val})} 
                                    description="App main surface background color"
                                />
                                <ColorPicker 
                                    label="Surface/Card" 
                                    value={theme.surface} 
                                    onChange={(val) => setTheme({...theme, surface: val})} 
                                    description="Card and item backgrounds"
                                />
                                <ColorPicker 
                                    label="Main Text" 
                                    value={theme.text} 
                                    onChange={(val) => setTheme({...theme, text: val})} 
                                    description="Primary heading and body text color"
                                />
                                <ColorPicker 
                                    label="Muted Text" 
                                    value={theme.muted} 
                                    onChange={(val) => setTheme({...theme, muted: val})} 
                                    description="Subtitles and secondary text color"
                                />
                                <ColorPicker 
                                    label="Accent/Status" 
                                    value={theme.accent} 
                                    onChange={(val) => setTheme({...theme, accent: val})} 
                                    description="Third color for status or specific highlights"
                                />
                                <ColorPicker 
                                    label="Borders" 
                                    value={theme.border} 
                                    onChange={(val) => setTheme({...theme, border: val})} 
                                    description="Separator and input border colors"
                                />
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <Button onClick={() => handleSave('app_theme', theme, 'theme')} disabled={saving}>
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Deploy Color Changes Everywhere
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Live Mockup</CardTitle>
                                <CardDescription>Preview how users will see your app.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 rounded-xl border border-dashed transition-colors" style={{ backgroundColor: theme.background }}>
                                <div className="p-4 rounded-lg w-full shadow-lg border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme.primary }}>
                                            CG
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold" style={{ color: theme.text }}>Profile Preview</h4>
                                            <p className="text-[10px]" style={{ color: theme.muted }}>Raipur, Chhattisgarh</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="h-2 w-full rounded" style={{ backgroundColor: theme.border }} />
                                        <div className="h-2 w-3/4 rounded" style={{ backgroundColor: theme.border }} />
                                    </div>
                                    <Button className="w-full h-8 text-xs font-bold" style={{ backgroundColor: theme.primary, color: 'white' }}>
                                        Connect Now
                                    </Button>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-[10px] font-bold" style={{ color: theme.secondary }}>Verified Partner</span>
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* APP INFO */}
                <TabsContent value="info" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Identity</CardTitle>
                            <CardDescription>Customize the name, slogans, and contact details shown in the app.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>App Name</Label>
                                    <Input value={appInfo.name} onChange={(e) => setAppInfo({...appInfo, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Marketing Slogan</Label>
                                    <Input value={appInfo.slogan} onChange={(e) => setAppInfo({...appInfo, slogan: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>App Description</Label>
                                    <Textarea rows={4} value={appInfo.description} onChange={(e) => setAppInfo({...appInfo, description: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Support Phone</Label>
                                    <Input value={appInfo.supportPhone} onChange={(e) => setAppInfo({...appInfo, supportPhone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Public Website</Label>
                                    <Input value={appInfo.website} onChange={(e) => setAppInfo({...appInfo, website: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Google Play Store Link</Label>
                                    <Input value={appInfo.googlePlayUrl} onChange={(e) => setAppInfo({...appInfo, googlePlayUrl: e.target.value})} placeholder="https://play.google.com/store/apps/details?id=..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>APK Download Link</Label>
                                    <Input value={appInfo.apkUrl} onChange={(e) => setAppInfo({...appInfo, apkUrl: e.target.value})} placeholder="Direct link to .apk file" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Email</Label>
                                    <Input value={appInfo.supportEmail} disabled className="bg-white/5 border-white/10" />
                                    <p className="text-[10px] text-muted-foreground">Main contact email is locked for security.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Button onClick={() => handleSave('app_info', appInfo, 'general')} disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Information
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* FEATURES TOGGLES */}
                <TabsContent value="features" className="mt-6">
                    <div className="grid gap-6">
                        {/* Operation Mode */}
                        <div className="p-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${offlineMode ? 'bg-orange-500/20' : 'bg-emerald-500/20'}`}>
                                        <Database className={`w-6 h-6 ${offlineMode ? 'text-orange-400' : 'text-emerald-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Operation Environment</h3>
                                        <p className="text-sm text-muted-foreground">Toggle between Local Mock data and Live Production API.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                                    <button 
                                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!offlineMode ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                        onClick={() => toggleOfflineMode(false)}
                                    >
                                        Production
                                    </button>
                                    <button 
                                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${offlineMode ? 'bg-orange-500 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                        onClick={() => toggleOfflineMode(true)}
                                    >
                                        Test Mode
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Status</CardTitle>
                                    <CardDescription>Control the global availability of your platform.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/20">
                                        <div className="space-y-1">
                                            <Label className="text-base font-bold flex items-center text-red-400">
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                Under Maintenance
                                            </Label>
                                            <p className="text-xs text-muted-foreground">Block all users from accessing the app with a system message.</p>
                                        </div>
                                        <Switch 
                                            checked={features.maintenanceMode} 
                                            onCheckedChange={(val) => setFeatures({...features, maintenanceMode: val})} 
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between px-2">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center">
                                                <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                                                New Signups
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Allow or block new registration flows.</p>
                                        </div>
                                        <Switch 
                                            checked={!features.disableSignups} 
                                            onCheckedChange={(val) => setFeatures({...features, disableSignups: !val})} 
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between px-2">
                                        <div className="space-y-0.5">
                                            <Label className="text-base flex items-center">
                                                <Smartphone className="w-4 h-4 mr-2 text-indigo-500" />
                                                Force Update
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Enforce users to update to the latest app version.</p>
                                        </div>
                                        <Switch 
                                            checked={features.enforceAppUpdate} 
                                            onCheckedChange={(val) => setFeatures({...features, enforceAppUpdate: val})} 
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Feature Flags</CardTitle>
                                    <CardDescription>Granular control over available app functionalities.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg"><MessageSquare className="w-4 h-4 text-emerald-400" /></div>
                                            <div>
                                                <Label className="text-sm font-semibold">Real-time Chat</Label>
                                                <p className="text-[10px] text-muted-foreground">Direct messaging system</p>
                                            </div>
                                        </div>
                                        <Switch checked={!features.disableChat} onCheckedChange={(val) => setFeatures({...features, disableChat: !val})} />
                                    </div>

                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-lg"><CreditCard className="w-4 h-4 text-amber-400" /></div>
                                            <div>
                                                <Label className="text-sm font-semibold">Payments & Subs</Label>
                                                <p className="text-[10px] text-muted-foreground">Premium purchasing & Razorpay</p>
                                            </div>
                                        </div>
                                        <Switch checked={features.enablePayments} onCheckedChange={(val) => setFeatures({...features, enablePayments: val})} />
                                    </div>

                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg"><Zap className="w-4 h-4 text-blue-400" /></div>
                                            <div>
                                                <Label className="text-sm font-semibold">Match Discovery</Label>
                                                <p className="text-[10px] text-muted-foreground">Finding and browsing profiles</p>
                                            </div>
                                        </div>
                                        <Switch checked={features.enableDiscovery} onCheckedChange={(val) => setFeatures({...features, enableDiscovery: val})} />
                                    </div>

                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 rounded-lg"><Shield className="w-4 h-4 text-purple-400" /></div>
                                            <div>
                                                <Label className="text-sm font-semibold">KYC Verification</Label>
                                                <p className="text-[10px] text-muted-foreground">AADHAAR/Selfie upload flows</p>
                                            </div>
                                        </div>
                                        <Switch checked={features.enableVerification} onCheckedChange={(val) => setFeatures({...features, enableVerification: val})} />
                                    </div>

                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-pink-500/10 rounded-lg"><Layout className="w-4 h-4 text-pink-400" /></div>
                                            <div>
                                                <Label className="text-sm font-semibold">Testimonials</Label>
                                                <p className="text-[10px] text-muted-foreground">Success stories on home screen</p>
                                            </div>
                                        </div>
                                        <Switch checked={features.showTestimonials} onCheckedChange={(val) => setFeatures({...features, showTestimonials: val})} />
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500/10 rounded-lg"><UserPlus className="w-4 h-4 text-orange-400" /></div>
                                            <div>
                                                <Label className="text-sm font-semibold">Agency Dashboard</Label>
                                                <p className="text-[10px] text-muted-foreground">Allow Agent/Partner logins</p>
                                            </div>
                                        </div>
                                        <Switch checked={features.enableAgencyLogin} onCheckedChange={(val) => setFeatures({...features, enableAgencyLogin: val})} />
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t pt-4">
                                    <Button onClick={() => handleSave('app_features', features, 'features')} disabled={saving} className="w-full">
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save & Sync Feature Flags
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ACCESS & SECURITY */}
                <TabsContent value="security" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Security</CardTitle>
                            <CardDescription>Critical backend and API security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex items-start gap-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm text-emerald-300">Automated Security Active</h4>
                                    <p className="text-xs text-muted-foreground">Your server is currently handling JWT verification and Rate Limiting automatically.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm text-amber-300">Advanced Lockdown</h4>
                                    <p className="text-xs text-muted-foreground">Database connection strings and API keys are protected in environment variables and cannot be modified here.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
