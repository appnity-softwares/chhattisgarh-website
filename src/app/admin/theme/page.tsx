'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Smartphone, RefreshCw, Save, CheckCircle2, 
  Sparkles, Zap, Layout, Monitor, MessageSquare, 
  User, Search, Heart, ShieldCheck, Sun, Moon 
} from 'lucide-react';

const DEFAULTS = {
  primaryColor: '#E94057',
  secondaryColor: '#8A2387',
  accentColor: '#F27121',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F8F9FA',
  textPrimary: '#1A1A1A',
  textSecondary: '#757575',
  successColor: '#4CAF50',
  errorColor: '#F44336',
  gradientStart: '#E94057',
  gradientEnd: '#8A2387'
};

const PRESET_THEMES = [
  {
    name: 'Passion Red',
    colors: { ...DEFAULTS, primaryColor: '#E94057', secondaryColor: '#FF99AC', backgroundColor: '#FFFFFF', surfaceColor: '#FFF5F6', textPrimary: '#1A1A1A', textSecondary: '#757575' }
  },
  {
    name: 'Royal Purple',
    colors: { ...DEFAULTS, primaryColor: '#7C3AED', secondaryColor: '#A78BFA', backgroundColor: '#F5F3FF', surfaceColor: '#FFFFFF', textPrimary: '#1E1B4B', textSecondary: '#4338CA' }
  },
  {
    name: 'Midnight Gold',
    colors: { ...DEFAULTS, primaryColor: '#F59E0B', secondaryColor: '#1F2937', backgroundColor: '#111827', surfaceColor: '#1F2937', textPrimary: '#FFFFFF', textSecondary: '#9CA3AF' }
  },
  {
    name: 'Ocean Deep',
    colors: { ...DEFAULTS, primaryColor: '#0ea5e9', secondaryColor: '#7dd3fc', backgroundColor: '#f0f9ff', surfaceColor: '#ffffff', textPrimary: '#0c4a6e', textSecondary: '#0369a1' }
  }
];

