// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Adapter Cloudflare removido: output: 'static' gera HTML puro.
// Cloudflare Pages serve os arquivos direto do CDN global (sem Worker intermediário),
// garantindo TTFB ~50ms e cache via _headers file nativo.

export default defineConfig({
  site: 'https://www.savior.com.br',

  output: 'static',

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/preview'),
      changefreq: 'weekly',
      priority: 0.9,
    }),
  ],

  build: {
    // CSS inline elimina request render-blocking extra.
    inlineStylesheets: 'always',
  },

  compressHTML: true,

  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
