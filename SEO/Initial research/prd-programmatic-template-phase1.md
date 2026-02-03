# PRD: Programmatic Template - Phase 1 (Brand × Sector × Reward Pages)

**Document Version:** 1.0  
**Created:** January 30, 2026  
**Owner:** Product/Engineering  
**Template Type:** Brand Partner + Sector Cluster + Reward Integration

---

## 1. Overview

### 1.1 Objective

Create a scalable programmatic page template that connects **brand partner searches** (NIKIN, RRREVOLVE, etc.) to **Dopaya's social enterprise sectors** and **reward mechanisms**, driving high-intent organic traffic from existing brand search volume.

**Formula:** `{Brand Partner} + {Dopaya Sector Cluster} + {Reward Phrase}`

**Target Scale:** 160 unique pages (8 brands × 5 sectors × 4 reward phrases)

### 1.2 Success Metrics

**Month 1-2 Target:**
- 160 pages live and indexed
- 3,000+ monthly organic visits from brand keywords
- 30+ conversions (sign-ups or donations)
- Average time on page: >2 minutes
- Bounce rate: <60%

### 1.3 Example URLs

```
/brands/nikin-clean-energy-donation-rewards
/brands/rrrevolve-education-india-impact-points
/brands/reslides-water-wash-supporter-perks
/brands/2nd-peak-healthcare-sustainable-shopping-rewards
/brands/kompotoi-food-agriculture-impact-points
```

---

## 2. Page Structure & Layout

### 2.1 Overall Design Alignment

**Must match current Dopaya design system:**
- Clean, minimalist Swiss design aesthetic
- White background with subtle shadows for cards
- Primary color: Dopaya brand color (from logo)
- Typography: Match existing Dopaya font stack
- Spacing: Consistent with current project/brand pages
- Responsive: Mobile-first design

### 2.2 Page Sections (Top to Bottom)

#### **Section 1: Hero Section**

**Layout:**
- Full-width container, centered content
- Brand logo (left) + Dopaya logo (right) with "×" or "&" between them
- H1 headline (dynamic)
- Subheadline explaining the connection
- Primary CTA button

**Example Content:**
```
[NIKIN Logo] × [Dopaya Logo]

H1: "Shop NIKIN & Support Clean Energy Projects Worldwide"

Subheadline: "Every purchase from NIKIN earns you Impact Points on Dopaya. 
Redeem exclusive donation rewards while supporting verified renewable energy 
social enterprises."

[CTA: Explore Clean Energy Projects →]
```

**Visual Elements:**
- Hero image: Blend of brand product + sector impact imagery
- Gradient overlay for text readability
- Height: ~500px desktop, ~400px mobile

---

#### **Section 2: How It Works (3-Step Process)**

**Layout:**
- 3 columns on desktop, stacked on mobile
- Icon + Number + Heading + Description per step

**Content Structure:**
```
[Icon: Shopping bag]
1. Shop at [Brand]
Purchase sustainable products from [Brand Name] and enjoy their quality craftsmanship.

[Icon: Points/Stars]
2. Earn Impact Points
Receive [X]% of your purchase value as Impact Points on your Dopaya dashboard.

[Icon: Globe/Heart]
3. Support [Sector]
Redeem your points to fund verified [Sector] social enterprises making real change.
```

