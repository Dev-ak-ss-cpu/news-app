import Link from "next/link";
import { Clock, Newspaper, ArrowUpRight } from "lucide-react";
import { buildArticleUrl } from "@/app/utils/articleUrl";
import { getYouTubeThumbnail } from "../Helper";
import VideoPlayButton from "./VideoPlayButton";

export const formatArticleDate = (article) => {
  if (article?.formattedDate) return article.formattedDate;
  if (!article?.publishDate) return "";
  return new Date(article.publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

export const hasVideo = (article) => Boolean(article?.youtubeVideo?.trim());

export const hasImage = (article) => Boolean(article?.featuredImage?.trim());

/** Falls back to the YouTube thumbnail when no image was uploaded. */
export const getArticleThumbnail = (article) =>
  article?.featuredImage?.trim() || getYouTubeThumbnail(article?.youtubeVideo);

const OVERLAY_SIZES = {
  lead: {
    padding: "p-5 md:p-6",
    title: "text-lg md:text-2xl line-clamp-3",
    excerpt: true,
    badge: "lg",
    minHeight: "min-h-76",
  },
  wide: {
    padding: "p-4 md:p-5",
    title: "text-base md:text-xl line-clamp-2",
    excerpt: true,
    badge: "lg",
    minHeight: "min-h-60",
  },
  small: {
    padding: "p-4",
    title: "text-sm md:text-base line-clamp-2",
    excerpt: false,
    badge: "md",
    minHeight: "min-h-42",
  },
};

/**
 * Image-led card with the headline set over a gradient scrim.
 *
 * The link is stretched across the card rather than wrapping it, so the video
 * badge can sit above it without nesting a <button> inside an <a>.
 *
 * `fill` stretches the card to its grid row; otherwise it keeps a 16/9 frame.
 */
export function OverlayNewsCard({
  article,
  size = "small",
  fill = false,
  priority = false,
}) {
  if (!article) return null;

  const style = OVERLAY_SIZES[size] || OVERLAY_SIZES.small;
  const image = getArticleThumbnail(article);
  const category = article.category?.name;
  const isVideo = hasVideo(article);

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-xl">
      <div
        className={`relative w-full ${
          fill ? `h-full ${style.minHeight} lg:min-h-full` : "aspect-video"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={article.title}
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-700 via-slate-800 to-slate-900">
            <Newspaper size={44} className="text-white/15" strokeWidth={1.5} />
          </div>
        )}

        {/* Scrim keeps the headline readable over any photo */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/5" />

        <div className={`absolute inset-x-0 bottom-0 text-white ${style.padding}`}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {category && (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                {category}
              </span>
            )}
            {isVideo && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                à¤µà¥€à¤¡à¤¿à¤¯à¥‹
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-white/75">
              <Clock size={11} />
              {formatArticleDate(article)}
            </span>
          </div>

          <h3 className={`font-bold leading-snug ${style.title}`}>
            {article.title}
          </h3>

          {style.excerpt && article.excerpt && (
            <p className="mt-2 hidden text-sm leading-relaxed text-white/80 line-clamp-2 md:block">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Whole card links to the article */}
        <Link
          href={buildArticleUrl(article)}
          aria-label={article.title}
          className="absolute inset-0 z-10"
        />

        {/* Corner controls sit above the stretched link */}
        {isVideo ? (
          <VideoPlayButton
            videoUrl={article.youtubeVideo}
            title={article.title}
            size={style.badge}
            className="absolute right-3 top-3 z-20"
          />
        ) : (
          <span className="pointer-events-none absolute right-3 top-3 z-20 translate-y-1 rounded-full bg-white/15 p-1.5 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={14} className="text-white" />
          </span>
        )}
      </div>
    </article>
  );
}

/** Headline on the left, thumbnail (with an optional play badge) on the right. */
export function CompactNewsCard({ article }) {
  if (!article) return null;

  const category = article.category?.name;
  const tags = article.tags || [];
  const image = getArticleThumbnail(article);
  const isVideo = hasVideo(article);

  return (
    <article className="group relative flex h-full gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
          {category && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-600">
              {category}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock size={10} className="text-gray-400" />
            {formatArticleDate(article)}
          </span>
        </div>

        <h3 className="text-sm font-bold leading-snug text-gray-900 line-clamp-3 transition-colors group-hover:text-red-700">
          {article.title}
        </h3>

        {tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-[11px] font-medium text-blue-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {image && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg md:h-24 md:w-24">
          <img
            src={image}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isVideo && <span className="absolute inset-0 bg-black/20" />}
        </div>
      )}

      {/* Whole card links to the article */}
      <Link
        href={buildArticleUrl(article)}
        aria-label={article.title}
        className="absolute inset-0 z-10 rounded-xl"
      />

      {/* Play badge sits above the stretched link */}
      {isVideo && (
        <VideoPlayButton
          videoUrl={article.youtubeVideo}
          title={article.title}
          size="sm"
          className={
            image
              ? "absolute bottom-4 right-4 z-20"
              : "absolute bottom-3 right-3 z-20"
          }
        />
      )}
    </article>
  );
}
