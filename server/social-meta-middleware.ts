import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
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

export async function socialMetaMiddleware(req: Request, res: Response, next: NextFunction) {
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

  // Extract project slug from URL
  const slug = extractProjectSlug(req.path);
  console.log(`📍 Extracted slug: ${slug} from path: ${req.path}`);
  
  if (!slug) {
    console.log('⚠️  No slug found, passing to next middleware');
    return next(); // Not a project page
  }

  try {
    // Fetch project data
    console.log(`🔍 Fetching project by slug: ${slug}`);
    const project = await storage.getProjectBySlug(slug);
    
    if (!project) {
      console.log(`❌ Project not found for slug: ${slug}`);
      return next();
    }

    console.log(`✅ Found project: ${project.title}`);

    // Read the base HTML file (using correct path resolution)
    const htmlPath = path.resolve(import.meta.dirname, '..', 'client', 'index.html');
    let html = await fs.promises.readFile(htmlPath, 'utf-8');

    // Build the full URL
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

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
    console.error('Error in social meta middleware:', error);
    next();
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

