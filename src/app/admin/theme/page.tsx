'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Palette, Smartphone, RefreshCw, Save } from 'lucide-react';

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cg-red to-cg-purple bg-clip-text text-transparent flex items-center gap-2">
            <Palette className="w-6 h-6 text-cg-red" />
            App Branding & Theme
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure the colors of the user mobile app in real-time.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-cg-red hover:bg-cg-red-hover text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-medium disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Publish Theme
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor Pane */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Color Palette</h2>
          
          <div className="space-y-6">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    <input
                      type="color"
                      value={theme[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={theme[key].toUpperCase()}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-cg-red/20 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setTheme(DEFAULTS)}
              className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-medium transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-center items-center pb-12 pt-12 relative overflow-hidden">
          
          <div className="absolute top-4 left-4 flex items-center gap-2 text-gray-400">
            <Smartphone className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Live App Preview</span>
          </div>

          {/* Dummy Phone Frame */}
          <div 
            className="w-[320px] h-[650px] rounded-[40px] shadow-2xl overflow-hidden relative border-[8px] border-white"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            {/* Header */}
            <div 
              className="absolute top-0 w-full h-44 rounded-b-3xl flex flex-col pt-12 px-6"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
            >
              <h3 className="text-white font-bold text-xl mb-1">Discover</h3>
              <p className="text-white/80 text-sm">Find your perfect match today</p>
            </div>

            {/* Profile Card Mockup */}
            <div className="absolute top-32 left-4 right-4 z-10 space-y-4">
              <div 
                className="w-full h-80 rounded-2xl shadow-lg p-4 flex flex-col justify-end relative overflow-hidden"
                style={{ backgroundColor: theme.surfaceColor }}
              >
                <div className="absolute inset-0 bg-gray-200" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                <div className="relative z-10">
                  <h4 className="text-white font-bold text-lg mb-1">Aaradhya S., 26</h4>
                  <p className="text-white/80 text-sm flex items-center gap-1 mb-3">
                    Bhilai, Chhattisgarh
                  </p>
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 py-3 bg-white rounded-xl text-sm font-bold flex justify-center items-center"
                      style={{ color: theme.primaryColor }}
                    >
                      View Profile
                    </button>
                    <button 
                      className="w-12 h-12 rounded-xl flex justify-center items-center shadow-md text-white"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Smaller details */}
              <div className="w-full flex gap-3">
                <div className="flex-1 rounded-xl p-4 shadow-sm" style={{ backgroundColor: theme.surfaceColor }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Reliability</p>
                  <h5 className="font-bold text-sm" style={{ color: theme.successColor }}>Verified ✓</h5>
                </div>
                <div className="flex-1 rounded-xl p-4 shadow-sm" style={{ backgroundColor: theme.surfaceColor }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>Status</p>
                  <h5 className="font-bold text-sm" style={{ color: theme.textPrimary }}>Online Now</h5>
                </div>
              </div>
            </div>

            {/* Bottom Nav Mockup */}
            <div 
              className="absolute bottom-0 w-full h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center px-4"
              style={{ backgroundColor: theme.surfaceColor }}
            >
              <div className="p-2 border-t-2 flex items-center justify-center h-full" style={{ borderTopColor: theme.primaryColor, color: theme.primaryColor }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <div style={{ color: theme.textSecondary }} className="p-2">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div style={{ color: theme.textSecondary }} className="p-2">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div style={{ color: theme.textSecondary }} className="p-2">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
