# SEO Pages Deployment Checklist

## ✅ Fixed Issues

### 1. Sitemap Generation Script (`scripts/generate-sitemap.js`)
- ✅ **FIXED**: Now properly matches Astro route structure
- ✅ **FIXED**: Validates URLs exist before including in sitemap
- ✅ **FIXED**: Handles trailing slashes correctly (`/brands/{slug}/`)
- ✅ **ADDED**: Better error handling and logging
- ✅ **ADDED**: File size validation (Google limit: 50MB, 50k URLs)

### 2. URL Structure Validation
- ✅ Canonical URLs are correctly set: `https://dopaya.com/brands/{slug}`
- ✅ Pages are generated at: `dist/brands/{slug}/index.html`
- ✅ Sitemap URLs match: `https://dopaya.com/brands/{slug}/`

## 🔍 Pre-Deployment Checks

### Step 1: Build and Validate
```bash
cd /Users/patrick/Cursor/Dopaya/Tech/SEO/dopaya-astro-seo-pages
npm run build
node scripts/validate-sitemap.js
```

**Expected Output:**
- ✅ All checked URLs are valid!
- ✅ Sitemap generated with X URLs
- ✅ File size under 50MB

### Step 2: Verify Sitemap URLs
1. Open `dist/sitemap-seo.xml`
2. Pick 5-10 random URLs
3. Check they match format: `https://dopaya.com/brands/{slug}/`
4. Verify no trailing slash issues or malformed URLs

### Step 3: Test Sample Pages Locally
```bash
npm run preview
```
Then visit:
- `http://localhost:4321/brands/{any-slug-from-sitemap}`
- Should show actual page content, not 404

## 🚀 Deployment Steps

### Critical: Ensure Pages Are Deployed to Main Site

**The SEO pages MUST be deployed to `dopaya.com`, not a separate subdomain.**

1. **Check Deployment Configuration**
   - Verify Vercel/production config points to `dopaya.com`
   - Ensure `dist` folder contents are deployed
   - Check that `/brands/{slug}` routes are accessible

2. **Verify Sitemap is Accessible**
   - After deployment, visit: `https://dopaya.com/sitemap-seo.xml`
   - Should return XML, not 404
   - Check first few URLs in browser to confirm they work

3. **Submit to Google Search Console**
   - Go to: https://search.google.com/search-console
   - Property: `dopaya.com`
   - Navigate to: **Sitemaps** → **Add a new sitemap**
   - Enter: `sitemap-seo.xml`
   - Click **Submit**

## 🔧 Post-Deployment Verification

### 1. URL Inspection (Google Search Console)
- Use **URL Inspection** tool
- Test 5-10 URLs from sitemap
- Check:
  - ✅ "URL is on Google" or "URL is not on Google"
  - ✅ "Page is indexable"
  - ✅ No "Soft 404" errors
  - ✅ Correct canonical URL

### 2. Manual Browser Check
Visit these URLs directly:
- `https://dopaya.com/brands/{sample-slug-1}/`
- `https://dopaya.com/brands/{sample-slug-2}/`
- `https://dopaya.com/brands/{sample-slug-3}/`

**Expected:** Real page content, not "Page not found"

### 3. Robots.txt Check
Verify `https://dopaya.com/robots.txt`:
- ✅ Does NOT block `/brands/` paths
- ✅ References sitemap: `Sitemap: https://dopaya.com/sitemap-seo.xml`

## ⚠️ Common Issues & Fixes

### Issue 1: Pages Return 404
**Cause:** Pages not deployed or wrong route structure
**Fix:**
- Verify Astro build outputs to `dist/brands/{slug}/index.html`
- Check deployment includes `dist` folder
- Verify server routing handles `/brands/{slug}/` correctly

### Issue 2: Sitemap URLs Don't Match Pages
**Cause:** Sitemap generator creating wrong URLs
**Fix:**
- Run `node scripts/validate-sitemap.js` to check
- Ensure sitemap URLs match canonical URLs exactly
- Rebuild and regenerate sitemap

### Issue 3: Google Shows "Soft 404"
**Cause:** Pages exist but look empty/thin to Google
**Fix:**
- Ensure pages have substantial content (not just template)
- Check meta descriptions are unique per page
- Verify canonical tags are correct

### Issue 4: Pages Not Indexing After Weeks
**Cause:** Low priority, crawl budget, or quality issues
**Fix:**
- Request indexing for top 10-20 pages manually
- Add internal links from main pages to brand pages
- Ensure pages have unique, valuable content

## 📊 Monitoring

### Weekly Checks (First Month)
1. Google Search Console → **Coverage** report
   - Check "Valid" vs "Excluded" pages
   - Review "Not indexed" reasons

2. **Performance** report
   - Monitor impressions/clicks for brand keywords
   - Track which pages get organic traffic

3. **Sitemap** status
   - Verify "Success" status
   - Check "Discovered pages" count matches expected

### Monthly Review
- Review indexing rate (how many pages indexed vs submitted)
- Identify top-performing brand keyword combinations
- Adjust strategy based on what's working

## 🎯 Success Criteria

After 4-6 weeks, you should see:
- ✅ 50%+ of submitted pages indexed
- ✅ Some organic impressions for brand keywords
- ✅ No "Soft 404" errors in Search Console
- ✅ Pages accessible and returning 200 status

## 📝 Notes

- **Sitemap Location:** `dist/sitemap-seo.xml` (generated after build)
- **Sitemap URL:** `https://dopaya.com/sitemap-seo.xml`
- **Expected Pages:** ~1,400-1,600 brand SEO pages
- **Update Frequency:** Weekly (set in sitemap)
- **Priority:** 0.8 (high priority for brand pages)
