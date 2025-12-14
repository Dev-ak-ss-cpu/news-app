"use client";
import Header from "../Components/Header";
import SectionHeader from "./SectionHeader";
import NewsGrid from "./NewsGrid";
import Footer from "../Components/Footer";
import Layout from "./HomeLayout";
import { Button, HeroUIProvider } from "@heroui/react";
import { useEffect, useState } from "react";
import { serverGetApi, fetchHomeArticles } from "../utils/serverApi";
import { ToastProvider } from "@heroui/toast";
import HomePageShimmer from "../Components/Shimmer/HomePageShimmer";
import NewsGridShimmer from "../Components/Shimmer/NewsGridShimmer";
import { LiveStreamPlayer } from "../Components/LiveStreamPlayer";

export default function HomePageClient({ 
  initialData, 
  rootCategories = [],
  allCategories = []
}) {
  const [breakingNews, setBreakingNews] = useState(initialData?.breakingNews || []);
  const [featuredArticle, setFeaturedArticle] = useState(initialData?.featuredArticle || null);
  const [topStory, setTopStory] = useState(initialData?.topStory || []);
  const [regularArticles, setRegularArticles] = useState(initialData?.regularArticles || []);
  const [trendingArticles, setTrendingArticles] = useState(initialData?.trendingArticles || []);
  const [pagination, setPagination] = useState(initialData?.pagination || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveVideoId, setLiveVideoId] = useState(initialData?.liveVideoId || "");

  const fetchArticles = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      }

      const response = await fetchHomeArticles(page, 10);

      if (response.success) {
        const { breakingNews: breaking, center, trending, liveVideoId } = response.data;

        setBreakingNews(breaking || []);
        
        if (liveVideoId) {
          setLiveVideoId(liveVideoId);
        }

        if (center) {
          setFeaturedArticle(center.featured);
          setTopStory(center.topStory);

          if (page === 1) {
            setRegularArticles(center.regularArticles || []);
          } else {
            setRegularArticles((prev) => [
              ...prev,
              ...(center.regularArticles || []),
            ]);
          }

          setPagination(center.pagination);
          setCurrentPage(page);
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

  const loadMoreArticles = () => {
    if (pagination?.hasMore && !loading) {
      fetchArticles(currentPage + 1);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreArticles();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pagination, loading, currentPage]);

  return (
    <HeroUIProvider>
      <ToastProvider />
      <Header 
        initialRootCategories={rootCategories}
        initialAllCategories={allCategories}
      />
      <main>
        {loading && currentPage === 1 ? (
          <HomePageShimmer />
        ) : (
          <>
            {featuredArticle?.length > 0 && (
              <section className="container mx-auto px-4 py-8">
                <SectionHeader title="प्रमुख समाचार" />
                {error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => fetchArticles(1)} variant="bordered">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <NewsGrid articles={featuredArticle?.slice(0, 6)} />
                )}
              </section>
            )}

            {!loading && !error && (
              <Layout
                breakingNews={breakingNews}
                featuredArticle={featuredArticle}
                topStory={topStory}
                regularArticles={regularArticles}
                trendingArticles={trendingArticles}
                liveVideoId={liveVideoId}
                loadMore={loadMoreArticles}
                hasMore={pagination?.hasMore}
                isLoadingMore={loading && currentPage > 1}
              />
            )}
          </>
        )}
      </main>
      <Footer rootCategories={rootCategories} />
    </HeroUIProvider>
  );
}
