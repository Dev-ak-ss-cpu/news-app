"use client";

import CategoryCard from "../Components/Category";
import Link from "next/link";
import { genericGetApi } from "../Helper";
import SectionHeader from "./SectionHeader";
import { useEffect, useState } from "react";
import {
  OverlayNewsCard,
  CompactNewsCard,
  hasVideo,
  hasImage,
} from "../Components/NewsCards";

// A full-width story leads every run of this many cards.
const WIDE_CARD_INTERVAL = 5;

export default function MiddleNewsSection({
  topStory = [],
  regularArticles = [],
  title = "ताज़ा खबरें",
}) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await genericGetApi("/api/categories", {
          parent: "null",
          level: 0,
          includeArticleCount: "true",
        });

        if (response.success && response.data) {
          const limitedCategories = response.data.slice(0, 4);

          const formattedCategories = limitedCategories.map((category) => {
            const categoryConfig = getCategoryConfig(category.name);
            return {
              _id: category._id,
              name: category.name,
              slug: category.slug,
              count: formatCount(category.articleCount || 0),
              color: categoryConfig.color,
              icon: categoryConfig.icon,
            };
          });

          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const formatCount = (count) => {
    if (!count || count === 0) return "0";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  const getCategoryConfig = (categoryName) => {
    const configs = {
      Country: { color: "bg-blue-500", icon: "🌍" },
      Sports: { color: "bg-green-500", icon: "⚽" },
      Business: { color: "bg-yellow-500", icon: "💼" },
      Politics: { color: "bg-blue-500", icon: "🏛️" },
      Entertainment: { color: "bg-purple-500", icon: "🎬" },
      City: { color: "bg-orange-500", icon: "🏙️" },
      Technology: { color: "bg-indigo-500", icon: "💻" },
      Health: { color: "bg-pink-500", icon: "🏥" },
      Cricket: { color: "bg-green-500", icon: "🏏" },

      // Hindi categories
      राजनीति: { color: "bg-blue-500", icon: "🏛️" },
      क्रिकेट: { color: "bg-green-500", icon: "🏏" },
      मनोरंजन: { color: "bg-purple-500", icon: "🎬" },
      शहर: { color: "bg-orange-500", icon: "🏙️" },
      बिजनेस: { color: "bg-yellow-500", icon: "💼" },
      खेल: { color: "bg-red-500", icon: "⚽" },
      तकनीक: { color: "bg-indigo-500", icon: "💻" },
      स्वास्थ्य: { color: "bg-pink-500", icon: "🏥" },
    };
    return configs[categoryName] || { color: "bg-gray-500", icon: "📰" };
  };

  // Render in the exact order the API sent: top stories, then the paginated
  // feed. "Load more" only appends, so nothing already on screen moves.
  const seenIds = new Set();
  const articles = [...topStory, ...regularArticles].filter((article) => {
    if (!article) return false;
    if (!article._id) return true;
    if (seenIds.has(article._id)) return false;
    seenIds.add(article._id);
    return true;
  });

  /**
   * Card size is decided by absolute position, never by what else is loaded, so
   * appending a page can't resize or reshuffle earlier cards. A wide card every
   * fifth slot fills its row exactly (2 + 2 + 1 full-width), leaving no gaps.
   */
  const renderArticles = (items, offset = 0) => (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((article, i) => {
        const index = offset + i;
        const isWide = index % WIDE_CARD_INTERVAL === 0;

        return (
          <div
            key={article._id || index}
            className={isWide ? "sm:col-span-2" : ""}
          >
            {hasImage(article) || hasVideo(article) ? (
              <OverlayNewsCard
                article={article}
                size={isWide ? "wide" : "small"}
                priority={index === 0}
              />
            ) : (
              <CompactNewsCard article={article} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-10 pb-8">
      {/* Header and first cards stay one block so `space-y-10` can't split them */}
      {articles.length > 0 && (
        <div>
          <SectionHeader title={title} />
          {renderArticles(articles)}
        </div>
      )}

      {/* CATEGORIES */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {categoriesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex min-h-35 flex-col items-center justify-center p-6 text-center">
                  {/* Icon placeholder */}
                  <div className="mb-3 h-12 w-12 shimmer rounded-full"></div>

                  {/* Title placeholder */}
                  <div className="mb-3 h-5 w-24 shimmer rounded"></div>

                  {/* Count and dot placeholder */}
                  <div className="mt-auto flex items-center justify-center gap-2">
                    <div className="h-2 w-2 shimmer rounded-full"></div>
                    <div className="h-4 w-16 shimmer rounded"></div>
                  </div>
                </div>
              </div>
            ))
          : categories.map((c) => (
              <Link
                key={c._id}
                href={`/${c.slug || c._id}`}
                className="block h-full"
              >
                <CategoryCard {...c} />
              </Link>
            ))}
      </div>
    </div>
  );
}
