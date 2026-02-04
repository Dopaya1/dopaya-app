# Dopaya Programmatic SEO Implementation Plan

**Prioritized by Search Volume & Strategic Fit**

This document outlines the implementation roadmap for Dopaya's programmatic SEO strategy, ordered by priority based on actual search volume data and strategic alignment.

---

## Phase 1: High-Volume Brand & Reward Integration (Priority Start)

### Formula 3: Brand + Product Category + Reward Type + Benefit Modifier (4,312+ keywords)

**Formula:** `{Brand} + {Product Category} + {Reward Type} + {Benefit Modifier}`

**Variables:**
- **Brands** (9): NIKIN, RRREVOLVE, 2nd Peak, RESLIDES, sustainable fashion brand, ethical home goods brand, **Rania Kinge**, **Wuerfeli (by QE)**, **Ecomade**  
- **Product Categories:** per brand (see complete overview below)  
- **Reward Types** (5): cashback, loyalty points, discount codes, impact credits, impact points  
- **Benefit Modifiers** (3): supporting social enterprises, with verified impact, for conscious consumers  

**Data source:** Only brands with **status = active** in the Supabase `brands` table are shown on the site; drafts are hidden. Programmatic pages are generated for all brands in the overview below.  

**Examples:**
- "NIKIN clothing cashback supporting social enterprises"
- "sustainable fashion brand loyalty points with verified impact"
- "ethical home goods discount codes for conscious consumers"

---

### Complete Overview: Brands × Categories × Reward Types × Benefit Modifiers

| Brand | Product Categories | Reward Types | Benefit Modifiers | Pages |
|-------|--------------------|--------------|-------------------|-------|
| **NIKIN** | clothing, accessories, outdoor gear, handbags | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 60 |
| **RRREVOLVE** | clothing, accessories, shoes, handbags | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 60 |
| **2nd Peak** | outdoor gear, athletic wear, accessories, clothing | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 60 |
| **RESLIDES** | shoes, accessories | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 30 |
| **sustainable fashion brand** | clothing, accessories, shoes | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 45 |
| **ethical home goods brand** | home goods, lifestyle products | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 30 |
| **Rania Kinge** | clothing, accessories | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 30 |
| **Wuerfeli (by QE)** | home goods, lifestyle products | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 30 |
| **Ecomade** | home goods, lifestyle products | cashback, loyalty points, discount codes, impact credits, impact points | supporting social enterprises, with verified impact, for conscious consumers | 30 |

**Total Formula 3 pages:** 375 (9 brands × categories × 5 reward types × 3 benefit modifiers)

---

### Brand Verification Summary

| Brand | Verified Categories | Source | Notes |
|-------|---------------------|--------|-------|
| **NIKIN** | clothing, accessories, outdoor gear, handbags | brands.json | ✓ Apparel, TreeCaps/socks/bags, outdoor gear, backpacks & bags |
| **2nd Peak** | outdoor gear, athletic wear, accessories, clothing | brands.json | ✓ Second-hand outdoor shop — jackets, tops, pants |
| **RESLIDES** | shoes, accessories | brands.json | ✓ Modular sustainable sandals; accessories = straps |
| **RRREVOLVE** | clothing, accessories, shoes, handbags | brands.json + categories.json | ✓ Fair fashion retailer; handbags from categories.relatedBrands |
| **Rania Kinge** | clothing, accessories | brands.json | ✓ Handcrafted jewelry and apparel; women-empowering brand |
| **Wuerfeli (by QE)** | home goods, lifestyle products | brands.json | ✓ Swiss indoor air quality device; lifestyle/wellness |
| **Ecomade** | home goods, lifestyle products | brands.json | ✓ Swiss sustainable mattresses; circular design |

**Display rule:** Only brands with **status = active** in Supabase are shown on the homepage and in brand lists; programmatic Formula 3 pages are generated for all 9 brands above.

---

### Reward Types (5)

| ID | Name |
|----|------|
| cashback | cashback |
| loyalty-points | loyalty points |
| discount-codes | discount codes |
| impact-credits | impact credits |
| impact-points | impact points |

### Benefit Modifiers (3 in use)

| Modifier | Purpose |
|----------|---------|
| supporting social enterprises | Captures donation/impact intent |
| with verified impact | Captures transparency/verification intent |
| for conscious consumers | Captures audience identity intent |

*Additional modifiers in `rewards.json` (not in use): sustainable, ethical, transparent giving, values-aligned*

---

### Suggested Additional Categories (for future expansion)

