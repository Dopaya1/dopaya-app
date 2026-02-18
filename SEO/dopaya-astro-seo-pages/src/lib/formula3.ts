import brandsData from "../data/brands.json";
import categoriesData from "../data/categories.json";
import rewardsData from "../data/rewards.json";
import { getBrands } from "./supabase.ts";

type BrandJson = (typeof brandsData)["brands"][number];
type CategoryJson = (typeof categoriesData)["categories"][number];
type RewardTypeJson = (typeof rewardsData)["rewardTypes"][number];

export interface Formula3Combination {
  brand: BrandJson;
  category: CategoryJson;
  rewardType: RewardTypeJson;
  benefitModifier: string;
  /** URL-safe slug used in the route */
  slug: string;
}

// ============================================================================
// FEATURE FLAG: Brand Filtering (2026-02-18)
// ============================================================================
// Set to false to revert to including all brands (rollback option)
const ENABLE_BRAND_FILTERING = true;

// Approved brands only: NIKIN, RRREVOLVE, RESLIDES, 2nd Peak, Würfeli, Ecomade
// To rollback: Set ENABLE_BRAND_FILTERING = false above
const APPROVED_BRAND_IDS = [
  "nikin",
  "rrrevolve",
  "reslides",
  "2nd-peak",
  "wuerfeli",
  "ecomade",
];

// Fallback list: brands from JSON that should always get programmatic pages
// CHANGED: Now only includes approved brands when ENABLE_BRAND_FILTERING is true
const PRIORITY_BRAND_IDS = ENABLE_BRAND_FILTERING
  ? APPROVED_BRAND_IDS
  : [
      "nikin",
      "rrrevolve",
      "2nd-peak",
      "reslides",
      "sustainable-fashion-brand",
      "ethical-home-goods-brand",
      "rania-kinge",
      "wuerfeli",
      "ecomade",
    ];

const PRIORITY_REWARD_TYPE_IDS = [
  "cashback",
  "loyalty-points",
  "discount-codes",
  "impact-credits",
  "impact-points",
];

const PRIORITY_BENEFIT_MODIFIERS = [
  "supporting social enterprises",
  "with verified impact",
  "for conscious consumers",
];

function normalizeToSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\.(ch|com|org|net)$/i, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normName(name: string): string {
  return (name || "").toLowerCase().trim().replace(/\.(ch|com|org|net)$/i, "");
}

function findJsonBrandByName(supabaseName: string): BrandJson | null {
  const n = normName(supabaseName);
  const exact = brandsData.brands.find(
    (j) => normName(j.name || "") === n,
  );
  if (exact) return exact;
  return (
    brandsData.brands.find(
      (j) =>
        (j.name || "").toLowerCase().includes(n) ||
        n.includes((j.name || "").toLowerCase()),
    ) ?? null
  );
}

function getCategoriesForBrand(brand: BrandJson, categories: CategoryJson[]) {
  return categories.filter((category) => {
    const matchesBrandCategories =
      Array.isArray(brand.categories) && brand.categories.includes(category.name);
    const matchesRelatedBrands =
      Array.isArray((category as any).relatedBrands) &&
      (category as any).relatedBrands.includes(brand.name);
    return matchesBrandCategories || matchesRelatedBrands;
  });
}

/**
 * Generate Formula 3 combinations from active Supabase brands + JSON fallback.
 * New active brands in Supabase automatically get programmatic pages (with categories from brands.json or default "lifestyle products").
 */
