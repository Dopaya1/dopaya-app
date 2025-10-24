export default async function handler(req: any, res: any) {
  try {
    const baseUrl = 'https://dopaya.com';
    
    // Static pages
    const staticPages = [
      { 
        url: `${baseUrl}/`, 
        priority: '1.0', 
        changefreq: 'weekly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/projects`, 
        priority: '0.9', 
        changefreq: 'daily',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/social-enterprises`, 
        priority: '0.8', 
        changefreq: 'monthly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/about`, 
        priority: '0.7', 
        changefreq: 'monthly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/rewards`, 
        priority: '0.6', 
        changefreq: 'weekly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/brands`, 
        priority: '0.6', 
        changefreq: 'monthly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/contact`, 
        priority: '0.5', 
        changefreq: 'monthly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/faq`, 
        priority: '0.5', 
        changefreq: 'monthly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/eligibility`, 
        priority: '0.5', 
        changefreq: 'monthly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/privacy`, 
        priority: '0.3', 
        changefreq: 'yearly',
        lastmod: new Date().toISOString().split('T')[0]
      },
      { 
        url: `${baseUrl}/cookies`, 
        priority: '0.3', 
        changefreq: 'yearly',
        lastmod: new Date().toISOString().split('T')[0]
      }
    ];

    // Generate XML
    const urlsetOpen = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';
    
    const urls = staticPages.map(page => {
      const lastmod = page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : '';
      
      return `  <url>
    <loc>${page.url}</loc>${lastmod}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }).join('\n');

    const sitemap = `${urlsetOpen}\n${urls}\n${urlsetClose}`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}