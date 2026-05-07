/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Color System based on design spec
      colors: {
        // Core Neutrals (Static across all themes)
        'page-bg': '#F8F9FA',
        'surface-bg': '#FFFFFF',
        'border-subtle': '#E9ECEF',
        'border-default': '#DEE2E6',
        'text-primary': '#212529',
        'text-secondary': '#6C757D',
        'icon-default': '#495057',
        
        // Primary Accent (Themeable per Mall)
        'primary': {
          '100': '#E7F5FF',  // Light bg
          '500': '#1890FF',  // Default
          '700': '#096DD9',  // Dark hover
        },
        
        // Semantic Colors
        'success': '#28A745',
        'warning': '#FFC107',
        'error': '#DC3545',
      },
      
      // Typography - Inter font
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Type Scale (Major Third — 1.25 Ratio)
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5', letterSpacing: '0.05em', textTransform: 'uppercase' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.5' }],
        'lg': ['18px', { lineHeight: '1.4' }],
        'xl': ['24px', { lineHeight: '1.3' }],
        '2xl': ['30px', { lineHeight: '1.2' }],
      },
      
      // Spacing (8px grid system)
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      
      // Border Radius
      borderRadius: {
        'sm': '8px',
        'md': '12px',
      },
      
      // Shadow system
      boxShadow: {
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      
      // Animation durations
      transitionDuration: {
        '200': '200ms',
        '250': '250ms',
      },
      
      // Minimum touch target size
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
}