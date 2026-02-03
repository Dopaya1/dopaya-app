# Brand × Category Overview — Formula 3 Programmatic Pages

**Generated:** For validation of correct brand–category combinations  
**Source:** `formula3.ts` logic using `brands.json` + `categories.json`

---

## What Are Benefit Modifiers?

**Benefit modifiers** are the 4th variable in the formula. They create **multiple page variants** for the same brand + category + reward combination.

**Example:** For "RRREVOLVE shoes cashback", we generate **3 separate pages** (one per modifier):

| Page | URL slug | Benefit modifier |
|------|----------|------------------|
| 1 | `rrrevolve-shoes-cashback-supporting-social-enterprises` | supporting social enterprises |
| 2 | `rrrevolve-shoes-cashback-with-verified-impact` | with verified impact |
| 3 | `rrrevolve-shoes-cashback-for-conscious-consumers` | for conscious consumers |

**Why use them?** They capture different search intents and audience phrases (e.g. "cashback for conscious consumers", "rewards with verified impact"). Each modifier = 1 extra page per brand×category×reward combo.

**Current modifiers in use:** supporting social enterprises, with verified impact, for conscious consumers  
**Full list in `rewards.json`:** sustainable, ethical, transparent giving, values-aligned (not currently used)

---

## How Categories Are Assigned

Each brand gets categories from **either**:

1. **`brand.categories`** (in `brands.json`) — explicit categories the brand offers
2. **`category.relatedBrands`** (in `categories.json`) — categories that list the brand as related

If a category matches either source, it is included for that brand.

---

## Brand × Category Matrix

| Brand | Categories (from brand.categories) | + From relatedBrands | **Total Categories** | Pages |
|-------|-----------------------------------|----------------------|----------------------|-------|
| **NIKIN** | clothing, accessories, outdoor gear, handbags | — | clothing, accessories, outdoor gear, handbags | 60 |
| **RRREVOLVE** | clothing, accessories, shoes | **handbags** | clothing, accessories, shoes, handbags | 60 |
| **2nd Peak** | outdoor gear, athletic wear, accessories, clothing | — | outdoor gear, athletic wear, accessories, clothing | 60 |
| **RESLIDES** | shoes, accessories | — | shoes, accessories | 30 |
| **sustainable fashion brand** | clothing, accessories, shoes | — | clothing, accessories, shoes | 45 |
| **ethical home goods brand** | home goods, lifestyle products | — | home goods, lifestyle products | 30 |

**Kompotoi removed** — not a current brand partner.

**Total Formula 3 pages:** 285 (6 brands × categories × 5 reward types × 3 benefit modifiers)

---

## Detailed Brand Breakdown

### NIKIN
- **brand.categories:** clothing, accessories, outdoor gear, handbags
- **Categories.json match:** clothing (relatedBrands), outdoor gear (relatedBrands)
- **Valid:** ✓ All categories match brand offering (NIKIN offers apparel, TreeCaps/socks/bags, outdoor gear, backpacks & bags)

### RRREVOLVE
- **brand.categories:** clothing, accessories, shoes
- **+ From categories.json:** handbags (relatedBrands lists RRREVOLVE)
- **Valid:** ✓ RRREVOLVE offers fair fashion including accessories/bags; handbags sourced from categories.relatedBrands

### 2nd Peak
- **brand.categories:** outdoor gear, athletic wear, accessories, clothing
- **Valid:** ✓ Second-hand outdoor shop — jackets, tops, pants, outdoor apparel

### RESLIDES
- **brand.categories:** shoes, accessories
- **Valid:** ✓ All categories match brand offering (footwear brand)

### sustainable fashion brand
- **brand.categories:** clothing, accessories, shoes
- **Valid:** ✓ Generic fashion brand — broad categories appropriate

### ethical home goods brand
- **brand.categories:** home goods, lifestyle products
- **Valid:** ✓ All categories match brand offering

---

## Reward Types (per combination)

- cashback
- loyalty points
- discount codes
- impact credits
- impact points

## Benefit Modifiers (per combination)

- supporting social enterprises
- with verified impact
- for conscious consumers

---

## Suggested Additional Categories (for consideration)

| Brand | Current categories | Possible additions | Notes |
|-------|--------------------|-------------------|-------|
| **NIKIN** | clothing, accessories, outdoor gear, handbags | — | ✓ Complete — handbags added |
| **2nd Peak** | outdoor gear, athletic wear, accessories, clothing | — | ✓ Complete — clothing added |
| **RESLIDES** | shoes, accessories | — | ✓ Complete — modular sandals + straps |
| **sustainable fashion brand** | clothing, accessories, shoes | handbags, outdoor gear | Generic fashion brand; broader coverage possible |
| **RRREVOLVE** | clothing, accessories, shoes, handbags | home goods | RRREVOLVE offers "Home & Living" products |

**To add a category:** Edit `brands.json` → add to `brands[].categories`, or edit `categories.json` → add brand name to `categories[].relatedBrands`.

---

## Potential Issues to Review

1. **RRREVOLVE + handbags** — Sourced from `categories.json` relatedBrands. RRREVOLVE offers accessories/bags; handbags is valid. Consider adding handbags to RRREVOLVE in `brands.json` for consistency.

2. **Brands not in PRIORITY_BRAND_IDS** — `eco-beauty-brand` has categories (beauty, skincare) but is not in the formula3 priority list, so no pages are generated for it.

3. **Categories not used** — beauty, food, skincare have no priority brands, so no formula3 pages use them.

4. **"ReWolf"** — Not found in project. User may mean **RRREVOLVE** (Swiss circular fashion brand).

---

## Files to Edit for Corrections

- **Add/remove brand categories:** `src/data/brands.json` → `brands[].categories`
- **Add/remove category–brand links:** `src/data/categories.json` → `categories[].relatedBrands`
- **Add/remove priority brands:** `src/lib/formula3.ts` → `PRIORITY_BRAND_IDS`
