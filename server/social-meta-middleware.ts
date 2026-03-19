import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { getBlogPostMeta } from "./blog-data";
import fs from "fs";
import path from "path";

/**
 * Middleware to inject Open Graph meta tags for social media bots
 * This ensures Facebook, Twitter, LinkedIn etc. can see project images/titles
 */

// Detect if request is from a social media bot
function isSocialBot(userAgent: string): boolean {
  const botPatterns = [
    'facebookexternalhit',
    'facebot',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'TelegramBot',
    'Slackbot',
    'SkypeUriPreview',
    'Discordbot'
  ];
  
  return botPatterns.some(pattern => userAgent.includes(pattern));
}

// Extract project slug from various URL patterns
function extractProjectSlug(url: string): string | null {
  // Match patterns like:
  // /projects/slug-name
  // /project/slug-name
  const match = url.match(/\/projects?\/([^/?]+)/);
  return match ? match[1] : null;
}

// Extract blog post slug from URL patterns like /blog/slug-name or /de/blog/slug-name
function extractBlogSlug(url: string): string | null {
  const match = url.match(/\/(?:de\/)?blog\/([^/?]+)/);
  return match ? match[1] : null;
}

export async function socialMetaMiddleware(req: Request, res: Response, next: NextFunction) {
  // CRITICAL: Skip API routes entirely - they have their own auth
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // CRITICAL: Skip static assets (favicon, images, etc.)
  if (req.path.startsWith('/favicon.ico') || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/static/') ||
      req.path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  const userAgent = req.headers['user-agent'] || '';
  
  // Only process if it's a social media bot
  if (!isSocialBot(userAgent)) {
    return next();
  }

  console.log(`🤖 Social bot detected: ${userAgent.substring(0, 50)}...`);
  
  // Only process HTML requests (accept text/html or */*)
  const accepts = req.headers.accept || '';
  if (!accepts.includes('text/html') && !accepts.includes('*/*')) {
    console.log(`⚠️  Non-HTML request (Accept: ${accepts}), passing to next middleware`);
    return next();
  }

  // Build the full URL (used by both project and blog handlers)
  const protocol = req.protocol;
  const host = req.get('host');
  const fullUrl = `${protocol}://${host}${req.originalUrl}`;

  // Try blog post first (file-based, no Supabase call needed)
  const blogSlug = extractBlogSlug(req.path);
  if (blogSlug) {
    const blogPost = getBlogPostMeta(blogSlug);
    if (blogPost) {
      console.log(`✅ Found blog post: ${blogPost.title}`);
      try {
        const htmlPath = path.resolve(import.meta.dirname, '..', 'client', 'index.html');
        let html = await fs.promises.readFile(htmlPath, 'utf-8');

        const ogTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${escapeHtml(blogPost.title)} | Dopaya" />
    <meta property="og:description" content="${escapeHtml(blogPost.description)}" />
    ${blogPost.image ? `<meta property="og:image" content="${escapeHtml(blogPost.image)}" />` : ''}
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Dopaya" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${fullUrl}" />
    <meta property="twitter:title" content="${escapeHtml(blogPost.title)} | Dopaya" />
    <meta property="twitter:description" content="${escapeHtml(blogPost.description)}" />
    ${blogPost.image ? `<meta property="twitter:image" content="${escapeHtml(blogPost.image)}" />` : ''}
`;
        html = html.replace('</head>', `${ogTags}\n  </head>`);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
        console.log(`📤 Sent social preview for blog: ${blogPost.title}`);
        return;
      } catch (error) {
        console.error('[social-meta-middleware] Error serving blog meta:', error);
        return next();
      }
    }
  }

  // Try project page
  const slug = extractProjectSlug(req.path);
  console.log(`📍 Extracted slug: ${slug} from path: ${req.path}`);

  if (!slug) {
    console.log('⚠️  No slug found, passing to next middleware');
    return next(); // Not a project or blog page
  }

  try {
    // CRITICAL: Only make Supabase calls for non-API routes that are project pages
    // This middleware should NEVER make Supabase calls for API routes or static assets
    const project = await storage.getProjectBySlug(slug);

    if (!project) {
      console.log(`❌ Project not found for slug: ${slug}`);
      return next();
    }

    console.log(`✅ Found project: ${project.title}`);

    // Read the base HTML file (using correct path resolution)
    const htmlPath = path.resolve(import.meta.dirname, '..', 'client', 'index.html');
    let html = await fs.promises.readFile(htmlPath, 'utf-8');

    // Prepare OG meta tags
    const ogTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${escapeHtml(project.title)} | Dopaya" />
    <meta property="og:description" content="${escapeHtml(project.summary || project.description)}" />
    <meta property="og:image" content="${escapeHtml(project.imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Dopaya" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${fullUrl}" />
    <meta property="twitter:title" content="${escapeHtml(project.title)} | Dopaya" />
    <meta property="twitter:description" content="${escapeHtml(project.summary || project.description)}" />
    <meta property="twitter:image" content="${escapeHtml(project.imageUrl)}" />
`;

    // Inject OG tags into <head>
    html = html.replace('</head>', `${ogTags}\n  </head>`);

    // Send the modified HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

    console.log(`📤 Sent social preview for: ${project.title}`);
  } catch (error) {
    console.error('[social-meta-middleware] Error in social meta middleware:', error);
    // Always call next() on error - never return 401 for public routes
    return next();
  }
}

// Helper to escape HTML special characters
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

