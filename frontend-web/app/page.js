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
  const [articles, setArticles] = useState([]);
  const [breakingArticle, setBreakingArticle] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const [
        allArticlesResponse,
        breakingResponse,
        trendingResponse,
        latestResponse,
      ] = await Promise.all([
        genericGetApi("/api/articles", {
          status: "published",
          limit: 20,
          page: 1,
        }),
        genericGetApi("/api/articles", {
          status: "published",
          isBreaking: "true",
          limit: 1,
        }),
        genericGetApi("/api/articles", {
          status: "published",
          isTrending: "true",
          limit: 5,
        }),
        genericGetApi("/api/articles", {
          status: "published",
          limit: 10,
          page: 1,
        }),
      ]);

      if (allArticlesResponse.success) {
        setArticles(allArticlesResponse.data?.articles || []);
      }

      if (
        breakingResponse.success &&
        breakingResponse.data?.articles?.length > 0
      ) {
        setBreakingArticle(breakingResponse.data.articles[0]);
      }

      if (trendingResponse.success) {
        setTrendingArticles(trendingResponse.data?.articles || []);
      }

      if (latestResponse.success) {
        setLatestArticles(latestResponse.data?.articles || []);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("An error occurred while fetching articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
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
              <p className="ml-4 text-gray-600">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchArticles} variant="bordered">
                Retry
              </Button>
            </div>
          ) : (
            <NewsGrid articles={articles} />
          )}
        </section>

        {/* <section className="container mx-auto px-4 py-8">
          <SectionHeader
            title="बड़ी खबरें"
          />
          <NewsGrid />
        </section> */}

        <Layout />
      </main>

      <Footer />
    </HeroUIProvider>
  );
}
