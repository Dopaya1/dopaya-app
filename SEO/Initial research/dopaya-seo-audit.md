# Dopaya.com - Complete SEO Audit Report

**Generated:** January 30, 2026  
**Audited URL:** https://dopaya.com  
**Scope:** Technical SEO, On-Page SEO, LLM Optimization (GEO)

---

## Executive Summary

Overall, dopaya.com has a solid foundation but has **critical issues** that are likely hurting search rankings and LLM visibility. The most urgent fixes relate to the robots.txt misconfiguration, missing structured data, and unverified Google Search Console setup.

### Priority Rating
- 🔴 **Critical** - Fix immediately
- 🟠 **High** - Fix within 1 week
- 🟡 **Medium** - Fix within 2 weeks
- 🟢 **Low** - Nice to have

---

## 🔴 CRITICAL ISSUES

### 1. **robots.txt Points to Wrong Domain**

**Issue:** Your robots.txt file points to the wrong sitemap:
```
Sitemap: https://dopaya.org/sitemap.xml  ❌ WRONG
```

**Should be:**
```
Sitemap: https://dopaya.com/sitemap.xml  ✅ CORRECT
```

**Impact:** Search engines may never discover your sitemap, hurting crawling and indexing of all pages.

**Fix:** Update `public/robots.txt` immediately.

---

### 2. **Google Search Console Not Verified**

**Issue:** Found placeholder verification code:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE">
```

**Impact:** You cannot monitor search performance, submit sitemaps, or receive alerts about indexing issues.

**Fix:**
1. Go to Google Search Console
2. Add property for dopaya.com
3. Get your actual verification code
4. Replace the placeholder

---

### 3. **Missing Structured Data (JSON-LD)**

**Issue:** No structured data (schema.org markup) was detected on the homepage.

**Impact:** 
- Missing rich snippets in Google search results
- LLMs cannot easily understand your organization, services, or content
- Competitors with structured data will rank higher

**Required Schemas to Add:**

#### a) Organization Schema (Homepage)
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dopaya",
  "alternateName": "Dopaya Social Impact Platform",
  "url": "https://dopaya.com",
  "logo": "https://dopaya.com/assets/Dopaya%20Logo-IS_kpXiQ.png",
  "description": "Platform connecting supporters with verified social enterprises, enabling donations while earning rewards from sustainable brands.",
  "foundingDate": "2024",
  "foundingLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CH"
    }
  },
  "areaServed": "Worldwide",
  "slogan": "Supporting real impact made rewarding",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hello@dopaya.com",
    "url": "https://dopaya.com/contact"
  },
  "sameAs": [
    "https://www.linkedin.com/company/dopaya",
    "https://www.instagram.com/dopaya"
  ]
}
</script>
```

#### b) WebSite Schema (Homepage)
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Dopaya",
  "url": "https://dopaya.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://dopaya.com/projects?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

#### c) FAQPage Schema (FAQ Page)
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why support social enterprises instead of NGOs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Social enterprises use sustainable business models to create long-term impact. Unlike traditional charities that may create dependency, social enterprises build self-sustaining solutions that continue generating value for communities."
      }
    },
    {
      "@type": "Question",
      "name": "How does Dopaya make money?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Dopaya operates sustainably through partnerships with impact-driven brands who offer exclusive rewards to our supporters."
      }
    }
  ]
}
</script>
```

#### d) NonProfitType/SocialEnterprise Schema (Project Pages)
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://dopaya.com/project/openversum#organization",
  "name": "Openversum",
  "description": "Connecting Swiss water technology with local entrepreneurship, ensuring safe, affordable, and reliable access to clean drinking water for communities worldwide.",
  "url": "https://dopaya.com/project/openversum",
  "areaServed": "Global",
  "knowsAbout": ["Water purification", "Clean drinking water", "Social enterprise"],
  "parentOrganization": {
    "@type": "Organization",
    "name": "Dopaya",
    "url": "https://dopaya.com"
  }
}
</script>
```

---

## 🟠 HIGH PRIORITY ISSUES

### 4. **Missing Open Graph & Twitter Card Meta Tags (Verify)**

From the scrape, I detected partial OG tags but you should verify complete implementation:

