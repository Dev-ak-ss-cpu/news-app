import { Card, CardBody } from "@heroui/react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { buildArticleUrl } from "@/app/utils/articleUrl";
import { Thermometer, CloudRain, Wind, Droplets, MapPin, Loader2 } from "lucide-react";
import { genericGetApi } from "../Helper";
import WeatherWidget from "./HomeWeather";

export default function RightNewsPanel({ breakingNews = [] }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const stickyRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  const STICKY_TOP = 120; // px → match your top-30 / top-36

  useEffect(() => {
    const handleScroll = () => {
      if (!stickyRef.current) return;

      const rect = stickyRef.current.getBoundingClientRect();
      const stuckNow = rect.top <= STICKY_TOP;

      setIsSticky((prev) => {
        // 🔁 When leaving sticky → reset internal scroll
        if (prev && !stuckNow) {
          stickyRef.current.scrollTop = 0;
        }
        return stuckNow;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


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
    <div ref={stickyRef} className={`
        space-y-6 py-2 sticky top-30
        ${isSticky ? "max-h-screen overflow-y-auto" : "overflow-visible"}
        no-scrollbar
      `}>
      {/* Breaking News - Compact */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardBody className="p-3">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">ब्रेकिंग न्यूज़</h3>
                <p className="text-xs text-gray-500">ताज़ा अपडेट</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-full">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-red-600">LIVE</span>
            </div>
          </div>

          {/* Compact Breaking News Items */}
          <div className="space-y-2">
            {breakingNews.length > 0 ? (
              breakingNews.map((news, index) => (
                <Link key={news._id || index} href={buildArticleUrl(news)}>
                  <div className="p-2 rounded-lg group hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2">
                      {/* Red Number Badge */}
                      <div className="shrink-0 pt-0.5">
                        <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1 group-hover:text-red-700 transition-colors line-clamp-3">
                          {news.title}
                        </h4>

                        {/* Metadata */}
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
                              <span className="text-red-600 font-medium">{news.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {index < breakingNews.length - 1 && <div className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent my-2"></div>}

                </Link>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse mx-auto mb-1"></div>
                <p className="text-gray-500 text-xs">कोई ब्रेकिंग न्यूज़ नहीं</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-white border border-gray-100 shadow-md rounded-2xl" style={{ minHeight: '35vh' }}>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl text-gray-900">मौसम</h3>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <MapPin size={16} />
              <span className="font-medium">दिल्ली, भारत</span>
            </div>
          </div>

          <WeatherWidget />
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
    </div>
  );
}
