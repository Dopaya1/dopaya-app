# Rollback: SEO programmatic pages CSS/JS

If the `/_assets/` rewrite causes any issue, you can roll back by removing it.

**Steps:**
1. Open `vercel.json`.
2. In the `rewrites` array, **delete this line**:
   ```json
   { "source": "/_assets/:path*", "destination": "https://dopaya-astro-seo-pages.vercel.app/_assets/:path*" },
   ```
3. Save and redeploy.

After rollback, programmatic pages at `/brands/...` will still load (HTML) but styles/scripts will not load on dopaya.com until this rewrite is re-added or another fix is applied.
