import { useParams } from "wouter";
import { useState } from "react";
import { getBlogPostBySlug } from "@/content/blog";
import { SEOHead } from "@/components/seo/seo-head";
import { useI18n } from "@/lib/i18n/i18n-context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useI18n();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
          <p className="text-gray-500">The blog post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Language-aware content
  const title = (language === "de" && post.titleDe) ? post.titleDe : post.title;
  const description = (language === "de" && post.metaDescriptionDe) ? post.metaDescriptionDe : post.metaDescription;
  const content = (language === "de" && post.contentDe) ? post.contentDe : post.content;

  const canonicalPath = language === "de"
    ? `/de/blog/${post.slug}`
    : `/blog/${post.slug}`;
  const canonicalUrl = `https://dopaya.com${canonicalPath}`;
  const videoId = post.youtubeUrl ? getYouTubeId(post.youtubeUrl) : null;
  const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : undefined;
  const isPlaceholder = post.youtubeUrl === "https://youtube.com/watch?v=PLACEHOLDER";

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={post.tags.join(", ")}
        ogType="article"
        ogImage={thumbnailUrl}
        canonicalUrl={canonicalUrl}
        alternateUrls={{
          en: `https://dopaya.com/blog/${post.slug}`,
          de: `https://dopaya.com/de/blog/${post.slug}`,
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: description,
          image: thumbnailUrl || post.coverImage,
          author: {
            "@type": "Organization",
            name: post.author || "Dopaya",
          },
          publisher: {
            "@type": "Organization",
            name: "Dopaya",
            logo: "https://dopaya.com/assets/Dopaya%20Logo-IS_kpXiQ.png",
          },
          datePublished: post.publishedAt,
          mainEntityOfPage: canonicalUrl,
          keywords: post.tags.join(", "),
        }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {post.guestName && post.organizationName && (
              <span className="font-medium text-gray-700">
                {post.guestName} | {post.organizationName}
              </span>
            )}
            {post.episode && (
              <span className="bg-[#F2662D] text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                Impact Bites Ep. {post.episode}
              </span>
            )}
            <span>{new Date(post.publishedAt).toLocaleDateString(language === "de" ? "de-CH" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </header>

        {/* YouTube Video: thumbnail that plays on click */}
        {videoId && !isPlaceholder && (
          <div className="mb-10 aspect-video rounded-xl overflow-hidden bg-gray-900 relative">
            {videoPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <button
                onClick={() => setVideoPlaying(true)}
                className="w-full h-full relative group cursor-pointer"
                aria-label="Play video"
              >
                <img
                  src={thumbnailUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F2662D] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#F2662D] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#F2662D] prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-li:text-gray-700 prose-strong:text-gray-900 prose-hr:border-gray-200 [&_.download-report-box]:not-prose [&_.download-report-box]:flex [&_.download-report-box]:items-center [&_.download-report-box]:gap-4 [&_.download-report-box]:bg-[#F8F6EF] [&_.download-report-box]:border [&_.download-report-box]:border-[#E5E7EB] [&_.download-report-box]:rounded-xl [&_.download-report-box]:px-6 [&_.download-report-box]:py-4 [&_.download-report-box]:my-8 [&_.download-report-btn]:inline-flex [&_.download-report-btn]:items-center [&_.download-report-btn]:gap-2 [&_.download-report-btn]:bg-[#F2662D] [&_.download-report-btn]:text-white [&_.download-report-btn]:font-semibold [&_.download-report-btn]:px-5 [&_.download-report-btn]:py-2.5 [&_.download-report-btn]:rounded-lg [&_.download-report-btn]:no-underline [&_.download-report-btn]:text-sm [&_.download-report-btn]:shrink-0 hover:[&_.download-report-btn]:bg-[#D9551F] [&_.download-report-meta]:text-sm [&_.download-report-meta]:text-gray-500">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </>
  );
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
