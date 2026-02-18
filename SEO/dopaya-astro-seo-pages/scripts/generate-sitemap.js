/**
 * Post-build script: generate sitemap-seo.xml with all SEO (programmatic) pages.
 * Run after `astro build`. Single file for easy submission in Google Search Console.
 * Max 50,000 URLs per sitemap (we have ~1.4k, so one file is fine).
 * 
 * FIXED VERSION: Ensures URLs match Astro route structure exactly and validates pages exist.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const SITE = 'https://dopaya.com';

/**
 * Collects URLs from the dist directory, matching Astro's static output structure.
 * Astro generates pages as: dist/brands/{slug}/index.html
 * URLs should be: https://dopaya.com/brands/{slug}/
 */
function collectUrls(dir, basePath = '') {
  const urls = [];
  if (!fs.existsSync(dir)) {
    console.warn(`[sitemap] Directory does not exist: ${dir}`);
    return urls;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    // Skip hidden directories and assets
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) {
      continue;
    }

    if (entry.isDirectory()) {
      // Check for index.html in this directory (Astro's static output format)
      const indexPath = path.join(fullPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        // Ensure trailing slash for directory-based routes
        const urlPath = `/${relativePath}/`;
        urls.push(urlPath);
      }
      // Recursively collect from subdirectories
      urls.push(...collectUrls(fullPath, relativePath));
    } else if (entry.name === 'index.html' && basePath) {
      // Handle root-level index.html
      const urlPath = `/${basePath}/`;
      urls.push(urlPath);
    }
  }

  return urls;
}

/**
 * Validates that a URL's corresponding HTML file exists in dist
 */
function validateUrl(url, distDir) {
  // Remove leading slash and trailing slash for file path
  const urlPath = url.replace(/^\/|\/$/g, '');
  const htmlPath = path.join(distDir, urlPath, 'index.html');
  const altHtmlPath = path.join(distDir, urlPath + '.html');
  
  return fs.existsSync(htmlPath) || fs.existsSync(altHtmlPath);
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
  console.log('[sitemap] Starting sitemap generation...');
  console.log(`[sitemap] Dist directory: ${distDir}`);
  console.log(`[sitemap] Site URL: ${SITE}`);

  // Check if dist directory exists
  if (!fs.existsSync(distDir)) {
    console.error(`[sitemap] ERROR: Dist directory does not exist: ${distDir}`);
    console.error('[sitemap] Please run "npm run build" first.');
    process.exit(1);
  }

  // Collect all URLs
  const rootIndex = path.join(distDir, 'index.html');
  let urls = [];
  
  if (fs.existsSync(rootIndex)) {
    urls.push('/');
  }

  // Collect URLs from dist directory
  const collectedUrls = collectUrls(distDir);
  urls = [...new Set([...urls, ...collectedUrls])]
    .filter((u) => {
      // Exclude assets and other non-page directories
      return !u.startsWith('/_assets') && 
             !u.startsWith('/logos') &&
             !u.startsWith('/favicon') &&
             !u.includes('_astro');
    })
    .sort();

  console.log(`[sitemap] Found ${urls.length} URLs`);

  // Validate URLs (optional but recommended)
  const invalidUrls = [];
  const validUrls = [];
  
  for (const url of urls) {
    if (validateUrl(url, distDir)) {
      validUrls.push(url);
    } else {
      invalidUrls.push(url);
      console.warn(`[sitemap] WARNING: URL may not exist: ${url}`);
    }
  }

  if (invalidUrls.length > 0) {
    console.warn(`[sitemap] Found ${invalidUrls.length} potentially invalid URLs`);
    console.warn('[sitemap] These URLs will still be included, but verify they are accessible.');
  }

  // Use valid URLs (or all if validation is skipped)
  const urlsToInclude = validUrls.length > 0 ? validUrls : urls;

  // Generate sitemap XML
  const lastmod = new Date().toISOString().slice(0, 10);
  const urlEntries = urlsToInclude
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

  // Write sitemap
  const outPath = path.join(distDir, 'sitemap-seo.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  
  console.log(`[sitemap] ✅ Generated sitemap-seo.xml with ${urlsToInclude.length} URLs`);
  console.log(`[sitemap] Output: ${outPath}`);
  console.log(`[sitemap] Sitemap URL: ${SITE}/sitemap-seo.xml`);
  
  // Generate summary stats
  const brandUrls = urlsToInclude.filter(u => u.startsWith('/brands/'));
  const deUrls = urlsToInclude.filter(u => u.startsWith('/de/'));
  
  console.log(`[sitemap] Summary:`);
  console.log(`  - Total URLs: ${urlsToInclude.length}`);
  console.log(`  - Brand pages: ${brandUrls.length}`);
  console.log(`  - German pages: ${deUrls.length}`);
  console.log(`  - Other pages: ${urlsToInclude.length - brandUrls.length - deUrls.length}`);
  
  // Check if sitemap is too large (Google limit is 50MB uncompressed, ~50k URLs)
  if (urlsToInclude.length > 50000) {
    console.warn('[sitemap] WARNING: Sitemap exceeds 50,000 URLs. Consider splitting into multiple sitemaps.');
  }
  
  const fileSize = fs.statSync(outPath).size;
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  console.log(`[sitemap] File size: ${fileSizeMB} MB`);
  
  if (fileSize > 50 * 1024 * 1024) {
    console.warn('[sitemap] WARNING: Sitemap exceeds 50MB. Google may not process it. Consider splitting.');
  }
}

main();
