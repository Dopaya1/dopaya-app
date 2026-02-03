# Dopaya Brand SEO - Phase 1 Implementation

This Astro project generates **4,470+ programmatic SEO pages** for Phase 1 of the Dopaya brand partnership strategy, targeting high-volume keywords with commercial intent.

## 🎯 SEO Strategy Overview

### Formula 12: Brand Partner + Sector + Reward (160 pages)
**Target:** `{Brand Partner} + {Dopaya Sector Cluster} + {Reward Phrase}`

**Examples:**
- `NIKIN clean energy & environment donation rewards`
- `RRREVOLVE education in India impact points`
- `RESLIDES water & WASH exclusive supporter perks`

**Why Priority 1:** Leverages existing brand search volume (20K+/month in CH) while connecting directly to Dopaya's social enterprises.

### Formula 3: Brand + Category + Reward + Modifier (4,312 pages)
**Target:** `{Brand} + {Product Category} + {Reward Type} + {Benefit Modifier}`

**Examples:**
- `NIKIN clothing cashback supporting social enterprises`
- `sustainable fashion brand loyalty points with verified impact`
- `RESLIDES shoes discount codes for conscious consumers`

**Why Priority 1:** Captures massive search volume (25K+/month globally) for sustainable/ethical brand combinations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── data/
│   ├── brands.json       # 8 brand partners (NIKIN, RRREVOLVE, etc.)
│   ├── sectors.json      # 5 social enterprise sectors  
│   ├── rewards.json      # Reward types and benefit modifiers
│   └── categories.json   # 11 product categories
├── layouts/
│   └── BaseLayout.astro  # Dopaya-branded layout
├── pages/
│   ├── index.astro       # Brand partnership overview
│   └── brands/
│       └── [...slug].astro # Dynamic page generator
└── components/           # Reusable components
```

## 🎨 Design System

Matches the main Dopaya website:
- **Colors:** Orange (#f2662d), Navy (#1a1a3a), Beige (#f8f6f1)
- **Fonts:** Poppins (headings), Inter (body)
- **Components:** Hero sections, info bars, footer with newsletter
- **Mobile-first:** Responsive design patterns

## 📊 Generated Pages

### High-Priority Pages (Launch First)
1. **NIKIN + sectors + rewards** = 20 pages
2. **RRREVOLVE + sectors + rewards** = 20 pages  
3. **Top sustainable brands + top categories** = 200+ pages

### Total Scale
- **Formula 12:** 8 brands × 5 sectors × 4 rewards = **160 pages**
- **Formula 3:** 8 brands × 11 categories × 8 rewards × 7 modifiers = **4,312 pages**
- **Phase 1 Total:** **4,470+ pages**

## 🔍 SEO Features

- **Structured URLs:** `/brands/{brand}-{sector}-{reward}`
- **Optimized Meta:** Title, description, keywords for each combination
- **Schema Markup:** Organization and website structured data
- **Canonical URLs:** Prevent duplicate content issues
- **Sitemap Generation:** Automatic via Astro sitemap plugin

## 🚦 Performance Targets

**Months 1-2 Goals:**
- ✅ 300+ pages live (Formula 12 + top Formula 3 combinations)
- 🎯 5K+ monthly organic visits from brand keywords  
- 🎯 50+ conversions from brand → cause → donation flow

**Search Volume Potential:**
- **Switzerland:** NIKIN (~9,900/month), RRREVOLVE (~9,900/month)
- **Global:** "sustainable fashion brands" (~22,200/month)
- **Total Estimated:** 45K+/month across all keywords

## 🛠 Development

### Adding New Brands
1. Update `src/data/brands.json`
2. Add brand logo to `public/logos/`
3. Pages auto-generate on next build

### Adding New Sectors
1. Update `src/data/sectors.json` 
2. Include enterprise names and impact metrics
3. Formula 12 pages auto-update

### Content Customization
- Edit `src/layouts/BaseLayout.astro` for global changes
- Modify `src/pages/brands/[...slug].astro` for page templates
- Update data files for new combinations

## 📈 Analytics & Monitoring

**Track These Metrics:**
- Organic traffic by brand keyword
- Conversion rate: page view → waitlist signup
- User flow: brand page → social enterprise selection
- Brand search volume trends in target markets

**Key Pages to Monitor:**
- NIKIN + clean energy combinations (highest volume)
- Sustainable fashion brand categories (global reach)
- Swiss brand + Swiss region combinations (local market)

## 🔗 Integration with Main Site

This Astro site can be:
1. **Subdomain:** `brands.dopaya.com`
2. **Subfolder:** `dopaya.com/brands/`  
3. **Static Export:** Build and serve from main domain

Recommended: Deploy to subfolder for maximum SEO benefit.

## 🎯 Success Metrics

**Phase 1 (Months 1-2):**
- [ ] 300+ pages indexed by Google
- [ ] 5K+ monthly visits from target keywords
- [ ] 50+ brand → social enterprise conversions
- [ ] Top 10 ranking for priority brand combinations

**Next Steps:**
- Launch Phase 2 (educational content formulas)
- A/B test page templates for conversion optimization  
- Add more Swiss and European brand partners
- Implement dynamic reward calculations based on impact

---

Built with ❤️ for social impact by the Dopaya team.