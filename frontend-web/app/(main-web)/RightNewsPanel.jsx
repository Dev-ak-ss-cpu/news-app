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
      <Card className="bg-white border border-gray-100 shadow-md rounded-2xl">
        <CardBody className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={20} className="text-blue-600" />
            <h3 className="font-semibold text-xl text-gray-900">ताज़ा अपडेट</h3>
          </div>

          <div className="space-y-4">
            {breakingNews.length > 0 ? (
              breakingNews.map((news, index) => (
                <Link key={news._id || index} href={buildArticleUrl(news)}>
                  <div className="group border border-gray-100 bg-gray-50/60 hover:bg-gray-100 rounded-xl p-3 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold shadow-sm">
                        {index + 1}
                      </span>

                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition line-clamp-2">
                          {news.title}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{getTimeAgo(news.publishDate)}</span>

                          {news.category && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">
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

      <Card className="bg-white border border-gray-100 shadow-md rounded-2xl">
        <CardBody className="p-5">
          <h3 className="font-semibold text-xl text-gray-900 mb-4">
            लोकप्रिय श्रेणियाँ
          </h3>

          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
            {loadingCategories
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse"></div>
                ))
              : categories.map((c, index) => (
                  <Link key={index} href={`/${c.slug}`}>
                    <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${c.color}`}
                        ></span>
                        <span className="font-medium text-gray-800">
                          {c.name}
                        </span>
                      </div>

                      <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-semibold text-gray-700">
                        {c.count}
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white border border-gray-100 shadow-md rounded-2xl">
        <CardBody className="p-6 text-center">
          <h3 className="font-semibold text-xl text-gray-900 mb-4">मौसम</h3>

          <div className="text-5xl mb-3">🌤️</div>

          <p className="text-3xl font-bold text-gray-900 mb-1">24°C</p>
          <p className="text-gray-700 font-medium">दिल्ली</p>
          <p className="text-sm text-gray-500 mt-1">हल्की धूप के साथ</p>
        </CardBody>
      </Card>
    </div>
  );
}