**Design:**
- Card-based layout matching current Dopaya "How It Works" section
- Light background color (#F9FAFB or similar)
- Icons: Line-style, consistent with existing Dopaya iconography

---

#### **Section 3: Featured Social Enterprises in [Sector]**

**Layout:**
- Grid of 2-4 enterprise cards (same design as dopaya.com/projects)
- Each card shows: Logo, Name, Mission (1-2 lines), Sector tag, Geography flag

**Dynamic Content:**
- Pull 3-4 relevant enterprises from the specified sector cluster
- Example for "Clean Energy & Environment":
  - MPower Ventures (🇨🇭 Switzerland/Africa)
  - Mandulis Energy (🇺🇬 Uganda)
  - Panjurli Labs (🇮🇳 India - Air Quality)
  - Dump In Bin (🇮🇳 India - Waste to Materials)

**Card Design:**
- Match existing project card style from /projects page
- Image/logo at top
- Title, short mission, sector badge
- "Learn More" link → project detail page

---

#### **Section 4: About [Brand] + Sustainability**

**Layout:**
- Two-column layout (60/40 split)
- Left: Brand story and sustainability credentials
- Right: Brand logo + key stats/certifications

**Content Structure:**
```
About [Brand Name]

[Brand description from Dopaya brand partner database]

Sustainability Credentials:
✓ [Credential 1: e.g., "Plants a tree for every product sold"]
✓ [Credential 2: e.g., "Fair Trade certified"]
✓ [Credential 3: e.g., "Carbon neutral shipping"]

[Brand Stats Box]
- Founded: [Year]
- Products: [Category]
- Impact: [Key metric, e.g., "2.5M trees planted"]
```

**Visual:**
- Brand imagery (products in use)
- Clean, professional product photography
- Certification logos/badges where applicable

---

#### **Section 5: Impact Dashboard Preview**

**Layout:**
- Full-width section with dark/colored background
- Screenshot or illustration of Dopaya impact dashboard
- 3 key metrics highlighted

**Content:**
```
Track Your Impact in Real-Time

Every donation earns you Impact Points. Track your contributions, see exactly 
where your support goes, and monitor the real-world impact you're creating.

[Dashboard Screenshot/Illustration]

Key Features:
• Live donation tracking
• Impact Points accumulation
• Project-specific outcomes (e.g., "20 trees planted", "5 children educated")
• Ranking system: Impact Hero → Champion → Legend
```

---

#### **Section 6: Reward Redemption Options**

**Layout:**
- Card grid showing available rewards
- Filter by point threshold

**Content Structure:**
```
Redeem Your Impact Points

[Reward Card 1]
NIKIN 15% Discount
Cost: 500 Impact Points
Use your points for 15% off your next NIKIN order.
[Redeem →]

[Reward Card 2]
Plant 10 Trees
Cost: 100 Impact Points
Fund tree planting through verified reforestation projects.
[Redeem →]

[Reward Card 3]
Exclusive Early Access
Cost: 1000 Impact Points
Get early access to new [Brand] collections & Dopaya projects.
[Redeem →]
```

---

#### **Section 7: Social Proof / Recognition**

**Layout:**
- Logo wall of recognized organizations (same as homepage)
- Small disclaimer text below

**Content:**
```
Our Social Enterprises Are Backed By

[Logo Grid: Dasra | World Economic Forum | Swiss Agency for Development | 
Yunus Social Business | etc.]

"These logos represent recognition and support received by our featured 
social enterprises. They do not constitute endorsement of Dopaya's services."
```

---

#### **Section 8: FAQ Section**

**Layout:**
- Accordion-style FAQ (collapsible sections)
- 4-6 questions relevant to brand + sector combination

**Content Structure:**
```
Frequently Asked Questions

Q: How do I earn Impact Points from [Brand] purchases?
A: [Specific answer about the integration/process]

Q: What [Sector] projects can I support?
A: [List 2-3 example enterprises]

Q: Can I use Impact Points for [Brand] discounts?
A: [Explain redemption mechanics]

Q: How does Dopaya verify social enterprises?
A: [Brief explanation of verification process]

Q: Are my contributions tax-deductible?
A: [Standard answer with jurisdiction specifics]
```

**Schema Markup:** Add FAQPage structured data (JSON-LD)

---

#### **Section 9: CTA Section (Footer)**

**Layout:**
- Full-width, centered content
- Prominent CTA buttons
- Secondary navigation links

**Content:**
```
Ready to Make an Impact?

Start shopping sustainably with [Brand] and support verified 
[Sector] social enterprises today.

[Primary CTA: Explore [Sector] Projects →]
[Secondary CTA: Browse All Brand Partners →]

Related Links:
• View All Social Enterprises
• Learn About Impact Points
• Become a Founding Member
```

---

## 3. SEO Requirements

### 3.1 Meta Tags (Dynamic per Page)

**Title Tag Format:**
```
[Brand] [Product Category] Supporting [Sector] | Dopaya Impact Rewards
```

**Example:**
```
NIKIN Sustainable Clothing Supporting Clean Energy | Dopaya Impact Rewards
```

**Max length:** 60 characters  
**Include:** Brand name, sector, "Dopaya" for branding

---

**Meta Description Format:**
```
Shop [Brand] and earn Impact Points to support verified [Sector] social enterprises. 
[Reward phrase] + transparent impact tracking. Join [X] supporters making a difference.
```

**Example:**
```
Shop NIKIN sustainable fashion and earn Impact Points to support verified clean 
energy social enterprises. Get donation rewards + transparent impact tracking. 
Join 2,847 supporters making a difference.
```

**Max length:** 155-160 characters

---

### 3.2 Structured Data (JSON-LD)

**Required Schemas:**

#### a) WebPage Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://dopaya.com/brands/[slug]#webpage",
  "name": "[Page Title]",
  "description": "[Meta Description]",
  "url": "https://dopaya.com/brands/[slug]",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://dopaya.com#website"
  },
  "about": {
    "@type": "Thing",
    "name": "[Sector Name]"
  },
  "mentions": [
    {
      "@type": "Organization",
      "@id": "https://dopaya.com/project/[enterprise-slug]#organization"
    }
  ]
}
```

#### b) Breadcrumb Schema
```json
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
      "name": "Brand Partners",
      "item": "https://dopaya.com/brands"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Brand] + [Sector]",
      "item": "https://dopaya.com/brands/[slug]"
    }
  ]
}
```

#### c) FAQPage Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer text]"
      }
    }
  ]
}
```

