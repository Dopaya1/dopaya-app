import { generateSitemap } from './sitemap-generator';

export async function generateSitemapIndex(): Promise<string> {
  const baseUrl = 'https://dopaya.org';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const sitemapindexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const sitemapindexClose = '</sitemapindex>';
  
  const sitemaps = [
    {
      loc: `${baseUrl}/sitemap.xml`,
      lastmod: currentDate
    }
  ];
  
  const sitemapEntries = sitemaps.map(sitemap => 
    `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`
  ).join('\n');
  
  return `${xmlHeader}
${sitemapindexOpen}
${sitemapEntries}
${sitemapindexClose}`;
}
