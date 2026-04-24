// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.savior.com.br',

  // Build estático puro — zero JS por default, ideal para LPs
  output: 'static',

  // Sitemap automático para SEO
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/preview'),
      changefreq: 'weekly',
      priority: 0.9,
    }),
  ],

  build: {
    // Inlinar CSS pequeno (< 4KB) no HTML — elimina request extra
    inlineStylesheets: 'auto',
  },

  compressHTML: true,

  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
