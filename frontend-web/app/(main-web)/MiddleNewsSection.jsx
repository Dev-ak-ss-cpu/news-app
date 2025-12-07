"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { Play, Calendar, MapPin } from "lucide-react";
import NewsCard from "../Components/NavCard";
import CategoryCard from "../Components/Category";
import HeroSection from "./HeroSection";
import Link from "next/link";
import { genericGetApi, getYouTubeId, getYouTubeThumbnail } from "../Helper";
import { LiveStreamPlayer } from "../Components/LiveStreamPlayer";
import { useEffect, useState } from "react";
import { buildArticleUrl } from "@/app/utils/articleUrl";

export default function MiddleNewsSection({
  topStory = [],
  trendingArticles = [],
  regularArticles = [],
  loadMore,
  hasMore,
  isLoadingMore,
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

  const usedArticleIds = new Set();
  const articleSequence = [];

  const addToSequence = (type, article, priority) => {
    if (!article || usedArticleIds.has(article._id)) return;
    articleSequence.push({ type, article, priority });
    usedArticleIds.add(article._id);
  };

  const hasVideo = (a) => a?.youtubeVideo?.trim() !== "";
  const hasImage = (a) => a?.featuredImage?.trim() !== "";

  // TOP STORY LOGIC --------------
  // if (topStory.length > 0) {
  //   const first = topStory[0];
  //   if (hasImage(first)) addToSequence("image", first, "topStory");
  // }

  // if (topStory.length > 0) {
  //   const first = topStory[0];
  //   if (hasVideo(first) && articleSequence.length === 1) {
  //     addToSequence("video", first, "topStory");
  //   } else if (topStory.length > 1) {
  //     const second = topStory[1];
  //     if (hasImage(second) && articleSequence.length === 1) {
  //       addToSequence("image", second, "topStory");
  //     }
  //   }
  // }

  topStory.forEach((story) => {
    if (!usedArticleIds.has(story._id)) {
      if (hasVideo(story)) addToSequence("video", story, "topStory");
      else if (hasImage(story)) addToSequence("image", story, "topStory");
      else addToSequence("text", story, "topStory");
    }
  });

  trendingArticles.forEach((a) => {
    if (hasVideo(a)) addToSequence("video", a, "trending");
    else if (hasImage(a)) addToSequence("image", a, "trending");
    else addToSequence("text", a, "trending");
  });

  // REGULAR ARTICLES SPLIT ------------
  const regularImageArticles = [];
  const regularVideoArticles = [];
  const regularOnlyArticles = [];

  regularArticles.forEach((a) => {
    if (hasVideo(a)) regularVideoArticles.push(a);
    else if (hasImage(a)) regularImageArticles.push(a);
    else {
      regularOnlyArticles.push(a);
    }
  });

  const patternBlocks = [];
  let imageIndex = 0,
    videoIndex = 0,
    articleIndex = 0,
    sequenceIndex = 0;

  const articlesPerBlock = 3;
  const maxPatterns = 3;

  // BLOCK GENERATION ------------
  for (let i = 0; i < maxPatterns; i++) {
    const block = {
      imageArticle: null,
      videoArticle: null,
      textArticle: null,
      articles: [],
    };

    // 1. IMAGE from sequence (topStory/trending)
    if (!block.imageArticle && sequenceIndex < articleSequence.length) {
      const seqItem = articleSequence[sequenceIndex];
      if (seqItem.type === "image") {
        block.imageArticle = seqItem.article;
        usedArticleIds.add(seqItem.article._id);
        sequenceIndex++;
      }
    }

    // 2. VIDEO from sequence
    if (!block.videoArticle && sequenceIndex < articleSequence.length) {
      const seqItem = articleSequence[sequenceIndex];
      if (seqItem.type === "video") {
        block.videoArticle = seqItem.article;
        usedArticleIds.add(seqItem.article._id);
        sequenceIndex++;
      }
    }

    // 3. TEXT from sequence (topStory/trending)
    if (!block.textArticle && sequenceIndex < articleSequence.length) {
      const seqItem = articleSequence[sequenceIndex];
      if (seqItem.type === "text") {
        block.textArticle = seqItem.article;
        usedArticleIds.add(seqItem.article._id);
        sequenceIndex++;
      }
    }

    // 4. fallback image from regular articles
    if (!block.imageArticle && imageIndex < regularImageArticles.length) {
      const img = regularImageArticles[imageIndex++];
      if (!usedArticleIds.has(img._id)) {
        block.imageArticle = img;
        usedArticleIds.add(img._id);
      }
    }

    // 5. fallback video from regular articles
    if (!block.videoArticle && videoIndex < regularVideoArticles.length) {
      const vid = regularVideoArticles[videoIndex++];
      if (!usedArticleIds.has(vid._id)) {
        block.videoArticle = vid;
        usedArticleIds.add(vid._id);
      }
    }

    // fallback video
    if (!block.videoArticle && videoIndex < regularVideoArticles.length) {
      const vid = regularVideoArticles[videoIndex++];
      if (!usedArticleIds.has(vid._id)) {
        block.videoArticle = vid;
        usedArticleIds.add(vid._id);
      }
    }

    // REGULAR ARTICLES
    let added = 0;
    while (
      added < articlesPerBlock &&
      articleIndex < regularOnlyArticles.length
    ) {
      let art = regularOnlyArticles[articleIndex++];
      if (!usedArticleIds.has(art._id)) {
        block.articles.push(art);
        usedArticleIds.add(art._id);
        added++;
      }
    }

    if (block.imageArticle || block.videoArticle || block.articles.length > 0) {
      patternBlocks.push(block);
    }
  }

  // REMAINING ARTICLES -----------
  const remainingSequence = articleSequence.slice(sequenceIndex);

  const remainingArticles = [
    ...remainingSequence.map((i) => i.article),
    ...regularImageArticles.slice(imageIndex),
    ...regularVideoArticles.slice(videoIndex),
    ...regularOnlyArticles.slice(articleIndex),
  ].filter((a) => !usedArticleIds.has(a._id));

  // IMAGE CARD (UNEVEN HEIGHT) -------------
  const renderImageArticle = (article) => (
    <Link key={article._id} href={buildArticleUrl(article)}>
      <Card className="bg-white shadow-lg hover:shadow-xl transition rounded-xl overflow-hidden">
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <img
            src={article.featuredImage}
            className="w-full h-full object-cover"
            alt={article.title}
          />

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* text */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h2 className="font-bold text-sm sm:text-base line-clamp-1">
              {article.title}
            </h2>

            {article.excerpt && (
              <p className="text-xs sm:text-sm line-clamp-2 opacity-90">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );

  // VIDEO CARD -----------------
  const renderVideoArticle = (article) => {
    const thumbnail = getYouTubeThumbnail(article.youtubeVideo);

    return (
      <Link key={article._id} href={buildArticleUrl(article)}>
        <Card className="bg-white shadow-lg hover:shadow-xl transition rounded-xl overflow-hidden">
          {/* SAME AS IMAGE: All content inside aspect-[16/9] */}
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            {/* thumbnail */}
            <img
              src={thumbnail || article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />

            {/* dark gradient bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* play button */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="bg-red-600 p-3 rounded-full shadow">
                <Play size={26} className="text-white" />
              </div>
            </div>

            {/* TEXT INSIDE THUMBNAIL (same as image card) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                {article.title}
              </h3>

              {article.excerpt && (
                <p className="text-xs sm:text-sm line-clamp-2 opacity-90">
                  {article.excerpt}
                </p>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  const renderTextArticle = (article) => (
    <Link key={article._id} href={buildArticleUrl(article)}>
      <NewsCard
        title={article.title}
        excerpt={article.excerpt}
        image={null}
        location={article.category?.name}
        date={new Date(article.publishDate).toLocaleDateString()}
        category={article.category?.name}
        tags={article.tags}
      />
    </Link>
  );

  return (
    <div className="space-y-12 pb-8">
      {/* PATTERN BLOCKS (IMAGE → VIDEO → ARTICLES) */}
      {patternBlocks.map((block, idx) => (
        <div key={idx} className="space-y-8">
          {block.imageArticle && (
            <div className="break-inside-avoid">
              {renderImageArticle(block.imageArticle)}
            </div>
          )}

          {block.videoArticle && (
            <div className="break-inside-avoid">
              {renderVideoArticle(block.videoArticle)}
            </div>
          )}

          {block.textArticle && (
            <div className="break-inside-avoid">
              {renderTextArticle(block.textArticle)}
            </div>
          )}

          {block.articles.length > 0 && (
            <div className="columns-1 md:columns-1 lg:columns-2 gap-6 space-y-6">
              {block.articles.map((a, i) => (
                <div key={i} className="break-inside-avoid">
                  <Link href={buildArticleUrl(a)}>
                    <NewsCard
                      title={a.title}
                      excerpt={a.excerpt}
                      image={a.featuredImage}
                      location={a.category?.name}
                      date={new Date(a.publishDate).toLocaleDateString()}
                      category={a.category?.name}
                      tags={a.tags}
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* REMAINING ARTICLES */}
      {remainingArticles.length > 0 && (
        <div className="space-y-6">
          <div className="columns-1 md:columns-1 lg:columns-2 gap-6 space-y-6">
            {remainingArticles.map((a, i) => (
              <div key={i} className="break-inside-avoid">
                {hasVideo(a) ? (
                  renderVideoArticle(a, true)
                ) : hasImage(a) ? (
                  renderImageArticle(a)
                ) : (
                  <Link href={buildArticleUrl(a)}>
                    <NewsCard
                      title={a.title}
                      excerpt={a.excerpt}
                      image={a.featuredImage}
                      location={a.category?.name}
                      date={new Date(a.publishDate).toLocaleDateString()}
                      category={a.category?.name}
                      tags={a.tags}
                    />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <LiveStreamPlayer videoId="rEKifG2XUZg" />
        </div>
      )}

      {/* CATEGORIES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categoriesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border rounded-xl p-6 animate-pulse"
              ></div>
            ))
          : categories.map((c) => (
              <Link key={c._id} href={`/${c.slug || c._id}`}>
                <CategoryCard {...c} />
              </Link>
            ))}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            onPress={loadMore}
            variant="bordered"
            isLoading={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load More Articles"}
          </Button>
        </div>
      )}
    </div>
  );
}
