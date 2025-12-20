"use client";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { buildArticleUrl } from "@/app/utils/articleUrl";

export default function RelatedArticles({ 
  articles = [], // Pre-fetched articles from server
  title = "संबंधित खबरें",
  showLoading = false
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

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardBody className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-4">{title}</h3>

        {showLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link key={article._id} href={buildArticleUrl(article)}>
                <div className="flex gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                  {article.featuredImage && (
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-20 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1 line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(article.publishDate)}
                      </span>
                      {article.author && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{article.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No related articles available</p>
        )}
      </CardBody>
    </Card>
  );
}