**Required OG Tags:**
```html
<meta property="og:title" content="Dopaya - Social Impact Platform | Support Social Enterprises & Earn Rewards">
<meta property="og:description" content="Join Dopaya to support high-impact social enterprises, earn impact points, and drive meaningful change in communities worldwide.">
<meta property="og:image" content="https://dopaya.com/og-image.png">
<meta property="og:url" content="https://dopaya.com">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Dopaya">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="de_DE">
```

**Required Twitter Tags:**
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@dopaya">
<meta name="twitter:title" content="Dopaya - Social Impact Platform">
<meta name="twitter:description" content="Support verified social enterprises & earn rewards from sustainable brands.">
<meta name="twitter:image" content="https://dopaya.com/og-image.png">
```

**Impact:** Poor social media sharing appearance, reduced click-through rates when shared.

---

### 5. **Missing OG Image / Social Share Image**

**Issue:** Need a dedicated 1200x630px social share image.

**Fix:** Create `public/og-image.png` (1200x630px) showing:
- Dopaya logo
- Tagline "Supporting real impact made rewarding"
- Visual representation of impact (people, projects)

---

### 6. **Duplicate H1 Tags**

**Issue:** The homepage appears to have the same H1 repeated:
```
# Supporting real impact made rewarding
```

This appears twice (mobile + desktop versions). While not critical, having a single, clear H1 is best practice.

**Fix:** Ensure only one H1 per page using CSS to show/hide versions rather than duplicate DOM elements.

---

### 7. **Image Alt Text Improvements**

**Current:** Generic alt texts like "Gallery image 1", "Gallery image 2"

**Better:** Descriptive alt texts like:
- "MPower Ventures - Solar energy project in rural Africa"
- "Vision Friend - Eye care screening in India"
- "Openversum - Clean water technology installation"

**Impact:** Better accessibility, image search rankings, and LLM understanding.

---

### 8. **Missing Breadcrumb Schema**

**Issue:** Project pages should have breadcrumb navigation with schema markup.

**Add to project pages:**
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://dopaya.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Projects",
      "item": "https://dopaya.com/projects"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Openversum",
      "item": "https://dopaya.com/project/openversum"
    }
  ]
}
</script>
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 9. **Sitemap XML Formatting**

**Current sitemap lacks proper XML formatting** - appears as concatenated text without proper tags visible. Ensure the sitemap is valid XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dopaya.com/</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ...
</urlset>
```

**Fix:** Validate at https://www.xml-sitemaps.com/validate-xml-sitemap.html

---

### 10. **Missing German Sitemap URLs**

**Issue:** Sitemap doesn't include German `/de/` pages even though hreflang tags reference them.

**Add to sitemap:**
- https://dopaya.com/de/
- https://dopaya.com/de/projects
- https://dopaya.com/de/about
- https://dopaya.com/de/contact
- etc.

---

### 11. **Page Title Optimization**

**Current:** "Dopaya - Social Impact Platform | Support Social Enterprises & Earn Rewards"

**Optimized Options:**
- "Dopaya: Support Social Enterprises & Earn Sustainable Brand Rewards"
- "Dopaya | Fund Social Enterprises, Earn Rewards from Swiss Brands"

**Tips:**
- Keep under 60 characters
- Put unique keywords first
- Include location (Swiss) if targeting local

---

### 12. **Meta Description Enhancement**

**Current:** "Join Dopaya to support high-impact social enterprises, earn impact points, and drive meaningful change in communities worldwide."

**Optimized:** "Support verified social enterprises and earn exclusive rewards from sustainable Swiss brands. 100% transparent impact tracking. Join 2,800+ founding members making a difference."

**Tips:**
- Include numbers (social proof)
- Add call-to-action words
- Keep 150-160 characters

---

## 🟢 LLM OPTIMIZATION (GEO - Generative Engine Optimization)

To rank well in AI-powered search (ChatGPT, Perplexity, Google AI Overviews, etc.):

### 13. **Create an llms.txt File**

Create `public/llms.txt` to help AI understand your site:

