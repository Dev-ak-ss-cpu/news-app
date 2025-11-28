import { Card, CardBody, Button } from "@heroui/react";
import { Play, Calendar, MapPin } from "lucide-react";
import NewsCard from "../Components/NavCard";
import CategoryCard from "../Components/Category";
import HeroSection from "./HeroSection";
import Link from "next/link";
import { getYouTubeId, getYouTubeThumbnail } from "../Helper";
import { LiveStreamPlayer } from "../Components/LiveStreamPlayer";

export default function MiddleNewsSection({
  featuredArticle = null,
  topStory = [],
  trendingArticles = [],
  regularArticles = [],
  loadMore,
  hasMore,
  isLoadingMore,
}) {
  const categories = [
    { name: "राजनीति", count: "1245", color: "bg-blue-500", icon: "🏛️" },
    { name: "क्रिकेट", count: "892", color: "bg-green-500", icon: "🏏" },
    { name: "मनोरंजन", count: "756", color: "bg-purple-500", icon: "🎬" },
    { name: "शहर", count: "643", color: "bg-orange-500", icon: "🏙️" },
  ];

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

  // 1. First: Featured article (always as image if available)
  if (featuredArticle && hasImage(featuredArticle)) {
    articleSequence.push({
      type: "image",
      article: featuredArticle,
      priority: "featured",
    });
  }

  // 2. Second: Featured article with video (if available), or another featured image, or top story
  // Check if featured article has video (and we haven't added it yet)
  if (
    featuredArticle &&
    hasVideo(featuredArticle) &&
    articleSequence.length === 1
  ) {
    articleSequence.push({
      type: "video",
      article: featuredArticle,
      priority: "featured",
    });
  } else if (
    featuredArticle &&
    hasImage(featuredArticle) &&
    articleSequence.length === 1
  ) {
    // If featured article has another image variant, add it
    articleSequence.push({
      type: "image",
      article: featuredArticle,
      priority: "featured",
    });
  } else if (topStory && topStory.length > 0) {
    // Add first top story
    const firstTopStory = topStory[0];
    if (hasVideo(firstTopStory)) {
      articleSequence.push({
        type: "video",
        article: firstTopStory,
        priority: "topStory",
      });
    } else if (hasImage(firstTopStory)) {
      articleSequence.push({
        type: "image",
        article: firstTopStory,
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
  // Render Image Article Card with overlay
  const renderImageArticle = (article) => {
    if (!article) return null;
    return (
      <Link key={article._id} href={`/article/${article.slug}`}>
        <Card className="bg-white border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow rounded-xl">
          <div className="aspect-[16/9] bg-gray-200 relative rounded-xl overflow-hidden">
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            )}
            {/* Breaking News Badge - positioned at top-left */}
            {article.isBreaking && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg">
                  ब्रेकिंग न्यूज़
                </span>
              </div>
            )}
            {/* Dark overlay gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent"></div>
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              {/* Category and Date */}
              <div className="flex items-center text-white/90 text-xs mb-3">
                {article.category && (
                  <>
                    <MapPin size={14} className="mr-1.5" />
                    <span className="mr-3 font-medium">
                      {article.category.name}
                    </span>
                  </>
                )}
                <Calendar size={14} className="mr-1.5" />
                <span className="font-medium">
                  {new Date(article.publishDate).toLocaleDateString()}
                </span>
              </div>
              {/* Title */}
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                {article.title}
              </h2>
              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-white/95 text-sm md:text-base line-clamp-2 mb-3 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
              {/* Hashtags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-white text-sm font-medium hover:underline cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
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
      <Link key={article._id} href={`/article/${article.slug}`}>
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
                className={`${
                  thumbnail || article.featuredImage ? "md:w-3/5" : "w-full"
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
            <div>{renderImageArticle(block.imageArticle)}</div>
          )}

          {/* Video Article */}
          {block.videoArticle && (
            <div>{renderVideoArticle(block.videoArticle)}</div>
          )}

          {/* Articles Grid */}
          {block.articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {block.articles.map((article, index) => (
                <Link
                  key={article._id || index}
                  href={`/article/${article.slug}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remainingArticles.map((article, index) => {
              // If it's a video article, render video card
              if (hasVideo(article)) {
                return (
                  <div key={article._id || index} className="h-full">
                    {renderVideoArticle(article)}
                  </div>
                );
              } else if (hasImage(article)) {
                // If it has image, render with overlay (like featured) - same style as main cards
                return (
                  <div key={article._id || index} className="h-full">
                    {renderImageArticle(article)}
                  </div>
                );
              } else {
                // Regular article without image - use NewsCard
                return (
                  <Link
                    key={article._id || index}
                    href={`/article/${article.slug}`}
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
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            name={category.name}
            count={category.count}
            color={category.color}
            icon={category.icon}
          />
        ))}
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
