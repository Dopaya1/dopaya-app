import { Link } from "wouter";
import { blogPosts } from "@/content/blog";
import { SEOHead } from "@/components/seo/seo-head";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function BlogPage() {
  const { language } = useI18n();
  const prefix = language === "de" ? "/de" : "";

  return (
    <>
      <SEOHead
        title="Blog"
        description="Stories from social entrepreneurs solving real problems. Impact Bites episodes, insights, and updates from the Dopaya community."
        keywords="social entrepreneurship, impact bites, social enterprise, sustainable development"
        canonicalUrl={`https://dopaya.com${prefix}/blog`}
        alternateUrls={{
          en: "https://dopaya.com/blog",
          de: "https://dopaya.com/de/blog",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            {language === "de"
              ? "Geschichten von Sozialunternehmern, die echte Probleme lösen. Anschauen, lesen und Wirkung entdecken."
              : "Stories from social entrepreneurs solving real problems. Watch, read, and discover impact that matters."}
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`${prefix}/blog/${post.slug}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Cover image: YouTube thumbnail, coverImage, or fallback */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {(() => {
                  const imageUrl = post.coverImage || getYouTubeThumbnail(post.youtubeUrl);
                  if (imageUrl) {
                    return (
                      <>
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play icon overlay for video posts */}
                        {post.youtubeUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#F2662D]/90 rounded-full flex items-center justify-center shadow-md">
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {post.episode && (
                          <span className="absolute top-3 left-3 bg-[#F2662D] text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                            Ep. {post.episode}
                          </span>
                        )}
                      </>
                    );
                  }
                  return (
                    <div className="w-full h-full flex items-center justify-center">
                      {post.episode && (
                        <span className="bg-[#F2662D] text-white px-3 py-1 rounded-full text-xs font-medium">
                          Impact Bites Ep. {post.episode}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#F2662D] transition-colors mb-2 line-clamp-2">
                  {(language === "de" && post.titleDe) ? post.titleDe : post.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {(language === "de" && post.excerptDe) ? post.excerptDe : post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString(language === "de" ? "de-CH" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {post.guestName && (
                    <span className="text-gray-500">{post.guestName}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </>
  );
}

function getYouTubeThumbnail(url?: string): string | null {
  if (!url || url.includes("PLACEHOLDER")) return null;
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}
