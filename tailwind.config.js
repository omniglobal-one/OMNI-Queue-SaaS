/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        secondary: '#F59E0B',
        danger: '#DC2626',
        success: '#059669',
        bg: {
          base: '#FAFAFA',
          card: '#FFFFFF',
          border: '#E4E4E7',
        },
        text: {
          primary: '#09090B',
          secondary: '#52525B',
          tertiary: '#71717A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
        xl: '8px',
      },
      borderColor: {
        DEFAULT: '#E4E4E7',
      },
      minWidth: {
        dashboard: '1280px',
      },
      boxShadow: {
        glow: '0 0 24px rgba(37, 99, 235, 0.35)',
      },
    },
  },
  plugins: [],
}
