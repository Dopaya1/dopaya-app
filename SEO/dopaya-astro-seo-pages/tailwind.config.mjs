/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'brand-orange': '#F05304',
        'brand-navy': '#1a1a3a',
        'brand-beige': '#f8f6f1',
        'brand-white': '#fefefe',
        'brand-text': '#1a1a3a',
        'brand-text-secondary': '#6b7280',
        'brand-text-muted': '#9ca3af',
        'brand-border': '#e5e7eb',
      }
    },
  },
  plugins: [],
}