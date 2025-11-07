import { createClient } from '@supabase/supabase-js';

// Helper function to generate static pages (always works, no dependencies)
function getStaticPages(baseUrl: string) {
  return [
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
}

// Helper function to generate XML from pages
function generateSitemapXML(pages: Array<{url: string; priority: string; changefreq: string; lastmod?: string}>): string {
  const urlsetOpen = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urls = pages.map(page => {
    const lastmod = page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : '';
    
    return `  <url>
    <loc>${page.url}</loc>${lastmod}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  return `${urlsetOpen}\n${urls}\n${urlsetClose}`;
}

// Helper function to fetch project pages with timeout and error handling
async function fetchProjectPages(baseUrl: string): Promise<Array<{url: string; priority: string; changefreq: string; lastmod: string}>> {
  try {
    // Get environment variables with fallbacks (using VITE_ prefix as per codebase convention)
    // Also include hardcoded fallbacks from client code as last resort
    const supabaseUrl = process.env.VITE_SUPABASE_URL 
      || process.env.SUPABASE_URL 
      || 'https://mpueatfperbxbbojlrwd.supabase.co'; // Fallback from client code
      
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY 
      || process.env.SUPABASE_ANON_KEY 
      || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWVhdGZwZXJieGJib2pscndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODk3NzAsImV4cCI6MjA2MTY2NTc3MH0.GPBxZ2yEbtB3Ws_nKWeDaE-yuyH-uvufV-Mq9aN8hEc'; // Fallback from client code

    // Log which source we're using (for debugging)
    const usingEnvVars = !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
    if (!usingEnvVars) {
      console.warn('Using hardcoded Supabase credentials (env vars not found)');
      console.warn('Available env vars:', {
        hasViteUrl: !!process.env.VITE_SUPABASE_URL,
        hasViteKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      });
    } else {
      console.log('Using environment variables for Supabase');
    }
    
    console.log('Fetching projects from Supabase...');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Fetch projects with timeout protection (5 seconds max)
    const fetchPromise = supabase
      .from('projects')
      .select('slug, updated_at, created_at, status')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10000); // Limit to prevent huge sitemaps (max 50k URLs per sitemap)
      .then(result => ({ type: 'success', ...result }))
      .catch(error => ({ type: 'error', error }));

    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ type: 'timeout' }), 5000)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
    
    // Handle timeout
    if (result.type === 'timeout') {
      console.warn('Project fetch timed out after 5 seconds, using static pages only');
      return [];
    }
    
    // Handle error
    if (result.type === 'error' || result.error) {
      console.error('Error fetching projects for sitemap:', result.error);
      return [];
    }
    
    const { data: projects } = result;

    if (!projects || projects.length === 0) {
      console.log('No active projects found for sitemap');
      return [];
    }

    // Map projects to sitemap URLs
    return projects.map(project => ({
      url: `${baseUrl}/project/${project.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: project.updated_at 
        ? new Date(project.updated_at).toISOString().split('T')[0]
        : (project.created_at 
            ? new Date(project.created_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0])
    }));

  } catch (error) {
    // Log error but don't throw - we'll fallback to static pages
    console.error('Error generating project pages for sitemap:', error);
    return [];
  }
}

export default async function handler(req: any, res: any) {
  const baseUrl = 'https://dopaya.com';
  
  try {
    // Always get static pages (this never fails)
    const staticPages = getStaticPages(baseUrl);
    
    // Try to fetch project pages (with fallback to empty array if it fails)
    let projectPages: Array<{url: string; priority: string; changefreq: string; lastmod: string}> = [];
    try {
      projectPages = await fetchProjectPages(baseUrl);
    } catch (error) {
      console.error('Failed to fetch project pages, using static pages only:', error);
      // Continue with static pages only
    }

    // Combine static and project pages
    const allPages = [...staticPages, ...projectPages];

    // Generate XML
    const sitemap = generateSitemapXML(allPages);

    // Set headers and send response
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(sitemap);

  } catch (error) {
    // Final fallback: if everything fails, return at least static pages
    console.error('Sitemap generation error (using fallback):', error);
    
    try {
      const staticPages = getStaticPages(baseUrl);
      const fallbackSitemap = generateSitemapXML(staticPages);
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=300'); // Shorter cache for fallback
      res.status(200).send(fallbackSitemap);
    } catch (fallbackError) {
      // Last resort: return minimal valid sitemap
      console.error('Even fallback failed:', fallbackError);
      const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
      
      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(minimalSitemap);
    }
  }
}