---

### 3.3 Open Graph Tags

```html
<meta property="og:title" content="[Brand] Supporting [Sector] | Dopaya" />
<meta property="og:description" content="[Meta Description]" />
<meta property="og:image" content="https://dopaya.com/og-images/brands/[brand-sector].png" />
<meta property="og:url" content="https://dopaya.com/brands/[slug]" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Dopaya" />
```

---

### 3.4 Canonical & Hreflang

**Canonical:**
```html
<link rel="canonical" href="https://dopaya.com/brands/[slug]" />
```

**Hreflang (if multi-language):**
```html
<link rel="alternate" hreflang="en" href="https://dopaya.com/brands/[slug]" />
<link rel="alternate" hreflang="de" href="https://dopaya.com/de/brands/[slug]" />
<link rel="alternate" hreflang="fr" href="https://dopaya.com/fr/brands/[slug]" />
```

---

## 4. URL Structure & Routing

### 4.1 URL Pattern

**Format:**
```
/brands/[brand-slug]-[sector-slug]-[reward-slug]
```

**Examples:**
```
/brands/nikin-clean-energy-donation-rewards
/brands/rrrevolve-education-india-impact-points
/brands/reslides-water-wash-supporter-perks
/brands/2nd-peak-healthcare-shopping-rewards
/brands/kompotoi-waste-management-impact-points
```

### 4.2 Slug Generation Rules

- All lowercase
- Hyphens for spaces
- Brand names: Use official brand slug (nikin, rrrevolve, reslides, etc.)
- Sectors: Use shortened sector names
  - `clean-energy` (Clean Energy & Environment)
  - `education-india` (Education in India)
  - `water-wash` (Water & WASH)
  - `healthcare` (Healthcare & Vision)
  - `food-agriculture` (Food & Agriculture / Community Well-being)
- Rewards: 
  - `donation-rewards`
  - `impact-points`
  - `supporter-perks`
  - `shopping-rewards`

### 4.3 Sitemap Integration

Add all 160 URLs to `/sitemap.xml` with:
- Priority: 0.7
- Change frequency: monthly
- Last modified: [generation date]

---

## 5. Internal Linking Strategy

### 5.1 Links TO These Pages (How Users Arrive)

**From Homepage:**
- Add "Brand Partners" section with links to top brand pages
- Link from "How It Works" → "Earn Rewards from Brands"

**From /projects Page:**
- Add filter/tag: "Supported by Brand Partners"
- Link from sector filters to brand × sector pages

**From Individual Project Pages:**
- Add section: "Support this project through brand purchases"
- Link to relevant brand × sector page

**From /brands Hub Page (New):**
- Create `/brands` index page listing all partner brands
- Grid of brand cards linking to their sector pages

---

### 5.2 Links FROM These Pages (Where Users Go Next)

**Primary Links:**
- Link to 3-4 featured social enterprise project pages (Section 3)
- Link to individual brand detail page (if exists)
- Link to /projects filtered by sector
- Link to /signup or /get-started

**Secondary Links:**
- Footer: Standard Dopaya footer navigation
- Breadcrumb: Home → Brand Partners → [Current Page]
- Related pages: "Also explore [Brand] supporting [Other Sector]"

---

## 6. Content Requirements

### 6.1 Dynamic Content Fields

**Database Schema / CMS Fields Required:**

