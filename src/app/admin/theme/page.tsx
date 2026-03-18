'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Palette, Smartphone, RefreshCw, Save, CheckCircle2 } from 'lucide-react';

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

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin text-gray-500 w-8 h-8" />
      </div>
    );
  }

  const colorFields = [
    { key: 'primaryColor', label: 'Primary Brand Color' },
    { key: 'secondaryColor', label: 'Secondary Color' },
    { key: 'accentColor', label: 'Accent / Highlight' },
    { key: 'backgroundColor', label: 'App Background' },
    { key: 'surfaceColor', label: 'Card Surface' },
    { key: 'textPrimary', label: 'Primary Text' },
    { key: 'textSecondary', label: 'Secondary Text' },
  ] as const;

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
        <div className="lg:col-span-1 bg-card p-8 rounded-[2rem] shadow-2xl border border-white/5 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>Color Palette</h2>
          
          <div className="space-y-6">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
                <div className="flex gap-4 items-center">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group transition-transform hover:scale-105 active:scale-95">
                    <input
                      type="color"
                      value={theme[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="absolute inset-[-10px] w-24 h-24 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={theme[key].toUpperCase()}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono uppercase text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/5">
            <button
              onClick={() => setTheme(DEFAULTS)}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-2xl text-sm font-bold transition-all border border-white/5"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-2 bg-black/20 p-8 rounded-[2.5rem] border border-white/5 flex justify-center items-center pb-16 pt-16 relative overflow-hidden backdrop-blur-sm">
          {/* Background Decorative Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />
          
          {/* Enhanced Phone Frame */}
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
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: theme.textSecondary }}>Chhattisgarh</span>
                <span className="text-xl font-extrabold" style={{ color: theme.primaryColor }}>Shaadi</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ borderColor: theme.surfaceColor, backgroundColor: theme.surfaceColor + '20' }}>
                 <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primaryColor + '30' }}>
                    <div className="w-full h-full flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                    </div>
                 </div>
              </div>
            </div>

            {/* Discovery Feed */}
            <div className="px-5 space-y-5 pt-2">
              <div 
                className="w-full h-[380px] rounded-[32px] overflow-hidden relative shadow-2xl transition-all"
                style={{ backgroundColor: theme.surfaceColor }}
              >
                <div className="absolute inset-0 bg-gray-200" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                
                {/* Profile Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/20">Featured</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1" style={{ backgroundColor: theme.successColor }}>
                     <CheckCircle2 className="w-2.5 h-2.5" /> Verified
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
                    <button 
                      className="flex-1 py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                      style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                    >
                      View Profile
                    </button>
                    <button 
                      className="w-12 h-12 rounded-2xl flex justify-center items-center shadow-lg transition-transform active:scale-95 text-white"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 rounded-3xl flex flex-col gap-1 shadow-sm border" style={{ backgroundColor: theme.surfaceColor, borderColor: theme.surfaceColor === '#FFFFFF' ? '#F0F0F0' : 'transparent' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Matches</span>
                    <span className="text-lg font-black" style={{ color: theme.primaryColor }}>85%</span>
                 </div>
                 <div className="p-4 rounded-3xl flex flex-col gap-1 shadow-sm border" style={{ backgroundColor: theme.surfaceColor, borderColor: theme.surfaceColor === '#FFFFFF' ? '#F0F0F0' : 'transparent' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Trust Score</span>
                    <span className="text-lg font-black" style={{ color: theme.successColor }}>High</span>
                 </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div 
              className="absolute bottom-0 w-full h-[84px] pt-4 pb-8 flex justify-around items-center px-6"
              style={{ backgroundColor: theme.surfaceColor, borderTop: '1px solid ' + (theme.surfaceColor === '#FFFFFF' ? '#F0F0F0' : 'transparent') }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-1 bg-cg-red rounded-full absolute top-0" style={{ backgroundColor: theme.primaryColor }} />
                <div className="p-1" style={{ color: theme.primaryColor }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
              </div>
              <div style={{ color: theme.textSecondary }} className="flex flex-col items-center">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div style={{ color: theme.textSecondary }} className="flex flex-col items-center">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div style={{ color: theme.textSecondary }} className="flex flex-col items-center">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Pixel Perfect Mobile View</p>
          </div>

        </div>
      </div>
    </div>
  );
}
