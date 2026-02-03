# Astro Implementation Checklist - Dopaya Programmatic Pages

Use this checklist to track your implementation and deployment progress.

---

## ✅ Phase 1: Project Setup (COMPLETED)

- [x] Created isolated Astro project directory (`dopaya-astro-brands/`)
- [x] Configured package.json with dependencies
- [x] Set up Astro config with React & Tailwind integrations
- [x] Created Tailwind config with Dopaya brand colors
- [x] Created global CSS styles matching Dopaya design
- [x] Set up .gitignore

---

## ✅ Phase 2: Data Model (COMPLETED)

- [x] Created `brands.json` with 8 brand partners
- [x] Created `sectors.json` with 5 sector clusters and enterprises
- [x] Created `rewards.json` with 4 reward phrase variants
- [x] Data structure supports 160 programmatic page combinations

---

## ✅ Phase 3: Components & Templates (COMPLETED)

- [x] Created BaseLayout.astro with SEO meta tags
- [x] Created Hero.astro component
- [x] Created HowItWorks.astro component
- [x] Created EnterpriseGrid.astro component
- [x] Created BrandInfo.astro component
- [x] Created FAQ.astro component with structured data
- [x] Created CTA.astro component
- [x] Created dynamic route: `brands/[...slug].astro`
- [x] Created index.astro hub page

---

## ✅ Phase 4: SEO & Analytics (COMPLETED)

- [x] Meta title tags (unique per page)
- [x] Meta description tags (unique per page)
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Canonical URLs
- [x] JSON-LD WebPage schema
- [x] JSON-LD BreadcrumbList schema
- [x] JSON-LD FAQPage schema
- [x] robots.txt configured
- [x] Analytics placeholder ready

---

## ✅ Phase 5: Documentation (COMPLETED)

- [x] README.md - Project overview
- [x] QUICK_START.md - 5-minute setup guide
- [x] DEPLOYMENT_GUIDE.md - Vercel deployment steps
- [x] MAIN_DOMAIN_INTEGRATION.md - Integration guide
- [x] IMPLEMENTATION_COMPLETE.md - Summary

---

## 📋 Phase 6: Local Testing (YOUR TURN)

- [ ] Run `npm install` in dopaya-astro-brands folder
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:4321/brands/nikin-clean-energy-donation-rewards`
- [ ] Test 5-10 different brand × sector combinations
- [ ] Check responsive design on mobile
- [ ] Verify all internal links work
- [ ] Test FAQ accordion functionality

---

## 📋 Phase 7: Content Customization (YOUR TURN)

**Optional before deployment:**

- [ ] Add brand logos to `public/images/brands/`
  - nikin-logo.png
  - rrrevolve-logo.png
  - reslides-logo.png
  - 2nd-peak-logo.png
  - kompotoi-logo.png
  - syangs-logo.png
  - wuerfeli-logo.png
  - ecomade-logo.png

- [ ] Update brand colors in `tailwind.config.mjs`
  - Replace `#000000` with your actual primary color
  
- [ ] Add analytics tracking in `src/layouts/BaseLayout.astro`
  - Add your GA4 or Plausible script

- [ ] Review and update brand descriptions in `src/data/brands.json`
  - Ensure accuracy and completeness

---

## 📋 Phase 8: Build & Deploy (YOUR TURN)

### 8.1 Build Production

- [ ] Run `npm run build`
- [ ] Verify build succeeds
- [ ] Check `dist/brands/` folder contains ~160 HTML files
- [ ] Run `npm run preview` to test production build locally

### 8.2 Initialize Git

- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Initial Astro programmatic pages"`
- [ ] Create GitHub repo: `dopaya-astro-brands`
- [ ] `git remote add origin [your-repo-url]`
- [ ] `git push -u origin main`

### 8.3 Deploy to Vercel

**Option A: CLI**
- [ ] `npm install -g vercel` (if not installed)
- [ ] `vercel login`
- [ ] `vercel --prod`
- [ ] Note the deployment URL

**Option B: Dashboard**
- [ ] Go to vercel.com/new
- [ ] Import GitHub repo
- [ ] Configure: Framework = Astro
- [ ] Deploy

### 8.4 Test Deployment

