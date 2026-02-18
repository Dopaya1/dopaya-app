/**
 * Validation script: Check if sitemap URLs are accessible and properly formatted.
 * Run after generating sitemap to verify URLs match actual routes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const sitemapPath = path.join(distDir, 'sitemap-seo.xml');

function extractUrlsFromSitemap(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`[validate] Sitemap not found: ${sitemapPath}`);
    return [];
  }

  const content = fs.readFileSync(sitemapPath, 'utf8');
  const urlMatches = content.match(/<loc>(.*?)<\/loc>/g) || [];
  
  return urlMatches.map(match => {
    const url = match.replace(/<\/?loc>/g, '');
    return url.replace('https://dopaya.com', '');
  });
}

function validateUrl(url, distDir) {
  // Remove leading/trailing slashes for file path
  const urlPath = url.replace(/^\/|\/$/g, '');
  
  // Check for index.html in directory
  const indexPath = path.join(distDir, urlPath, 'index.html');
  // Check for .html file
  const htmlPath = path.join(distDir, urlPath + '.html');
  
  return {
    exists: fs.existsSync(indexPath) || fs.existsSync(htmlPath),
    path: fs.existsSync(indexPath) ? indexPath : htmlPath
  };
}

function main() {
  console.log('[validate] Starting sitemap validation...\n');

  if (!fs.existsSync(sitemapPath)) {
    console.error(`[validate] ERROR: Sitemap not found at ${sitemapPath}`);
    console.error('[validate] Please run "npm run build" first to generate the sitemap.');
    process.exit(1);
  }

  const urls = extractUrlsFromSitemap(sitemapPath);
  console.log(`[validate] Found ${urls.length} URLs in sitemap\n`);

  const results = {
    valid: [],
    invalid: [],
    stats: {
      brandPages: 0,
      dePages: 0,
      otherPages: 0
    }
  };

  // Validate first 50 URLs (sample check)
  const sampleSize = Math.min(50, urls.length);
  const urlsToCheck = urls.slice(0, sampleSize);

  console.log(`[validate] Checking ${sampleSize} sample URLs...\n`);

  for (const url of urlsToCheck) {
    const validation = validateUrl(url, distDir);
    
    if (url.startsWith('/brands/')) {
      results.stats.brandPages++;
    } else if (url.startsWith('/de/')) {
      results.stats.dePages++;
    } else {
      results.stats.otherPages++;
    }

    if (validation.exists) {
      results.valid.push(url);
    } else {
      results.invalid.push(url);
      console.warn(`[validate] ❌ Missing: ${url}`);
    }
  }

  // Summary
  console.log('\n[validate] Validation Summary:');
  console.log(`  ✅ Valid URLs: ${results.valid.length}/${sampleSize}`);
  console.log(`  ❌ Invalid URLs: ${results.invalid.length}/${sampleSize}`);
  console.log(`\n[validate] URL Statistics:`);
  console.log(`  - Brand pages: ${results.stats.brandPages}`);
  console.log(`  - German pages: ${results.stats.dePages}`);
  console.log(`  - Other pages: ${results.stats.otherPages}`);

  if (results.invalid.length > 0) {
    console.log('\n[validate] ⚠️  WARNING: Some URLs in sitemap do not have corresponding files.');
    console.log('[validate] These URLs will return 404 when accessed.');
    console.log('[validate] Please check your Astro route configuration.');
    process.exit(1);
  } else {
    console.log('\n[validate] ✅ All checked URLs are valid!');
  }
}

main();
