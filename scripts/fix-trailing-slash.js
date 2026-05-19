// fix-trailing-slash.js
// Copia cada .html do dist para dir/index.html, eliminando o redirect 301
// que o Cloudflare Pages faz quando alguém acessa /ambulancia-rj/ (com barra).
// Isso preserva tracking (UTM, GA4, dataLayer) que se perde no redirect.

import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const dist = new URL('../dist', import.meta.url).pathname;

const skip = new Set(['index.html', '404.html']);

const files = readdirSync(dist).filter(
  (f) => f.endsWith('.html') && !skip.has(f)
);

let count = 0;
for (const file of files) {
  const name = basename(file, '.html');
  const dir = join(dist, name);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  copyFileSync(join(dist, file), join(dir, 'index.html'));
  count++;
}

console.log(`fix-trailing-slash: ${count} páginas duplicadas (sem redirect)`);