```markdown
# Dopaya

> Supporting real impact made rewarding

Dopaya is a social impact platform connecting supporters with verified social enterprises. Users donate to vetted projects and earn rewards from sustainable brands.

## What We Do
- Verify and feature social enterprises across clean energy, healthcare, education, water, and more
- Enable transparent donations with 100% going to causes
- Reward supporters with exclusive discounts from Swiss sustainable brands
- Track personal impact through a comprehensive dashboard

## Key Pages
- /projects - Browse all social enterprises
- /about - Our mission and team
- /social-enterprises - Apply to join as a social enterprise
- /brands - Partner with us as a sustainable brand
- /faq - Frequently asked questions

## Social Enterprises
Featured enterprises include MPower (clean energy), Vision Friend (healthcare), Openversum (water), Ignis Careers (education), and more.

## Brand Partners
NIKIN, RRREVOLVE, RESLIDES, Wuerfeli, Rania Kinge, Ecomade.ch, 2nd Peak, Syangs

## Contact
hello@dopaya.com
https://dopaya.com/contact
```

---

### 14. **Add FAQ Content with Clear Q&A Format**

LLMs love question-answer formats. Your FAQ page content should use:
- Clear H2/H3 for questions
- Concise, factual answers
- Lists for multi-part answers

---

### 15. **Create Topic Authority Content**

To be cited by LLMs, create authoritative content pages:

**Suggested Content:**
1. **"What is a Social Enterprise?"** - Educational page defining social enterprises vs NGOs vs B-Corps
2. **"How to Support Social Enterprises"** - Guide for conscious consumers  
3. **"Impact Investing for Individuals"** - Educational resource
4. **"Social Enterprise Directory Switzerland"** - List of Swiss social enterprises

---

### 16. **Implement Speakable Schema** (for voice search)

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".hero-description", ".value-proposition"]
  }
}
</script>
```

---

### 17. **Add Statistics and Facts**

LLMs cite concrete data. Add visible stats:
- "2,847 founding members"
- "10+ verified social enterprises"
- "50,000+ CHF funded" (if true)
- "100% of donations go to causes"

---

## TECHNICAL SEO CHECKLIST

### Current Status

| Element | Status | Notes |
|---------|--------|-------|
| SSL/HTTPS | ✅ Good | Site uses HTTPS |
| Mobile Responsive | ✅ Good | Viewport meta tag present |
| Canonical URLs | ✅ Good | Canonical tags present |
| Hreflang | ✅ Good | EN/DE/x-default configured |
| robots.txt | ❌ Critical | Wrong sitemap URL |
| Sitemap | 🟡 Partial | Missing German pages |
| Meta Description | ✅ Good | Present but can improve |
| Meta Keywords | ✅ Good | Present |
| Open Graph | 🟡 Verify | Needs verification |
| Twitter Cards | 🟡 Verify | Needs verification |
| Structured Data | ❌ Missing | No JSON-LD found |
| Google Verification | ❌ Placeholder | Not configured |
| Core Web Vitals | ❓ Unknown | Run PageSpeed Insights |

---

## RECOMMENDED IMPLEMENTATION ORDER

### Week 1 (Critical)
1. Fix robots.txt sitemap URL
2. Set up and verify Google Search Console
3. Add Organization schema to homepage
4. Add WebSite schema to homepage

### Week 2 (High)
5. Add FAQPage schema to FAQ page
6. Create and add OG image
7. Verify/add complete OG and Twitter meta tags
8. Fix duplicate H1 issue

### Week 3 (Medium)
9. Add breadcrumb schema to project pages
10. Add German pages to sitemap
11. Improve image alt texts
12. Create llms.txt file

### Ongoing (LLM Optimization)
13. Create educational content pages
14. Add statistics throughout site
15. Build backlinks from authority sites
16. Submit to directories and social enterprise databases

---

## TOOLS FOR ONGOING MONITORING

1. **Google Search Console** - Monitor indexing, clicks, impressions
2. **Google Analytics 4** - Track traffic and conversions
3. **Ahrefs / Semrush** - Track rankings and backlinks
4. **PageSpeed Insights** - Monitor Core Web Vitals
5. **Schema Markup Validator** - https://validator.schema.org/
6. **Rich Results Test** - https://search.google.com/test/rich-results
7. **Mobile-Friendly Test** - https://search.google.com/test/mobile-friendly

---

## COMPETITOR ANALYSIS SUGGESTION

Monitor these competitors for SEO best practices:
- GlobalGiving.org
- Kiva.org
- B Lab / B Corporation
- Swiss social enterprise platforms

---

*Report generated by SEO Audit Tool*
*Last updated: January 30, 2026*
