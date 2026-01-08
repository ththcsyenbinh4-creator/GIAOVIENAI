import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium Monotone Palette
        mono: {
          black: '#000000',
          white: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          850: '#2A2A2A',  // Between 800 and 900 for softer dark cards
          900: '#212121',
          950: '#121212',
        },
        // Legacy compatibility tokens (used by header, modal, tabs)
        apple: {
          black: '#111111',
          white: '#FFFFFF',
          blue: '#007AFF',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Semantic colors
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        // Accent blue
        accent: {
          DEFAULT: '#007AFF',
          soft: 'rgba(0, 122, 255, 0.1)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'title-lg': ['40px', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.02em' }],
        'title': ['32px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'title-sm': ['24px', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.005em' }],
        'section': ['18px', { lineHeight: '1.35', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        // Apple legacy compatibility
        'apple-sm': '8px',
        'apple-md': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
        'apple-2xl': '24px',
        'apple-3xl': '32px',
      },
      boxShadow: {
        // Subtle shadows for depth
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'strong': '0 16px 48px rgba(0, 0, 0, 0.12)',
        // Apple legacy compatibility
        'apple-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'apple-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'apple-xl': '0 16px 48px rgba(0, 0, 0, 0.12)',
        // Glow effects
        'glow-sm': '0 0 20px rgba(255, 255, 255, 0.05)',
        'glow-md': '0 0 40px rgba(255, 255, 255, 0.08)',
        'glow-lg': '0 0 60px rgba(255, 255, 255, 0.1)',
        // Inner glow for cards
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        // Dark mode
        'dark-subtle': '0 1px 2px rgba(0, 0, 0, 0.2)',
        'dark-soft': '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        // Subtle gradients
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
        'gradient-dark': 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        'gradient-hero': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,120,120,0.15), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(255, 255, 255, 0.1)' },
          '50%': { borderColor: 'rgba(255, 255, 255, 0.2)' },
        },
      },
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
