import LeftNewsPanel from "./LeftNewsPanel";
import RightNewsPanel from "./RightNewsPanel";
import MiddleNewsSection from "./MiddleNewsSection";

export default function Layout({
  breakingNews = [],
  featuredArticle = null,
  topStory = [],
  regularArticles = [],
  trendingArticles = [],
  liveVideoId = "",
  loadMore,
  hasMore,
  isLoadingMore,
}) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-2 md:px-3 lg:px-3 xl:px-4">
        {/* Mobile/Tablet: Show Breaking News and Trending above main content */}
        <div className="lg:hidden pt-6 space-y-6">
          {/* Breaking News - Mobile */}
          {breakingNews.length > 0 && (
            <div className="w-full">
              <RightNewsPanel breakingNews={breakingNews} />
            </div>
          )}

          {/* Trending News - Mobile */}
          {trendingArticles.length > 0 && (
            <div className="w-full">
              <LeftNewsPanel trendingArticles={trendingArticles} liveVideoId={liveVideoId} />
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 pt-6">
          {/* Left Fixed Panel - Desktop Only */}
          <div className="hidden lg:block w-80 shrink-0">
            <LeftNewsPanel trendingArticles={trendingArticles} liveVideoId={liveVideoId} />
          </div>

          {/* Middle Scrollable Section */}
          <div className="flex-1 min-w-0">
            <MiddleNewsSection
              topStory={topStory}
              featuredArticle={featuredArticle}
              regularArticles={regularArticles}
              liveVideoId={liveVideoId}
              loadMore={loadMore}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
            />
          </div>

          {/* Right Fixed Panel - Desktop Only */}
          <div className="hidden lg:block w-80 shrink-0">
            <RightNewsPanel breakingNews={breakingNews} />
          </div>
        </div>
      </div>
    </div>
  );
}