| Brand | Possible addition | Rationale |
|-------|-------------------|-----------|
| **RRREVOLVE** | home goods | RRREVOLVE offers "Home & Living" products |
| **NIKIN** | — | Current categories cover full range (caps/bags under accessories) |
| **2nd Peak** | — | Outdoor gear + athletic wear + clothing covers second-hand outdoor apparel |
| **RESLIDES** | — | Shoes + accessories (straps) covers modular sandal ecosystem |

---

**Notes:** Kompotoi removed (not a current brand partner). Rania Kinge, Wuerfeli (by QE), and Ecomade added to Formula 3; only brands with **status = active** in the Supabase `brands` table are displayed on the site.

**Search Volume Insights (Switzerland):**
- `NIKIN` → **~9,900/month**
- `RRREVOLVE` → **~9,900/month**
- `2nd Peak` → **~1,300/month**
- `Kompotoi` → **~1,300/month**
- `RESLIDES` → **~140/month**

**Why Priority 1:**
- Leverages **existing high brand search volume** in Switzerland
- Connects brand intent to Dopaya's value proposition
- High commercial intent (people already searching for these brands)
- Fast traffic gains by piggybacking on established brands

---

### Formula 12: Brand Partner + Dopaya Sector Cluster + Reward Phrase (160+ keywords)

**Formula:** `{Brand Partner} + {Dopaya Sector Cluster} + {Reward Phrase}`

**Variables:**
- **Brand Partners** (8): NIKIN, RRREVOLVE, RESLIDES, Wuerfeli (QE), Rania Kinge, Syangs (brand), Ecomade.ch, 2nd Peak  
- **Dopaya Sector Clusters** (5): clean energy & environment (MPower Ventures, Mandulis Energy, Panjurli Labs, Dump In Bin), water & WASH (Openversum, Kompotoi), education in India (Ignis Careers), healthcare & vision (Vision Friend Sakib Gore), food & agriculture / community well-being (Syangs project)  
- **Reward Phrases** (4): donation rewards, impact points, exclusive supporter perks, sustainable shopping rewards  

**Examples:**
- "NIKIN clean energy & environment donation rewards"
- "RRREVOLVE education in India impact points"
- "RESLIDES water & WASH exclusive supporter perks"
- "Syangs sustainable shopping rewards for food & agriculture projects"

**Scale:** 8 brands × 5 sector clusters × 4 reward phrases = **160 keywords**

**Why Priority 1:**
- Direct connection between **brand searches and Dopaya's actual social enterprises**
- Creates clear user journey: brand search → impact cause → donation
- Leverages same high-volume brand traffic as Formula 3
- More tightly aligned to current Dopaya offerings

---

## Phase 2: Educational & Conscious Consumer Content (Volume + Authority)

### Formula 4: Question Trigger + Topic + Audience + Desired Outcome (4,480+ keywords)

**Formula:** `{Question Trigger} + {Topic} + {Audience} + {Desired Outcome}`

**Variables:**
- **Question Triggers** (8): how to, what is, why should I, where can I, which, is it worth, can I, should I  
- **Topics** (10): social enterprises, sustainable giving, impact rewards, verified nonprofits, ethical consumption, conscious shopping, impact tracking, charitable donations, sustainable brands, reward programs  
- **Audiences** (8): conscious consumers, working professionals, young adults, families, students, entrepreneurs, corporate teams, ethical shoppers  
- **Desired Outcomes** (7): earn while giving, track my impact, support verified causes, get rewards, make a difference, align values, be part of a community  

**Examples:**
- "how to support social enterprises as a conscious consumer and earn while giving"
- "what is the best sustainable giving platform for working professionals to track impact"
- "where can ethical shoppers get rewards while supporting verified causes"

**Scale:** 8 triggers × 10 topics × 8 audiences × 7 outcomes = **4,480 keywords**

**Search Volume Insights (US):**
- `what is a social enterprise` → **~1,000/month**
- `what is impact investing` → **~720/month**
- `how to support social enterprises` → <10/month (but variations have volume)

**Why Priority 2:**
- Captures **educational/awareness stage** of user journey
- Builds topical authority in social enterprise space
- Feeds users into Phase 1 brand/reward pages
- Creates content moat that competitors lack

---

### Formula 7: Conscious Consumer Identity + Core Value + Retail Behavior + Desired Outcome (2,240+ keywords)

**Formula:** `{Consumer Identity} + {Core Value} + {Retail Behavior} + {Desired Outcome}`

**Variables:**
- **Consumer Identities** (8): conscious consumer, ethical shopper, impact-driven buyer, values-aligned purchaser, sustainability advocate, fair-trade supporter, impact investor, social entrepreneur  
- **Core Values** (7): ethical, sustainable, transparent, fair-trade, socially-responsible, environmentally-conscious, community-focused  
- **Retail Behaviors** (8): shopping, gifting, collecting rewards, supporting brands, earning while shopping, joining a loyalty program, impact tracking, community engagement  
- **Desired Outcomes** (5): making a difference, supporting verified causes, aligning values, earning rewards, being part of a community  

