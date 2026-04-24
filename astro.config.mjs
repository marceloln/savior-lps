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
    // Inlinar TODO o CSS no HTML — elimina o request extra de CSS render-blocking.
    // O arquivo CSS da página tinha 11.1 KiB e bloqueava o render por 150ms.
    // Para LP estática single-page, inline é preferível: sem round-trip, sem FOUC.
    inlineStylesheets: 'always',
  },

  compressHTML: true,

  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
