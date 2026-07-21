/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Animations ─────────────────────────────────────
      keyframes: {
        // Dialog card: scale + slide up
        'dialog-in': {
          '0%':   { opacity: '0', transform: 'scale(0.93) translateY(12px)' },
          '60%':  { opacity: '1', transform: 'scale(1.01) translateY(-2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        // Backdrop: simple fade in
        'backdrop-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Icon: small bounce entrance
        'icon-pop': {
          '0%':   { opacity: '0', transform: 'scale(0.5)' },
          '70%':  { opacity: '1', transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Subtle shimmer on confirm button
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'dialog-in':   'dialog-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'backdrop-in': 'backdrop-in 0.2s ease-out forwards',
        'icon-pop':    'icon-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both',
        'shimmer':     'shimmer 1.6s linear infinite',
      },


      // ── Font ────────────────────────────────
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },

      // ── Clean Brown Palette ──────────────────
      colors: {
        primary: {
          DEFAULT: '#6E473B',
          light:   '#8A6A5E',
          dark:    '#4F332B',
        },
        secondary: {
          DEFAULT: '#E1D4C2',
          light:   '#EFE6D9',
        },
        neutral: {
          bg:       '#F3EEE7',
          card:     '#FAF8F4',
          border:   '#D4C5B3',
          muted:    '#9B8F88',
          subtle:   '#6F625D',
          text:     '#211D1B',
          soft:     '#F6F4F1',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger:  '#ef4444',
          info:    '#3b82f6',
        },
      },

      // ── Border Radius ────────────────────────
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        lg: '16px',
        xl: '20px',
      },

      // ── Box Shadow ───────────────────────────
      boxShadow: {
        card: '0 4px 24px rgba(110, 71, 59, 0.08)',
        lg:   '0 8px 40px rgba(110, 71, 59, 0.14)',
        soft: '0 12px 34px rgba(110, 71, 59, 0.16)',
      },
    },
  },
  plugins: [],
}
