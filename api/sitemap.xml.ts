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

// Helper function to fetch project pages with comprehensive error handling
// Returns empty array on any error (safe fallback)
async function fetchProjectPages(baseUrl: string): Promise<Array<{url: string; priority: string; changefreq: string; lastmod: string}>> {
  // Layer 1: Get Supabase credentials with multiple fallbacks
  const supabaseUrl = process.env.VITE_SUPABASE_URL 
    || process.env.SUPABASE_URL 
    || (() => {
      throw new Error('VITE_SUPABASE_URL or SUPABASE_URL environment variable is required');
    })();
      
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY 
    || process.env.SUPABASE_ANON_KEY 
    || (() => {
      throw new Error('VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable is required');
    })();

  // Log for debugging (but don't fail if logging fails)
  try {
    console.log(`[Sitemap] Using environment variables for Supabase connection`);
  } catch (e) {
    // Ignore logging errors
  }

  // Layer 2: Create Supabase client with error handling
  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (error) {
    console.error('[Sitemap] Failed to create Supabase client:', error);
    return []; // Safe fallback: return empty array
  }

  // Layer 3: Fetch projects with timeout and comprehensive error handling
  try {
    // Use Promise.race for timeout (5 seconds)
    const timeoutPromise = new Promise<{ type: 'timeout' }>((resolve) => 
      setTimeout(() => resolve({ type: 'timeout' }), 5000)
    );

           // Fetch ALL projects first (like server version), then filter in JavaScript
           // This is safer than using .eq('status', 'active') which might exclude projects without status
           // Note: Database column is createdAt (camelCase), not created_at
           const queryPromise = supabase
             .from('projects')
             .select('slug, createdAt, status')
             .order('createdAt', { ascending: false })
             .limit(10000)
             .then((result: any) => ({ type: 'query', ...result }))
             .catch((error: any) => ({ type: 'error', error }));

    const raceResult = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    // Handle timeout
    if (raceResult.type === 'timeout') {
      console.warn('[Sitemap] Project fetch timed out after 5 seconds');
      return []; // Safe fallback
    }
    
    // Handle query error
    if (raceResult.type === 'error' || raceResult.error) {
      console.error('[Sitemap] Supabase query error:', raceResult.error);
      return []; // Safe fallback
    }
    
    // Extract data
    const { data: allProjects } = raceResult;

    if (!allProjects || !Array.isArray(allProjects) || allProjects.length === 0) {
      console.log('[Sitemap] No projects found in database');
      return []; // Safe fallback
    }

    // Filter for active projects in JavaScript (safer than database filter)
    // Include projects with status='active' OR no status field (backwards compatible)
    const activeProjects = allProjects.filter((project: any) => 
      project.status === 'active' || !project.status || project.status === null
    );

    if (activeProjects.length === 0) {
      console.log('[Sitemap] No active projects found after filtering');
      return []; // Safe fallback
    }

    console.log(`[Sitemap] Found ${activeProjects.length} active projects`);

           // Map projects to sitemap URLs
           // Note: Database column is createdAt (camelCase), not created_at
           return activeProjects.map((project: any) => {
             // Database uses camelCase: createdAt
             const createdAt = project.createdAt;
             const slug = project.slug;

             if (!slug) {
               console.warn('[Sitemap] Project missing slug, skipping:', project);
               return null;
             }

             // Determine lastmod date using createdAt
             let lastmod = new Date().toISOString().split('T')[0]; // Default to today
             if (createdAt) {
               try {
                 lastmod = new Date(createdAt).toISOString().split('T')[0];
               } catch (e) {
                 // Keep default if date parsing fails
                 console.warn('[Sitemap] Invalid createdAt date for project:', slug, createdAt);
               }
             }

      return {
        url: `${baseUrl}/project/${slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod
      };
    }).filter((item): item is {url: string; priority: string; changefreq: string; lastmod: string} => item !== null);

  } catch (error) {
    // Catch-all error handler - return empty array (safe fallback)
    console.error('[Sitemap] Unexpected error in fetchProjectPages:', error);
    return []; // Safe fallback: always return valid array
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