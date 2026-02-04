/**
 * Post-build script: generate sitemap-index.xml and sitemap-*.xml from built output.
 * Run after `astro build` so programmatic and all other pages are included for Google.
 * Max 50,000 URLs per sitemap file (sitemap spec).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const SITE = 'https://dopaya.com';
const MAX_URLS_PER_SITEMAP = 50000;

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

function writeUrlsetXml(urls, outPath) {
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
  fs.writeFileSync(outPath, xml, 'utf8');
}

function writeSitemapIndexXml(chunkNames, outPath) {
  const urlEntries = chunkNames
    .map(
      (name) => `  <sitemap>
    <loc>${escapeXml(SITE + '/' + name)}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </sitemap>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</sitemapindex>`;
  fs.writeFileSync(outPath, xml, 'utf8');
}

function main() {
  const rootIndex = path.join(distDir, 'index.html');
  let urls = [];
  if (fs.existsSync(rootIndex)) {
    urls.push('/');
  }
  urls = [...new Set([...urls, ...collectUrls(distDir)])]
    .filter((u) => !u.startsWith('/_assets'))
    .sort();

  const chunks = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = urls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const chunkName = `sitemap-${chunks.length}.xml`;
    writeUrlsetXml(chunk, path.join(distDir, chunkName));
    chunks.push(chunkName);
  }

  writeSitemapIndexXml(chunks, path.join(distDir, 'sitemap-index.xml'));
  console.log(`[sitemap] Generated sitemap-index.xml with ${chunks.length} chunk(s), ${urls.length} URLs total.`);
}

main();
