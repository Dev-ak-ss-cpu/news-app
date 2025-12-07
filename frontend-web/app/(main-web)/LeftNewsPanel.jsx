import { Card, CardBody } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { LiveStreamPlayer } from "../Components/LiveStreamPlayer";
import { buildArticleUrl } from "@/app/utils/articleUrl";

export default function LeftNewsPanel({ trendingArticles = [] }) {
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
    <div className="space-y-6 sticky top-36">
      {/* Trending News */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          {/* <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-red-600" />
            <h3 className="font-bold text-lg text-gray-900">
              ट्रेंडिंग न्यूज़
            </h3>
          </div> */}

          {/* Trending Articles - Clean & Professional */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">TRENDING</h3>
              </div>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                View all →
              </button>
            </div>

            {trendingArticles.length > 0 ? (
              <div className="space-y-2">
                {trendingArticles.map((news, index) => (
                  <Link key={news._id || index} href={buildArticleUrl(news)}>
                    <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 pt-0.5">
                          <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded
                  ${index < 3
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                            }`}>
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs leading-snug mb-1.5 group-hover:text-blue-700 transition-colors">
                            {news.title}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{getTimeAgo(news.publishDate)}</span>

                            {news.category && (
                              <>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span className="font-medium text-blue-600">{news.category.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Trending indicator for top 3 */}
                        {index < 3 && (
                          <div className="shrink-0">
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
                              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-bold text-blue-700">Trending</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500">No trending articles</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Live TV */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">लाइव टीवी</h3>

          <LiveStreamPlayer videoId="Cy2JyWkya5w" small={true} />
        </CardBody>
      </Card>
    </div>
  );
}
