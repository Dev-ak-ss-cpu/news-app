import RightNewsPanel from "./RightNewsPanel";
import MiddleNewsSection from "./MiddleNewsSection";

export default function Layout({
  breakingNews = [],
  topStory = [],
  regularArticles = [],
}) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-2 md:px-3 lg:px-3 xl:px-4">
        {/* Mobile/Tablet: Breaking News above main content */}
        {breakingNews.length > 0 && (
          <div className="w-full pt-6 lg:hidden">
            <RightNewsPanel breakingNews={breakingNews} />
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col gap-6 pt-6 lg:flex-row">
          {/* Main Section - takes the full width left of the panel */}
          <div className="min-w-0 flex-1">
            <MiddleNewsSection
              topStory={topStory}
              regularArticles={regularArticles}
            />
          </div>

          {/* Right Fixed Panel - Desktop Only */}
          <div className="hidden w-80 shrink-0 lg:block">
            <RightNewsPanel breakingNews={breakingNews} />
          </div>
        </div>
      </div>
    </div>
  );
}