const ColorField = ({ keyId, label, theme, onChange, desc }: { keyId: keyof typeof DEFAULTS, label: string, theme: any, onChange: any, desc: string }) => (
  <div className="flex flex-col gap-2.5">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <span className="text-[10px] text-muted-foreground/60 italic">{desc}</span>
    </div>
    <div className="flex gap-4 items-center">
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group transition-transform hover:scale-105 active:scale-95">
        <input
          type="color"
          value={theme[keyId]}
          onChange={(e) => onChange(keyId, e.target.value)}
          className="absolute inset-[-10px] w-24 h-24 border-none cursor-pointer"
        />
      </div>
      <input
        type="text"
        value={theme[keyId].toUpperCase()}
        onChange={(e) => onChange(keyId, e.target.value)}
        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono uppercase text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
      />
    </div>
  </div>
);

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'surface' | 'text'>('brand');
  const [previewScreen, setPreviewScreen] = useState<'feed' | 'profile' | 'chat'>('feed');
  const { toast } = useToast();

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/theme`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data) {
        setTheme({ ...DEFAULTS, ...res.data.data });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load theme settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/theme`, theme, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Success', description: 'App Theme updated globally!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to save theme', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof typeof DEFAULTS, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const generateMagicPalette = () => {
    const primary = theme.primaryColor;
    // Simple magic: assume primary is a brand color, set background to a very light version or dark if needed
    setTheme({
        ...theme,
        secondaryColor: primary + 'CC',
        accentColor: '#F27121',
        surfaceColor: theme.backgroundColor === '#FFFFFF' ? '#F8F9FA' : '#1F2937'
    });
    toast({ title: 'Magic Applied!', description: 'Generated a complementary palette based on your primary color.' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Palette className="w-8 h-8 text-primary" />
            App Branding & Theme
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure the colors of the user mobile app in real-time.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-2xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Publish Theme
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor Pane */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Presets */}
          <div className="bg-card p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Quick Presets
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setTheme(preset.colors);
                    toast({ title: 'Preset Applied', description: `Switched to ${preset.name} theme.` });
                  }}
                  className="group relative h-20 rounded-2xl overflow-hidden border border-white/5 bg-white/5 transition-all hover:border-primary/50 text-left"
                >
                  <div className="absolute inset-0 flex flex-col p-3">
                    <div className="flex gap-1 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.primaryColor }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.secondaryColor }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.backgroundColor }} />
                    </div>
                    <span className="text-[10px] font-bold text-white/70 group-hover:text-white transition-colors uppercase leading-none">{preset.name}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary/10 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Config */}
          <div className="bg-card p-8 rounded-[2rem] shadow-2xl border border-white/5 backdrop-blur-md">
            <div className="flex gap-2 p-1 bg-black/20 rounded-2xl mb-8">
              {[
                { id: 'brand', icon: Zap, label: 'Brand' },
                { id: 'surface', icon: Layout, label: 'UI' },
                { id: 'text', icon: Monitor, label: 'Type' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {activeTab === 'brand' && (
                  <>
                    <ColorField keyId="primaryColor" label="Primary Brand" theme={theme} onChange={handleChange} desc="Main buttons & active states" />
                    <ColorField keyId="secondaryColor" label="Secondary" theme={theme} onChange={handleChange} desc="Accents and secondary actions" />
                    <ColorField keyId="accentColor" label="Highlight" theme={theme} onChange={handleChange} desc="Special focus elements" />
                  </>
                )}
                {activeTab === 'surface' && (
                  <>
                    <ColorField keyId="backgroundColor" label="App Background" theme={theme} onChange={handleChange} desc="Base application background" />
                    <ColorField keyId="surfaceColor" label="Card Surface" theme={theme} onChange={handleChange} desc="User cards & message bubbles" />
                  </>
                )}
                {activeTab === 'text' && (
                  <>
                    <ColorField keyId="textPrimary" label="Primary Text" theme={theme} onChange={handleChange} desc="Headings & large body text" />
                    <ColorField keyId="textSecondary" label="Muted Text" theme={theme} onChange={handleChange} desc="Subtitles & descriptions" />
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-white/5 space-y-3">
              <button
                onClick={generateMagicPalette}
                className="w-full py-3.5 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl text-sm font-bold transition-all border border-primary/20 flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Auto-Magic Palette
              </button>
              <button
                onClick={() => setTheme(DEFAULTS)}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-2xl text-sm font-bold transition-all border border-white/5"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/20 p-8 rounded-[3rem] border border-white/5 flex flex-col items-center pb-16 pt-16 relative overflow-hidden backdrop-blur-sm h-full">
            {/* Background Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />

            {/* Screen Switcher */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
              {[
                { id: 'feed', icon: Search, label: 'Discovery' },
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'chat', icon: MessageSquare, label: 'Messages' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPreviewScreen(s.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${previewScreen === s.id ? 'bg-primary text-white scale-105 shadow-xl shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
            
            {/* Phone Frame */}
            <div 
              className="w-[340px] h-[680px] rounded-[48px] shadow-2xl overflow-hidden relative border-[10px] border-[#121212] ring-1 ring-white/10"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#121212] rounded-b-2xl z-50 flex items-center justify-center">
                <div className="w-10 h-1 bg-[#222] rounded-full" />
              </div>

              {/* Status Bar */}
              <div className="pt-8 px-6 flex justify-between items-center z-40 relative">
                <span className="text-[10px] font-bold" style={{ color: theme.textPrimary }}>9:41</span>
                <div className="flex gap-1.5 items-center">
                  <div className="w-4 h-2 rounded-[2px] border" style={{ borderColor: theme.textSecondary }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.textSecondary }} />
                </div>
              </div>

              {/* App Header */}
              <div className="px-6 py-4 flex justify-between items-center z-40 relative">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: theme.textSecondary }}>CHHATTISGARH</span>
                  <span className="text-xl font-black italic" style={{ color: theme.primaryColor }}>Shaadi</span>
                </div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5">
                   <div className="relative w-7 h-7">
                      <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: theme.primaryColor }} />
                      <div className="relative w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primaryColor + '20' }}>
                         <Heart className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      </div>
                   </div>
                </div>
              </div>

              {/* Content Screens */}
              <div className="h-[520px] overflow-y-auto hide-scrollbar px-5 pb-20">
                {previewScreen === 'feed' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
                    <div className="w-full h-[380px] rounded-[32px] overflow-hidden relative shadow-2xl group">
                      <div className="absolute inset-0 bg-gray-200" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/20">Featured</span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: theme.successColor }}>
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-black text-2xl">Aaradhya S.</h4>
                          <span className="text-white/80 text-xl font-medium">24</span>
                        </div>
                        <p className="text-white/70 text-sm font-medium mb-4 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> Software Engineer • Bhilai, CG
                        </p>
                        <div className="flex gap-3">
                          <button className="flex-1 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-black/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2" style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}>
                            View Profile
                          </button>
                          <button className="w-12 h-12 rounded-2xl flex justify-center items-center shadow-lg shadow-black/20 transition-all hover:scale-105 active:scale-95 text-white" style={{ backgroundColor: theme.accentColor }}>
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-3xl flex flex-col gap-1 border border-white/5" style={{ backgroundColor: theme.surfaceColor }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Matches</span>
                        <span className="text-lg font-black" style={{ color: theme.primaryColor }}>85%</span>
                      </div>
                      <div className="p-4 rounded-3xl flex flex-col gap-1 border border-white/5" style={{ backgroundColor: theme.surfaceColor }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Trust Score</span>
                        <span className="text-lg font-black" style={{ color: theme.successColor }}>High</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {previewScreen === 'profile' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border-[3px] border-primary/20 p-1 mb-3">
                        <div className="w-full h-full rounded-full bg-cover bg-center shadow-xl" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80")' }} />
                      </div>
                      <h3 className="text-xl font-black" style={{ color: theme.textPrimary }}>My Profile</h3>
                      <p className="text-xs" style={{ color: theme.textSecondary }}>Complete your details to find better matches</p>
                    </div>
                    <div className="space-y-3">
                      {['Account Settings', 'Preferences', 'Privacy'].map((item, i) => (
                        <div key={item} className="flex items-center justify-between p-4 rounded-2xl border border-white/5" style={{ backgroundColor: theme.surfaceColor }}>
                          <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>{item}</span>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center opacity-40" style={{ backgroundColor: theme.textSecondary + '20' }}>
                            <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-white rotate-45" style={{ borderColor: theme.textPrimary }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {previewScreen === 'chat' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0" />
                      <div className="p-4 rounded-2xl rounded-tl-none shadow-sm" style={{ backgroundColor: theme.surfaceColor }}>
                        <p className="text-xs font-bold leading-relaxed" style={{ color: theme.textPrimary }}>Hi there! I saw your profile and would love to connect.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div className="p-4 rounded-2xl rounded-tr-none shadow-lg shadow-primary/10" style={{ backgroundColor: theme.primaryColor }}>
                        <p className="text-xs font-bold text-white leading-relaxed">Hello! Thank you for reaching out. I'm interested too.</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="p-3 rounded-2xl border border-dashed border-primary/30 flex items-center justify-center" style={{ backgroundColor: theme.primaryColor + '08' }}>
                        <p className="text-[10px] font-bold text-primary italic">Awaiting response...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div 
                className="absolute bottom-0 w-full h-[84px] pt-4 pb-8 flex justify-around items-center px-6"
                style={{ backgroundColor: theme.backgroundColor, borderTop: '1px solid ' + (theme.backgroundColor === '#FFFFFF' ? '#F0F0F0' : theme.backgroundColor + '40') }}
              >
                {[
                  { s: 'feed', icon: Search },
                  { s: 'profile', icon: User },
                  { s: 'chat', icon: MessageSquare }
                ].map((m) => (
                  <div key={m.s} className="flex flex-col items-center relative transition-all" style={{ color: previewScreen === m.s ? theme.primaryColor : theme.textSecondary }}>
                    {previewScreen === m.s && <motion.div layoutId="navGlow" className="w-10 h-1 rounded-full absolute -top-4" style={{ backgroundColor: theme.primaryColor }} />}
                    <m.icon className={`w-5.5 h-5.5 ${previewScreen === m.s ? 'scale-110' : 'opacity-60'}`} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 text-center">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Pixel Perfect Mobile View</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
