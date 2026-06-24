// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cieinstruments.in',
  base: '/',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [sitemap({
    serialize(item) {
      const url = item.url;
      if (url === 'https://cieinstruments.in/') return { ...item, priority: 1.0, changefreq: 'weekly' };
      if (url === 'https://cieinstruments.in/products/') return { ...item, priority: 0.95, changefreq: 'weekly' };
      if (url === 'https://cieinstruments.in/blog/') return { ...item, priority: 0.8, changefreq: 'weekly' };
      if (url === 'https://cieinstruments.in/contact/') return { ...item, priority: 0.8, changefreq: 'monthly' };
      if (url === 'https://cieinstruments.in/authorised-dealership/') return { ...item, priority: 0.9, changefreq: 'monthly' };
      if (url.match(/\/products\/[^/]+\/[^/]+\//)) return { ...item, priority: 0.9, changefreq: 'monthly' };
      if (url.match(/\/products\/[^/]+\//)) return { ...item, priority: 0.85, changefreq: 'monthly' };
      if (url.match(/\/authorised-dealership\/[^/]+\/[^/]+\//)) return { ...item, priority: 0.85, changefreq: 'monthly' };
      if (url.match(/\/authorised-dealership\/[^/]+\//)) return { ...item, priority: 0.85, changefreq: 'monthly' };
      if (url.includes('/blog/')) return { ...item, priority: 0.75, changefreq: 'monthly' };
      return { ...item, priority: 0.6, changefreq: 'monthly' };
    },
  })],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
      minify: 'esbuild',
    },
  },
});
