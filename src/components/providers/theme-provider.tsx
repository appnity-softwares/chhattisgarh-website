'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiConfig from '@/lib/api.config';

type Theme = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
};

const ThemeContext = createContext<{ theme: Theme | null }>({ theme: null });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);

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

  const applyTheme = React.useCallback((theme: Theme) => {
    const colorMap: Record<string, string> = {
        primary: '--primary',
        secondary: '--secondary',
        background: '--background',
        surface: '--card',
        text: '--foreground',
        muted: '--muted-foreground',
        accent: '--accent',
        border: '--border'
    };

    Object.entries(theme).forEach(([key, hex]) => {
        const cssVar = colorMap[key];
        if (cssVar && typeof hex === 'string') {
            try {
                const hsl = hexToHsl(hex);
                document.documentElement.style.setProperty(cssVar, hsl);
                
                // Specific overrides for shadcn/ui components
                if (key === 'primary') {
                    document.documentElement.style.setProperty('--sidebar-primary', hsl);
                    document.documentElement.style.setProperty('--ring', hsl);
                }
                if (key === 'background') {
                    document.documentElement.style.setProperty('--popover', hsl);
                    document.documentElement.style.setProperty('--sidebar-background', hsl);
                }
                if (key === 'surface') {
                    document.documentElement.style.setProperty('--popover', hsl);
                }
            } catch (e) {
                console.error(`Failed to apply theme color ${key}:`, e);
            }
        }
    });
  }, []);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const response = await fetch(`${apiConfig.baseUrl}/config/public`);
        const result = await response.json();
        
        if (result.success) {
          const themeConfig = result.data.find((c: { key: string; value: string }) => c.key === 'app_theme');
          if (themeConfig) {
            const parsedTheme = JSON.parse(themeConfig.value);
            setTheme(parsedTheme);
            applyTheme(parsedTheme);
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error);
      }
    }

    fetchTheme();
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
