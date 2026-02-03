import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
// sitemap disabled - upstream reduce error; re-enable when fixed
// import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dopaya.com',
  integrations: [
    tailwind(),
    // sitemap({ filter: (page) => !page.includes('/admin') })
  ],
  output: 'static',
  build: {
    assets: '_assets'
  },
  compressHTML: true
});