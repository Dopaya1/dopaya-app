import type { BlogPost } from "./types";
import ep1Openversum from "./ep1-openversum";
import ep2IgnisCareers from "./ep2-ignis-careers";
import theImpactGivingReport2026 from "./the-impact-giving-report-2026";

// All blog posts — add new episodes here
const allPosts: BlogPost[] = [
  theImpactGivingReport2026,
  ep1Openversum,
  ep2IgnisCareers,
];

// Sorted by date (newest first)
export const blogPosts = allPosts.sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export type { BlogPost };
