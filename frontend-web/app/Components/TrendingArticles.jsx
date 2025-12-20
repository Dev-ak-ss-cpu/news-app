"use client";
import { Card, CardBody } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { buildArticleUrl } from "@/app/utils/articleUrl";

export default function TrendingArticles({ 
  articles = [], // Pre-fetched articles from server
  title = "ट्रेंडिंग अभी",
  showLoading = false,
  maxItems = 5  // Add this prop
}) {
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

  // Limit articles to maxItems
  const displayArticles = articles.slice(0, maxItems);

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardBody className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-red-600" />
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        </div>

        {showLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : displayArticles.length > 0 ? (
          <div className="space-y-3">
            {displayArticles.map((article, index) => (
              <Link key={article._id || index} href={buildArticleUrl(article)}>
                <div className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {article.category && (
                          <span className="text-blue-600">{article.category.name}</span>
                        )}
                        {article.author && (
                          <>
                            {article.category && <span>•</span>}
                            <span>{article.author}</span>
                          </>
                        )}
                      </div>
                      <span>{getTimeAgo(article.publishDate)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No trending articles available</p>
        )}
      </CardBody>
    </Card>
  );
}