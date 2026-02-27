import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
          '950': '#020617',
        },
        zinc: {
          '50': '#fafafa',
          '100': '#f4f4f5',
          '200': '#e4e4e7',
          '300': '#d4d4d8',
          '400': '#a1a1a6',
          '500': '#71717a',
          '600': '#52525b',
          '700': '#3f3f46',
          '800': '#27272a',
          '900': '#18181b',
          '950': '#09090b',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass-sm': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'glass-md': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glass-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'inner-dark': 'inset 0 1px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'glass': '1.5rem',
        'glass-lg': '2rem',
        'glass-xl': '2.5rem',
      },
      opacity: {
        '2': '0.02',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
      },
      transitionTimingFunction: {
        'glass': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
        },
      },
      fontFamily: {
        'sans': ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': '0.75rem',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities, theme, e }) {
      // Glassmorphism component presets
      addComponents({
        // Glass card - base frosted glass container
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          '@supports (backdrop-filter: blur(0))': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
        // Glass card - secondary (darker variant)
        '.glass-secondary': {
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
        // Glass input field
        '.glass-input': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '0.875rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'rgb(30, 41, 59)',
          '@supports (backdrop-filter: blur(0))': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '&::placeholder': {
            color: 'rgba(30, 41, 59, 0.5)',
          },
          '&:focus': {
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
        },
        // Glass button
        '.glass-btn': {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '0.875rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: 'rgb(30, 41, 59)',
          fontWeight: '500',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.25)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        // Glass button - variant (secondary)
        '.glass-btn-secondary': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '0.875rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'rgb(30, 41, 59)',
          fontWeight: '500',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      });

      // Additional glassmorphism utilities
      addUtilities({
        '.backdrop-blur-glass': {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        },
        '.glass-border': {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        '.glass-text': {
          color: 'rgba(255, 255, 255, 0.9)',
        },
        '.glass-text-secondary': {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        '.glass-divider': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      });
    }),
  ],
};

export default config;