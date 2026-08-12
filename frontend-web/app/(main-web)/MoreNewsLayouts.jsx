"use client";

import Link from "next/link";
import { Clock, Newspaper } from "lucide-react";
import VideoPlayButton from "../Components/VideoPlayButton";
import {
  formatArticleDate,
  getArticleThumbnail,
  hasVideo,
} from "../Components/NewsCards";
import { buildArticleUrl } from "@/app/utils/articleUrl";
import { HOME_PAGE_SIZE } from "@/app/utils/serverApi";

/*
 * Mosaic layout for the feed below the main layout: one feature tile beside a
 * stack of compact tiles. The feature swaps sides on every other block so the
 * column doesn't read as one repeating shape.
 */

// A block is one feature plus a stack of tiles, sized so that one fetched page
// fills exactly one block — every "load more" adds a complete, tidy row.
const TILES_PER_BLOCK = Math.max(1, HOME_PAGE_SIZE - 1);

function Placeholder({ size = 36 }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
      <Newspaper size={size} className="text-slate-400" strokeWidth={1.5} />
    </div>
  );
}

function CategoryLabel({ children, className = "text-red-600" }) {
  if (!children) return null;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-[0.12em] ${className}`}
    >
      {children}
    </span>
  );
}

function DateLine({ article, className = "text-gray-500" }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] ${className}`}>
      <Clock size={11} />
      <span>{formatArticleDate(article)}</span>
    </div>
  );
}

/** Stretched link + corner play badge. */
function ItemOverlay({ article, badgeClassName, badgeSize = "sm" }) {
  return (
    <>
      <Link
        href={buildArticleUrl(article)}
        aria-label={article.title}
        className="absolute inset-0 z-10"
      />
      {hasVideo(article) && (
        <VideoPlayButton
          videoUrl={article.youtubeVideo}
          title={article.title}
          size={badgeSize}
          className={`absolute z-20 ${badgeClassName}`}
        />
      )}
    </>
  );
}

function MosaicFeature({ article }) {
  const image = getArticleThumbnail(article);

  return (
    <article className="group relative h-full min-h-56 overflow-hidden rounded-lg bg-gray-900">
      {image ? (
        <img
          src={image}
          alt={article.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0">
          <Placeholder size={48} />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/5" />

      <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
        <CategoryLabel className="text-red-400">
          {article.category?.name}
        </CategoryLabel>

        <h3 className="mt-1.5 text-base font-bold leading-snug line-clamp-2 md:text-xl">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="mt-1.5 hidden text-sm leading-relaxed text-white/80 line-clamp-2 lg:block">
            {article.excerpt}
          </p>
        )}

        <div className="mt-2">
          <DateLine article={article} className="text-white/75" />
        </div>
      </div>

      <ItemOverlay
        article={article}
        badgeClassName="right-3 top-3"
        badgeSize="md"
      />
    </article>
  );
}

function MosaicTile({ article }) {
  const image = getArticleThumbnail(article);

  return (
    <article className="group relative flex min-h-0 flex-1 gap-3">
      <div className="relative h-full min-h-20 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:w-28">
        {image ? (
          <img
            src={image}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <Placeholder size={20} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <CategoryLabel>{article.category?.name}</CategoryLabel>

        <h3 className="mt-1 text-sm font-bold leading-snug text-gray-900 line-clamp-2 transition-colors duration-200 group-hover:text-red-700">
          {article.title}
        </h3>

        <div className="mt-1.5">
          <DateLine article={article} />
        </div>
      </div>

      <ItemOverlay article={article} badgeClassName="bottom-1 left-1" />
    </article>
  );
}

export function MoreNewsMosaic({ articles }) {
  const blockSize = TILES_PER_BLOCK + 1;

  const blocks = [];
  for (let i = 0; i < articles.length; i += blockSize) {
    blocks.push(articles.slice(i, i + blockSize));
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const [feature, ...tiles] = block;

        // Feature sits right on every other block
        const featureRight = index % 2 === 1;

        return (
          <div
            key={feature._id || index}
            className="grid gap-5 lg:grid-cols-3"
          >
            <div
              className={`lg:col-span-2 lg:h-96 ${
                featureRight ? "lg:order-last" : ""
              }`}
            >
              <MosaicFeature article={feature} />
            </div>

            {tiles.length > 0 && (
              <div className="flex flex-col gap-3 lg:h-96">
                {tiles.map((article, tileIndex) => (
                  <MosaicTile
                    key={article._id || tileIndex}
                    article={article}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MoreNewsSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="min-h-56 shimmer rounded-lg lg:col-span-2 lg:h-96"></div>

      <div className="flex flex-col gap-3 lg:h-96">
        {Array.from({ length: TILES_PER_BLOCK }).map((_, index) => (
          <div key={index} className="flex min-h-20 flex-1 gap-3">
            <div className="h-full w-24 shrink-0 shimmer rounded-md sm:w-28"></div>
            <div className="flex flex-1 flex-col justify-center gap-2">
              <div className="h-3 w-16 shimmer rounded"></div>
              <div className="h-4 w-full shimmer rounded"></div>
              <div className="h-3 w-20 shimmer rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