**Examples:**
- "ethical shopper sustainable gifting supporting verified causes"
- "conscious consumer transparent shopping earning rewards"
- "impact-driven buyer fair-trade loyalty program making a difference"

**Scale:** 8 identities × 7 values × 8 behaviors × 5 outcomes = **2,240 keywords**

**Search Volume Insights (US):**
- `sustainable fashion brands` → **~22,200/month** (HUGE)
- `eco friendly brands` → **~720/month**
- `ethical shopping` → **~210/month**
- `conscious consumer brands` → **~10/month**

**Why Priority 2:**
- Taps into **massive global search volume** for sustainable/ethical brands
- Positions Dopaya in broader conscious consumer ecosystem
- Attracts users who don't yet know about social enterprises
- High conversion potential (values-aligned audience)

---

## Phase 3: Mission-Aligned Enterprise & Geographic Pages (Lower Volume, High Relevance)

### Formula 13: Social Enterprise + Primary Sector + Primary Geography (10 keywords)

**Formula:** `{Social Enterprise} + {Primary Sector} + {Primary Geography}`

**Variables:**
- **Social Enterprises** (10):  
  - MPower Ventures – clean energy & environment – Switzerland / Africa  
  - Vision Friend Sakib Gore – healthcare / eye care – global  
  - Openversum – water – Switzerland / global  
  - Ignis Careers – education – India  
  - Mandulis Energy – clean energy & environment – Uganda  
  - Kompotoi – WASH / circular sanitation – Switzerland  
  - Syangs (project) – healthcare & wellness / food & agriculture – India (Darjeeling)  
  - Panjurli Labs – clean air / environment – India (Bengaluru)  
  - Dump In Bin – waste management – India  
  - Universal Fund – multiple sectors – global  
- **Primary Sector**: fixed per enterprise (as above)  
- **Primary Geography**: fixed per enterprise (as above)  

**Examples:**
- "MPower Ventures clean energy & environment in Africa"
- "Ignis Careers education in India"
- "Kompotoi circular sanitation in Switzerland"

**Scale:** 10 enterprises × 1 primary sector × 1 primary geography = **10 highly focused keywords**

**Search Volume Insights (CH):**
- `Kompotoi` → **~1,300/month**
- `Openversum` → **~50/month**
- `MPower Ventures` → **~20/month**
- `Mandulis Energy` → **~10/month**
- Others: <10/month or no data

**Why Priority 3:**
- **Core landing pages** for each social enterprise
- Essential for brand/SEO foundation even with low volume
- High conversion when users do arrive (direct intent)
- Supports all other formulas as link destinations

---

### Formula 10: Swiss/Europe Social Enterprise + Swiss Region + Sector (48+ keywords)

**Formula:** `{Swiss/European Social Enterprise} + {Swiss Region} + {Sector}`

**Variables:**
- **Swiss / Europe-Focused Social Enterprises** (4): MPower Ventures (Swiss-founded clean energy across Africa), Openversum (Swiss water tech, global), Kompotoi (Swiss WASH & sanitation), Universal Fund (supports all Dopaya enterprises)  
- **Swiss Regions** (4): Switzerland, Zurich, Basel, Geneva  
- **Sectors** (3): clean energy & environment, water & WASH, multiple sectors (through Universal Fund)  

**Examples:**
- "support MPower Ventures in Switzerland for clean energy & environment"
- "donate to Openversum water & WASH projects from Zurich"
- "back Kompotoi circular sanitation solutions in Basel"
- "give via the Universal Fund in Geneva across multiple sectors"

**Scale:** 4 enterprises × 4 regions × 3 sectors = **48 keywords**

**Why Priority 3:**
- Leverages **Swiss geographic focus** (key Dopaya market)
- Creates regional landing pages for Swiss donors
- Builds local SEO authority
- Low competition for these specific combinations

---

## Not Prioritized (Removed from Implementation)

### ~~Formula 9: India Social Enterprise + India Region + Action~~ ❌

**Removed because:**
- Very low search volume (<10/month per keyword)
- Most Indian enterprise names have no measurable brand search volume
- Better to focus resources on higher-volume approaches
- Can revisit once enterprises gain more brand recognition

---

## Implementation Summary

| Phase | Formulas | Total Keywords | Estimated Monthly Volume Potential | Effort Level |
|-------|----------|----------------|-----------------------------------|--------------|
| **Phase 1** | 3, 12 | ~4,470 | **High** (brand traffic 20K+/month in CH) | Medium |
| **Phase 2** | 4, 7 | ~6,720 | **Very High** (educational + sustainable brands 25K+/month globally) | High |
| **Phase 3** | 13, 10 | ~58 | **Low** (<2K/month) but high conversion | Low |
| **TOTAL** | 6 formulas | **~11,250 keywords** | **45K+/month potential** | — |

