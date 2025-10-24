import { supabase } from './supabase';

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export async function generateSitemap(): Promise<{ staticPages: SitemapUrl[], projectPages: SitemapUrl[] }> {
  const baseUrl = 'https://dopaya.org';
  
  // Static pages with their priorities and change frequencies
  const staticPages: SitemapUrl[] = [
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

  // Fetch active projects from database
  let projectPages: SitemapUrl[] = [];
  
  try {
    // First, let's try to get all projects to see what's available
    const { data: allProjects, error: allError } = await supabase
      .from('projects')
      .select('slug, updated_at, created_at, status, title')
      .order('created_at', { ascending: false });

    console.log('All projects for sitemap:', allProjects?.length || 0);
    console.log('Sample project:', allProjects?.[0]);

    if (allError) {
      console.error('Error fetching all projects for sitemap:', allError);
    } else if (allProjects && allProjects.length > 0) {
      // Filter for active projects or use all if no status field
      const activeProjects = allProjects.filter(project => 
        project.status === 'active' || !project.status
      );
      
      console.log('Active projects for sitemap:', activeProjects.length);
      
      projectPages = activeProjects.map(project => ({
        url: `${baseUrl}/project/${project.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: project.updated_at ? 
          new Date(project.updated_at).toISOString().split('T')[0] : 
          new Date(project.created_at).toISOString().split('T')[0]
      }));
    } else {
      console.log('No projects found in database for sitemap');
    }
  } catch (error) {
    console.error('Error generating project pages for sitemap:', error);
  }

  return { staticPages, projectPages };
}

export function generateSitemapXML(staticPages: SitemapUrl[], projectPages: SitemapUrl[]): string {
  const allPages = [...staticPages, ...projectPages];
  
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';
  const urlsetClose = '</urlset>';
  
  const urls = allPages.map(page => {
    const lastmod = page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : '';
    
    // Add image sitemap for project pages
    const imageTags = page.url.includes('/project/') ? 
      `\n    <image:image>
      <image:loc>https://dopaya.org/og-project.jpg</image:loc>
      <image:title>Social Impact Project</image:title>
      <image:caption>Support this social enterprise and make a real impact</image:caption>
    </image:image>` : '';
    
    return `  <url>
    <loc>${page.url}</loc>${lastmod}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageTags}
  </url>`;
  }).join('\n');
  
  return `${xmlHeader}
${urlsetOpen}
${urls}
${urlsetClose}`;
}

export async function getSitemapXML(): Promise<string> {
  try {
    const { staticPages, projectPages } = await generateSitemap();
    return generateSitemapXML(staticPages, projectPages);
  } catch (error) {
    console.error('Error generating sitemap XML:', error);
    // Return a basic sitemap with just static pages if there's an error
    const { staticPages } = await generateSitemap();
    return generateSitemapXML(staticPages, []);
  }
}
