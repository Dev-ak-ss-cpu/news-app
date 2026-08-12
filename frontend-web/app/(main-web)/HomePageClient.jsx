"use client";
import Header from "../Components/Header";
import FeaturedNews from "./FeaturedNews";
import TrendingLiveRow from "./TrendingLiveRow";
import MoreNewsSection from "./MoreNewsSection";
import Footer from "../Components/Footer";
import Layout from "./HomeLayout";
import { Button, HeroUIProvider } from "@heroui/react";
import { useCallback, useState } from "react";
import { fetchHomeArticles } from "../utils/serverApi";
import { ToastProvider } from "@heroui/toast";
import HomePageShimmer from "../Components/Shimmer/HomePageShimmer";
import BreakingNewsTicker from "../Components/BreakingNewsTicker";

export default function HomePageClient({
  initialData,
  rootCategories = [],
  allCategories = []
}) {
  // Page 1 — everything above the "और खबरें" feed
  const [breakingNews, setBreakingNews] = useState(initialData?.breakingNews || []);
  const [featuredArticle, setFeaturedArticle] = useState(initialData?.featuredArticle || null);
  const [topStory, setTopStory] = useState(initialData?.topStory || []);
  const [regularArticles, setRegularArticles] = useState(initialData?.regularArticles || []);
  const [trendingArticles, setTrendingArticles] = useState(initialData?.trendingArticles || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveVideoId, setLiveVideoId] = useState(initialData?.liveVideoId || "");

  // Page 2+ — the full-width feed below the three-column layout
  const [moreArticles, setMoreArticles] = useState([]);
  const [morePage, setMorePage] = useState(1);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreError, setMoreError] = useState(null);
  const [moreHasMore, setMoreHasMore] = useState(
    Boolean(initialData?.pagination?.hasMore)
  );

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchHomeArticles(1);

      if (response.success) {
        const { breakingNews: breaking, center, trending, liveVideoId } = response.data;

        setBreakingNews(breaking || []);

        // Assign directly so clearing it in settings also hides the player
        setLiveVideoId(liveVideoId || "");

        if (center) {
          setFeaturedArticle(center.featured);
          setTopStory(center.topStory);
          setRegularArticles(center.regularArticles || []);

          // Page 1 was refetched, so the feed below starts over too
          setMoreArticles([]);
          setMorePage(1);
          setMoreError(null);
          setMoreHasMore(Boolean(center.pagination?.hasMore));
        }

        setTrendingArticles(trending || []);
      } else {
        setError(response.message || "Failed to fetch articles");
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("An error occurred while fetching articles");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNews = useCallback(async () => {
    // `moreLoading` guards against a double click firing two requests
    if (moreLoading || !moreHasMore) return;

    const nextPage = morePage + 1;

    try {
      setMoreLoading(true);
      setMoreError(null);

      const response = await fetchHomeArticles(nextPage);

      if (response.success) {
        const center = response.data?.center;

        setMoreArticles((prev) => [...prev, ...(center?.regularArticles || [])]);
        setMoreHasMore(Boolean(center?.pagination?.hasMore));
        setMorePage(nextPage);
      } else {
        setMoreError(response.message || "Failed to load more articles");
      }
    } catch (error) {
      console.error("Error loading more articles:", error);
      setMoreError("An error occurred while loading more articles");
    } finally {
      setMoreLoading(false);
    }
  }, [moreLoading, moreHasMore, morePage]);

  return (
    <HeroUIProvider>
      <ToastProvider />
      <Header
        initialRootCategories={rootCategories}
        initialAllCategories={allCategories}
      />
      <main>
        {loading ? (
          <HomePageShimmer />
        ) : (
          <>
            {/* Breaking News Ticker - Above Featured News */}
            {breakingNews.length > 0 && (
              <BreakingNewsTicker breakingNews={breakingNews} />
            )}

            {featuredArticle?.length > 0 &&
              (error ? (
                <section className="container mx-auto px-4 py-8">
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onPress={fetchArticles} variant="bordered">
                      Retry
                    </Button>
                  </div>
                </section>
              ) : (
                <FeaturedNews articles={featuredArticle?.slice(0, 6)} />
              ))}

            {!error && (
              <Layout
                breakingNews={breakingNews}
                topStory={topStory}
                regularArticles={regularArticles}
              />
            )}

            {/* Trending + live TV, full width above the "और खबरें" feed */}
            {!error && (
              <TrendingLiveRow
                trendingArticles={trendingArticles}
                liveVideoId={liveVideoId}
              />
            )}

            {/* Full-width feed: page 2 onwards, no sticky side panels */}
            {!error && (
              <MoreNewsSection
                articles={moreArticles}
                hasMore={moreHasMore}
                isLoading={moreLoading}
                error={moreError}
                onLoadMore={loadMoreNews}
              />
            )}
          </>
        )}
      </main>
      <Footer rootCategories={rootCategories} />
    </HeroUIProvider>
  );
}