- [ ] Visit your Vercel URL (e.g., `dopaya-astro-brands.vercel.app`)
- [ ] Test 5-10 sample pages
- [ ] Run Lighthouse on 3 pages (target: 95+)
- [ ] Verify structured data: https://search.google.com/test/rich-results

---

## 📋 Phase 9: Subdomain Setup (YOUR TURN)

### 9.1 Configure Vercel

- [ ] In Vercel project settings → Domains
- [ ] Add custom domain: `brands.dopaya.com`
- [ ] Note the DNS instructions provided

### 9.2 Configure DNS

- [ ] Log into DNS provider (Cloudflare, Namecheap, etc.)
- [ ] Add CNAME record:
  - Type: CNAME
  - Name: brands
  - Value: cname.vercel-dns.com
  - TTL: Auto or 3600
- [ ] Save changes

### 9.3 Wait & Verify

- [ ] Wait 15-60 minutes for DNS propagation
- [ ] Run `nslookup brands.dopaya.com`
- [ ] Visit `https://brands.dopaya.com/brands/nikin-clean-energy-donation-rewards`
- [ ] Verify SSL certificate issued automatically

---

## 📋 Phase 10: SEO Setup (YOUR TURN)

### 10.1 Google Search Console

- [ ] Go to search.google.com/search-console
- [ ] Add property: `brands.dopaya.com`
- [ ] Verify ownership (Vercel auto or DNS TXT)
- [ ] Submit sitemap: `https://brands.dopaya.com/sitemap-0.xml`
- [ ] Request indexing for 5-10 sample pages

### 10.2 Analytics Setup

- [ ] Verify tracking code added to BaseLayout.astro
- [ ] Test: View page, check GA4 Real-Time reports
- [ ] Set up conversion goals (sign-ups, donations)

---

## 📋 Phase 11: Verify Main Site Untouched (CRITICAL)

- [ ] Visit `https://dopaya.com` - works normally ✅
- [ ] Visit `https://dopaya.com/projects` - works ✅
- [ ] Visit `https://dopaya.com/dashboard` - works ✅
- [ ] Test authentication - works ✅
- [ ] Test payment flow - works ✅
- [ ] Check existing functionality - all working ✅

**Expected: Everything on dopaya.com should be 100% unchanged.**

---

## 📋 Phase 12: Monitoring (First 2 Weeks)

- [ ] Day 1: Check Vercel logs for errors
- [ ] Day 3: Check Google Search Console for indexing
- [ ] Week 1: Review Lighthouse scores
- [ ] Week 2: Check initial organic traffic in analytics
- [ ] Week 2: Monitor Core Web Vitals in Vercel

---

## 📋 Phase 13: Main Domain Integration (OPTIONAL - After Success)

**Only do this after subdomain proves successful (4-8 weeks)**

- [ ] In main Dopaya Vercel project, add to `vercel.json`:
  ```json
  {
    "rewrites": [
      {
        "source": "/brands/:path*",
        "destination": "https://brands.dopaya.com/brands/:path*"
      }
    ]
  }
  ```
- [ ] Deploy main site
- [ ] Test `dopaya.com/brands/*` URLs
- [ ] Update canonical URLs in Astro project
- [ ] Rebuild and redeploy Astro project
- [ ] Monitor for 2 weeks
- [ ] Update sitemap reference in main site

---

## Success Criteria

### Week 1
- [ ] All 160 pages accessible
- [ ] Lighthouse scores 95+
- [ ] No console errors
- [ ] Mobile responsive

### Month 1
- [ ] 50+ pages indexed in Google
- [ ] 500+ organic impressions
- [ ] 100+ organic clicks
- [ ] 5+ conversions

### Month 3
- [ ] 150+ pages indexed
- [ ] 10,000+ organic impressions
- [ ] 2,000+ organic clicks
- [ ] 20+ conversions

### Month 6
- [ ] All 160 pages indexed
- [ ] 30,000+ organic impressions
- [ ] 4,000+ organic clicks
- [ ] 40+ conversions
- [ ] Ready for Phase 2 expansion

---

## Quick Reference Commands

```bash
# Navigate to project
cd "/Users/patrick/Cursor/Dopaya Business/dopaya-astro-brands"

# Install
npm install

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy
vercel --prod
```

---

**Current Status:** ✅ All implementation complete. Ready for you to test and deploy!

**Next:** Follow `QUICK_START.md` to see your pages locally in 5 minutes.