```json
{
  "brand_id": "string",
  "brand_name": "string",
  "brand_logo_url": "string",
  "brand_description": "text (250 chars)",
  "brand_sustainability_credentials": ["array of strings"],
  "brand_founded_year": "number",
  "brand_category": "string",
  "brand_impact_stat": "string",
  "brand_website_url": "string",
  
  "sector_cluster_id": "string",
  "sector_name": "string",
  "sector_description": "text",
  "sector_icon": "string",
  
  "reward_phrase_id": "string",
  "reward_title": "string",
  "reward_description": "text",
  
  "featured_enterprises": ["array of enterprise IDs"],
  
  "hero_image_url": "string",
  "og_image_url": "string"
}
```

---

### 6.2 Copy Tone & Style Guide

**Voice:**
- Inspiring but professional
- Action-oriented ("Shop", "Support", "Earn", "Make an impact")
- Transparent and credible
- Swiss quality/precision vibes

**Avoid:**
- Overly emotional language
- Guilt-based messaging
- Jargon without explanation
- Making unrealistic impact claims

**Language:**
- Primary: English
- Future: German, French (Swiss market focus)

---

## 7. Technical Specifications

### 7.1 Tech Stack

**Assumed Stack (based on Dopaya site):**
- **Frontend:** React / Next.js (SSG or ISR)
- **Styling:** Tailwind CSS or styled-components
- **Images:** Supabase storage (as mentioned in audit)
- **CMS/Data:** Supabase or similar headless CMS
- **Deployment:** Vercel or similar

### 7.2 Page Generation Method

**Option 1: Static Site Generation (SSG) - RECOMMENDED**
- Pre-generate all 160 pages at build time
- Regenerate on content updates (ISR)
- Fast performance, excellent SEO

**Implementation:**
```javascript
// pages/brands/[slug].js
export async function getStaticPaths() {
  const combinations = generateBrandSectorRewardCombinations();
  return {
    paths: combinations.map(c => ({ params: { slug: c.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const pageData = await fetchPageData(params.slug);
  return { props: { ...pageData }, revalidate: 86400 }; // ISR: 24hrs
}
```

**Option 2: Client-Side Rendering (CSR)**
- Less ideal for SEO
- Only if SSG not feasible

---

### 7.3 Performance Requirements

**Target Metrics:**
- Lighthouse Performance Score: >90
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Cumulative Layout Shift (CLS): <0.1

**Optimization Requirements:**
- Lazy-load images below fold
- Use next/image or similar for automatic optimization
- Compress hero images (WebP format)
- Minimize JavaScript bundle (<200KB)
- Defer non-critical CSS

---

### 7.4 Mobile Responsiveness

**Breakpoints:**
- Mobile: <640px
- Tablet: 640px - 1024px
- Desktop: >1024px

**Mobile-Specific Requirements:**
- Hero height: 400px max
- 3-column grid → single column stack
- Touch-friendly CTA buttons (min 44×44px)
- Readable font sizes (min 16px body text)

---

## 8. Testing & Quality Assurance

### 8.1 Pre-Launch Checklist

**SEO:**
- [ ] Meta title unique & within 60 chars
- [ ] Meta description unique & within 160 chars
- [ ] H1 tag present and unique per page
- [ ] Canonical URL correct
- [ ] All images have descriptive alt text
- [ ] Structured data validates (Google Rich Results Test)
- [ ] robots.txt allows indexing
- [ ] Sitemap includes all URLs
- [ ] Page loads in <3 seconds

**Content:**
- [ ] Brand name spelled correctly throughout
- [ ] Enterprise cards link to correct project pages
- [ ] CTAs functional and track correctly
- [ ] FAQ answers factually accurate
- [ ] No placeholder text (e.g., "Lorem ipsum")

**Design:**
- [ ] Matches Dopaya brand guidelines
- [ ] Consistent spacing/typography
- [ ] All links have hover states
- [ ] Images load properly
- [ ] Responsive on all breakpoints

**Technical:**
- [ ] No console errors
- [ ] Analytics tracking working (GA4/Plausible)
- [ ] Forms submit successfully
- [ ] 404 pages handled gracefully
- [ ] HTTPS enabled

---

### 8.2 A/B Testing Plan

**Phase 1 (Month 1):**
- Test 2 headline variations for hero section
- Test CTA button copy: "Explore Projects" vs "Start Supporting"

**Phase 2 (Month 2-3):**
- Test hero image style: Product-focused vs Impact-focused
- Test FAQ section: Above fold vs below fold

**Measure:**
- Click-through rate to project pages
- Scroll depth
- Time on page
- Conversion rate (signup/donation)

---

## 9. Content Database Structure

### 9.1 Brand Partner Data

