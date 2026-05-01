import type { Config } from 'tailwindcss';
import tailwindAnimate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-pt-sans)', 'sans-serif'],
        headline: ['var(--font-pt-sans)', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--surface-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--surface-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--surface-rgb) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark-rgb) / <alpha-value>)',
        },
        primaryDark: 'rgb(var(--primary-dark-rgb) / <alpha-value>)',
        gold: 'rgb(var(--gold-rgb) / <alpha-value>)',
        accentGold: 'rgb(var(--gold-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        text: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        error: 'rgb(var(--error-rgb) / <alpha-value>)',
        warning: 'rgb(var(--gold-rgb) / <alpha-value>)',
        secondary: {
          DEFAULT: 'rgb(var(--border-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted-surface-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--muted-rgb) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--gold-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--error-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--surface-rgb) / <alpha-value>)',
        },
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        input: 'rgb(var(--border-rgb) / <alpha-value>)',
        ring: 'rgb(var(--primary-rgb) / <alpha-value>)',
        chart: {
          '1': 'rgb(var(--primary-rgb) / <alpha-value>)',
          '2': 'rgb(var(--gold-rgb) / <alpha-value>)',
          '3': 'rgb(var(--success-rgb) / <alpha-value>)',
          '4': 'rgb(var(--primary-dark-rgb) / <alpha-value>)',
          '5': 'rgb(var(--error-rgb) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'rgb(var(--primary-dark-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--surface-rgb) / <alpha-value>)',
          primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
          'primary-foreground': 'rgb(var(--surface-rgb) / <alpha-value>)',
          accent: 'rgb(var(--gold-rgb) / <alpha-value>)',
          'accent-foreground': 'rgb(var(--foreground-rgb) / <alpha-value>)',
          border: 'rgb(var(--gold-rgb) / 0.22)',
          ring: 'rgb(var(--gold-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