export async function generateFormula3CombinationsAsync(): Promise<Formula3Combination[]> {
  const categories = categoriesData.categories;
  const rewardTypes = rewardsData.rewardTypes.filter((r) =>
    PRIORITY_REWARD_TYPE_IDS.includes(r.id),
  );
  const benefitModifiers = rewardsData.benefitModifiers.filter((m) =>
    PRIORITY_BENEFIT_MODIFIERS.includes(m),
  );

  const supabaseBrands = await getBrands();
  // CHANGED: Filter Supabase brands to only approved ones when ENABLE_BRAND_FILTERING is true
  const activeFromSupabase = supabaseBrands.filter(
    (b: any) => {
      const status = (b.status || "").toLowerCase().trim() === "active";
      if (!status) return false;
      
      // If brand filtering is enabled, only include approved brands
      if (ENABLE_BRAND_FILTERING) {
        const name = (b.name || "").trim();
        const jsonMatch = findJsonBrandByName(name);
        const id = jsonMatch ? jsonMatch.id : normalizeToSlug(name);
        return APPROVED_BRAND_IDS.includes(id);
      }
      
      // Original behavior: include all active brands
      return true;
    }
  );

  const brandMap = new Map<string, BrandJson>();

  for (const sb of activeFromSupabase) {
    const name = (sb.name || "").trim();
    const jsonMatch = findJsonBrandByName(name);
    const id = jsonMatch
      ? jsonMatch.id
      : normalizeToSlug(name);
    if (brandMap.has(id)) continue;
    if (jsonMatch) {
      brandMap.set(id, jsonMatch);
    } else {
      brandMap.set(id, {
        id,
        name: name.replace(/\.(ch|com|org|net)$/i, "").trim() || name,
        description: (sb as any).description ?? "",
        website: (sb as any).website_url ?? (sb as any).websiteUrl ?? (sb as any).website,
        country: (sb as any).country,
        categories: ["lifestyle products"],
        sustainability: {},
      } as BrandJson);
    }
  }

  for (const bid of PRIORITY_BRAND_IDS) {
    if (brandMap.has(bid)) continue;
    const jsonBrand = brandsData.brands.find((b) => b.id === bid);
    if (jsonBrand) brandMap.set(bid, jsonBrand);
  }

  const brands = Array.from(brandMap.values());
  const combinations: Formula3Combination[] = [];

  for (const brand of brands) {
    const brandCategories = getCategoriesForBrand(brand, categories);
    if (brandCategories.length === 0) continue;

    for (const category of brandCategories) {
      for (const rewardType of rewardTypes) {
        for (const benefitModifier of benefitModifiers) {
          const slug = [
            normalizeToSlug(brand.id),
            normalizeToSlug(category.id),
            normalizeToSlug(rewardType.id),
            normalizeToSlug(benefitModifier),
          ].join("-");

          combinations.push({
            brand,
            category,
            rewardType,
            benefitModifier,
            slug,
          });
        }
      }
    }
  }

  return combinations;
}

/**
 * Sync version for callers that cannot await (uses JSON-only list).
 * Prefer generateFormula3CombinationsAsync() so active Supabase brands are included.
 */
export function generateFormula3Combinations(): Formula3Combination[] {
  const brands = brandsData.brands.filter((b) => PRIORITY_BRAND_IDS.includes(b.id));
  const categories = categoriesData.categories;
  const rewardTypes = rewardsData.rewardTypes.filter((r) =>
    PRIORITY_REWARD_TYPE_IDS.includes(r.id),
  );
  const benefitModifiers = rewardsData.benefitModifiers.filter((m) =>
    PRIORITY_BENEFIT_MODIFIERS.includes(m),
  );

  const combinations: Formula3Combination[] = [];

  for (const brand of brands) {
    const brandCategories = getCategoriesForBrand(brand, categories);
    for (const category of brandCategories) {
      for (const rewardType of rewardTypes) {
        for (const benefitModifier of benefitModifiers) {
          combinations.push({
            brand,
            category,
            rewardType,
            benefitModifier,
            slug: [
              normalizeToSlug(brand.id),
              normalizeToSlug(category.id),
              normalizeToSlug(rewardType.id),
              normalizeToSlug(benefitModifier),
            ].join("-"),
          });
        }
      }
    }
  }

  return combinations;
}

