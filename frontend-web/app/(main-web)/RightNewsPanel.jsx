
import { Card, CardBody } from "@heroui/react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buildArticleUrl } from "@/app/utils/articleUrl";
import { genericGetApi } from "../Helper";

export default function RightNewsPanel({ breakingNews = [] }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ---------------------------
  // CATEGORY COLOR + ICON CONFIG
  // ---------------------------
  const getCategoryConfig = (name) => {
    const configs = {
      राजनीति: { color: "bg-blue-500" },
      क्रिकेट: { color: "bg-green-500" },
      मनोरंजन: { color: "bg-purple-500" },
      शहर: { color: "bg-orange-500" },
      बिजनेस: { color: "bg-indigo-500" },

      // English mapping for fallback
      Politics: { color: "bg-blue-500" },
      Cricket: { color: "bg-green-500" },
      Entertainment: { color: "bg-purple-500" },
      City: { color: "bg-orange-500" },
      Business: { color: "bg-indigo-500" },
    };

    return configs[name] || { color: "bg-gray-500" };
  };

  // ---------------------------
  // FORMAT COUNT (1.2K, 980 etc.)
  // ---------------------------
  const formatCount = (count) => {
    if (!count) return "0";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  // ---------------------------
  // FETCH CATEGORIES (same as middle section)
  // ---------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await genericGetApi("/api/categories", {
          parent: "null",
          level: 0,
          includeArticleCount: "true",
        });

        if (response.success && response.data) {
          const formatted = response.data.map((c) => ({
            name: c.name,
            slug: c.slug,
            count: formatCount(c.articleCount || 0),
            color: getCategoryConfig(c.name).color,
          }));

          setCategories(formatted);
        }
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ---------------------------
  const getTimeAgo = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));

    if (diffHours < 1) {
      const mins = Math.floor((now - d) / (1000 * 60));
      return mins < 1 ? "अभी" : `${mins} मिनट पहले`;
    }

    if (diffHours < 24) return `${diffHours} घंटे पहले`;

    const days = Math.floor(diffHours / 24);
    return `${days} दिन पहले`;
  };

  // ---------------------------
  return (
    <div className="space-y-6 sticky top-36">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">ताज़ा अपडेट</h3>
          </div>

          <div className="space-y-4">
            {breakingNews.length > 0 ? (
              breakingNews.map((news, index) => (
                <Link key={news._id || index} href={buildArticleUrl(news)}>
                  <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 leading-tight mb-1">
                          {news.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{getTimeAgo(news.publishDate)}</span>
                          {news.category && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">
                                {news.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No breaking news</p>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            लोकप्रिय श्रेणियाँ
          </h3>

          <div className="space-y-3">
            {loadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 rounded-lg animate-pulse"
                ></div>
              ))
            ) : categories.length > 0 ? (
              categories.map((c, index) => (
                <Link key={index} href={`/${c.slug}`}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${c.color}`} />
                      <span className="font-medium text-gray-900">
                        {c.name}
                      </span>
                    </div>

                    <span className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-700">
                      {c.count}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No categories available</p>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">मौसम</h3>

          <div className="text-center">
            <div className="text-4xl mb-2">🌤️</div>
            <p className="text-2xl font-bold text-gray-900">24°C</p>
            <p className="text-gray-600">दिल्ली</p>
            <p className="text-sm text-gray-500 mt-1">हल्की धूप के साथ</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
