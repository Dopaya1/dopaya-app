/**
 * Utility script to generate and analyze programmatic SEO pages
 * Run with: node scripts/generate-pages.js
 */

import fs from 'fs';
import path from 'path';

// Import data files
const brands = JSON.parse(fs.readFileSync('./src/data/brands.json', 'utf8'));
const sectors = JSON.parse(fs.readFileSync('./src/data/sectors.json', 'utf8'));
const rewards = JSON.parse(fs.readFileSync('./src/data/rewards.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('./src/data/categories.json', 'utf8'));

function generateFormula12Pages() {
  const pages = [];
  
  brands.brands.forEach(brand => {
    sectors.sectors.forEach(sector => {
      rewards.rewardPhrases.forEach(rewardPhrase => {
        const slug = `${brand.id}-${sector.id}-${rewardPhrase.id}`;
        const title = `${brand.name} ${sector.name} ${rewardPhrase.phrase}`;
        const searchVolume = brand.searchVolume || 0;
        
        pages.push({
          type: 'formula12',
          slug,
          title,
          brand: brand.name,
          sector: sector.name,
          reward: rewardPhrase.phrase,
          searchVolume,
          url: `/brands/${slug}`,
          seoTitle: `${title} | Dopaya - Social Impact Platform`,
          description: `Earn ${rewardPhrase.phrase} when you support ${sector.name} through ${brand.name}. 100% of donations go to verified social enterprises.`
        });
      });
    });
  });
  
  return pages;
}

function generateFormula3Pages(limit = 200) {
  const pages = [];
  
  // Use top brands and categories for initial launch
  const topBrands = brands.brands
    .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
    .slice(0, 4);
  
  const topCategories = categories.categories.slice(0, 6);
  const topRewards = rewards.rewardTypes.slice(0, 4);
  const topModifiers = rewards.benefitModifiers.slice(0, 3);
  
  topBrands.forEach(brand => {
    topCategories.forEach(category => {
      topRewards.forEach(reward => {
        topModifiers.forEach(modifier => {
          if (pages.length >= limit) return;
          
          const slug = `${brand.id}-${category.id}-${reward.id}-${modifier.replace(/\s+/g, '-')}`;
          const title = `${brand.name} ${category.name} ${reward.name} ${modifier}`;
          const searchVolume = brand.searchVolume || 0;
          
          pages.push({
            type: 'formula3',
            slug,
            title,
            brand: brand.name,
            category: category.name,
            reward: reward.name,
            modifier,
            searchVolume,
            url: `/brands/${slug}`,
            seoTitle: `${title} | Dopaya - Social Impact Platform`,
            description: `Get ${reward.name} on ${brand.name} ${category.name} while ${modifier}. Support verified social enterprises and earn exclusive rewards.`
          });
        });
      });
    });
  });
  
  return pages;
}

function analyzePage(page) {
  return {
    ...page,
    keywords: page.title.toLowerCase().split(' ').slice(0, 8).join(', '),
    priority: page.searchVolume > 1000 ? 'high' : page.searchVolume > 100 ? 'medium' : 'low',
    characterCount: {
      title: page.seoTitle.length,
      description: page.description.length
    },
    seoScore: calculateSEOScore(page)
  };
}

function calculateSEOScore(page) {
  let score = 100;
  
  // Title length (optimal: 50-60 characters)
  if (page.seoTitle.length > 60) score -= 10;
  if (page.seoTitle.length < 30) score -= 10;
  
  // Description length (optimal: 150-160 characters)  
  if (page.description.length > 160) score -= 10;
  if (page.description.length < 120) score -= 10;
  
  // Brand mention in title
  if (!page.seoTitle.toLowerCase().includes(page.brand.toLowerCase())) score -= 20;
  
  // Search volume bonus
  if (page.searchVolume > 1000) score += 10;
  if (page.searchVolume > 5000) score += 20;
  
  return Math.max(0, score);
}

function generateSitemap(pages) {
  const urls = pages.map(page => 
    `  <url>
    <loc>https://dopaya.com${page.url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.searchVolume > 1000 ? '0.8' : '0.6'}</priority>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dopaya.com/brands/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
}

function main() {
  console.log('🚀 Generating Dopaya Brand SEO Pages...\n');
  
  // Generate pages
  const formula12Pages = generateFormula12Pages();
  const formula3Pages = generateFormula3Pages(200); // Start with 200 for launch
  
  const allPages = [...formula12Pages, ...formula3Pages];
  const analyzedPages = allPages.map(analyzePage);
  
  // Sort by priority and search volume
  const sortedPages = analyzedPages.sort((a, b) => {
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.searchVolume - a.searchVolume;
  });
  
  // Statistics
  const stats = {
    total: sortedPages.length,
    formula12: formula12Pages.length,
    formula3: formula3Pages.length,
    highPriority: sortedPages.filter(p => p.priority === 'high').length,
    mediumPriority: sortedPages.filter(p => p.priority === 'medium').length,
    lowPriority: sortedPages.filter(p => p.priority === 'low').length,
    totalSearchVolume: sortedPages.reduce((sum, p) => sum + p.searchVolume, 0),
    avgSeoScore: Math.round(sortedPages.reduce((sum, p) => sum + p.seoScore, 0) / sortedPages.length)
  };
  
  console.log('📊 Generation Statistics:');
  console.log(`├─ Total Pages: ${stats.total}`);
  console.log(`├─ Formula 12: ${stats.formula12} (Brand + Sector + Reward)`);
  console.log(`├─ Formula 3: ${stats.formula3} (Brand + Category + Reward + Modifier)`);
  console.log(`├─ High Priority: ${stats.highPriority} pages`);
  console.log(`├─ Medium Priority: ${stats.mediumPriority} pages`);
  console.log(`├─ Low Priority: ${stats.lowPriority} pages`);
  console.log(`├─ Total Search Volume: ${stats.totalSearchVolume.toLocaleString()}/month`);
  console.log(`└─ Average SEO Score: ${stats.avgSeoScore}/100\n`);
  
  // Top 10 highest priority pages
  console.log('🎯 Top 10 Priority Pages:');
  sortedPages.slice(0, 10).forEach((page, i) => {
    console.log(`${i + 1}. ${page.title}`);
    console.log(`   └─ Volume: ${page.searchVolume}/month | Score: ${page.seoScore}/100 | Priority: ${page.priority}`);
  });
  
  // Export data
  const outputDir = './dist';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write page data
  fs.writeFileSync(
    `${outputDir}/generated-pages.json`, 
    JSON.stringify(sortedPages, null, 2)
  );
  
  // Write sitemap
  fs.writeFileSync(
    `${outputDir}/sitemap-brands.xml`,
    generateSitemap(sortedPages)
  );
  
  // Write CSV for spreadsheet analysis
  const csvHeader = 'Type,Slug,Title,Brand,Sector/Category,Reward,Search Volume,Priority,SEO Score,URL\n';
  const csvData = sortedPages.map(page => 
    `${page.type},"${page.slug}","${page.title}","${page.brand}","${page.sector || page.category}","${page.reward}",${page.searchVolume},${page.priority},${page.seoScore},https://dopaya.com${page.url}`
  ).join('\n');
  
  fs.writeFileSync(`${outputDir}/pages-analysis.csv`, csvHeader + csvData);
  
  console.log(`\n✅ Export Complete!`);
  console.log(`├─ Page Data: ${outputDir}/generated-pages.json`);
  console.log(`├─ Sitemap: ${outputDir}/sitemap-brands.xml`);
  console.log(`└─ CSV Analysis: ${outputDir}/pages-analysis.csv\n`);
  
  // Launch recommendations
  console.log('🚀 Launch Recommendations:');
  console.log('1. Deploy high-priority pages first (search volume > 1000/month)');
  console.log('2. Monitor NIKIN and RRREVOLVE combinations for quick wins');
  console.log('3. Focus on Swiss market initially, then expand globally');
  console.log('4. A/B test page templates with top 20 combinations');
  console.log('5. Set up tracking for brand keyword → waitlist conversion\n');
}

// Run the script
main();