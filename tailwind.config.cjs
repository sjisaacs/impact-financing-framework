/** Tailwind v3 config, carried over from the original single-page site so the look is preserved. */
module.exports = {
  content: ['./src/**/*.{astro,mdx,md,js,json,ts}'],
  theme: {
    extend: {
      colors: {
        slate: { 850: '#172033' },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display Variable"', '"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
