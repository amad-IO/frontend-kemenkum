/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
