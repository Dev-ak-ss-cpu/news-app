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
          {/* <div className="flex items-center gap-2 mb-5">
            <Clock size={20} className="text-blue-600" />
            <h3 className="font-semibold text-xl text-gray-900">ताज़ा अपडेट</h3>
          </div> */}

          {/* Breaking News - Urgent & Eye-catching */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-red-600 rounded-full"></div>
              <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">BREAKING NEWS</h3>
              <div className="ml-auto">
                <div className="flex items-center gap-1 animate-pulse">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-xs font-semibold text-red-600">LIVE</span>
                </div>
              </div>
            </div>

            {breakingNews.length > 0 ? (
              <div className="rounded-lg bg-white divide-y divide-gray-100">
                {breakingNews.map((news, index) => (
                  <Link key={news._id || index} href={buildArticleUrl(news)}>
                    <div className="p-3 hover:bg-red-50/30 transition-colors duration-200 group">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-md">
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-xs leading-snug group-hover:text-red-700 transition-colors">
                              {news.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium">{getTimeAgo(news.publishDate)}</span>

                            {news.category && (
                              <>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span className="font-medium text-red-600">{news.category.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <svg className="w-6 h-6 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500">No breaking news at this time</p>
              </div>
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