```json
{
  "brands": [
    {
      "id": "nikin",
      "name": "NIKIN",
      "slug": "nikin",
      "category": "Lifestyle & Fashion",
      "logo_url": "/assets/brands/nikin-logo.png",
      "description": "Swiss clothing brand committed to sustainability and conscious consumption. Founded in 2016, creates durable, timeless products made from sustainable materials, mainly produced in Europe.",
      "sustainability_credentials": [
        "Plants a tree for every product sold",
        "Over 2.5 million trees planted worldwide",
        "Sustainable materials",
        "Produced mainly in Europe"
      ],
      "founded_year": 2016,
      "impact_stat": "2.5M+ trees planted",
      "website_url": "https://nikin.com",
      "country": "Switzerland",
      "reward_default": "15% OFF on all orders"
    },
    {
      "id": "rrrevolve",
      "name": "RRREVOLVE",
      "slug": "rrrevolve",
      "category": "Lifestyle & Fashion",
      "logo_url": "/assets/brands/rrrevolve-logo.png",
      "description": "Swiss pioneer in sustainable fashion, fair design, and conscious living since 2010. Curates high-quality, certified products. Active member of Swiss Fair Trade and Sustainable Textiles Switzerland 2030.",
      "sustainability_credentials": [
        "Swiss Fair Trade member",
        "Sustainable Textiles Switzerland 2030 (STS2030)",
        "High-quality certified products",
        "Fair design principles"
      ],
      "founded_year": 2010,
      "impact_stat": "15+ years in sustainable fashion",
      "website_url": "https://rrrevolve.com",
      "country": "Switzerland",
      "reward_default": "15% discount on online orders"
    }
    // ... additional brands
  ]
}
```

---

### 9.2 Sector Cluster Data

```json
{
  "sectors": [
    {
      "id": "clean-energy",
      "name": "Clean Energy & Environment",
      "slug": "clean-energy",
      "description": "Support verified social enterprises providing renewable energy access, clean air solutions, and waste-to-energy initiatives.",
      "icon": "solar-panel",
      "featured_enterprises": [
        "mpower-ventures",
        "mandulis-energy",
        "panjurli-labs",
        "dump-in-bin"
      ],
      "impact_examples": [
        "Solar energy access in rural Africa",
        "Air quality improvement in urban India",
        "Agricultural waste to sustainable energy"
      ]
    },
    {
      "id": "water-wash",
      "name": "Water & WASH",
      "slug": "water-wash",
      "description": "Fund clean water access, sanitation solutions, and hygiene education programs through verified social enterprises.",
      "icon": "water-drop",
      "featured_enterprises": [
        "openversum",
        "kompotoi"
      ],
      "impact_examples": [
        "Clean drinking water access",
        "Ecological sanitation systems",
        "Water technology for communities"
      ]
    }
    // ... additional sectors
  ]
}
```

---

### 9.3 Reward Phrase Data

```json
{
  "reward_phrases": [
    {
      "id": "donation-rewards",
      "title": "Donation Rewards",
      "slug": "donation-rewards",
      "description": "Earn exclusive rewards when you donate to social enterprises",
      "cta_text": "Earn Rewards"
    },
    {
      "id": "impact-points",
      "title": "Impact Points",
      "slug": "impact-points",
      "description": "Accumulate Impact Points with every contribution and unlock benefits",
      "cta_text": "Start Earning Points"
    },
    {
      "id": "supporter-perks",
      "title": "Exclusive Supporter Perks",
      "slug": "supporter-perks",
      "description": "Get exclusive perks for being a verified social enterprise supporter",
      "cta_text": "Unlock Perks"
    },
    {
      "id": "shopping-rewards",
      "title": "Sustainable Shopping Rewards",
      "slug": "shopping-rewards",
      "description": "Shop sustainably and support social impact simultaneously",
      "cta_text": "Shop & Support"
    }
  ]
}
```

---

## 10. Launch Plan

### 10.1 Pilot Phase (Week 1)

**Launch 10 pilot pages:**
- NIKIN × Clean Energy × Donation Rewards
- NIKIN × Education India × Impact Points
- RRREVOLVE × Water WASH × Supporter Perks
- RESLIDES × Clean Energy × Shopping Rewards
- 2nd Peak × Healthcare × Impact Points
- Kompotoi × Water WASH × Donation Rewards
- Syangs × Food Agriculture × Shopping Rewards
- Wuerfeli × Clean Energy × Impact Points
- Rania Kinge × Education India × Supporter Perks
- Ecomade × Healthcare × Shopping Rewards

