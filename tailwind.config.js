/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@omni/tokens/tailwind-preset')],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // "success" dropped here — the preset now owns that key as a nested
        // {DEFAULT, soft} semantic token; a plain string would have clobbered it.
        primary: '#4D7C0F',
        'primary-hover': '#3F6212',
        secondary: '#F59E0B',
        danger: '#DC2626',
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
      // fontFamily and borderRadius dropped — the preset owns both scales now.
      borderColor: {
        DEFAULT: '#E4E4E7',
      },
      minWidth: {
        dashboard: '1280px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.05)',
        glow: '0 0 24px rgba(77, 124, 15, 0.35)',
      },
    },
  },
  plugins: [],
}
