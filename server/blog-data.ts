/**
 * Server-side blog post metadata for social media preview tags.
 * Keep in sync with client/src/content/blog/ when adding new posts.
 */

interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  image?: string;
}

const blogPostMeta: BlogMeta[] = [
  {
    slug: "clean-water-for-all-how-openversum-is-solving-the-crisis",
    title: "Clean Water for All: How Openversum Is Solving the Crisis",
    description: "Olivier Groninger from Openversum on clean water — Impact Bites Episode 1",
  },
  {
    slug: "education-crisis-364000-students-reached-for-10-a-year",
    title: "Education Crisis: 364,000 Students Reached for $10 a Year",
    description: "Rennis Joseph from Ignis Careers on education crisis — Impact Bites Episode 2",
  },
];

export function getBlogPostMeta(slug: string): BlogMeta | undefined {
  return blogPostMeta.find((p) => p.slug === slug);
}

export function getAllBlogPostMeta(): BlogMeta[] {
  return blogPostMeta;
}
