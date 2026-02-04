/**
 * Post-build script: generate sitemap-seo.xml with all SEO (programmatic) pages.
 * Run after `astro build`. Single file for easy submission in Google Search Console.
 * Max 50,000 URLs per sitemap (we have ~1.4k, so one file is fine).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const SITE = 'https://dopaya.com';

function collectUrls(dir, basePath = '') {
  const urls = [];
  if (!fs.existsSync(dir)) return urls;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        urls.push(`/${relativePath}/`);
      }
      urls.push(...collectUrls(fullPath, relativePath));
    } else if (entry.name === 'index.html' && basePath) {
      urls.push(`/${basePath}/`);
    }
  }

  return urls;
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  const rootIndex = path.join(distDir, 'index.html');
  let urls = [];
  if (fs.existsSync(rootIndex)) {
    urls.push('/');
  }
  urls = [...new Set([...urls, ...collectUrls(distDir)])]
    .filter((u) => !u.startsWith('/_assets') && !u.startsWith('/logos'))
    .sort();

  const lastmod = new Date().toISOString().slice(0, 10);
  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(SITE + url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  const outPath = path.join(distDir, 'sitemap-seo.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`[sitemap] Generated sitemap-seo.xml with ${urls.length} SEO pages.`);
}

main();
