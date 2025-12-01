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
  featuredArticle = [],
  topStory = [],
  trendingArticles = [],
  regularArticles = [],
  loadMore,
  hasMore,
  isLoadingMore,
}) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch level 0 categories with article counts
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
          // Take only first 4 categories
          const limitedCategories = response.data.slice(0, 4);

          // Map to format expected by CategoryCard component
          const formattedCategories = limitedCategories.map((category) => {
            // You can customize colors and icons based on category name or add them to the backend
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

  // Helper function to format count (e.g., 1245 -> "1.2K" or "1245")
  const formatCount = (count) => {
    if (!count || count === 0) return "0";
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  // Helper function to get category config (color and icon)
  // Handles both English and Hindi category names
  const getCategoryConfig = (categoryName) => {
    const configs = {
      // English names
      Country: { color: "bg-blue-500", icon: "🌍" },
      Sports: { color: "bg-green-500", icon: "⚽" },
      Business: { color: "bg-yellow-500", icon: "💼" },
      Politics: { color: "bg-blue-500", icon: "🏛️" },
      Entertainment: { color: "bg-purple-500", icon: "🎬" },
      City: { color: "bg-orange-500", icon: "🏙️" },
      Technology: { color: "bg-indigo-500", icon: "💻" },
      Health: { color: "bg-pink-500", icon: "🏥" },
      Cricket: { color: "bg-green-500", icon: "🏏" },

      // Hindi names
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

  // Helper function to check if article has video
  const hasVideo = (article) => {
    return article?.youtubeVideo && article.youtubeVideo.trim() !== "";
  };

  // Helper function to check if article has image
  const hasImage = (article) => {
    return article?.featuredImage && article.featuredImage.trim() !== "";
  };

  // Build the article sequence
  const articleSequence = [];

  // 1. First: Top story (always as image if available)
  if (topStory && topStory.length > 0) {
    const firstTopStory = topStory[0];
    if (hasImage(firstTopStory)) {
      articleSequence.push({
        type: "image",
        article: firstTopStory,
        priority: "topStory",
      });
    }
  }

  // 2. Second: Top story with video (if available), or another top story image
  if (topStory && topStory.length > 0) {
    const firstTopStory = topStory[0];
    // Check if first top story has video (and we haven't added it yet)
    if (hasVideo(firstTopStory) && articleSequence.length === 1) {
      articleSequence.push({
        type: "video",
        article: firstTopStory,
        priority: "topStory",
      });
    } else if (
      topStory.length > 1 &&
      hasImage(topStory[1]) &&
      articleSequence.length === 1
    ) {
      // If second top story has image, add it
      articleSequence.push({
        type: "image",
        article: topStory[1],
        priority: "topStory",
      });
    }
  }

  // 3. Add remaining top stories
  const usedTopStoryIds = new Set(
    articleSequence
      .filter((a) => a.priority === "topStory")
      .map((a) => a.article._id)
  );
  topStory.forEach((story) => {
    if (!usedTopStoryIds.has(story._id)) {
      if (hasVideo(story)) {
        articleSequence.push({
          type: "video",
          article: story,
          priority: "topStory",
        });
      } else if (hasImage(story)) {
        articleSequence.push({
          type: "image",
          article: story,
          priority: "topStory",
        });
      }
    }
  });

  // 4. Add trending articles
  trendingArticles.forEach((article) => {
    if (hasVideo(article)) {
      articleSequence.push({
        type: "video",
        article: article,
        priority: "trending",
      });
    } else if (hasImage(article)) {
      articleSequence.push({
        type: "image",
        article: article,
        priority: "trending",
      });
    }
  });

  // 5. Process regular articles - separate by type
  const regularImageArticles = [];
  const regularVideoArticles = [];
  const regularOnlyArticles = [];

  regularArticles.forEach((article) => {
    if (hasVideo(article)) {
      regularVideoArticles.push(article);
    } else if (hasImage(article)) {
      regularImageArticles.push(article);
    } else {
      regularOnlyArticles.push(article);
    }
  });

  // Create pattern blocks: Image → Video → Articles (2-3 articles)
  const patternBlocks = [];
  let imageIndex = 0;
  let videoIndex = 0;
  let articleIndex = 0;
  const articlesPerBlock = 3;

  // First, use the article sequence (featured, top stories, trending)
  let sequenceIndex = 0;

  // Create pattern blocks starting with the article sequence
  const maxPatterns = 3;
  for (let i = 0; i < maxPatterns; i++) {
    const block = {
      imageArticle: null,
      videoArticle: null,
      articles: [],
    };

    // Add image article from sequence first
    if (sequenceIndex < articleSequence.length) {
      const seqItem = articleSequence[sequenceIndex];
      if (seqItem.type === "image") {
        block.imageArticle = seqItem.article;
        sequenceIndex++;
      } else if (seqItem.type === "video") {
        block.videoArticle = seqItem.article;
        sequenceIndex++;
      }
    }

    // If no image from sequence, try regular image articles
    if (!block.imageArticle && imageIndex < regularImageArticles.length) {
      block.imageArticle = regularImageArticles[imageIndex++];
    }

    // Add video article if not already added
    if (!block.videoArticle && sequenceIndex < articleSequence.length) {
      const seqItem = articleSequence[sequenceIndex];
      if (seqItem.type === "video") {
        block.videoArticle = seqItem.article;
        sequenceIndex++;
      }
    }

    // If no video from sequence, try regular video articles
    if (!block.videoArticle && videoIndex < regularVideoArticles.length) {
      block.videoArticle = regularVideoArticles[videoIndex++];
    }

    // Add regular articles for this block
    for (
      let j = 0;
      j < articlesPerBlock && articleIndex < regularOnlyArticles.length;
      j++
    ) {
      block.articles.push(regularOnlyArticles[articleIndex++]);
    }

    // Only add block if it has at least one item
    if (block.imageArticle || block.videoArticle || block.articles.length > 0) {
      patternBlocks.push(block);
    }
  }

  // Remaining articles (after pattern blocks)
  const remainingSequence = articleSequence.slice(sequenceIndex);
  const remainingArticles = [
    ...remainingSequence.map((item) => item.article),
    ...regularImageArticles.slice(imageIndex),
    ...regularVideoArticles.slice(videoIndex),
    ...regularOnlyArticles.slice(articleIndex),
  ];

  // Render Image Article Card with overlay
  const renderImageArticle = (article) => {
    if (!article) return null;
    return (
      <Link key={article._id} href={buildArticleUrl(article)}>
        <Card className="bg-white border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow rounded-xl h-full flex flex-col">
          <div className="aspect-[16/9] bg-gray-200 relative rounded-xl overflow-hidden flex-shrink-0">
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            )}
            {/* Breaking News Badge - positioned at top-left */}
            {article.isBreaking && (
              <div className="absolute top-1 left-1 z-10">
                <span className="bg-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-[10px] md:text-xs font-bold shadow-lg">
                  ब्रेकिंग न्यूज़
                </span>
              </div>
            )}
            {/* Dark overlay gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent"></div>
            {/* Content overlay - using flexbox for better control */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col justify-end">
              <div className="p-2 sm:p-2.5 md:p-2.5 lg:p-3 xl:p-3 2xl:p-6">
                {/* Category and Date - Always at top, fixed size */}
                <div className="flex items-center text-white/90 text-[9px] sm:text-[10px] md:text-xs mb-0.5 sm:mb-1 md:mb-1 lg:mb-1.5 xl:mb-2 flex-wrap gap-0.5 sm:gap-1 flex-shrink-0 lg:hidden 2xl:flex">
                  {article.category && (
                    <>
                      <MapPin
                        size={9}
                        className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 flex-shrink-0 mr-0.5"
                      />
                      <span className="mr-1 sm:mr-1.5 md:mr-2 font-medium truncate max-w-[90px] sm:max-w-[110px] md:max-w-[140px] lg:max-w-[120px] xl:max-w-[140px] 2xl:max-w-none">
                        {article.category.name}
                      </span>
                    </>
                  )}
                  <Calendar
                    size={9}
                    className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 flex-shrink-0 mr-0.5"
                  />
                  <span className="font-medium text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap">
                    {new Date(article.publishDate).toLocaleDateString()}
                  </span>
                </div>
                {/* Title - 1 line only, smaller size, especially in 1024-1535px range */}
                <h2 className="text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base 2xl:text-lg font-bold text-white mb-0.5 sm:mb-1 md:mb-1 lg:mb-1.5 xl:mb-2 line-clamp-1 leading-tight flex-shrink-0">
                  {article.title}
                </h2>
                {/* Excerpt - 2 lines only, smaller in 1024-1535px range */}
                {article.excerpt && (
                  <p className="text-white/95 text-[10px] sm:text-xs md:text-xs lg:text-xs xl:text-sm 2xl:text-base line-clamp-2 leading-snug sm:leading-snug md:leading-snug lg:leading-snug xl:leading-relaxed flex-shrink-0">
                    {article.excerpt}
                  </p>
                )}
                {/* Hashtags - Compact, show on larger screens */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 md:mt-1 lg:mt-1.5 xl:mt-2 flex-shrink-0 hidden sm:flex">
                    {article.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="text-white text-[9px] sm:text-[10px] md:text-xs lg:text-xs xl:text-sm font-medium hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  // Render Video Article Card
  const renderVideoArticle = (article) => {
    if (!article) return null;
    const videoId = getYouTubeId(article.youtubeVideo);
    const thumbnail = getYouTubeThumbnail(article.youtubeVideo);

    return (
      <Link key={article._id} href={buildArticleUrl(article)}>
        <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
          <CardBody className="p-0">
            <div className="flex flex-col md:flex-row">
              {(thumbnail || article.featuredImage) && (
                <div className="md:w-2/5 h-48 md:h-auto relative">
                  <img
                    src={thumbnail || article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-red-600 hover:bg-red-700 rounded-full p-3 transition-colors">
                      <Play
                        size={24}
                        className="text-white ml-1"
                        fill="white"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div
                className={`${thumbnail || article.featuredImage ? "md:w-3/5" : "w-full"
                  } p-6`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  {article.category && (
                    <>
                      <MapPin size={16} />
                      <span>{article.category.name}</span>
                      <span>•</span>
                    </>
                  )}
                  <Calendar size={16} />
                  <span>
                    {new Date(article.publishDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-gray-600 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Pattern Blocks: Image → Video → Articles */}
      {patternBlocks.map((block, blockIndex) => (
        <div key={blockIndex} className="space-y-8">
          {/* Image Article */}
          {block.imageArticle && (
            <div className="w-full">
              {renderImageArticle(block.imageArticle)}
            </div>
          )}

          {/* Video Article */}
          {block.videoArticle && (
            <div className="w-full">
              {renderVideoArticle(block.videoArticle)}
            </div>
          )}

          {/* Articles Grid */}
          {block.articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {block.articles.map((article, index) => (
                <Link
                  key={article._id || index}
                  href={buildArticleUrl(article)}
                  className="h-full block"
                >
                  <NewsCard
                    title={article.title}
                    excerpt={article.excerpt}
                    image={article.featuredImage}
                    location={article.category?.name}
                    date={new Date(article.publishDate).toLocaleDateString()}
                    category={article.category?.name}
                    tags={article.tags}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Remaining Articles Section */}
      {remainingArticles.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {remainingArticles.map((article, index) => {
              // If it's a video article, render video card
              if (hasVideo(article)) {
                return (
                  <div key={article._id || index} className="h-full flex">
                    {renderVideoArticle(article)}
                  </div>
                );
              } else if (hasImage(article)) {
                // If it has image, render with overlay (like featured) - same style as main cards
                return (
                  <div key={article._id || index} className="h-full flex">
                    {renderImageArticle(article)}
                  </div>
                );
              } else {
                // Regular article without image - use NewsCard
                return (
                  <Link
                    key={article._id || index}
                    href={buildArticleUrl(article)}
                    className="h-full block"
                  >
                    <NewsCard
                      title={article.title}
                      excerpt={article.excerpt}
                      image={article.featuredImage}
                      location={article.category?.name}
                      date={new Date(article.publishDate).toLocaleDateString()}
                      category={article.category?.name}
                      tags={article.tags}
                    />
                  </Link>
                );
              }
            })}
          </div>
          <LiveStreamPlayer videoId="rEKifG2XUZg" />
        </div>
      )}

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categoriesLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
            >
              <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto mb-3 w-24"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto w-16"></div>
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <Link
              key={category._id}
              href={`/${category.slug || category._id}`}
            >
              <CategoryCard
                name={category.name}
                count={category.count}
                color={category.color}
                icon={category.icon}
              />
            </Link>
          ))
        ) : (
          <div className="col-span-4 text-center text-gray-500 py-8">
            No categories available
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            onPress={loadMore}
            isLoading={isLoadingMore}
            variant="bordered"
            className="border-gray-300"
          >
            {isLoadingMore ? "Loading..." : "Load More Articles"}
          </Button>
        </div>
      )}

      <HeroSection />
      <HeroSection />
    </div>
  );
}
