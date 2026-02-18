import { rewrite } from '@vercel/functions';

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Route /brands/* requests to external Astro SEO deployment
  // Exclude exact /brands route (handled by React app)
  if (pathname.startsWith('/brands/') && pathname !== '/brands') {
    const astroUrl = `https://dopaya-astro-seo-pages.vercel.app${pathname}`;
    return rewrite(new URL(astroUrl));
  }

  // Route /de/brands/* requests to external Astro SEO deployment
  if (pathname.startsWith('/de/brands/')) {
    const astroUrl = `https://dopaya-astro-seo-pages.vercel.app${pathname}`;
    return rewrite(new URL(astroUrl));
  }

  // Route /_assets/* requests to external Astro SEO deployment
  if (pathname.startsWith('/_assets/')) {
    const astroUrl = `https://dopaya-astro-seo-pages.vercel.app${pathname}`;
    return rewrite(new URL(astroUrl));
  }

  // Route /sitemap-seo.xml to external Astro SEO deployment
  if (pathname === '/sitemap-seo.xml') {
    const astroUrl = 'https://dopaya-astro-seo-pages.vercel.app/sitemap-seo.xml';
    return rewrite(new URL(astroUrl));
  }

  // Allow all other requests to proceed normally
  return new Response(null, { status: 200 });
}

export const config = {
  matcher: [
    '/brands/:path*',
    '/de/brands/:path*',
    '/_assets/:path*',
    '/sitemap-seo.xml',
  ],
};
