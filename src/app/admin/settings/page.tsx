'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { configService, SystemConfig } from '@/services/config.service';
import { Loader2, Save, Palette, Settings, Globe, ShieldCheck, CheckCircle2, XCircle, Layout, MessageSquare, UserPlus, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const hexToHsl = (hex: string): string => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(s => s + s).join('');
    
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

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
        name: 'Chhattisgarh Shaadi',
        slogan: "Chhattisgarh's #1 Matrimony App",
        description: 'Find your perfect life partner in Chhattisgarh.',
        supportEmail: 'support@chhattisgarhshadi.com',
        supportPhone: '+91 99999 88888',
        website: 'https://chhattisgarhshadi.com'
    });

    // Feature Toggles
    const [features, setFeatures] = useState({
        maintenanceMode: false,
        disableChat: false,
        disableSignups: false,
        showTestimonials: true
    });

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const data = await configService.getAllConfigs();
            
            // Map configs to state
            const themeConfig = data.find(c => c.key === 'app_theme');
            if (themeConfig) setTheme(JSON.parse(themeConfig.value));

            const infoConfig = data.find(c => c.key === 'app_info');
            if (infoConfig) setAppInfo(JSON.parse(infoConfig.value));

            const featureConfig = data.find(c => c.key === 'app_features');
            if (featureConfig) setFeatures(JSON.parse(featureConfig.value));

        } catch (error) {
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

    const handleSave = async (key: string, value: any, category: string) => {
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
                    } catch (e) {}
                });
            }
        } catch (error) {
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
                                    <Label>Support Email</Label>
                                    <Input value={appInfo.supportEmail} disabled className="bg-slate-50" />
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
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Status</CardTitle>
                                <CardDescription>Control the availability of your platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base flex items-center">
                                            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                                            Maintenance Mode
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Disable the app for users during updates.</p>
                                    </div>
                                    <Switch 
                                        checked={features.maintenanceMode} 
                                        onCheckedChange={(val) => setFeatures({...features, maintenanceMode: val})} 
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base flex items-center">
                                            <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                                            New User Signups
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Temporarily stop new registrations.</p>
                                    </div>
                                    <Switch 
                                        checked={!features.disableSignups} 
                                        onCheckedChange={(val) => setFeatures({...features, disableSignups: !val})} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Module Control</CardTitle>
                                <CardDescription>Enable or disable specific features of the app.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base flex items-center">
                                            <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                                            Chat System
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Allow users to message each other in real-time.</p>
                                    </div>
                                    <Switch 
                                        checked={!features.disableChat} 
                                        onCheckedChange={(val) => setFeatures({...features, disableChat: !val})} 
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base flex items-center">
                                            <Layout className="w-4 h-4 mr-2 text-purple-500" />
                                            User Testimonials
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Display success stories on the home screen.</p>
                                    </div>
                                    <Switch 
                                        checked={features.showTestimonials} 
                                        onCheckedChange={(val) => setFeatures({...features, showTestimonials: val})} 
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <Button onClick={() => handleSave('app_features', features, 'features')} disabled={saving} className="w-full">
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Apply Feature Changes
                                </Button>
                            </CardFooter>
                        </Card>
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
                            <div className="p-4 bg-slate-50 rounded-lg border flex items-start gap-4">
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm">Automated Security Active</h4>
                                    <p className="text-xs text-muted-foreground">Your server is currently handling JWT verification and Rate Limiting automatically.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm text-amber-800">Advanced Lockdown</h4>
                                    <p className="text-xs text-amber-700">Database connection strings and API keys are protected in environment variables and cannot be modified here for safety.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
