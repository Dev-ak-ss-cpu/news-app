import { Card, CardBody, Button } from "@heroui/react";
import { Play, Calendar, MapPin } from "lucide-react";
import NewsCard from "../Components/NavCard";
import CategoryCard from "../Components/Category";
import HeroSection from "./HeroSection";
import Link from "next/link";
import { getYouTubeId, getYouTubeThumbnail } from "../Helper";

export default function MiddleNewsSection({
  featuredArticle = null,
  topStory = null,
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

  // Separate articles by type
  const imageArticles = [];
  const videoArticles = [];
  const regularOnlyArticles = [];

  // Add featured article if it has image
  if (featuredArticle && hasImage(featuredArticle)) {
    imageArticles.push(featuredArticle);
  }

  // Add top story if it has video, otherwise check if it has image
  if (topStory) {
    if (hasVideo(topStory)) {
      videoArticles.push(topStory);
    } else if (hasImage(topStory)) {
      imageArticles.push(topStory);
    }
  }

  // Process regular articles
  regularArticles.forEach((article) => {
    if (hasVideo(article)) {
      videoArticles.push(article);
    } else if (hasImage(article)) {
      imageArticles.push(article);
    } else {
      regularOnlyArticles.push(article);
    }
  });

  // Create pattern blocks: Image → Video → Articles (2-3 articles)
  const patternBlocks = [];
  let imageIndex = 0;
  let videoIndex = 0;
  let articleIndex = 0;
  const articlesPerBlock = 3; // Number of articles to show after each image/video pair

  // Create 2-3 pattern blocks
  const maxPatterns = 3;
  for (let i = 0; i < maxPatterns; i++) {
    const block = {
      imageArticle:
        imageIndex < imageArticles.length ? imageArticles[imageIndex++] : null,
      videoArticle:
        videoIndex < videoArticles.length ? videoArticles[videoIndex++] : null,
      articles: [],
    };

    // Add articles for this block
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
  const remainingArticles = [
    ...imageArticles.slice(imageIndex),
    ...videoArticles.slice(videoIndex),
    ...regularOnlyArticles.slice(articleIndex),
  ];

  // Render Image Article Card
  const renderImageArticle = (article) => {
    if (!article) return null;
    return (
      <Link key={article._id} href={`/article/${article.slug}`}>
        <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
          <div className="aspect-[16/9] bg-gray-200 relative">
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center text-white/80 text-sm mb-2">
                {article.category && (
                  <>
                    <MapPin size={16} className="mr-1" />
                    <span className="mr-4">{article.category.name}</span>
                  </>
                )}
                <Calendar size={16} className="mr-1" />
                <span>
                  {new Date(article.publishDate).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                {article.title}
              </h2>
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-white/90 text-sm hover:underline cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {article.isBreaking && (
              <div className="absolute top-4 left-4">
                <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                  ब्रेकिंग न्यूज़
                </span>
              </div>
            )}
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remainingArticles.map((article, index) => {
              // If it's a video or image article, render it directly (already has Link)
              if (hasVideo(article)) {
                return (
                  <div key={article._id || index} className="h-full">
                    {renderVideoArticle(article)}
                  </div>
                );
              } else if (hasImage(article)) {
                return (
                  <div key={article._id || index} className="h-full">
                    {renderImageArticle(article)}
                  </div>
                );
              } else {
                // Regular article - wrap NewsCard with Link
                return (
                  <Link
                    key={article._id || index}
                    href={`/article/${article.slug}`}
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
