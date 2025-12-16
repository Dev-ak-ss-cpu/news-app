import { Card, CardBody } from "@heroui/react";
import { TrendingUp, Clock, Folder } from "lucide-react";
import Link from "next/link";
import { LiveStreamPlayer } from "../Components/LiveStreamPlayer";
import { buildArticleUrl } from "@/app/utils/articleUrl";

export default function LeftNewsPanel({ trendingArticles = [], liveVideoId = "" }) {
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

  return (
    <div className="space-y-4 lg:sticky lg:top-32">
      {/* Trending News - Compact Version */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-3">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-linear-to-r from-red-500 to-orange-500 rounded-md">
                <TrendingUp size={14} className="text-white" />
              </div>
              <div className="flex items-start justify-between gap-22">
                {/* Left */}
                <div>
                  <Link href="/trending">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                      ट्रेंडिंग न्यूज़
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    सबसे ज्यादा पढ़े जा रहे
                  </p>
                </div>

                {/* Right */}
                <Link
                  href="/trending"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                >
                  View All →
                </Link>
              </div>
            </div>
          </div>

          {/* Compact Articles */}
          <div className="space-y-2">
            {trendingArticles.length > 0 ? (
              trendingArticles.map((news, index) => (
                <Link
                  key={news._id || index}
                  href={buildArticleUrl(news)}
                  className="block group"
                >
                  <div className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2">
                      {/* Compact Number */}
                      <div className="shrink-0 pt-0.5">
                        <div className={`
                          w-5 h-5 rounded flex items-center justify-center text-xs font-bold
                          ${index < 5
                            ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                          }
                        `}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title - Single line */}
                        <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1 group-hover:text-red-700 transition-colors line-clamp-3">
                          {news.title}
                        </h4>

                        {/* Compact Metadata */}
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-600">
                          {/* Time */}
                          <div className="flex items-center gap-1">
                            <Clock size={10} className="text-gray-400" />
                            <span className="text-gray-600">{getTimeAgo(news.publishDate)}</span>
                          </div>

                          {/* Category */}
                          {news.category && (
                            <>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1">
                                <Folder size={10} className="text-gray-400" />
                                <span className="text-red-600 font-medium">{news.category.name}</span>
                              </div>
                            </>
                          )}
                        </div>

                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {index < trendingArticles.length - 1 && <div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent my-1"></div>}
                </Link>

              ))
            ) : (
              <div className="text-center py-4">
                <TrendingUp size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-gray-500 text-xs">कोई ट्रेंडिंग समाचार नहीं</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Live TV - Compact */}
      {liveVideoId && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardBody className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-gray-900 text-sm">लाइव टीवी</h3>
            </div>

            <LiveStreamPlayer videoId={liveVideoId} small={true} />

            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600">24×7 लाइव कवरेज</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}