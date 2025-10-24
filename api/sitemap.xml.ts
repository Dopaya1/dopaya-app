import { supabase } from '../server/supabase';

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

    // Fetch projects from database
    let projectPages: any[] = [];
    
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('slug, updated_at, created_at, status, title')
        .order('created_at', { ascending: false });

      console.log('Projects found for sitemap:', projects?.length || 0);

      if (projects && projects.length > 0) {
        projectPages = projects.map(project => ({
          url: `${baseUrl}/project/${project.slug}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: project.updated_at ? 
            new Date(project.updated_at).toISOString().split('T')[0] : 
            new Date(project.created_at).toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching projects for sitemap:', error);
    }

    // Generate XML
    const allPages = [...staticPages, ...projectPages];
    
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
    const urlsetClose = '</urlset>';
    
    const urls = allPages.map(page => {
      const lastmod = page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : '';
      
      const imageTags = page.url.includes('/project/') ? 
        `\n    <image:image>
      <image:loc>https://dopaya.com/og-project.jpg</image:loc>
      <image:title>Social Impact Project</image:title>
      <image:caption>Support this social enterprise and make a real impact</image:caption>
    </image:image>` : '';
      
      return `  <url>
    <loc>${page.url}</loc>${lastmod}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageTags}
  </url>`;
    }).join('\n');
    
    const sitemapXML = `${xmlHeader}
${urlsetOpen}
${urls}
${urlsetClose}`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemapXML);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
