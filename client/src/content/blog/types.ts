export interface BlogPost {
  slug: string;
  title: string;
  titleDe?: string;
  metaDescription: string;
  metaDescriptionDe?: string;
  excerpt: string;
  excerptDe?: string;
  content: string; // Markdown body (without YAML front matter)
  contentDe?: string; // German translation
  coverImage?: string;
  youtubeUrl?: string;
  author: string;
  category: string; // e.g., "impact-bites", "news", "insights"
  tags: string[];
  primaryKeyword: string;
  // Impact Bites-specific
  guestName?: string;
  organizationName?: string;
  episode?: number;
  // Publishing
  publishedAt: string; // ISO date string
}
