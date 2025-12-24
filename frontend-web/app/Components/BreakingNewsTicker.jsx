"use client";
import Link from "next/link";
import { buildArticleUrl } from "@/app/utils/articleUrl";
import { AlertTriangle } from "lucide-react";

export default function BreakingNewsTicker({ breakingNews = [] }) {
  if (breakingNews.length === 0) return null;

  return (
    <div className="bg-red-600 text-white border-b border-red-700">
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          {/* Breaking News Label */}
          <div className="flex items-center gap-2 shrink-0 bg-red-700 px-2 sm:px-3 py-1 rounded-md">
            <AlertTriangle size={16} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold whitespace-nowrap">ब्रेकिंग</span>
          </div>

          {/* Scrolling News Ticker */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center gap-4 sm:gap-6 animate-scroll whitespace-nowrap">
              {breakingNews.map((news, index) => (
                <Link
                  key={news._id || index}
                  href={buildArticleUrl(news)}
                  className="flex items-center gap-2 shrink-0 hover:text-yellow-200 transition-colors"
                >
                  <span className="text-sm sm:text-base font-medium">
                    {news.title}
                  </span>
                  <span className="text-xs opacity-75">•</span>
                </Link>
              ))}
              {/* Duplicate for seamless loop */}
              {breakingNews.map((news, index) => (
                <Link
                  key={`dup-${news._id || index}`}
                  href={buildArticleUrl(news)}
                  className="flex items-center gap-2 shrink-0 hover:text-yellow-200 transition-colors"
                >
                  <span className="text-sm sm:text-base font-medium">
                    {news.title}
                  </span>
                  <span className="text-xs opacity-75">•</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