**Monitor for 1 week:**
- Indexing status (Google Search Console)
- Page load times
- User behavior (GA4)
- Any technical errors

---

### 10.2 Full Rollout (Week 2-3)

**If pilot successful:**
- Generate remaining 150 pages
- Submit updated sitemap
- Monitor indexing progress
- Track rankings for target keywords

---

### 10.3 Post-Launch Optimization (Week 4+)

**Month 1:**
- Analyze top-performing pages
- Identify low-performing pages
- A/B test headline variations
- Gather user feedback

**Month 2:**
- Refine content based on performance
- Add more internal links from high-traffic pages
- Create promotional content (blog posts, social media)
- Begin link-building outreach

---

## 11. Analytics & Tracking

### 11.1 Google Analytics 4 Events

**Track:**
- Page views: `page_view` (automatic)
- CTA clicks: `brand_cta_click` (brand, sector, reward_type)
- Project card clicks: `project_card_click` (enterprise_name, sector)
- FAQ expansions: `faq_expand` (question_text)
- External links: `outbound_link_click` (brand_website)

---

### 11.2 Conversion Goals

**Primary:**
- User signs up for Dopaya account
- User makes first donation to featured enterprise
- User clicks through to project detail page

**Secondary:**
- Time on page >2 minutes
- Scroll depth >75%
- Page share on social media

---

## 12. Dependencies

**Pre-requisites:**
- [ ] Brand partner data finalized and loaded into CMS
- [ ] Social enterprise sector mappings confirmed
- [ ] Brand logos and product images collected
- [ ] Hero images created (1 per sector minimum)
- [ ] OG images generated (can use template)
- [ ] Legal review of brand partnership language
- [ ] Analytics tracking configured

**Nice-to-Have:**
- [ ] Video testimonials from brand partners
- [ ] Impact data API integration
- [ ] User review/testimonial system

---

## 13. Risk Mitigation

### 13.1 Potential Issues

**Risk:** Brand partnership terms change
**Mitigation:** Build flexible reward display system, can update centrally

**Risk:** Low organic traffic initially
**Mitigation:** Promote via email, social media; consider paid promotion for top pages

**Risk:** Duplicate content concerns (similar pages)
**Mitigation:** Ensure unique H1, meta descriptions, intro paragraphs per page

**Risk:** Page performance issues at scale
**Mitigation:** Use SSG, optimize images, implement caching

---

## 14. Future Enhancements

**Phase 2 (Month 3+):**
- Add user reviews/ratings per brand
- Integrate real-time impact tracker
- Add video content (brand stories)
- Create comparison pages ("NIKIN vs RRREVOLVE for supporting clean energy")

**Phase 3 (Month 6+):**
- Multi-language support (German, French)
- Personalized recommendations based on user interests
- Dynamic reward offers based on inventory
- Brand-specific landing pages with all sectors

---

## Appendix A: Example Complete Page

**URL:** `/brands/nikin-clean-energy-donation-rewards`

**Title Tag:** `NIKIN Sustainable Fashion Supporting Clean Energy | Dopaya Rewards`

**Meta Description:** `Shop NIKIN sustainable clothing and earn Impact Points to support verified clean energy social enterprises. Get donation rewards + transparent impact tracking. Join 2,847 supporters.`

**H1:** `Shop NIKIN & Support Clean Energy Projects Worldwide`

**Hero Subheadline:** `Every NIKIN purchase earns you Impact Points on Dopaya. Redeem exclusive donation rewards while supporting verified renewable energy social enterprises in Africa, India, and beyond.`

**Featured Enterprises:**
1. MPower Ventures (Switzerland/Africa - Solar Energy)
2. Mandulis Energy (Uganda - Agricultural Waste to Energy)
3. Panjurli Labs (India - Clean Air Technology)
4. Dump In Bin (India - Waste to Climate-Friendly Materials)

---

## Appendix B: Design Mockup References

**Refer to:**
- Current Dopaya homepage for hero styling
- /projects page for enterprise card design
- Existing brand partner pages (if any) for brand presentation

**Key Design Elements to Match:**
- Button styles (rounded corners, hover states)
- Card shadows and spacing
- Typography scale
- Color palette
- Icon style (line vs filled)

---

## Sign-Off

**Approved By:**
- [ ] Product Manager
- [ ] Engineering Lead
- [ ] SEO/Marketing Lead
- [ ] Design Lead

**Ready for Development:** ☐ YES  ☐ NO

**Estimated Development Time:** 2-3 weeks (including testing)

---

*End of PRD*
