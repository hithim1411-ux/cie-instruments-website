// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hithim1411-ux.github.io',
  base: '/cie-instruments-website',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
