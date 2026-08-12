"use client";

import Link from "next/link";
import { TrendingUp, Clock, Folder } from "lucide-react";
import { LiveStreamPlayer } from "../Components/LiveStreamPlayer";
import { buildArticleUrl } from "@/app/utils/articleUrl";

const getTimeAgo = (date) => {
  const now = new Date();
  const articleDate = new Date(date);
  const diffInHours = Math.floor((now - articleDate) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - articleDate) / (1000 * 60));
    return diffInMinutes < 1 ? "अभी" : `${diffInMinutes} मिनट पहले`;
  }
  if (diffInHours < 24) return `${diffInHours} घंटे पहले`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} दिन पहले`;
};

/**
 * Trending list and the live player side by side, in the full-width strip
 * between the main layout and the "और खबरें" feed.
 */
// Fills the 3-column grid exactly
const TRENDING_LIMIT = 9;

export default function TrendingLiveRow({
  trendingArticles = [],
  liveVideoId = "",
}) {
  const trending = trendingArticles.slice(0, TRENDING_LIMIT);
  const hasTrending = trending.length > 0;

  if (!hasTrending && !liveVideoId) return null;

  return (
    <section className="container mx-auto px-4 pt-8 pb-10 md:pb-12">
      <div className="grid gap-6 lg:grid-cols-3">
        {hasTrending && (
          <div
            className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${
              liveVideoId ? "lg:col-span-2" : "lg:col-span-3"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-linear-to-r from-red-500 to-orange-500 p-2">
                  <TrendingUp size={16} className="text-white" />
                </span>
                <div>
                  <Link href="/trending">
                    <h3 className="text-base font-bold leading-tight text-gray-900">
                      ट्रेंडिंग न्यूज़
                    </h3>
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">
                    सबसे ज्यादा पढ़े जा रहे
                  </p>
                </div>
              </div>

              <Link
                href="/trending"
                className="whitespace-nowrap text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View All →
              </Link>
            </div>

            <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((news, index) => (
                <Link
                  key={news._id || index}
                  href={buildArticleUrl(news)}
                  className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  {/* Top three get the accent treatment */}
                  <span
                    className={`w-6 shrink-0 pt-0.5 text-center font-mono text-lg font-bold leading-none tabular-nums ${
                      index < 3
                        ? "bg-linear-to-br from-red-500 to-orange-500 bg-clip-text text-transparent"
                        : "text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1.5 text-sm font-semibold leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-red-700">
                      {news.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={10} className="text-gray-400" />
                        {getTimeAgo(news.publishDate)}
                      </span>

                      {news.category && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1">
                            <Folder size={10} className="text-gray-400" />
                            <span className="font-medium text-red-600">
                              {news.category.name}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {liveVideoId && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></span>
              <h3 className="text-sm font-bold text-gray-900">लाइव टीवी</h3>
            </div>

            <LiveStreamPlayer videoId={liveVideoId} />

            <p className="mt-2 text-center text-xs text-gray-600">
              24×7 लाइव कवरेज
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
