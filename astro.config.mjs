// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.cieinstruments.in',
  base: '/',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'always',
  redirects: {
    '/virtual-instruments/': '/playground/',
    '/virtual-instruments/dit-2500/': '/playground/dit-2500/',
    '/virtual-instruments/dit-5000/': '/playground/dit-5000/',
    '/virtual-instruments/cie-444/': '/playground/cie-444/',
    '/virtual-instruments/det-2000/': '/playground/det-2000/',
    '/virtual-instruments/dcm-2250-tr/': '/playground/dcm-2250-tr/',
    '/virtual-instruments/dcm-5410-tr/': '/playground/dcm-5410-tr/',
    '/products/oil-test-sets/cie-7100/': '/products/oil-test-sets/cie-7050/',
    '/products/oil-test-sets/cie-7120/': '/products/oil-test-sets/cie-7050/',
  },
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [sitemap({
    serialize(item) {
      const url = item.url;
      if (url === 'https://www.cieinstruments.in/') return { ...item, priority: 1.0, changefreq: 'weekly' };
      if (url === 'https://www.cieinstruments.in/products/') return { ...item, priority: 0.95, changefreq: 'weekly' };
      if (url === 'https://www.cieinstruments.in/blog/') return { ...item, priority: 0.8, changefreq: 'weekly' };
      if (url === 'https://www.cieinstruments.in/contact/') return { ...item, priority: 0.8, changefreq: 'monthly' };
      if (url === 'https://www.cieinstruments.in/authorised-dealership/') return { ...item, priority: 0.9, changefreq: 'monthly' };
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