---

## Recommended Timeline

### Months 1-2: Phase 1 Launch
- Implement **Formula 12** first (160 pages): Brand × Sector × Reward
  - Focus on NIKIN, RRREVOLVE, 2nd Peak, Kompotoi combinations
  - Quick wins by leveraging existing brand search volume
  
- Begin **Formula 3** (prioritize top 200-300 combinations initially)
  - Start with highest-volume brands (NIKIN, RRREVOLVE)
  - Focus on clothing, shoes, accessories categories first

### Months 3-4: Phase 2 Foundation
- Launch **10-15 cornerstone guides** from Formula 4
  - "What is a social enterprise"
  - "What is impact investing"
  - "How to support social enterprises as [audience]"
  
- Create **20-30 hub pages** from Formula 7
  - "Sustainable fashion brands that support social enterprises"
  - "Ethical shopping guide for conscious consumers"
  - "Eco-friendly brands with verified impact"

### Months 5-6: Phase 3 Completion
- Complete **Formula 13** (10 enterprise landing pages)
  - One page per social enterprise with full details
  
- Expand **Formula 10** (48 Swiss regional pages)
  - Geographic variants for Swiss donors

---

## Success Metrics

**Phase 1 (Months 1-2):**
- 300+ pages live
- 5K+ monthly organic visits from brand keywords
- 50+ conversions from brand → cause → donation flow

**Phase 2 (Months 3-4):**
- 30-45 high-authority content pieces live
- 15K+ monthly organic visits from educational + conscious consumer keywords
- Top 10 rankings for "what is a social enterprise", "sustainable fashion brands"

**Phase 3 (Months 5-6):**
- All 58 enterprise/geographic pages live
- Complete internal linking structure
- 25K+ total monthly organic visits across all programmatic content

---

## Implementation Status & Technical Notes (Completed)

The following fixes and features have been implemented for programmatic SEO pages on dopaya.com.

### 1. CSS / Assets on Production
- **Issue:** Programmatic pages (e.g. `/brands/nikin-clothing-cashback-supporting-social-enterprises`) were served as HTML-only; CSS did not load because asset URLs (`/_assets/*`) were not proxied from the Astro deployment.
- **Fix:** In the main site’s `vercel.json` (dopaya/Tech), a rewrite was added so `/_assets/:path*` is proxied to the Astro deployment (`dopaya-astro-seo-pages.vercel.app`). Reversal instructions are in `ROLLBACK_SEO_ASSETS.md` in the main repo.

### 2. Missing Programmatic Pages on Localhost
- **Issue:** Some programmatic URLs (e.g. `nikin-clothing-impact-points-for-conscious-consumers`) did not resolve locally.
- **Fix:** In `dopaya-astro-seo-pages`, `src/data/rewards.json` was updated: an entry for **impact-points** was added to the `rewardTypes` array so Formula 3 slug generation includes impact-points pages.

### 3. Sitemap for Indexing
- **Issue:** Programmatic pages were not listed in any sitemap, limiting discoverability by Google.
- **Fix:**
  - In the Astro project, `scripts/generate-sitemap.js` was added/updated to produce a single **sitemap-seo.xml** with all programmatic (and other Astro-generated) page URLs from `dist/`. This script runs as a **post-build** step.
  - In the main site’s `vercel.json`, a rewrite was added so **`/sitemap-seo.xml`** is proxied from the Astro deployment.

### Verification After Deployment
- Confirm programmatic pages on dopaya.com load with CSS (e.g. `/brands/nikin-clothing-cashback-supporting-social-enterprises`).
- Confirm **https://dopaya.com/sitemap-seo.xml** is live and returns valid XML with all programmatic URLs (~1,418+).

### Google Search Console
Once `sitemap-seo.xml` is live:
1. In GSC → **Sitemaps**, add a new sitemap: **sitemap-seo.xml**.
2. Submit it. Monitor indexing status in GSC.

---

## Next Steps

1. **Template Design**: Create 3-4 page templates for Phase 1 formulas
2. **Content Database**: Build structured data for all brand × sector × reward combinations
3. **Technical Setup**: Configure programmatic page generation system
4. **Pilot Launch**: Test with 10-20 pages, measure performance, iterate
5. **Scale**: Roll out remaining pages based on pilot learnings
6. **Post-deploy**: Trigger Vercel deploys for both Astro and main site; run verification above; submit `sitemap-seo.xml` in GSC
