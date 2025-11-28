"use client";
import Header from "./Components/Header";
import HeroSection from "./(main-web)/HeroSection";
import SectionHeader from "./(main-web)/SectionHeader";
import NewsGrid from "./(main-web)/NewsGrid";
import Footer from "./Components/Footer";
import Layout from "./(main-web)/HomeLayout";
import { Button, Calendar, HeroUIProvider } from "@heroui/react";
import { useEffect, useState } from "react";
import { genericGetApi, genericPostApi } from "./Helper";

export default function Page() {
  const [breakingNews, setBreakingNews] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [topStory, setTopStory] = useState(null);
  const [regularArticles, setRegularArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      }

      const response = await genericGetApi("/api/articles", {
        home: "true",
        page: page,
        limit: 10,
      });

      if (response.success) {
        const { breakingNews: breaking, center, trending } = response.data;

        setBreakingNews(breaking || []);

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

  useEffect(() => {
    fetchArticles(1);
  }, []);

  return (
    <HeroUIProvider>
      <Header />
      <main>
        {/* <HeroSection /> */}

        <section className="container mx-auto px-4 py-8">
          <SectionHeader title="ताज़ा खबरें" badgeText="शपथ ग्रहण" />
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              {/* <p className="ml-4 text-gray-600">Loading articles...</p> */}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchArticles} variant="bordered">
                Retry
              </Button>
            </div>
          ) : (
            <NewsGrid articles={topStory?.slice(0, 6)} />
          )}
        </section>

        {/* <section className="container mx-auto px-4 py-8">
          <SectionHeader
            title="बड़ी खबरें"
          />
          <NewsGrid />
        </section> */}

        {!loading && !error && (
          <Layout
            breakingNews={breakingNews}
            featuredArticle={featuredArticle}
            topStory={topStory}
            regularArticles={regularArticles}
            trendingArticles={trendingArticles}
            loadMore={loadMoreArticles}
            hasMore={pagination?.hasMore}
            isLoadingMore={loading && currentPage > 1}
          />
        )}
      </main>

      <Footer />
    </HeroUIProvider>
  );
}
