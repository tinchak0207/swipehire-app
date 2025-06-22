import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-5',
    'grid-cols-6',
    'grid-cols-7',
    // Card theme classes - ensure these are generated if only used via JS
    'card-theme-ocean',
    'card-theme-sunset',
    'card-theme-forest',
    'card-theme-professional-dark',
    'card-theme-lavender',
    // Specific text/bg colors for themes if not covered by utilities directly
    'text-cyan-200',
    'text-blue-100/90',
    'bg-cyan-700/80',
    'text-cyan-100',
    'border-cyan-600',
    'from-cyan-300',
    'to-blue-300',
    'text-pink-200',
    'text-orange-100/90',
    'bg-red-700/80',
    'text-red-100',
    'border-red-600',
    'from-pink-300',
    'to-orange-300',
    'text-lime-200',
    'text-green-100/90',
    'bg-emerald-800/80',
    'text-emerald-100',
    'border-emerald-700',
    'from-lime-300',
    'to-green-300',
    'text-yellow-300',
    'hover:bg-yellow-400/30',
    'border-yellow-400/50',
    'bg-yellow-500/40',
    'border-yellow-300',
    'ring-yellow-200',
    'text-sky-400',
    'text-slate-400',
    'bg-slate-600',
    'text-slate-200',
    'border-slate-500',
    'from-sky-500',
    'to-blue-500',
    'text-indigo-700',
    'text-slate-600',
    'bg-indigo-200/80',
    'text-indigo-800',
    'border-indigo-300',
    'from-indigo-500',
    'to-purple-500',
    'bg-purple-200/50',
    'bg-red-500/20',
    'bg-green-500/20',
    'bg-white/50',
    'border-purple-300/70',
    'bg-green-200/80',
  ],
  theme: {
    extend: {
      colors: {
        'custom-primary-purple': '#6C63FF',
        'custom-dark-purple-blue': '#2A2486',
        'custom-light-purple-text': '#9D99FF',
        'custom-light-gray-ring': '#E0E0E0',
        'custom-light-purple-skill-bg': '#F0EEFF',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      backgroundImage: {
        'card-theme-ocean': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'card-theme-sunset': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'card-theme-forest': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'purple-gradient-hero':
          'linear-gradient(145deg, hsl(260, 70%, 30%), hsl(280, 65%, 45%), hsl(250, 70%, 55%))', // Added for AI HR Assistant page
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
        'text-glow': {
          '0%, 100%': {
            textShadow: '0 0 5px hsl(var(--primary) / 0.5), 0 0 10px hsl(var(--primary) / 0.3)',
          },
          '50%': {
            textShadow: '0 0 10px hsl(var(--primary) / 0.7), 0 0 20px hsl(var(--primary) / 0.5)',
          },
        },
        'gradient-button-hover': {
          // For the frosted button background
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'text-glow': 'text-glow 2.5s ease-in-out infinite alternate',
        'gradient-button-hover': 'gradient-button-hover 3s ease infinite alternate', // For frosted button
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
